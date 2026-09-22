<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('authenticated merchant can upload brand logo and update draft settings', function () {
    Storage::fake('public');

    $tenant = Tenant::create(['id' => 'burger-queen', 'name' => 'Burger Queen']);
    $user = User::factory()->create(['tenant_id' => $tenant->id]);

    $file = UploadedFile::fake()->create('store_logo.png', 100, 'image/png');

    $response = $this->actingAs($user)
        ->postJson('/settings/miniapp/logo', [
            'logo' => $file,
        ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $settings = $tenant->settings('draft');
    expect($settings->branding['logo'])->not->toBeEmpty();
    expect($settings->branding['logo'])->toContain('/storage/logos/burger-queen/logo_');
});
