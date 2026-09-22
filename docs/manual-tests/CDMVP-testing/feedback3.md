i have social auth implemented in a laravel app; when i registered/logged in via Google; in my profile i need to update password; i dont know what my current password is because i registered via Google Auth

That's normal. With Google OAuth, your Laravel app may have created the user without a local password (or with an unusable/random password). So there is no "current password" you can know or enter.

Your profile's Change Password flow should handle OAuth users differently:

Local-password user: require current password → new password.
Google-only user: show Set Password → new password + confirmation. No current password required.
After setting it, the user can log in either with Google or with email + password (assuming your app supports both).
Laravel implementation

The key is to determine whether the user actually has a usable password.

For example:

if (is_null($user->password)) {
    // OAuth-only account
    // Allow setting a new password without asking for current password.
} else {
    // Normal password account
    // Require current password verification.
}

However, don't rely solely on password === null if your Socialite implementation creates a random password for OAuth users. A better design is to explicitly track authentication providers, e.g.:

users
  id
  email
  password
  ...


social_accounts
  id
  user_id
  provider       // google
  provider_id

Then your logic becomes:

$user->socialAccounts()->exists()

and, more importantly, you can determine whether the user has a local password credential independently from whether they have Google linked.

What I'd recommend for your app

Your profile UI should probably say:

If Google-only:

Password not set
You registered using Google. Set a password if you'd also like to sign in with your email and password.

Button:

Set Password

If password exists:

Change Password

with:

Current Password
New Password
Confirm New Password

And if you want enterprise-grade authentication, I'd keep Google login and local password as two independent credentials. That gives you a clean path later for Microsoft, GitHub, MFA, passkeys, etc.