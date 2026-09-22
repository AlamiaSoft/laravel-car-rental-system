<?php

use App\Enums\UserRole;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Bot\Models\BotSession;
use Modules\Bot\Models\BotWorkflow;
use Modules\Bot\Services\WorkflowExecutionEngine;
use Modules\Menu\Models\Category;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->tenant = Tenant::create([
        'id' => 'workflow-restaurant',
        'name' => 'Workflow Restaurant',
    ]);

    $role = Role::firstOrCreate(['name' => UserRole::SuperAdmin->value, 'guard_name' => 'web']);

    $this->superAdmin = User::factory()->create([
        'tenant_id' => null,
    ]);
    $this->superAdmin->assignRole($role);

    $this->regularUser = User::factory()->create([
        'tenant_id' => $this->tenant->id,
    ]);

    tenancy()->initialize($this->tenant);
});

test('platform admin can view bot workflows list page', function () {
    $response = $this
        ->actingAs($this->superAdmin)
        ->get('/admin/bot-workflows');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('Admin/BotWorkflows/Index'));
});

test('non-admin user cannot access admin bot workflows page', function () {
    $response = $this
        ->actingAs($this->regularUser)
        ->get('/admin/bot-workflows');

    $response->assertForbidden();
});

test('platform admin can create a new bot workflow template', function () {
    $response = $this
        ->actingAs($this->superAdmin)
        ->post('/admin/bot-workflows', [
            'tenant_id' => null,
            'name' => 'Custom SaaS Workflow',
            'description' => 'Test bot workflow schema',
            'is_active' => true,
            'trigger_keywords' => ['hi', 'start'],
            'nodes_schema' => [
                [
                    'key' => 'root_trigger',
                    'type' => 'trigger',
                    'title' => 'Trigger Entry',
                ],
                [
                    'key' => 'welcome_msg',
                    'type' => 'message',
                    'title' => 'Welcome Message',
                    'config' => ['body' => 'Welcome to {{tenant.name}}!'],
                ],
            ],
        ]);

    $response->assertRedirect('/admin/bot-workflows');
    $this->assertDatabaseHas('bot_workflows', [
        'name' => 'Custom SaaS Workflow',
        'is_active' => true,
    ]);
});

test('workflow execution engine renders trigger message node correctly', function () {
    $workflow = BotWorkflow::create([
        'tenant_id' => $this->tenant->id,
        'name' => 'Active Test Workflow',
        'is_active' => true,
        'trigger_keywords' => ['hi', 'hello'],
        'nodes_schema' => [
            [
                'key' => 'welcome_node',
                'type' => 'message',
                'title' => 'Welcome Step',
                'config' => ['body' => 'Assalam-o-Alaikum! Welcome to {{tenant.name}}.'],
            ],
        ],
    ]);

    $session = BotSession::create([
        'phone_number' => '923001234567',
        'tenant_id' => $this->tenant->id,
        'current_state' => 'START',
        'current_node_key' => 'welcome_node',
        'expires_at' => now()->addHours(2),
    ]);

    $engine = new WorkflowExecutionEngine;
    $result = $engine->execute($session, 'hi', 'text');

    expect($result)->toBeArray();
    expect($result['type'])->toBe('text');
    expect($result['text']['body'])->toContain('Assalam-o-Alaikum! Welcome to Workflow Restaurant.');
});

test('workflow execution engine dynamically resolves catalog menu node', function () {
    Category::create([
        'tenant_id' => $this->tenant->id,
        'name' => 'Burgers & Fries',
        'is_active' => true,
    ]);

    $workflow = BotWorkflow::create([
        'tenant_id' => $this->tenant->id,
        'name' => 'Catalog Flow',
        'is_active' => true,
        'trigger_keywords' => ['menu'],
        'nodes_schema' => [
            [
                'key' => 'cat_node',
                'type' => 'catalog_menu',
                'title' => 'Menu Step',
            ],
        ],
    ]);

    $session = BotSession::create([
        'phone_number' => '923001234567',
        'tenant_id' => $this->tenant->id,
        'current_state' => 'START',
        'current_node_key' => 'cat_node',
        'expires_at' => now()->addHours(2),
    ]);

    $engine = new WorkflowExecutionEngine;
    $result = $engine->execute($session, 'menu', 'text');

    expect($result)->toBeArray();
    expect($result['text']['body'])->toContain('Burgers & Fries');
});

test('workflow execution engine generates PWA short link node', function () {
    $workflow = BotWorkflow::create([
        'tenant_id' => $this->tenant->id,
        'name' => 'PWA Flow',
        'is_active' => true,
        'trigger_keywords' => ['app'],
        'nodes_schema' => [
            [
                'key' => 'pwa_node',
                'type' => 'pwa_link',
                'title' => 'PWA Step',
            ],
        ],
    ]);

    $session = BotSession::create([
        'phone_number' => '923001234567',
        'tenant_id' => $this->tenant->id,
        'current_state' => 'START',
        'current_node_key' => 'pwa_node',
        'expires_at' => now()->addHours(2),
    ]);

    $engine = new WorkflowExecutionEngine;
    $result = $engine->execute($session, 'app', 'text');

    expect($result)->toBeArray();
    expect($result['text']['body'])->toContain('/t/');
});
