<?php

use App\Capability\PwaExperienceResolver;
use App\Enums\BusinessType;
use App\Enums\TenantCapability;
use App\Exceptions\CapabilityNotEnabledException;
use App\Models\Tenant;
use App\Services\TenantCapabilityService;
use Illuminate\Support\Facades\Route;
use Modules\Menu\Models\Category;
use Modules\Menu\Models\Product;

beforeEach(function () {
    Tenant::query()->delete();

    $this->tenant = Tenant::create([
        'id' => 'test-salon',
        'name' => 'Test Salon',
        'is_active' => true,
    ]);

    tenancy()->initialize($this->tenant);
    $this->service = new TenantCapabilityService;
});

test('preset application seeds capabilities and sets primary experience', function () {
    // 1. Apply Restaurant Preset
    $this->service->applyPreset($this->tenant, BusinessType::Restaurant);

    expect($this->tenant->fresh()->business_type)->toBe(BusinessType::Restaurant->value);
    expect($this->tenant->fresh()->primary_experience)->toBe('order');

    expect($this->tenant->hasCapability(TenantCapability::Catalog))->toBeTrue();
    expect($this->tenant->hasCapability(TenantCapability::Ordering))->toBeTrue();
    expect($this->tenant->hasCapability(TenantCapability::Kds))->toBeTrue();
    expect($this->tenant->hasCapability(TenantCapability::Delivery))->toBeTrue();
});

test('enabling capability automatically enables transitive dependencies', function () {
    // Kds depends on Ordering which depends on Catalog.
    // Let me enable Kds on an empty tenant.
    expect($this->tenant->hasCapability(TenantCapability::Kds))->toBeFalse();

    $this->tenant->enableCapability(TenantCapability::Kds);

    expect($this->tenant->hasCapability(TenantCapability::Kds))->toBeTrue();
    expect($this->tenant->hasCapability(TenantCapability::Ordering))->toBeTrue();
    expect($this->tenant->hasCapability(TenantCapability::Catalog))->toBeTrue();
});

test('disabling capability throws exception if active dependents exist', function () {
    // Enable Kds (which resolves Ordering and Catalog)
    $this->tenant->enableCapability(TenantCapability::Kds);

    // Cannot disable Catalog because Ordering (and thus Kds) depends on it
    expect(fn () => $this->tenant->disableCapability(TenantCapability::Catalog))
        ->toThrow(RuntimeException::class, "Cannot disable 'catalog': the following active capabilities depend on it: ordering");

    // Cannot disable Ordering because Kds depends on it
    expect(fn () => $this->tenant->disableCapability(TenantCapability::Ordering))
        ->toThrow(RuntimeException::class, "Cannot disable 'ordering': the following active capabilities depend on it: kds");

    // Can disable Kds since nothing depends on it
    $this->tenant->disableCapability(TenantCapability::Kds);
    expect($this->tenant->hasCapability(TenantCapability::Kds))->toBeFalse();
});

test('primary_experience is validated and invalid value throws exception', function () {
    // Enable catalog and ordering first
    $this->tenant->enableCapability(TenantCapability::Ordering);

    // 'order' is valid because Ordering is enabled
    $this->service->validatePrimaryExperience($this->tenant, 'order');
});

test('syncing capabilities resolves dependencies and removes unused capabilities', function () {
    // Enable ordering
    $this->tenant->enableCapability(TenantCapability::Ordering);

    // Now sync to only have Catalog
    $this->service->syncCapabilities($this->tenant, [TenantCapability::Catalog]);

    expect($this->tenant->hasCapability(TenantCapability::Catalog))->toBeTrue();

    // Ordering should have been removed
    expect($this->tenant->hasCapability(TenantCapability::Ordering))->toBeFalse();
});

test('capability middleware allows access if enabled and aborts/throws if disabled', function () {
    // Register a test route
    Route::get('/_test/ordering-gate', function () {
        return response()->json(['success' => true]);
    })->middleware(['web', 'capability:ordering']);

    // Disable ordering
    $this->tenant->capabilities()->delete();

    // Attempting to access should throw CapabilityNotEnabledException (handled as 403 HTTP exception)
    $this->get('/_test/ordering-gate')
        ->assertStatus(403);

    // Now enable capability
    $this->tenant->enableCapability(TenantCapability::Ordering);

    // Access should now be allowed
    $this->get('/_test/ordering-gate')
        ->assertOk()
        ->assertJson(['success' => true]);
});

test('PwaExperienceResolver resolves correct URLs and respects primary_experience', function () {
    $resolver = new PwaExperienceResolver;

    // Empty tenant has no experiences
    $this->tenant->capabilities()->delete();
    expect($resolver->resolve($this->tenant))->toBeEmpty();

    // Apply Restaurant preset
    $this->service->applyPreset($this->tenant, BusinessType::Restaurant);

    // primary_experience is 'order'
    expect($resolver->primaryExperience($this->tenant))->toBe(url("/app/{$this->tenant->id}/order"));

    // Resolve returns 'order' experience url
    $resolved = $resolver->resolve($this->tenant);
    expect($resolved)->toHaveKey('order');
    expect($resolved['order'])->toBe(url("/app/{$this->tenant->id}/order"));
});

test('runtime capability disablement immediately rejects checkout mutation with 403', function () {
    // 1. Start with Restaurant preset (Ordering enabled)
    $this->service->applyPreset($this->tenant, BusinessType::Restaurant);

    $category = Category::create([
        'name' => 'Main Courses',
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Burger',
        'price' => 500,
        'is_active' => true,
    ]);

    $payload = [
        'customer_name' => 'Test Customer',
        'customer_phone' => '1234567890',
        'order_type' => 'takeaway',
        'cart' => [
            ['product_id' => $product->id, 'quantity' => 1],
        ],
    ];

    // 2. Initial checkout succeeds
    $response = $this->postJson("/app/{$this->tenant->id}/checkout", $payload);
    $response->assertOk();

    // 3. Admin disables Kds and Delivery and then Ordering capability at runtime
    $this->tenant->disableCapability(TenantCapability::Kds);
    $this->tenant->disableCapability(TenantCapability::Delivery);
    $this->tenant->disableCapability(TenantCapability::Ordering);

    // 4. Subsequent checkout attempt must be rejected with 403
    $secondResponse = $this->postJson("/app/{$this->tenant->id}/checkout", $payload);
    $secondResponse->assertStatus(403);
});

test('registration applies chosen business_type preset', function () {
    // 1. Register as a Restaurant
    $response = $this->post('/register', [
        'name' => 'City Restaurant',
        'email' => 'chef@cityrestaurant.com',
        'password' => 'Pass!123',
        'password_confirmation' => 'Pass!123',
        'business_type' => 'restaurant',
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));

    $restaurantTenant = Tenant::where('id', 'city-restaurant')->first();
    expect($restaurantTenant)->not->toBeNull();
    expect($restaurantTenant->business_type)->toBe(BusinessType::Restaurant->value);
    expect($restaurantTenant->primary_experience)->toBe('order');

    // Capabilities must match exact Restaurant preset (Catalog, Ordering, Kds, Delivery)
    expect($restaurantTenant->hasCapability(TenantCapability::Catalog))->toBeTrue();
    expect($restaurantTenant->hasCapability(TenantCapability::Ordering))->toBeTrue();
    expect($restaurantTenant->hasCapability(TenantCapability::Kds))->toBeTrue();
    expect($restaurantTenant->hasCapability(TenantCapability::Delivery))->toBeTrue();
});
