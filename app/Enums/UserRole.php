<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case Owner = 'owner';
    case Manager = 'manager';
    case Staff = 'staff';
    case Customer = 'customer';
}
