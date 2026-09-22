# ADR 0003: Multi-Tenancy Architecture

## Status
Accepted

## Context
The Alamia Restaurant OS is a SaaS platform serving multiple restaurants (tenants). We need a strategy to ensure data isolation so that one restaurant cannot accidentally query or modify data belonging to another restaurant. 
The PRD states: "Every module isolated by Tenant ID."

## Decision
We will use a **Single-Database Architecture with Global Scopes**, enforced via a custom `tenant_id` foreign key.
*   **Why not multi-database (`stancl/tenancy`)?** While multi-database architectures offer extreme isolation, they add significant operational overhead for migrations, scaling, and cross-tenant reporting (which may be needed later for a master super-admin dashboard). A single database with global scopes is highly performant and perfectly adequate for this business model.
*   **Implementation:** All tenant-specific models (Menus, Orders, Branches) will use a `BelongsToTenant` trait that automatically applies a Laravel Global Scope: `where('tenant_id', auth()->user()->tenant_id)`.

## Consequences
*   **Positive:** Easier database management, simpler migrations, and native compatibility with `nwidart/laravel-modules`.
*   **Negative:** Developers must always remember to use the `BelongsToTenant` trait on new models to ensure data doesn't leak.
