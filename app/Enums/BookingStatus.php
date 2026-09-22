<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
