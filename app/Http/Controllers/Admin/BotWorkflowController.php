<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Bot\Models\BotWorkflow;

class BotWorkflowController extends Controller
{
    public function index()
    {
        $workflows = BotWorkflow::with('tenant')
            ->latest()
            ->get();

        $tenants = Tenant::select('id', 'name')->get();

        return Inertia::render('Admin/BotWorkflows/Index', [
            'workflows' => $workflows,
            'tenants' => $tenants,
        ]);
    }

    public function create()
    {
        $tenants = Tenant::select('id', 'name')->get();

        $defaultSchema = [
            'nodes' => [
                [
                    'key' => 'root_trigger',
                    'type' => 'trigger',
                    'title' => 'Trigger Entry',
                    'config' => ['keywords' => ['hi', 'hello', 'menu', 'start']],
                ],
                [
                    'key' => 'welcome_msg',
                    'type' => 'message',
                    'title' => 'Welcome Message',
                    'config' => [
                        'body' => "Welcome to {{tenant.name}}!\n\nHow would you like to place your order today?\n\n1. 📜 Order directly in WhatsApp Chat\n2. 📱 Open PWA App",
                        'buttons' => [
                            ['id' => 'action_view_menu', 'title' => '📜 Order in WhatsApp'],
                        ],
                    ],
                ],
                [
                    'key' => 'catalog_node',
                    'type' => 'catalog_menu',
                    'title' => 'Interactive Catalog',
                    'config' => [],
                ],
                [
                    'key' => 'pwa_link_node',
                    'type' => 'pwa_link',
                    'title' => 'PWA App Link',
                    'config' => [],
                ],
            ],
            'edges' => [],
        ];

        return Inertia::render('Admin/BotWorkflows/Editor', [
            'workflow' => null,
            'tenants' => $tenants,
            'defaultSchema' => $defaultSchema,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tenant_id' => 'nullable|string|exists:tenants,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'trigger_keywords' => 'nullable|array',
            'nodes_schema' => 'required|array',
            'edges_schema' => 'nullable|array',
        ]);

        if (! empty($validated['is_active'])) {
            BotWorkflow::where('tenant_id', $validated['tenant_id'] ?? null)->update(['is_active' => false]);
        }

        $workflow = BotWorkflow::create($validated);

        return redirect()->route('admin.bot-workflows.index')->with('success', 'Workflow created successfully.');
    }

    public function edit(BotWorkflow $workflow)
    {
        $tenants = Tenant::select('id', 'name')->get();

        return Inertia::render('Admin/BotWorkflows/Editor', [
            'workflow' => $workflow->load('tenant'),
            'tenants' => $tenants,
        ]);
    }

    public function update(Request $request, BotWorkflow $workflow)
    {
        $validated = $request->validate([
            'tenant_id' => 'nullable|string|exists:tenants,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'trigger_keywords' => 'nullable|array',
            'nodes_schema' => 'required|array',
            'edges_schema' => 'nullable|array',
        ]);

        if (! empty($validated['is_active'])) {
            BotWorkflow::where('tenant_id', $validated['tenant_id'] ?? null)
                ->where('id', '!=', $workflow->id)
                ->update(['is_active' => false]);
        }

        $workflow->update($validated);

        return redirect()->route('admin.bot-workflows.index')->with('success', 'Workflow updated successfully.');
    }

    public function toggleActivate(BotWorkflow $workflow)
    {
        $newStatus = ! $workflow->is_active;

        if ($newStatus) {
            BotWorkflow::where('tenant_id', $workflow->tenant_id)->update(['is_active' => false]);
        }

        $workflow->update(['is_active' => $newStatus]);

        return redirect()->back()->with('success', 'Workflow status updated successfully.');
    }

    public function destroy(BotWorkflow $workflow)
    {
        $workflow->delete();

        return redirect()->route('admin.bot-workflows.index')->with('success', 'Workflow deleted successfully.');
    }
}
