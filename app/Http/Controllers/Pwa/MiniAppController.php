<?php

namespace App\Http\Controllers\Pwa;

use App\Capability\CapabilityRegistry;
use App\Capability\PwaExperienceResolver;
use App\Enums\TenantCapability;
use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Bot\Services\CustomerPwaTokenService;
use Modules\Crm\Models\Customer;
use Modules\Menu\Models\Category;
use Modules\Rental\Models\Vehicle;

class MiniAppController extends Controller
{
    /**
     * Resolve tenant context by slug.
     */
    protected function initializeTenant(string $slug): Tenant
    {
        $tenant = Tenant::find($slug);
        if (! $tenant || ! $tenant->is_active) {
            abort(404, 'Restaurant/Business not found.');
        }
        tenancy()->initialize($tenant);

        return $tenant;
    }

    /**
     * Canonical entry point for /app/{slug}
     */
    public function index(Request $request, string $slug)
    {
        $tenant = $this->initializeTenant($slug);

        // One-time exchange flow: consume incoming auth token
        if ($request->has('auth')) {
            $token = $request->query('auth');
            $payload = CustomerPwaTokenService::validateToken($token);

            if ($payload && $payload['tenant_id'] === $tenant->id) {
                // Store verified customer identity in secure HttpOnly session
                session(['pwa_customer_id' => $payload['customer_id']]);

                // 302 Redirect to clean URL
                return redirect($request->url());
            }
        }

        // Dynamically resolve primary experience URL
        $resolver = app(PwaExperienceResolver::class);
        $activeExperiences = $resolver->resolve($tenant);

        if (! empty($activeExperiences)) {
            $primaryUrl = $resolver->primaryExperience($tenant);
            if ($primaryUrl !== $request->url()) {
                return redirect($primaryUrl);
            }
        }

        return $this->renderMiniApp($tenant, null);
    }

    /**
     * Entry point for specific experience, e.g. /app/{slug}/{experience}
     */
    public function experience(Request $request, string $slug, string $experience)
    {
        $tenant = $this->initializeTenant($slug);

        // One-time exchange flow: consume incoming auth token
        if ($request->has('auth')) {
            $token = $request->query('auth');
            $payload = CustomerPwaTokenService::validateToken($token);

            if ($payload && $payload['tenant_id'] === $tenant->id) {
                // Store verified customer identity in secure HttpOnly session
                session(['pwa_customer_id' => $payload['customer_id']]);

                // 302 Redirect to clean URL
                return redirect($request->url());
            }
        }

        // Validate that the requested experience is enabled for this tenant
        $requiredCapability = CapabilityRegistry::capabilityForExperience($experience);
        if ($requiredCapability && ! $tenant->hasCapability($requiredCapability)) {
            // Customer UX: redirect to primary valid experience
            $resolver = app(PwaExperienceResolver::class);
            $primaryUrl = $resolver->primaryExperience($tenant);

            if ($primaryUrl !== $request->url()) {
                return redirect($primaryUrl);
            }
        }

        return $this->renderMiniApp($tenant, $experience);
    }

    /**
     * Render the single-page PWA shell with necessary context.
     */
    protected function renderMiniApp(Tenant $tenant, ?string $experience): Response
    {
        $customer = null;
        $customerId = session('pwa_customer_id');
        if ($customerId) {
            $customer = Customer::with('addresses')->find($customerId);
        }

        // Support Secure Live Preview Mode matching original PwaController logic
        $status = 'published';
        if (request()->query('preview') === 'true' && auth()->check() && auth()->user()->tenant_id === $tenant->id) {
            $status = 'draft';
        }
        $settings = $tenant->settings($status);

        // Load active menu catalog if catalog capability is enabled
        $categories = [];
        if ($tenant->hasCapability(TenantCapability::Catalog)) {
            $categories = Category::where('is_active', true)
                ->with(['products' => function ($query) {
                    $query->where('is_active', true);
                }])
                ->get();
        }

        // Render legacy OrderMenu component directly if ordering capability is active and experience is order
        if (($experience === 'order' || $experience === 'ordering') && $tenant->hasCapability(TenantCapability::Ordering)) {
            return Inertia::render('Pwa/OrderMenu', [
                'tenant' => [
                    'id' => $tenant->id,
                    'name' => $tenant->name,
                ],
                'customer' => $customer,
                'categories' => $categories,
                'settings' => $settings,
                'previewMode' => $status === 'draft',
            ]);
        }

        $activeCapabilities = $tenant->capabilities()->pluck('capability')->map(fn ($c) => $c->value)->toArray();

        $vehicles = [];
        if ($tenant->hasCapability(TenantCapability::Fleet) || $tenant->hasCapability(TenantCapability::Rentals)) {
            $vehicles = \Modules\Rental\Models\Vehicle::where('status', \App\Enums\VehicleStatus::Available->value)
                ->select(['id', 'model', 'year', 'plate_number', 'daily_rate', 'fuel_tank_capacity', 'image_url', 'photo_metadata'])
                ->orderBy('model')
                ->get();
        }

        return Inertia::render('Pwa/MiniApp', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $tenant->name,
            ],
            'customer' => $customer,
            'categories' => $categories,
            'vehicles' => $vehicles,
            'settings' => $settings,
            'currentExperience' => $experience,
            'capabilities' => $activeCapabilities,
            'previewMode' => $status === 'draft',
        ]);
    }
}
