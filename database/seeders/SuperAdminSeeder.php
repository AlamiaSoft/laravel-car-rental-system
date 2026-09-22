<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roleName = UserRole::SuperAdmin->value;
        $role = Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);

        $user = User::firstOrCreate(
            ['email' => 'amr.shah@gmail.com'],
            [
                'name' => 'Amr Shah',
                'password' => Hash::make('Pass!123'),
                'tenant_id' => null,
            ]
        );

        if (! $user->hasRole($roleName)) {
            $user->assignRole($role);
        }
    }
}
