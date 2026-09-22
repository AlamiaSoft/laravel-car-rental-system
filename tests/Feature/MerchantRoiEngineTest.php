<?php

use App\Enums\BusinessType;
use App\Models\Tenant;
use App\Models\User;
use App\Services\MerchantRoiService;
use App\Services\TenantCapabilityService;
use App\Services\TenantSettingsService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Orders\Models\Order;

uses(RefreshDatabase::class);

test('merchant roi engine calculates direct revenue, AOV, and commission savings correctly', function () {
    $tenant = Tenant::create(['id' => 'pizza-hub-roi', 'name' => 'Pizza Hub ROI']);
    app(TenantCapabilityService::class)->applyPreset($tenant, BusinessType::Restaurant);
    tenancy()->initialize($tenant);

    // Set custom 30% commission rate in settings
    $settingsService = app(TenantSettingsService::class);
    $settings = $settingsService->getSettings($tenant->id, 'published');
    $ordering = $settings->ordering;
    $ordering['marketplace_commission_rate'] = 30;
    $settings->ordering = $ordering;
    $settings->save();

    // Create completed orders inside this month
    $order1 = Order::create([
        'order_number' => 'ORD-1001',
        'customer_name' => 'Alice',
        'customer_phone' => '+923001112222',
        'total_amount' => 2000.00,
        'status' => 'Delivered',
    ]);
    $order1->created_at = Carbon::now()->startOfMonth()->addDays(2);
    $order1->save();

    $order2 = Order::create([
        'order_number' => 'ORD-1002',
        'customer_name' => 'Bob',
        'customer_phone' => '+923003334444',
        'total_amount' => 1000.00,
        'status' => 'Delivered',
    ]);
    $order2->created_at = Carbon::now()->startOfMonth()->addDays(3);
    $order2->save();

    // Order outside this month (last month)
    $order3 = Order::create([
        'order_number' => 'ORD-0999',
        'customer_name' => 'Charlie',
        'customer_phone' => '+923005556666',
        'total_amount' => 5000.00,
        'status' => 'Delivered',
    ]);
    $order3->created_at = Carbon::now()->subMonths(2);
    $order3->save();

    $roiService = app(MerchantRoiService::class);

    // 1. Calculate for this_month
    $monthMetrics = $roiService->calculate($tenant->id, 'this_month');
    expect($monthMetrics['total_orders'])->toBe(2);
    expect($monthMetrics['gross_revenue'])->toBe(3000.0);
    expect($monthMetrics['average_order_value'])->toBe(1500.0);
    expect($monthMetrics['commission_rate'])->toBe(30.0);
    expect($monthMetrics['commission_saved'])->toBe(900.0); // 30% of 3000

    // 2. Calculate for all_time
    $allTimeMetrics = $roiService->calculate($tenant->id, 'all_time');
    expect($allTimeMetrics['total_orders'])->toBe(3);
    expect($allTimeMetrics['gross_revenue'])->toBe(8000.0);
    expect($allTimeMetrics['commission_saved'])->toBe(2400.0); // 30% of 8000
});

test('merchant roi engine segments new vs returning customers correctly', function () {
    $tenant = Tenant::create(['id' => 'burger-lab-roi', 'name' => 'Burger Lab ROI']);
    app(TenantCapabilityService::class)->applyPreset($tenant, BusinessType::Restaurant);
    tenancy()->initialize($tenant);

    $phoneReturning = '+923009998888';
    $phoneNew = '+923001234567';

    // Prior order last month
    $oldOrder = Order::create([
        'order_number' => 'OLD-001',
        'customer_phone' => $phoneReturning,
        'customer_name' => 'Returning Customer',
        'total_amount' => 1200.00,
        'status' => 'Delivered',
    ]);
    $oldOrder->created_at = Carbon::now()->subMonth();
    $oldOrder->save();

    // Orders this month
    $newOrder1 = Order::create([
        'order_number' => 'NEW-001',
        'customer_phone' => $phoneReturning,
        'customer_name' => 'Returning Customer',
        'total_amount' => 1500.00,
        'status' => 'Delivered',
    ]);
    $newOrder1->created_at = Carbon::now();
    $newOrder1->save();

    $newOrder2 = Order::create([
        'order_number' => 'NEW-002',
        'customer_phone' => $phoneNew,
        'customer_name' => 'Brand New Customer',
        'total_amount' => 800.00,
        'status' => 'Delivered',
    ]);
    $newOrder2->created_at = Carbon::now();
    $newOrder2->save();

    $roiService = app(MerchantRoiService::class);
    $metrics = $roiService->calculate($tenant->id, 'this_month');

    expect($metrics['unique_ordering_customers'])->toBe(2);
    expect($metrics['returning_customers_count'])->toBe(1);
    expect($metrics['new_customers_count'])->toBe(1);
    expect($metrics['repeat_rate'])->toBe(50.0);
});

test('dashboard route renders with period filters', function () {
    $tenant = Tenant::create(['id' => 'tasty-bites', 'name' => 'Tasty Bites']);
    app(TenantCapabilityService::class)->applyPreset($tenant, BusinessType::Restaurant);

    $user = User::factory()->create(['tenant_id' => $tenant->id]);

    $response = $this->actingAs($user)
        ->get('/dashboard?period=today');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Dashboard')
        ->has('kpis')
        ->where('selectedPeriod', 'today')
        ->has('kpis.commission_saved')
        ->has('kpis.gross_revenue')
        ->has('kpis.total_orders')
    );
});
