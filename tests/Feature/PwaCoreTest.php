<?php

use App\Enums\BusinessType;
use App\Events\OrderStatusUpdated;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantCapabilityService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Modules\Bot\Models\WhatsAppConnection;
use Modules\Bot\Services\CustomerPwaTokenService;
use Modules\Crm\Models\Customer;
use Modules\Menu\Models\Category;
use Modules\Menu\Models\Product;
use Modules\Orders\Models\Order;

beforeEach(function () {
    // Clean up DB before test
    Tenant::query()->delete();
    WhatsAppConnection::query()->delete();
    Category::query()->delete();
    Product::query()->delete();

    $this->tenant = Tenant::create([
        'id' => 'test-restaurant',
        'name' => 'Test Restaurant',
        'is_active' => true,
    ]);

    app(TenantCapabilityService::class)->applyPreset($this->tenant, BusinessType::Restaurant);

    tenancy()->initialize($this->tenant);

    // Prevent any real HTTP requests to Evolution API during tests
    Http::fake([
        '*/message/*' => Http::response(['success' => true], 200),
    ]);
});

test('webhook performs immediate CRM Customer upsert at gateway entry', function () {
    $connection = WhatsAppConnection::create([
        'tenant_id' => $this->tenant->id,
        'provider' => 'evolution',
        'instance_name' => 'test_instance_abc',
        'status' => 'open',
    ]);

    $response = $this->postJson('/api/bot/whatsapp/evolution/webhook', [
        'instance' => 'test_instance_abc',
        'event' => 'messages.upsert',
        'data' => [
            'key' => [
                'remoteJid' => '923345112969@s.whatsapp.net',
                'fromMe' => false,
            ],
            'message' => [
                'conversation' => 'Hi',
            ],
        ],
    ]);

    $response->assertOk();

    $this->assertDatabaseHas('customers', [
        'phone' => '923345112969',
        'name' => 'WhatsApp Customer',
    ]);
});

test('CustomerPwaTokenService generates and validates 15-min opaque tokens', function () {
    $customerId = 42;
    $tenantId = $this->tenant->id;

    $token = CustomerPwaTokenService::generateToken($customerId, $tenantId);
    expect($token)->toBeString();

    $payload = CustomerPwaTokenService::validateToken($token);
    expect($payload)->toBeArray();
    expect($payload['customer_id'])->toBe($customerId);
    expect($payload['tenant_id'])->toBe($tenantId);
    expect($payload['expires_at'])->toBeGreaterThan(now()->timestamp);
});

test('PWA menu endpoint performs one-time token exchange and clean redirect', function () {
    $customer = Customer::create([
        'phone' => '923345112969',
        'name' => 'Test Customer',
    ]);

    $token = CustomerPwaTokenService::generateToken($customer->id, $this->tenant->id);

    $response = $this->get(route('pwa.menu', [
        'tenant_slug' => $this->tenant->id,
        'auth' => $token,
    ]));

    // Assert 302 Redirect to strip token from URL
    $response->assertStatus(302);
    $response->assertRedirect(route('pwa.menu', ['tenant_slug' => $this->tenant->id]));

    // Assert customer ID is saved in session
    expect(session('pwa_customer_id'))->toBe($customer->id);
});

test('PWA checkout API validates and saves order details and updates CRM LTV', function () {
    $category = Category::create([
        'name' => 'Fast Food',
        'is_active' => true,
    ]);

    $product = Product::create([
        'category_id' => $category->id,
        'name' => 'Zinger Burger',
        'price' => 500,
        'is_active' => true,
    ]);

    $response = $this->postJson(route('pwa.checkout', ['tenant_slug' => $this->tenant->id]), [
        'customer_name' => 'John Doe',
        'customer_phone' => '923345112969',
        'order_type' => 'delivery',
        'delivery_address' => 'G-11, Islamabad',
        'cart' => [
            [
                'product_id' => $product->id,
                'quantity' => 2,
            ],
        ],
    ]);

    $response->assertOk();
    $response->assertJsonPath('success', true);

    $this->assertDatabaseHas('orders', [
        'customer_name' => 'John Doe',
        'customer_phone' => '923345112969',
        'total_amount' => 1150,
        'type' => 'delivery',
        'status' => 'Pending',
    ]);

    $this->assertDatabaseHas('customers', [
        'phone' => '923345112969',
        'name' => 'John Doe',
        'total_orders' => 1,
        'total_spent' => 1150,
    ]);
});

test('PWA order tracking endpoint loads correct order page', function () {
    $order = Order::create([
        'order_number' => 'ORD-TEST1234',
        'customer_phone' => '923345112969',
        'customer_name' => 'John Doe',
        'total_amount' => 500,
        'status' => 'Pending',
        'order_type' => 'WhatsApp',
        'source' => 'whatsapp',
    ]);

    $response = $this->get(route('pwa.track', [
        'tenant_slug' => $this->tenant->id,
        'order_number' => $order->order_number,
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Pwa/OrderTracking')
        ->where('order.order_number', $order->order_number)
    );
});

test('OrderStatusUpdated event triggers WhatsApp notification delivery', function () {
    // Create WhatsApp connection
    WhatsAppConnection::create([
        'tenant_id' => $this->tenant->id,
        'provider' => 'evolution',
        'instance_name' => 'test_instance_abc',
        'status' => 'open',
    ]);

    $order = Order::create([
        'order_number' => 'ORD-NOTIFY123',
        'customer_phone' => '923345112969',
        'customer_name' => 'John Doe',
        'total_amount' => 500,
        'status' => 'Preparing',
        'order_type' => 'WhatsApp',
        'source' => 'whatsapp',
    ]);

    // Dispatch status updated event
    event(new OrderStatusUpdated($order, $this->tenant->id));

    // Assert request was sent to Evolution API for text message notification
    Http::assertSent(function (Request $request) {
        return str_contains($request->url(), '/message/sendText') &&
            str_contains($request['text'], 'ORD-NOTIFY123') &&
            str_contains($request['text'], 'kitchen');
    });
});

test('tenant settings can be saved as draft and published live', function () {
    $user = User::factory()->create([
        'tenant_id' => $this->tenant->id,
    ]);

    $settingsData = [
        'branding' => ['primary_color' => '#0000FF', 'tagline' => 'Blue Fast Food'],
        'ordering' => ['type' => 'delivery', 'min_order' => 500, 'delivery_fee' => 100, 'free_delivery_threshold' => 2000, 'prep_time_mins' => 45],
        'payments' => ['cod_enabled' => true],
        'whatsapp' => ['order_preparing' => 'Cookin your meal {order_number}!'],
        'crm' => ['auto_tag' => 'vip'],
    ];

    // Save as draft
    $response = $this->actingAs($user)
        ->post(route('settings.miniapp.save'), $settingsData);

    $response->assertStatus(302);
    $this->assertDatabaseHas('tenant_settings', [
        'tenant_id' => $this->tenant->id,
        'status' => 'draft',
    ]);

    // Verify PWA menu with auth returns draft settings in preview mode
    $response = $this->actingAs($user)
        ->get(route('pwa.menu', ['tenant_slug' => $this->tenant->id, 'preview' => 'true']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Pwa/OrderMenu')
        ->where('settings.branding.primary_color', '#0000FF')
        ->where('previewMode', true)
    );

    // Publish settings
    $response = $this->actingAs($user)
        ->post(route('settings.miniapp.publish'));

    $response->assertStatus(302);
    $this->assertDatabaseHas('tenant_settings', [
        'tenant_id' => $this->tenant->id,
        'status' => 'published',
    ]);

    // Verify public PWA (no auth, no preview) loads the published color
    $response = $this->get(route('pwa.menu', ['tenant_slug' => $this->tenant->id]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Pwa/OrderMenu')
        ->where('settings.branding.primary_color', '#0000FF')
        ->where('previewMode', false)
    );
});
