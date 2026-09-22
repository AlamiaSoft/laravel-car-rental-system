<?php

namespace App\Enums;

enum PricingMode: string
{
    case Lumpsum = 'lumpsum';
    case Daily = 'daily';
}
