<?php

namespace App\Console\Commands;

use App\Models\GlobalSetting;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Modules\Orders\Models\Order;

class GenerateInvoicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:generate-invoices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate invoices for tenants based on their billing configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tenants = Tenant::all();
        $this->info('Checking billing for '.$tenants->count().' tenants.');

        foreach ($tenants as $tenant) {
            if ($tenant->billing_frequency === 'manual') {
                continue;
            }

            if (! $this->isDueForBilling($tenant)) {
                continue;
            }

            $this->generateInvoice($tenant);
        }

        $this->info('Billing generation complete.');
    }

    protected function isDueForBilling(Tenant $tenant)
    {
        if (! $tenant->last_billed_at) {
            return true;
        }

        $lastBilled = Carbon::parse($tenant->last_billed_at);
        $now = now();

        switch ($tenant->billing_frequency) {
            case 'daily':
                return $lastBilled->diffInDays($now) >= 1;
            case 'weekly':
                return $lastBilled->diffInWeeks($now) >= 1;
            case 'monthly':
                return $lastBilled->diffInMonths($now) >= 1;
            default:
                return false;
        }
    }

    protected function generateInvoice(Tenant $tenant)
    {
        $amount = 0;
        $periodStart = $tenant->last_billed_at ? Carbon::parse($tenant->last_billed_at) : now()->subDays(7);
        $periodEnd = now();

        if ($tenant->billing_model === 'fixed') {
            $amount = $tenant->billing_rate;
        } elseif ($tenant->billing_model === 'commission') {
            tenancy()->initialize($tenant);

            $totalSales = Order::whereIn('status', ['Completed', 'Delivered'])
                ->whereBetween('created_at', [$periodStart, $periodEnd])
                ->sum('total_amount');

            $amount = $totalSales * ($tenant->billing_rate / 100);

            tenancy()->end();
        }

        if ($amount > 0) {
            $invoice = Invoice::create([
                'tenant_id' => $tenant->id,
                'amount' => $amount,
                'status' => 'pending',
                'billing_period_start' => $periodStart,
                'billing_period_end' => $periodEnd,
                'due_date' => now()->addDays(7),
                'type' => $tenant->billing_model,
            ]);

            $tenant->update(['last_billed_at' => now()]);
            $this->info("Generated invoice #{$invoice->id} for tenant {$tenant->id} (Amount: {$amount})");

            $this->sendWhatsAppNotification($tenant, $invoice);
        } else {
            $tenant->update(['last_billed_at' => now()]);
            $this->info("Skipped invoice generation for tenant {$tenant->id} (Amount: 0)");
        }
    }

    protected function sendWhatsAppNotification(Tenant $tenant, Invoice $invoice)
    {
        $notificationSetting = GlobalSetting::where('key', 'invoice_notifications')->first();
        if (! $notificationSetting || $notificationSetting->value !== 'auto') {
            return;
        }

        tenancy()->initialize($tenant);
        // Find the first user with a phone number
        $user = User::whereNotNull('phone')->first();
        tenancy()->end();

        if ($user && $user->phone) {
            $message = "Hello {$user->name},\n\nYour new invoice #{$invoice->id} for Rs. {$invoice->amount} has been generated. Please check your dashboard for payment instructions.";

            // We'll log it for now to avoid actual API calls during automated cron testing
            Log::info("Would send WhatsApp to {$user->phone}: {$message}");

            // Assuming the SaaS platform has its own central WhatsApp integration to send this,
            // or uses the tenant's integration:
            // \Kstmostofa\LaravelWhatsapp\Facades\WhatsApp::sendText($user->phone, $message);
        }
    }
}
