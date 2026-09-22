<?php

namespace Database\Seeders;

use App\Enums\BusinessType;
use App\Enums\UserRole;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantCapabilityService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('Starting Database Seeder...');

        $this->command->info('Seeding Roles and Permissions...');
        $this->call([
            RolesAndPermissionsSeeder::class,
        ]);

        $this->command->info('Seeding Super Admin...');
        $this->call([
            SuperAdminSeeder::class,
        ]);

        $tenantName = 'Default Restaurant';
        $tenantId = Str::slug($tenantName);

        $tenant = Tenant::firstOrCreate([
            'id' => $tenantId,
        ], [
            'name' => $tenantName,
        ]);

        app(TenantCapabilityService::class)->applyPreset($tenant, BusinessType::Restaurant);

        $this->command->info('Creating Restaurant Owner User...');
        $user = User::firstOrCreate([
            'email' => 'admin@restaurant.com',
        ], [
            'name' => 'Restaurant Owner',
            'password' => bcrypt('password123'),
            'tenant_id' => $tenant->id,
            'email_verified_at' => now(),
        ]);

        $this->command->info('Assigning Owner Role to User...');
        // We can optionally initialize tenancy to ensure the role assignment works cleanly in scope if needed,
        // though Spatie roles in this app might be global.
        $user->assignRole(UserRole::Owner->value);

        $this->command->info('Seeding Car Rental Tenant and Demo Fleet...');
        $this->call([
            CarRentalSeeder::class,
        ]);

        $this->command->info('Database Seeding Completed Successfully!');
    }
}
