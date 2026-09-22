<?php

namespace App\Http\Controllers\Auth;

use App\Enums\BusinessType;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantCapabilityService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'business_type' => ['nullable', 'string', new Enum(BusinessType::class)],
        ]);

        $businessType = BusinessType::tryFrom($request->input('business_type')) ?? BusinessType::Restaurant;

        $slug = Str::slug($request->name);
        if (empty($slug)) {
            $slug = $businessType->value;
        }

        $originalSlug = $slug;
        $count = 1;
        while (Tenant::where('id', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        $tenant = Tenant::create([
            'id' => $slug,
            'name' => $request->name,
            'trial_ends_at' => now()->addDays(15),
            'subscription_status' => 'trial',
        ]);

        app(TenantCapabilityService::class)->applyPreset($tenant, $businessType);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tenant_id' => $tenant->id,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
