<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;

class TwoFactorChallengeController extends Controller
{
    /**
     * Show the two-factor authentication challenge view.
     */
    public function create(Request $request)
    {
        if (! $request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    /**
     * Attempt to authenticate the user using their two-factor authentication token.
     */
    public function store(Request $request, TwoFactorAuthenticationProvider $provider)
    {
        if (! $request->session()->has('login.id')) {
            return redirect()->route('login');
        }

        $user = User::findOrFail($request->session()->get('login.id'));

        $request->validate([
            'code' => 'nullable|string',
            'recovery_code' => 'nullable|string',
        ]);

        if ($code = $request->code) {
            $secret = decrypt($user->two_factor_secret);

            if (! $provider->verify($secret, $code)) {
                return back()->withErrors(['code' => 'The provided two-factor authentication code was invalid.']);
            }
        } elseif ($recoveryCode = $request->recovery_code) {
            $recoveryCodes = $user->recoveryCodes();

            $found = false;
            foreach ($recoveryCodes as $key => $savedCode) {
                if (hash_equals($savedCode, $recoveryCode)) {
                    unset($recoveryCodes[$key]);
                    $user->forceFill([
                        'two_factor_recovery_codes' => encrypt(json_encode(array_values($recoveryCodes))),
                    ])->save();
                    $found = true;
                    break;
                }
            }

            if (! $found) {
                return back()->withErrors(['recovery_code' => 'The provided recovery code was invalid.']);
            }
        } else {
            return back()->withErrors(['code' => 'Please enter a two-factor authentication code or recovery code.']);
        }

        // Login user
        Auth::login($user, $request->session()->get('login.remember', false));

        // Clear session keys
        $request->session()->forget(['login.id', 'login.remember']);

        // Redirect to dashboard
        if ($user->isPlatformAdmin()) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
