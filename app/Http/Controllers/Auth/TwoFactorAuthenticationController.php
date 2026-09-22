<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Fortify\Actions\DisableTwoFactorAuthentication;
use Laravel\Fortify\Actions\EnableTwoFactorAuthentication;
use Laravel\Fortify\Actions\GenerateNewRecoveryCodes;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;

class TwoFactorAuthenticationController extends Controller
{
    /**
     * Enable two-factor authentication for the user.
     */
    public function enable(Request $request, EnableTwoFactorAuthentication $enable)
    {
        $enable($request->user());

        return back()->with('success', 'Two-factor authentication has been enabled. Please scan the QR code to confirm.');
    }

    /**
     * Confirm two-factor authentication setup.
     */
    public function confirm(Request $request, TwoFactorAuthenticationProvider $provider)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $user = $request->user();
        $secret = decrypt($user->two_factor_secret);

        if (! $provider->verify($secret, $request->code)) {
            return back()->withErrors(['code' => 'The provided two-factor authentication code was invalid.']);
        }

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
        ])->save();

        return back()->with('success', 'Two-factor authentication has been confirmed.');
    }

    /**
     * Disable two-factor authentication for the user.
     */
    public function disable(Request $request, DisableTwoFactorAuthentication $disable)
    {
        $disable($request->user());

        return back()->with('success', 'Two-factor authentication has been disabled.');
    }

    /**
     * Get the two-factor authentication setup details.
     */
    public function getQrCode(Request $request)
    {
        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json(['svg' => null, 'secret' => null]);
        }

        return response()->json([
            'svg' => $user->twoFactorQrCodeSvg(),
            'secret' => decrypt($user->two_factor_secret),
        ]);
    }

    /**
     * Get the user's two-factor recovery codes.
     */
    public function getRecoveryCodes(Request $request)
    {
        $user = $request->user();

        return response()->json($user->recoveryCodes());
    }

    /**
     * Regenerate the user's two-factor recovery codes.
     */
    public function regenerateRecoveryCodes(Request $request, GenerateNewRecoveryCodes $generate)
    {
        $generate($request->user());

        return back()->with('success', 'Recovery codes have been regenerated.');
    }
}
