<?php

use App\Enums\UserRole;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('super admin is redirected to admin dashboard', function () {
    $role = Role::firstOrCreate(['name' => UserRole::SuperAdmin->value, 'guard_name' => 'web']);

    $user = User::factory()->create([
        'tenant_id' => null,
    ]);
    $user->assignRole($role);

    $response = $this->actingAs($user)
        ->get('/dashboard');

    $response->assertRedirect(route('admin.dashboard'));
});

test('regular tenant user is not redirected to admin dashboard', function () {
    // Create tenant to satisfy foreign key constraint
    $tenant = Tenant::create([
        'id' => 'test-restaurant',
        'name' => 'Test Restaurant',
        'is_active' => true,
    ]);

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
    ]);

    $response = $this->actingAs($user)
        ->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Dashboard'));
});
