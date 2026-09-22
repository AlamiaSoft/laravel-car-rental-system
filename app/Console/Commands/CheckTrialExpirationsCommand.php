<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;

class CheckTrialExpirationsCommand extends Command
{
    protected $signature = 'app:check-trial-expirations';

    protected $description = 'Scan tenants with expired trials and update status to read_only';

    public function handle(): int
    {
        $expiredTenants = Tenant::where('subscription_status', 'trial')
            ->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '<', now())
            ->get();

        $this->info("Found {$expiredTenants->count()} expired trial tenants.");

        foreach ($expiredTenants as $tenant) {
            $tenant->update(['subscription_status' => 'read_only']);
            $this->line("Tenant {$tenant->id} ({$tenant->name}) updated to read_only.");
        }

        return Command::SUCCESS;
    }
}
