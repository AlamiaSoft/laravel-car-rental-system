<?php

namespace App\Exceptions;

use InvalidArgumentException;

class InvalidPrimaryExperienceException extends InvalidArgumentException
{
    public function __construct(string $experience)
    {
        parent::__construct(
            "Cannot set primary experience to '{$experience}': no active capability provides this experience."
        );
    }
}
