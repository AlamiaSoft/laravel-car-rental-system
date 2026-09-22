<?php

namespace App\Capability;

use App\Enums\TenantCapability;
use App\Exceptions\CapabilityDependencyCycleException;

class CapabilityRegistry
{
    /**
     * @var array<string, array{
     *     name: string,
     *     description: string,
     *     icon: string,
     *     dependencies: TenantCapability[],
     *     experience: string|null,
     *     priority: int,
     *     nav_label: string|null,
     *     nav_route: string|null,
     *     pwa_experience: string|null,
     * }>
     */
    private static array $definitions = [];

    private static bool $booted = false;

    public static function boot(): void
    {
        if (static::$booted) {
            return;
        }

        static::$definitions = [
            TenantCapability::Catalog->value => [
                'name' => 'Product Catalog',
                'description' => 'Manage categories and products for ordering.',
                'icon' => 'package',
                'dependencies' => [],
                'experience' => null,
                'priority' => 0,
                'nav_label' => 'Menu',
                'nav_route' => 'menu.index',
                'pwa_experience' => null,
            ],
            TenantCapability::Services->value => [
                'name' => 'Service Catalog',
                'description' => 'Define services with duration and pricing for bookings.',
                'icon' => 'briefcase',
                'dependencies' => [],
                'experience' => null,
                'priority' => 0,
                'nav_label' => 'Services',
                'nav_route' => 'services.index',
                'pwa_experience' => null,
            ],
            TenantCapability::Ordering->value => [
                'name' => 'Food & Retail Ordering',
                'description' => 'Allow customers to browse the catalog and place orders.',
                'icon' => 'shopping-cart',
                'dependencies' => [TenantCapability::Catalog],
                'experience' => 'ordering',
                'priority' => 10,
                'nav_label' => 'Orders',
                'nav_route' => 'orders.index',
                'pwa_experience' => 'order',
            ],
            TenantCapability::Booking->value => [
                'name' => 'Appointment Booking',
                'description' => 'Allow customers to browse services and book appointments.',
                'icon' => 'calendar',
                'dependencies' => [TenantCapability::Services],
                'experience' => 'booking',
                'priority' => 10,
                'nav_label' => 'Bookings',
                'nav_route' => 'bookings.index',
                'pwa_experience' => 'book',
            ],
            TenantCapability::Kds->value => [
                'name' => 'Kitchen Display System',
                'description' => 'Real-time kitchen order display for food preparation.',
                'icon' => 'monitor',
                'dependencies' => [TenantCapability::Ordering],
                'experience' => null,
                'priority' => 0,
                'nav_label' => 'Kitchen Display',
                'nav_route' => 'kds.index',
                'pwa_experience' => null,
            ],
            TenantCapability::Staff->value => [
                'name' => 'Staff Management',
                'description' => 'Manage staff members, schedules, and assignments.',
                'icon' => 'users',
                'dependencies' => [],
                'experience' => null,
                'priority' => 0,
                'nav_label' => 'Staff',
                'nav_route' => 'staff.index',
                'pwa_experience' => null,
            ],
            TenantCapability::Payments->value => [
                'name' => 'Payment Processing',
                'description' => 'Accept payments for orders or bookings.',
                'icon' => 'credit-card',
                'dependencies' => [],
                'experience' => null,
                'priority' => 0,
                'nav_label' => 'Payments',
                'nav_route' => 'payments.index',
                'pwa_experience' => null,
            ],
            TenantCapability::Delivery->value => [
                'name' => 'Delivery Management',
                'description' => 'Track and manage order deliveries.',
                'icon' => 'truck',
                'dependencies' => [TenantCapability::Ordering],
                'experience' => null,
                'priority' => 0,
                'nav_label' => 'Deliveries',
                'nav_route' => 'deliveries.index',
                'pwa_experience' => null,
            ],
            TenantCapability::Inventory->value => [
                'name' => 'Inventory Tracking',
                'description' => 'Track stock levels and manage inventory.',
                'icon' => 'layers',
                'dependencies' => [TenantCapability::Catalog],
                'experience' => null,
                'priority' => 0,
                'nav_label' => 'Inventory',
                'nav_route' => 'inventory.index',
                'pwa_experience' => null,
            ],
            TenantCapability::Documents->value => [
                'name' => 'Document Management',
                'description' => 'Share and manage documents with clients.',
                'icon' => 'file-text',
                'dependencies' => [],
                'experience' => null,
                'priority' => 0,
                'nav_label' => 'Documents',
                'nav_route' => 'documents.index',
                'pwa_experience' => null,
            ],
            TenantCapability::Fleet->value => [
                'name' => 'Fleet & Maintenance',
                'description' => 'Manage vehicles, odometers, maintenance intervals, and third-party fleet partners.',
                'icon' => 'car',
                'dependencies' => [],
                'experience' => null,
                'priority' => 0,
                'nav_label' => 'Fleet',
                'nav_route' => 'rental.vehicles.index',
                'pwa_experience' => null,
            ],
            TenantCapability::Rentals->value => [
                'name' => 'Car Rentals & Bookings',
                'description' => 'Manage rental bookings, drivers, fuel settlements, and WhatsApp auto-match requests.',
                'icon' => 'key',
                'dependencies' => [TenantCapability::Fleet],
                'experience' => 'rent',
                'priority' => 10,
                'nav_label' => 'Rentals',
                'nav_route' => 'rental.bookings.index',
                'pwa_experience' => 'rent',
            ],
        ];

        static::$booted = true;
        static::validateNoCycles();
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public static function all(): array
    {
        static::boot();

        return static::$definitions;
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function get(TenantCapability $capability): ?array
    {
        static::boot();

        return static::$definitions[$capability->value] ?? null;
    }

    /**
     * Returns the dependency graph for a given capability.
     *
     * @return TenantCapability[]
     */
    public static function dependenciesFor(TenantCapability $capability): array
    {
        $definition = static::get($capability);

        return $definition ? $definition['dependencies'] : [];
    }

    /**
     * Resolves all transitive dependencies for a set of requested capabilities.
     * Detects cycles and throws CapabilityDependencyCycleException.
     *
     * @param  TenantCapability[]  $requested
     * @param  TenantCapability[]  $visited  Internal cycle detection tracker
     * @return TenantCapability[]
     */
    public static function resolveWithDependencies(array $requested, array $visited = []): array
    {
        $resolved = [];

        foreach ($requested as $capability) {
            if (in_array($capability, $visited, true)) {
                $chain = array_map(fn (TenantCapability $c) => $c->value, [...$visited, $capability]);
                throw new CapabilityDependencyCycleException(
                    'Capability dependency cycle detected: '.implode(' → ', $chain)
                );
            }

            if (! in_array($capability, $resolved, true)) {
                $dependencies = static::dependenciesFor($capability);

                if (! empty($dependencies)) {
                    $transitive = static::resolveWithDependencies($dependencies, [...$visited, $capability]);
                    foreach ($transitive as $dep) {
                        if (! in_array($dep, $resolved, true)) {
                            $resolved[] = $dep;
                        }
                    }
                }

                $resolved[] = $capability;
            }
        }

        return $resolved;
    }

    /**
     * Returns which of the given capabilities depend on the target capability.
     *
     * @param  TenantCapability[]  $activeCapabilities
     * @return TenantCapability[]
     */
    public static function dependentsOf(TenantCapability $target, array $activeCapabilities): array
    {
        $dependents = [];

        foreach ($activeCapabilities as $capability) {
            $deps = static::dependenciesFor($capability);
            if (in_array($target, $deps, true)) {
                $dependents[] = $capability;
            }
        }

        return $dependents;
    }

    /**
     * Returns safe frontend-only DTO representations of all capabilities.
     *
     * @return CapabilityFrontendDto[]
     */
    public static function forFrontend(): array
    {
        static::boot();

        return array_map(
            fn (string $key, array $def) => new CapabilityFrontendDto(
                key: $key,
                name: $def['name'],
                description: $def['description'],
                icon: $def['icon'],
                navLabel: $def['nav_label'],
                navRoute: $def['nav_route'],
                hasPwaExperience: $def['pwa_experience'] !== null,
                dependencies: array_map(fn (TenantCapability $d) => $d->value, $def['dependencies']),
            ),
            array_keys(static::$definitions),
            array_values(static::$definitions),
        );
    }

    /**
     * Finds the tenant capability that provides the given PWA experience key.
     */
    public static function capabilityForExperience(string $experience): ?TenantCapability
    {
        static::boot();

        foreach (static::$definitions as $key => $def) {
            if ($def['pwa_experience'] === $experience) {
                return TenantCapability::from($key);
            }
        }

        return null;
    }

    /**
     * Returns all supported PWA experience keys.
     *
     * @return string[]
     */
    public static function validExperiences(): array
    {
        static::boot();

        $experiences = [];
        foreach (static::$definitions as $def) {
            if ($def['pwa_experience'] !== null) {
                $experiences[] = $def['pwa_experience'];
            }
        }

        return array_unique($experiences);
    }

    /**
     * Validates that the dependency graph contains no cycles.
     * Called once during boot.
     */
    private static function validateNoCycles(): void
    {
        foreach (TenantCapability::cases() as $capability) {
            if (isset(static::$definitions[$capability->value])) {
                // Attempt to resolve — will throw if cycle exists
                static::resolveWithDependencies([$capability]);
            }
        }
    }

    /**
     * Reset boot state. For testing only.
     */
    public static function resetForTesting(): void
    {
        static::$booted = false;
        static::$definitions = [];
    }
}
