<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\GlobalSetting;
use App\Models\Invoice;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function index()
    {
        $tenant = tenant();
        $invoices = Invoice::where('tenant_id', $tenant->id)->latest()->paginate(10);
        $paymentInstructions = GlobalSetting::where('key', 'payment_instructions')->value('value');

        return Inertia::render('Settings/Billing', [
            'invoices' => $invoices,
            'paymentInstructions' => $paymentInstructions,
            'billing_model' => $tenant->billing_model,
            'billing_rate' => $tenant->billing_rate,
            'billing_frequency' => $tenant->billing_frequency,
        ]);
    }

    public function show(Invoice $invoice)
    {
        $tenant = tenant();
        if ($invoice->tenant_id !== $tenant->id) {
            abort(403);
        }

        $settings = Cache::rememberForever('global_settings', function () {
            return GlobalSetting::pluck('value', 'key')->toArray();
        });

        return view('invoice', [
            'invoice' => $invoice,
            'settings' => $settings,
        ]);
    }
}
