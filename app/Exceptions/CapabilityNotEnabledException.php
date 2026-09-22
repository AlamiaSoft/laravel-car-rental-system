<?php

namespace App\Exceptions;

use App\Enums\TenantCapability;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CapabilityNotEnabledException extends HttpException
{
    public function __construct(public readonly TenantCapability $capability)
    {
        parent::__construct(
            statusCode: 403,
            message: "The '{$capability->value}' capability is not enabled for this tenant.",
        );
    }
}
