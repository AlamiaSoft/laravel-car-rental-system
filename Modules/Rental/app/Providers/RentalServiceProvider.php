<?php

namespace Modules\Rental\Providers;

use Nwidart\Modules\Support\ModuleServiceProvider;

class RentalServiceProvider extends ModuleServiceProvider
{
    protected string $name = 'Rental';

    protected string $nameLower = 'rental';

    protected array $providers = [
        RouteServiceProvider::class,
    ];

    public function boot(): void
    {
        $this->loadMigrationsFrom(module_path($this->name, 'database/migrations'));
    }

    public function register(): void
    {
        parent::register();
    }
}
