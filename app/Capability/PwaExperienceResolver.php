<?php

namespace App\Capability;

use App\Enums\TenantCapability;
use App\Models\Tenant;

class PwaExperienceResolver
{
    /**
     * Returns all active experiences this tenant can offer.
     *
     * @return array<string, string> experience_key => URL
     */
    public function resolve(Tenant $tenant): array
    {
        CapabilityRegistry::boot();

        $experiences = [];

        foreach (CapabilityRegistry::all() as $key => $definition) {
            $capability = TenantCapability::from($key);

            if ($tenant->hasCapability($capability) && $definition['pwa_experience'] !== null) {
                $experiences[$definition['pwa_experience']] = url("/app/{$tenant->id}/{$definition['pwa_experience']}");
            }
        }

        return $experiences;
    }

    /**
     * Returns the primary CTA URL for the WhatsApp bot message.
     * Uses explicit tenant override first, then highest-priority capability.
     */
    public function primaryExperience(Tenant $tenant): string
    {
        // 1. Use explicit tenant override if set
        if ($tenant->primary_experience) {
            return url("/app/{$tenant->id}/{$tenant->primary_experience}");
        }

        // 2. Resolve by highest-priority capability with a pwa_experience
        CapabilityRegistry::boot();

        $topExperience = null;
        $topPriority = -1;

        foreach (CapabilityRegistry::all() as $key => $definition) {
            $capability = TenantCapability::from($key);

            if (
                $tenant->hasCapability($capability)
                && $definition['pwa_experience'] !== null
                && $definition['priority'] > $topPriority
            ) {
                $topPriority = $definition['priority'];
                $topExperience = $definition['pwa_experience'];
            }
        }

        return $topExperience
            ? url("/app/{$tenant->id}/{$topExperience}")
            : url("/app/{$tenant->id}");
    }
}
