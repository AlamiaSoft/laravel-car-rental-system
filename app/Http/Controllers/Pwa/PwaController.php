<?php

namespace App\Http\Controllers\Pwa;

use App\Capability\PwaExperienceResolver;
use App\Events\OrderCreated;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantSetting;
use App\Services\TenantSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Modules\Bot\Services\CustomerPwaTokenService;
use Modules\Crm\Models\Customer;
use Modules\Menu\Models\Category;
use Modules\Menu\Models\Product;
use Modules\Orders\Models\Order;

class PwaController extends Controller
{
    /**
     * Resolve tenant context by slug.
     */
    protected function initializeTenant(string $slug): Tenant
    {
        $tenant = Tenant::find($slug);
        if (! $tenant || ! $tenant->is_active) {
            abort(404, 'Restaurant not found.');
        }
        tenancy()->initialize($tenant);

        return $tenant;
    }

    /**
     * Resolve short token, exchange customer session, and redirect to primary PWA experience.
     */
    public function shortTokenExchange(string $token)
    {
        $payload = CustomerPwaTokenService::validateToken($token);

        if (! $payload || empty($payload['tenant_id'])) {
            abort(404, 'Invalid or expired ordering link.');
        }

        $tenant = $this->initializeTenant($payload['tenant_id']);

        if (! empty($payload['customer_id'])) {
            session(['pwa_customer_id' => $payload['customer_id']]);
        }

        $resolver = app(PwaExperienceResolver::class);
        $baseUrl = $resolver->primaryExperience($tenant);

        return redirect($baseUrl);
    }

    /**
     * Exchange short-lived token and display menu.
     */
    public function exchangeTokenAndShowMenu(Request $request, string $tenant_slug)
    {
        $tenant = $this->initializeTenant($tenant_slug);

        // 1. One-time exchange flow: consume incoming auth token
        if ($request->has('auth')) {
            $token = $request->query('auth');
            $payload = CustomerPwaTokenService::validateToken($token);

            if ($payload && $payload['tenant_id'] === $tenant->id) {
                // Store verified customer identity in secure HttpOnly session
                session(['pwa_customer_id' => $payload['customer_id']]);

                // 302 Redirect to clean URL
                return redirect()->route('pwa.menu', ['tenant_slug' => $tenant_slug]);
            }
        }

        // 2. Load Customer Profile (Customer Memory)
        $customer = null;
        $customerId = session('pwa_customer_id');
        if ($customerId) {
            $customer = Customer::with('addresses')->find($customerId);
        }

        // 3. Load Tenant settings (Support Secure Live Preview Mode)
        $status = 'published';
        if ($request->query('preview') === 'true' && auth()->check() && auth()->user()->tenant_id === $tenant->id) {
            $status = 'draft';
        }
        $settings = $tenant->settings($status);

        // 4. Load Active Menu Catalog
        $categories = Category::where('is_active', true)
            ->with(['products' => function ($query) {
                $query->where('is_active', true);
            }])
            ->get();

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

    /**
     * Generate Web App Manifest dynamically.
     */
    public function manifest(Request $request, string $tenant_slug)
    {
        $tenant = $this->initializeTenant($tenant_slug);
        $settings = $tenant->settings('published');
        $branding = $settings->branding ?? [];

        $manifest = [
            'name' => $tenant->name,
            'short_name' => $tenant->name,
            'start_url' => route('pwa.menu', ['tenant_slug' => $tenant_slug]),
            'display' => 'standalone',
            'background_color' => '#ffffff',
            'theme_color' => $branding['primary_color'] ?? '#ef4444',
            'icons' => [
                [
                    'src' => $branding['logo'] ?: 'https://cdn-icons-png.flaticon.com/512/3565/3565418.png',
                    'sizes' => '512x512',
                    'type' => 'image/png',
                ],
            ],
        ];

        return response()->json($manifest);
    }

    /**
     * Handle order submission from PWA.
     */
    public function submitOrder(Request $request, string $tenant_slug)
    {
        $tenant = $this->initializeTenant($tenant_slug);
        $settings = $tenant->settings('published');
        $orderingConfig = $settings->ordering ?? [];

        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'order_type' => 'required|in:delivery,takeaway,dinein',
            'delivery_address' => 'required_if:order_type,delivery|string|nullable',
            'delivery_notes' => 'nullable|string',
            'cart' => 'required|array|min:1',
            'cart.*.product_id' => 'required|exists:products,id',
            'cart.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request, $tenant, $tenant_slug, $orderingConfig) {
            // 1. Upsert CRM Customer
            $phone = preg_replace('/[^0-9]/', '', $request->input('customer_phone'));
            $customer = Customer::firstOrCreate(['phone' => $phone]);
            $customer->name = $request->input('customer_name');
            $customer->touch(); // Refresh last interaction date

            // 2. Save delivery address if delivery type
            if ($request->input('order_type') === 'delivery') {
                $addressText = $request->input('delivery_address');
                $customer->addresses()->firstOrCreate([
                    'address' => $addressText,
                ], [
                    'label' => 'Recent Address',
                    'delivery_notes' => $request->input('delivery_notes'),
                ]);
            }

            // 3. Compute Cart Totals & Create Order
            $subtotalAmount = 0;
            $itemsData = [];

            foreach ($request->input('cart') as $item) {
                $product = Product::find($item['product_id']);
                if ($product) {
                    $subtotal = $product->price * $item['quantity'];
                    $subtotalAmount += $subtotal;

                    $itemsData[] = [
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'unit_price' => $product->price,
                        'subtotal' => $subtotal,
                    ];
                }
            }

            // Enforce Minimum Order Threshold validation
            $minOrder = $orderingConfig['min_order'] ?? 0;
            if ($subtotalAmount < $minOrder) {
                return response()->json([
                    'success' => false,
                    'errors' => ['general' => "Minimum order amount is Rs. {$minOrder}."],
                ], 422);
            }

            // Calculate delivery charges
            $deliveryFee = $orderingConfig['delivery_fee'] ?? 150;
            $freeThreshold = $orderingConfig['free_delivery_threshold'] ?? 1500;
            if ($subtotalAmount >= $freeThreshold) {
                $deliveryFee = 0;
            }

            $totalAmount = $subtotalAmount;
            if ($request->input('order_type') === 'delivery') {
                $totalAmount += $deliveryFee;
            }

            $order = Order::create([
                'order_number' => 'ORD-'.strtoupper(uniqid()),
                'customer_phone' => $phone,
                'customer_name' => $customer->name,
                'total_amount' => $totalAmount,
                'status' => 'Pending',
                'order_type' => 'WhatsApp',
                'type' => $request->input('order_type'),
                'source' => 'whatsapp',
                'delivery_address' => $request->input('delivery_address'),
            ]);

            // Save order items
            foreach ($itemsData as $item) {
                $order->items()->create($item);
            }

            // Update Customer LTV metrics
            $customer->total_orders += 1;
            $customer->total_spent += $totalAmount;
            $customer->last_order_date = now();
            $customer->save();

            // Link customer session
            session(['pwa_customer_id' => $customer->id]);

            // 4. Broadcast to KDS via WebSockets
            try {
                broadcast(new OrderCreated($order->load('items.product'), $tenant->id));
            } catch (\Exception $e) {
                Log::warning('PWA Submit Order: Could not broadcast OrderCreated event: '.$e->getMessage());
            }

            return response()->json([
                'success' => true,
                'order_number' => $order->order_number,
                'redirect_url' => route('pwa.track', ['tenant_slug' => $tenant_slug, 'order_number' => $order->order_number]),
            ]);
        });
    }

    /**
     * Live order status tracker page.
     */
    public function trackOrder(Request $request, string $tenant_slug, string $order_number)
    {
        $tenant = $this->initializeTenant($tenant_slug);
        $settings = $tenant->settings('published');
        $businessName = $settings->branding['business_name'] ?? $tenant->name;

        $order = Order::where('order_number', $order_number)
            ->with('items.product')
            ->firstOrFail();

        return Inertia::render('Pwa/OrderTracking', [
            'tenant' => [
                'id' => $tenant->id,
                'name' => $businessName,
            ],
            'order' => $order,
        ]);
    }

    /**
     * Display the settings form.
     */
    public function showSettings(Request $request)
    {
        $tenant = tenant();
        $settings = $tenant->settings('draft');

        return Inertia::render('Settings/MiniApp', [
            'settings' => $settings,
            'tenantId' => $tenant->id,
        ]);
    }

    /**
     * Save draft configurations.
     */
    public function saveSettings(Request $request)
    {
        $tenant = tenant();

        $validated = $request->validate([
            'branding' => 'required|array',
            'ordering' => 'required|array',
            'payments' => 'required|array',
            'whatsapp' => 'required|array',
            'crm' => 'required|array',
        ]);

        TenantSetting::updateOrCreate(
            ['tenant_id' => $tenant->id, 'status' => 'draft'],
            $validated
        );

        return redirect()->back()->with('success', 'Draft settings saved successfully.');
    }

    /**
     * Upload brand logo image.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpg,jpeg,png,webp,svg|max:3072',
        ]);

        if (! file_exists(public_path('storage'))) {
            try {
                Artisan::call('storage:link');
            } catch (\Throwable $e) {
                Log::warning('Failed to create storage symlink automatically: '.$e->getMessage());
            }
        }

        $tenant = tenant();
        $file = $request->file('logo');
        $filename = 'logo_'.time().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs("logos/{$tenant->id}", $filename, 'public');
        $url = asset("storage/{$path}");

        // Also update draft settings branding logo automatically
        $settings = $tenant->settings('draft');
        $branding = $settings->branding ?? [];
        $branding['logo'] = $url;
        $settings->branding = $branding;
        $settings->save();

        return response()->json([
            'success' => true,
            'url' => $url,
            'message' => 'Logo uploaded successfully.',
        ]);
    }

    /**
     * Publish draft configurations to live environment.
     */
    public function publishSettings(Request $request)
    {
        $tenant = tenant();
        (new TenantSettingsService)->publish($tenant->id);

        return redirect()->back()->with('success', 'Mini-App settings published successfully!');
    }
}
