<?php

namespace App\Enums;

enum UserPermission: string
{
    case ManageTenants = 'manage tenants';
    case ManageBilling = 'manage billing';
    case ManagePlatform = 'manage platform';

    case ManageRestaurant = 'manage restaurant';
    case ManageStaff = 'manage staff';

    case ManageMenu = 'manage menu';

    case ManageOrders = 'manage orders';
    case ViewOrders = 'view orders';

    case PlaceOrders = 'place orders';
    case ViewOwnOrders = 'view own orders';
}
