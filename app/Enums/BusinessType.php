<?php

namespace App\Enums;

enum BusinessType: string
{
    case Restaurant = 'restaurant';
    case Retail = 'retail';
    case CarRental = 'car_rental';

    /**
     * Returns the default capabilities assigned when this business type preset is selected.
     *
     * @return TenantCapability[]
     */
    public function defaultCapabilities(): array
    {
        return match ($this) {
            self::Restaurant => [
                TenantCapability::Catalog,
                TenantCapability::Ordering,
                TenantCapability::Kds,
                TenantCapability::Delivery,
            ],
            self::Retail => [
                TenantCapability::Catalog,
                TenantCapability::Ordering,
                TenantCapability::Inventory,
                TenantCapability::Delivery,
            ],
            self::CarRental => [
                TenantCapability::Fleet,
                TenantCapability::Rentals,
                TenantCapability::Payments,
            ],
        };
    }

    /**
     * Returns the default primary experience key for this business type.
     */
    public function defaultPrimaryExperience(): string
    {
        return match ($this) {
            self::CarRental => 'rent',
            default => 'order',
        };
    }
}
