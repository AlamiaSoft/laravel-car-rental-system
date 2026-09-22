<?php

namespace App\Http\Controllers\Admin;

use App\Capability\CapabilityRegistry;
use App\Enums\BusinessType;
use App\Enums\TenantCapability;
use App\Exceptions\InvalidPrimaryExperienceException;
use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Services\TenantCapabilityService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Menu\Models\Product;
use Modules\Orders\Models\Order;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = Tenant::with('domains')->latest()->get();

        return Inertia::render('Admin/Tenants/Index', [
            'tenants' => $tenants,
        ]);
    }

    public function edit(Tenant $tenant)
    {
        // Query the specific tenant's database for lightweight metrics
        // We temporarily initialize this tenant's environment
        $metrics = [
            'total_orders' => 0,
            'active_products' => 0,
        ];

        try {
            tenancy()->initialize($tenant);
            $metrics['total_orders'] = Order::count();
            $metrics['total_sales'] = Order::whereIn('status', ['Completed', 'Delivered'])->sum('total_amount');
            $metrics['active_products'] = Product::where('is_active', true)->count();
            tenancy()->end();
        } catch (\Exception $e) {
            \Log::error("Could not query metrics for tenant {$tenant->id}: ".$e->getMessage());
        }

        $capabilities = $tenant->capabilities()->pluck('capability')->map(fn ($c) => $c->value)->toArray();
        $capabilityDefinitions = array_map(fn ($dto) => $dto->toArray(), CapabilityRegistry::forFrontend());
        $businessTypes = array_map(fn ($case) => [
            'value' => $case->value,
            'label' => ucfirst($case->value),
            'default_capabilities' => array_map(fn ($c) => $c->value, $case->defaultCapabilities()),
            'default_primary_experience' => $case->defaultPrimaryExperience(),
        ], BusinessType::cases());

        return Inertia::render('Admin/Tenants/Edit', [
            'tenant' => $tenant->load('domains'),
            'metrics' => $metrics,
            'capabilities' => $capabilities,
            'capabilityDefinitions' => $capabilityDefinitions,
            'businessTypes' => $businessTypes,
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
            'business_type' => 'nullable|string',
            'primary_experience' => 'nullable|string',
            'capabilities' => 'nullable|array',
            'capabilities.*' => 'string',
        ]);

        $tenant->update([
            'name' => $request->input('name'),
            'is_active' => $request->input('is_active', true),
        ]);

        // Apply preset defaults if business_type is changing
        if ($request->filled('business_type') && $request->input('business_type') !== $tenant->business_type) {
            $type = BusinessType::tryFrom($request->input('business_type'));
            if ($type) {
                app(TenantCapabilityService::class)->applyPreset($tenant, $type);
            }
        }

        // Sync capabilities if provided (only if business_type wasn't changed, to avoid double-syncing)
        if ($request->has('capabilities') && ($request->input('business_type') === $tenant->business_type)) {
            $caps = array_map(fn ($val) => TenantCapability::from($val), $request->input('capabilities', []));
            try {
                app(TenantCapabilityService::class)->syncCapabilities($tenant, $caps);
            } catch (\Exception $e) {
                return redirect()->back()->withErrors(['capabilities' => $e->getMessage()]);
            }
        }

        // Validate and update primary_experience
        if ($request->has('primary_experience') && ($request->input('business_type') === $tenant->business_type)) {
            $exp = $request->input('primary_experience');
            if (empty($exp)) {
                $tenant->update(['primary_experience' => null]);
            } else {
                try {
                    app(TenantCapabilityService::class)->validatePrimaryExperience($tenant, $exp);
                    $tenant->update(['primary_experience' => $exp]);
                } catch (InvalidPrimaryExperienceException $e) {
                    return redirect()->back()->withErrors(['primary_experience' => $e->getMessage()]);
                }
            }
        }

        return redirect()->back()->with('success', 'Tenant updated successfully.');
    }

    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->route('admin.tenants.index')->with('success', 'Tenant deleted successfully.');
    }

    public function updateBilling(Request $request, Tenant $tenant)
    {
        $validated = $request->validate([
            'billing_model' => 'required|in:fixed,commission',
            'billing_rate' => 'required|numeric|min:0',
            'billing_frequency' => 'required|in:daily,weekly,monthly,manual',
        ]);

        $tenant->update($validated);

        return redirect()->back()->with('success', 'Billing configuration updated.');
    }

    public function generateInvoice(Tenant $tenant)
    {
        $amount = 0;
        $periodStart = $tenant->last_billed_at ? Carbon::parse($tenant->last_billed_at) : now()->subDays(7);
        $periodEnd = now();

        if ($tenant->billing_model === 'fixed') {
            $amount = $tenant->billing_rate;
        } elseif ($tenant->billing_model === 'commission') {
            tenancy()->initialize($tenant);
            $totalSales = Order::whereIn('status', ['Completed', 'Delivered'])
                ->whereBetween('created_at', [$periodStart, $periodEnd])
                ->sum('total_amount');
            $amount = $totalSales * ($tenant->billing_rate / 100);
            tenancy()->end();
        }

        if ($amount > 0) {
            Invoice::create([
                'tenant_id' => $tenant->id,
                'amount' => $amount,
                'status' => 'pending',
                'billing_period_start' => $periodStart,
                'billing_period_end' => $periodEnd,
                'due_date' => now()->addDays(7),
                'type' => $tenant->billing_model,
            ]);

            $tenant->update(['last_billed_at' => now()]);

            return redirect()->back()->with('success', 'Manual invoice generated successfully.');
        }

        return redirect()->back()->with('success', 'No invoice generated (amount is 0).');
    }

    public function orders(Request $request, Tenant $tenant)
    {
        $startDate = $request->query('start_date', now()->subDays(30)->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        tenancy()->initialize($tenant);

        $orders = Order::whereBetween('created_at', [
            Carbon::parse($startDate)->startOfDay(),
            Carbon::parse($endDate)->endOfDay(),
        ])->latest()->get();

        $completedOrdersTotal = $orders->whereIn('status', ['Completed', 'Delivered'])->sum('total_amount');
        $expectedCommission = 0;

        if ($tenant->billing_model === 'commission') {
            $expectedCommission = $completedOrdersTotal * ($tenant->billing_rate / 100);
        } elseif ($tenant->billing_model === 'fixed') {
            $expectedCommission = $tenant->billing_rate; // Just to display something, though fixed rate doesn't depend on orders
        }

        tenancy()->end();

        return Inertia::render('Admin/Tenants/Orders', [
            'tenant' => $tenant->load('domains'),
            'orders' => $orders,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'stats' => [
                'total_completed_amount' => $completedOrdersTotal,
                'expected_commission' => $expectedCommission,
                'billing_model' => $tenant->billing_model,
                'billing_rate' => $tenant->billing_rate,
            ],
        ]);
    }
}
