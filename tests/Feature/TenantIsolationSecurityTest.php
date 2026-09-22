<?php

use App\Enums\BusinessType;
use App\Models\AuditLog;
use App\Models\Tenant;
use App\Services\AuditLogService;
use App\Services\TenantCapabilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Crm\Models\Customer;
use Modules\Menu\Models\Category;
use Modules\Menu\Models\Product;
use Modules\Orders\Models\Order;

uses(RefreshDatabase::class);

test('tenant isolation guarantees strict cross-tenant data separation', function () {
    // Setup Tenant Alpha (Restaurant)
    $tenantA = Tenant::create(['id' => 'alpha-restaurant', 'name' => 'Alpha Restaurant']);
    app(TenantCapabilityService::class)->applyPreset($tenantA, BusinessType::Restaurant);

    // Setup Tenant Beta (Retail)
    $tenantB = Tenant::create(['id' => 'beta-retail', 'name' => 'Beta Retail']);
    app(TenantCapabilityService::class)->applyPreset($tenantB, BusinessType::Retail);

    // 1. Create Data in Tenant Alpha Context
    tenancy()->initialize($tenantA);
    $categoryA = Category::create(['name' => 'Alpha Pizzas', 'is_active' => true]);
    $productA = Product::create([
        'category_id' => $categoryA->id,
        'name' => 'Alpha Super Pizza',
        'price' => 1500,
        'is_active' => true,
    ]);
    $orderA = Order::create([
        'order_number' => 'ORD-ALPHA-01',
        'customer_name' => 'Alpha Customer',
        'customer_phone' => '+923001111111',
        'total_amount' => 1500,
        'status' => 'Delivered',
    ]);
    $customerA = Customer::create(['name' => 'Alpha VIP', 'phone' => '+923001111111']);
    AuditLogService::log('alpha_action', $orderA, ['detail' => 'secret_alpha']);

    // 2. Create Data in Tenant Beta Context
    tenancy()->initialize($tenantB);
    $categoryB = Category::create(['name' => 'Beta Electronics', 'is_active' => true]);
    $productB = Product::create([
        'category_id' => $categoryB->id,
        'name' => 'Beta Headphones',
        'price' => 3000,
        'is_active' => true,
    ]);
    $orderB = Order::create([
        'order_number' => 'ORD-BETA-01',
        'customer_name' => 'Beta Customer',
        'customer_phone' => '+923002222222',
        'total_amount' => 3000,
        'status' => 'Pending',
    ]);
    $customerB = Customer::create(['name' => 'Beta VIP', 'phone' => '+923002222222']);
    AuditLogService::log('beta_action', $orderB, ['detail' => 'secret_beta']);

    // 3. VERIFY TENANT ALPHA ISOLATION
    tenancy()->initialize($tenantA);

    // Alpha must only see Alpha's categories and products
    expect(Category::count())->toBe(1);
    expect(Category::first()->name)->toBe('Alpha Pizzas');
    expect(Product::count())->toBe(1);
    expect(Product::first()->name)->toBe('Alpha Super Pizza');

    // Alpha must only see Alpha's orders and customers
    expect(Order::count())->toBe(1);
    expect(Order::first()->order_number)->toBe('ORD-ALPHA-01');
    expect(Customer::count())->toBe(1);
    expect(Customer::first()->name)->toBe('Alpha VIP');

    // Alpha must only see Alpha's audit logs
    expect(AuditLog::count())->toBe(1);
    expect(AuditLog::first()->action)->toBe('alpha_action');

    // 4. VERIFY TENANT BETA ISOLATION
    tenancy()->initialize($tenantB);

    // Beta must only see Beta's categories and products
    expect(Category::count())->toBe(1);
    expect(Category::first()->name)->toBe('Beta Electronics');
    expect(Product::count())->toBe(1);
    expect(Product::first()->name)->toBe('Beta Headphones');

    // Beta must only see Beta's orders and customers
    expect(Order::count())->toBe(1);
    expect(Order::first()->order_number)->toBe('ORD-BETA-01');
    expect(Customer::count())->toBe(1);
    expect(Customer::first()->name)->toBe('Beta VIP');

    // Beta must only see Beta's audit logs
    expect(AuditLog::count())->toBe(1);
    expect(AuditLog::first()->action)->toBe('beta_action');
});
