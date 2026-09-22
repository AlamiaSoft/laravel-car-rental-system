<?php

namespace Modules\Rental\Services;

use App\Enums\PricingMode;
use Carbon\Carbon;
use Modules\Rental\Models\Vehicle;

class RentalPricingService
{
    public const DEFAULT_FUEL_TANK_FULL_COST = 8000.00;

    public const DEFAULT_FUEL_PRICE_PER_LITER = 280.00;

    /**
     * Calculate elapsed billable days from pickup to dropoff.
     */
    public function calculateNumberOfDays(Carbon $startDate, Carbon $endDate): int
    {
        $diffSeconds = $endDate->timestamp - $startDate->timestamp;

        return max(1, (int) ceil($diffSeconds / 86400));
    }

    /**
     * Calculate fuel shortfall fee based on tank capacity or default tank cost.
     */
    public function calculateFuelShortfallFee(
        int $fuelLevelPickup,
        int $fuelLevelDropoff,
        ?Vehicle $vehicle = null,
        ?float $pricePerLiter = null
    ): float {
        $shortfallPercent = max(0, $fuelLevelPickup - $fuelLevelDropoff);
        if ($shortfallPercent === 0) {
            return 0.00;
        }

        // If vehicle specifies a tank capacity (in liters), compute exact liters
        if ($vehicle && $vehicle->fuel_tank_capacity && $vehicle->fuel_tank_capacity > 0) {
            $effectivePricePerLiter = $pricePerLiter ?? self::DEFAULT_FUEL_PRICE_PER_LITER;
            $shortfallLiters = ($shortfallPercent / 100) * (float) $vehicle->fuel_tank_capacity;

            return round($shortfallLiters * $effectivePricePerLiter, 2);
        }

        // Fallback: proportional full tank baseline cost
        $tankFullCost = self::DEFAULT_FUEL_TANK_FULL_COST;

        return round(($shortfallPercent / 100) * $tankFullCost, 2);
    }

    /**
     * Compute final booking total cost based on pricing mode.
     */
    public function calculateTotalCost(
        PricingMode $pricingMode,
        ?float $lumpsumAmount,
        float $dailyDriverRate,
        float $dailyLunchRate,
        int $numberOfDays,
        float $fuelShortfallFee
    ): float {
        if ($pricingMode === PricingMode::Lumpsum) {
            return round((float) ($lumpsumAmount ?? 0), 2);
        }

        $perDay = $dailyDriverRate + $dailyLunchRate;
        $baseTotal = $perDay * $numberOfDays;

        return round($baseTotal + $fuelShortfallFee, 2);
    }
}
