<?php

namespace App\Enums;

enum FuelSettlement: string
{
    case ChargedToBill = 'charged_to_bill';
    case RefilledByClient = 'refilled_by_client';
    case CashToDriver = 'cash_to_driver';
}
