Yes. **This is a much better authorization foundation**, but I would make two changes before letting the dev agent implement it.

### 1. Don't overuse `isOwner()`, `isManager()`, etc.

The enum is good:

```php
UserRole::Owner
UserPermission::ManageOrders
```

But these helpers:

```php
isOwner()
isManager()
isStaff()
isCustomer()
```

can become another layer of role-specific coupling. Keep only genuinely meaningful identity checks such as:

```php
isPlatformAdmin()
```

For normal authorization, use:

```php
$user->can(UserPermission::ManageOrders->value);
```

and let **Policies/Gates + Spatie** determine what the user can actually do.

Also, `isPlatformAdmin()` should ideally not need to know the implementation detail `tenant_id === null` forever. That's a tenancy/domain rule and should eventually live behind something like `isPlatformUser()` / `hasPlatformRole()`.

### 2. Add MFA now, not later

You're right to identify this now. **Platform Admin and tenant Owner accounts should have MFA available from day one**, particularly because these accounts can manage restaurants, orders, staff, billing, integrations and potentially WhatsApp credentials.

I'd structure the security layer roughly:

```text
Authentication
├── Password
├── Email verification
├── Session management
└── MFA
    ├── TOTP authenticator app
    ├── Recovery codes
    └── Optional "remember this device"

Authorization
├── UserRole enum
├── UserPermission enum
├── Spatie roles/permissions
├── Policies/Gates
└── Tenant boundary enforcement
```

**Important:** don't build a custom MFA system if you're already using Jetstream/Fortify infrastructure. Reuse Laravel's established authentication/MFA mechanisms rather than inventing your own.

One architectural point I'd explicitly add to your sprint: **tenant isolation must be enforced independently of roles/permissions.** An Owner having `manage orders` must mean *manage orders belonging to their tenant*, not "manage orders anywhere." That's a policy/tenancy boundary, not a permission itself.

So overall: **approve the redesign, add MFA + tenant-boundary authorization to the same security sprint, and avoid turning the User model into a pile of role-specific convenience methods.**
