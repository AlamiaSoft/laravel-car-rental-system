<?php

namespace App\Enums;

enum TenantCapability: string
{
    case Catalog = 'catalog';
    case Services = 'services';
    case Ordering = 'ordering';
    case Booking = 'booking';
    case Kds = 'kds';
    case Staff = 'staff';
    case Payments = 'payments';
    case Delivery = 'delivery';
    case Inventory = 'inventory';
    case Documents = 'documents';
    case Fleet = 'fleet';
    case Rentals = 'rentals';
}
