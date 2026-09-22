<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Modules\Bot\Models\WhatsAppConnection;

beforeEach(function () {
    // Clean up DB before test
    Tenant::query()->delete();
    User::query()->delete();
    WhatsAppConnection::query()->delete();

    $this->tenant = Tenant::create([
        'id' => 'test-restaurant',
        'name' => 'Test Restaurant',
    ]);

    $this->user = User::factory()->create([
        'tenant_id' => $this->tenant->id,
    ]);

    tenancy()->initialize($this->tenant);
});

test('authenticated user can view integrations page with evolution prop', function () {
    $response = $this
        ->actingAs($this->user)
        ->get('/settings/integrations');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Settings/Integrations')
        ->has('evolution')
    );
});

test('authenticated user can trigger evolution connection', function () {
    Http::fake([
        '*/instance/create' => Http::response([
            'instance' => [
                'instanceId' => 'evo-instance-123',
                'status' => 'disconnected',
            ],
        ], 201),
        '*/instance/connect/*' => Http::response([
            'code' => 'data:image/png;base64,qrcode_placeholder',
        ], 200),
        '*/webhook/set/*' => Http::response([], 200),
    ]);

    $response = $this
        ->actingAs($this->user)
        ->post('/settings/whatsapp/evolution/connect');

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'status' => 'connecting',
        'qrcode' => 'data:image/png;base64,qrcode_placeholder',
    ]);

    $this->assertDatabaseHas('whatsapp_connections', [
        'tenant_id' => $this->tenant->id,
        'provider' => 'evolution',
        'status' => 'connecting',
    ]);
});

test('webhook can update qrcode and status', function () {
    // Webhook needs central domain context usually, but we bypass for test
    $connection = WhatsAppConnection::create([
        'tenant_id' => $this->tenant->id,
        'provider' => 'evolution',
        'instance_name' => 'test_instance_abc',
        'status' => 'disconnected',
    ]);

    $response = $this->postJson('/api/bot/whatsapp/evolution/webhook', [
        'instance' => 'test_instance_abc',
        'event' => 'qrcode.updated',
        'data' => [
            'qrcode' => [
                'base64' => 'data:image/png;base64,new_qrcode',
            ],
        ],
    ]);

    $response->assertOk();
    $connection->refresh();
    expect($connection->status)->toBe('connecting');
    expect($connection->qrcode)->toBe('data:image/png;base64,new_qrcode');
});

test('webhook can update connection state to open', function () {
    $connection = WhatsAppConnection::create([
        'tenant_id' => $this->tenant->id,
        'provider' => 'evolution',
        'instance_name' => 'test_instance_abc',
        'status' => 'connecting',
    ]);

    $response = $this->postJson('/api/bot/whatsapp/evolution/webhook', [
        'instance' => 'test_instance_abc',
        'event' => 'connection.update',
        'data' => [
            'state' => 'open',
        ],
    ]);

    $response->assertOk();
    $connection->refresh();
    expect($connection->status)->toBe('open');
    expect($connection->qrcode)->toBeNull();
    expect($connection->connected_at)->not->toBeNull();
});
