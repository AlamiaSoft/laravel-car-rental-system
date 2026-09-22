<?php

namespace App\Models;

use App\Capability\CapabilityRegistry;
use App\Enums\TenantCapability;
use App\Exceptions\CapabilityNotEnabledException;
use App\Services\TenantSettingsService;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant
{
    use HasDomains;

    protected $fillable = [
        'id',
        'name',
        'business_type',
        'primary_experience',
        'is_active',
        'data',
        'wa_access_token',
        'wa_phone_number_id',
        'wa_verify_token',
        'wa_app_secret',
        'billing_model',
        'billing_rate',
        'billing_frequency',
        'last_billed_at',
        'trial_ends_at',
        'subscription_status',
    ];

    protected function casts(): array
    {
        return [
            'trial_ends_at' => 'datetime',
            'is_active' => 'boolean',
            'last_billed_at' => 'datetime',
        ];
    }

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'business_type',
            'primary_experience',
            'is_active',
            'trial_ends_at',
            'subscription_status',
            'wa_access_token',
            'wa_phone_number_id',
            'wa_business_account_id',
            'billing_model',
            'billing_rate',
            'billing_frequency',
            'last_billed_at',
            'wa_verify_token',
            'wa_app_secret',
        ];
    }

    public function isReadOnly(): bool
    {
        if ($this->subscription_status === 'read_only') {
            return true;
        }

        if ($this->subscription_status === 'trial' && $this->trial_ends_at && $this->trial_ends_at->isPast()) {
            return true;
        }

        return false;
    }

    public function daysLeftInTrial(): ?int
    {
        if ($this->subscription_status !== 'trial' || ! $this->trial_ends_at) {
            return null;
        }

        return max(0, (int) ceil(now()->diffInSeconds($this->trial_ends_at, false) / 86400));
    }

    public function settings(string $status = 'published')
    {
        return (new TenantSettingsService)->getSettings($this->id, $status);
    }

    /**
     * Relationship to the tenant's enabled capabilities.
     */
    public function capabilities(): HasMany
    {
        return $this->hasMany(TenantCapabilityModel::class);
    }

    /**
     * Check if this tenant has a specific capability enabled.
     */
    public function hasCapability(TenantCapability|string $capability): bool
    {
        $capEnum = is_string($capability) ? TenantCapability::tryFrom($capability) : $capability;
        if (! $capEnum) {
            return false;
        }

        return $this->capabilities()
            ->where('capability', $capEnum->value)
            ->exists();
    }

    /**
     * Require a capability or throw 403.
     * Use the RequireCapability middleware as the canonical enforcement layer.
     * This method is for defense-in-depth on especially sensitive actions.
     */
    public function requireCapability(TenantCapability $capability): void
    {
        if (! $this->hasCapability($capability)) {
            throw new CapabilityNotEnabledException($capability);
        }
    }

    /**
     * Enable a capability, automatically resolving and enabling all transitive dependencies.
     */
    public function enableCapability(TenantCapability $capability): void
    {
        $allRequired = CapabilityRegistry::resolveWithDependencies([$capability]);

        foreach ($allRequired as $cap) {
            $this->capabilities()->firstOrCreate([
                'capability' => $cap->value,
            ]);
        }
    }

    /**
     * Disable a capability. Refuses if other active capabilities depend on it.
     *
     * @throws \RuntimeException if active dependents exist
     */
    public function disableCapability(TenantCapability $capability): void
    {
        $activeCapabilities = $this->capabilities()
            ->pluck('capability')
            ->all();

        $dependents = CapabilityRegistry::dependentsOf($capability, $activeCapabilities);

        if (! empty($dependents)) {
            $names = array_map(fn (TenantCapability $c) => $c->value, $dependents);
            throw new \RuntimeException(
                "Cannot disable '{$capability->value}': the following active capabilities depend on it: ".implode(', ', $names)
            );
        }

        // If this capability was the primary experience, reset it
        if ($this->primary_experience) {
            $definition = CapabilityRegistry::get($capability);
            if ($definition && $definition['pwa_experience'] === $this->primary_experience) {
                $this->update(['primary_experience' => null]);
            }
        }

        $this->capabilities()
            ->where('capability', $capability->value)
            ->delete();
    }
}
