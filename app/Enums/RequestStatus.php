<?php

namespace App\Enums;

enum RequestStatus: string
{
    case Matched = 'matched';
    case Unmatched = 'unmatched';
    case Converted = 'converted';
    case Rejected = 'rejected';
}
