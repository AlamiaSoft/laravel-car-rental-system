<?php

namespace App\Console\Commands;

use App\Enums\TenantCapability;
use App\Models\Tenant;
use Illuminate\Console\Command;
use Modules\Rental\Services\FleetMaintenanceService;

class ScanRentalMaintenanceCommand extends Command
{
    protected $signature = 'app:scan-rental-maintenance';

    protected $description = 'Scan fleet vehicles against maintenance thresholds for all rental tenants';

    public function handle(FleetMaintenanceService $maintenanceService): int
    {
        $tenants = Tenant::all();
        $totalFlagged = 0;

        foreach ($tenants as $tenant) {
            if (! $tenant->hasCapability(TenantCapability::Fleet)) {
                continue;
            }

            try {
                tenancy()->initialize($tenant);
                $flagged = $maintenanceService->scanOverdueVehicles();
                if ($flagged > 0) {
                    $this->info("Tenant {$tenant->id}: {$flagged} vehicles flagged for maintenance.");
                    $totalFlagged += $flagged;
                }
                tenancy()->end();
            } catch (\Throwable $e) {
                $this->error("Error scanning tenant {$tenant->id}: {$e->getMessage()}");
            }
        }

        $this->info("Fleet maintenance scan completed. Total vehicles flagged: {$totalFlagged}.");

        return Command::SUCCESS;
    }
}
