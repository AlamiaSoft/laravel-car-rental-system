Yes, it works with [Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2) completely out of the box.
Laravel Fortify generates standard Time-Based One-Time Passwords (TOTP). This is the universal protocol used by Google Authenticator, Microsoft Authenticator, 1Password, and Authy.
Here is how Fortify makes that connection seamless without any extra plugins:
## How it Bridges to Google Authenticator

   1. The Secret Key: When a user enables 2FA, Fortify generates a secure, random cryptographic secret key and saves it to the user's database row.
   2. The QR Code (URIs): Fortify provides a built-in helper method, twoFactorQrCodeUrl(). This creates a standard otpauth:// link containing your app name and the secret key.
   3. The Scan: When you turn that link into an SVG QR code on your frontend, Google Authenticator scans it, extracts the secret, and begins generating 6-digit tokens every 30 seconds.

## Quick Frontend Example (Blade)
To show the QR code that the Google Authenticator app can scan, you just need this in your profile settings view:

{{-- 1. Display the QR Code graphic --}}
<div class="p-2 bg-white inline-block">
    {!! auth()->user()->twoFactorQrCodeSvg() !!}
</div>

{{-- 2. Optional: Show the text-based secret key if their camera is broken --}}
<p>Alternative setup key: {{ decrypt(auth()->user()->two_factor_secret) }}</p>

## Best Practice Tip: Enable Confirmation
By default, old versions of Fortify enabled 2FA the second the QR code was generated. To prevent users from locking themselves out if they scan it incorrectly, make sure you use the 2FA Confirmation feature mentioned in step 4 of the previous message. This forces the user to type in a correct code from their Google Authenticator app before the system locks down their account.
Are you implementing this using standard Blade templates, or are you building an API for a mobile app or JavaScript framework (like Vue/React)?

