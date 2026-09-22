# Sprint 0: Foundation

## Active Goal
Establish the core OS architecture including Multi-tenancy, Authentication, Role-Based Access Control (RBAC), and Restaurant Onboarding.

## Current Tasks
1. Complete Multi-tenancy (`tenant_id` global scopes in `Core` module).
2. Complete RBAC (Spatie Laravel Permission implementation).
3. Connect Social Auth to Tenant Generation (Restaurant Onboarding).

## Definition of Done
A user can log in via Google, an isolated `Tenant` is automatically generated for their restaurant, and they are granted the `Owner` role with permissions.
