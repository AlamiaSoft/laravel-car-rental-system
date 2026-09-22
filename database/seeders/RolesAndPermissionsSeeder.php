<?php

namespace Database\Seeders;

use App\Enums\UserPermission;
use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Seed Permissions
        foreach (UserPermission::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
                'guard_name' => 'web',
            ]);
        }

        // 2. Seed Roles
        foreach (UserRole::cases() as $role) {
            Role::firstOrCreate([
                'name' => $role->value,
                'guard_name' => 'web',
            ]);
        }

        // 3. Map Permissions to Roles
        $rolePermissions = [
            UserRole::SuperAdmin->value => [
                UserPermission::ManageTenants->value,
                UserPermission::ManageBilling->value,
                UserPermission::ManagePlatform->value,
            ],
            UserRole::Owner->value => [
                UserPermission::ManageRestaurant->value,
                UserPermission::ManageStaff->value,
                UserPermission::ManageMenu->value,
                UserPermission::ManageOrders->value,
                UserPermission::ViewOrders->value,
            ],
            UserRole::Manager->value => [
                UserPermission::ManageMenu->value,
                UserPermission::ManageOrders->value,
                UserPermission::ViewOrders->value,
            ],
            UserRole::Staff->value => [
                UserPermission::ManageOrders->value,
                UserPermission::ViewOrders->value,
            ],
            UserRole::Customer->value => [
                UserPermission::PlaceOrders->value,
                UserPermission::ViewOwnOrders->value,
            ],
        ];

        foreach ($rolePermissions as $roleName => $permissions) {
            $role = Role::findByName($roleName, 'web');
            $role->syncPermissions($permissions);
        }
    }
}
