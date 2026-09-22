<?php

namespace App\Services;

use App\Capability\CapabilityRegistry;
use App\Enums\BusinessType;
use App\Enums\TenantCapability;
use App\Exceptions\InvalidPrimaryExperienceException;
use App\Models\Tenant;

class TenantCapabilityService
{
    /**
     * Apply a business type preset to a tenant.
     * Seeds default capabilities and sets the primary experience.
     */
    public function applyPreset(Tenant $tenant, BusinessType $type): void
    {
        $tenant->update([
            'business_type' => $type->value,
            'primary_experience' => $type->defaultPrimaryExperience(),
        ]);

        $this->syncCapabilities($tenant, $type->defaultCapabilities());
    }

    /**
     * Full capability sync with dependency resolution.
     * Replaces all existing capabilities with the resolved set.
     *
     * @param  TenantCapability[]  $capabilities
     */
    public function syncCapabilities(Tenant $tenant, array $capabilities): void
    {
        $resolved = CapabilityRegistry::resolveWithDependencies($capabilities);

        // Remove capabilities that are no longer in the resolved set
        $resolvedValues = array_map(fn (TenantCapability $c) => $c->value, $resolved);

        $tenant->capabilities()
            ->whereNotIn('capability', $resolvedValues)
            ->delete();

        // Add new capabilities
        foreach ($resolved as $capability) {
            $tenant->capabilities()->firstOrCreate([
                'capability' => $capability->value,
            ]);
        }

        // Validate primary_experience is still valid after sync
        if ($tenant->primary_experience) {
            try {
                $this->validatePrimaryExperience($tenant, $tenant->primary_experience);
            } catch (InvalidPrimaryExperienceException) {
                $tenant->update(['primary_experience' => null]);
            }
        }
    }

    /**
     * Validate that the requested experience key corresponds to an active capability.
     *
     * @throws InvalidPrimaryExperienceException
     */
    public function validatePrimaryExperience(Tenant $tenant, string $experience): void
    {
        CapabilityRegistry::boot();

        foreach (CapabilityRegistry::all() as $key => $definition) {
            if ($definition['pwa_experience'] === $experience) {
                $capability = TenantCapability::from($key);

                if ($tenant->hasCapability($capability)) {
                    return;
                }
            }
        }

        throw new InvalidPrimaryExperienceException($experience);
    }
}
