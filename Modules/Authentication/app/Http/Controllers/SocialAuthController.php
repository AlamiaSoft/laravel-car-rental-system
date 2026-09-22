<?php

namespace Modules\Authentication\Http\Controllers;

use App\Enums\BusinessType;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use App\Services\TenantCapabilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     *
     * @return RedirectResponse
     */
    public function redirect(string $provider)
    {
        $config = config("services.{$provider}");

        $clientId = $config['client_id'] ?? '';
        $redirectUrl = $config['redirect'] ?? '';
        $maskedClientId = ! empty($clientId)
            ? substr($clientId, 0, 10).'...'.substr($clientId, -10)
            : 'EMPTY';

        Log::info("Social Auth Redirect Initiated: Provider: '{$provider}', ClientID: '{$maskedClientId}', RedirectURI: '{$redirectUrl}'");

        if (request()->has('business_type')) {
            $type = BusinessType::tryFrom(request()->query('business_type'));
            if ($type) {
                session(['oauth_business_type' => $type->value]);
            }
        }

        if (empty($config['client_id']) || empty($config['client_secret']) || empty($config['redirect'])) {
            Log::error("Social Auth Redirect Blocked: Incomplete credentials/configuration for '{$provider}'. Verify client_id, client_secret, and redirect in .env variables and clear config cache via 'php artisan config:clear'.");

            return redirect()->route('login')->with('error', "Authentication configuration for '{$provider}' is incomplete on the server.");
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from the provider.
     *
     * @return RedirectResponse
     */
    public function callback(string $provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->user();

            $user = User::where('provider_id', $socialUser->getId())
                ->orWhere('email', $socialUser->getEmail())
                ->first();

            if (! $user) {
                // Register a new user
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'email' => $socialUser->getEmail(),
                    'provider_name' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                    // Generate a random password for social logins just to satisfy DB constraints
                    'password' => Hash::make(Str::random(24)),
                ]);

                // Create a tenant for the new user based on selected business type
                $businessTypeValue = session()->pull('oauth_business_type');
                $businessType = BusinessType::tryFrom($businessTypeValue) ?? BusinessType::Restaurant;

                $suffix = match ($businessType) {
                    BusinessType::Retail => 'Store',
                    BusinessType::Restaurant => 'Restaurant',
                };

                $firstName = explode(' ', $user->name)[0];
                $tenantName = "{$firstName}'s {$suffix}";

                $slug = Str::slug($tenantName);
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
                    'name' => $tenantName,
                ]);

                app(TenantCapabilityService::class)->applyPreset($tenant, $businessType);

                // Associate user with tenant
                $user->tenant_id = $tenant->id;
                $user->save();

                // Initialize tenancy context to assign roles within tenant scope (if using tenant-aware spatie)
                // For single-db with global roles, this might just work directly.
                $user->assignRole(UserRole::Owner->value);
            } else {
                // Update the user's provider info if they already existed via email
                $user->update([
                    'provider_name' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'avatar' => $socialUser->getAvatar(),
                ]);
            }

            Auth::login($user, true);

            return redirect()->intended(route('dashboard', absolute: false));
        } catch (\Exception $e) {
            Log::error('Social Auth callback failed: '.$e->getMessage());

            return redirect()->route('login')->with('error', 'Authentication failed. Please try again.');
        }
    }
}
