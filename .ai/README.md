# AI Knowledge Base Master Index: Car Rental Operating System (SaaS)

Welcome to the canonical AI knowledge base for **OrmEasy Car Rental OS**. This system is designed to minimize context loss and preserve architectural intent.

> [!NOTE]
> This platform has been transformed from an earlier restaurant WhatsApp ordering bot codebase into a full-fledged **Multi-Tenant Car Rental Operating System (SaaS)** featuring a Branded Customer PWA Mini-App, Fleet & Vehicle Management, Driver Allocation & Dispatch, Flexible Booking Lifecycle & Pricing Engine, Inbound WhatsApp Booking Gateway, and Central SaaS Management.

## The AI Bootstrap Read Order
If you are an AI Agent entering a fresh conversation, you **must** read the following documents in order before inspecting or modifying the source code:

1. **[Master Index](file:///e:/myapps/ms-rabia/Car-Rental-System/laravel-car-rental-system/.ai/README.md)** (You are here)
2. **[System Architecture](file:///e:/myapps/ms-rabia/Car-Rental-System/laravel-car-rental-system/.ai/permanent/architecture/01-system-architecture.md)** — Architectural principles, tenancy model, and domain structure.
3. **[Repository Index](file:///e:/myapps/ms-rabia/Car-Rental-System/laravel-car-rental-system/.ai/indexes/repository.md)** — Code map connecting business domains (Vehicles, Drivers, Bookings, PWA, WhatsApp) to files.
4. **[Domain Glossary](file:///e:/myapps/ms-rabia/Car-Rental-System/laravel-car-rental-system/.ai/permanent/glossary/01-car-rental-domain.md)** — Terminology, status lifecycles, and pricing models.
5. **[Coding Standards](file:///e:/myapps/ms-rabia/Car-Rental-System/laravel-car-rental-system/.ai/permanent/standards/01-coding-standards.md)** — Module conventions, service layers, and testing rules.
6. **[Current State & Sprint](file:///e:/myapps/ms-rabia/Car-Rental-System/laravel-car-rental-system/.ai/transient/sprint/00-current-state.md)** — Latest deployment status, seeded dataset, and open roadmap.

---

## Directory Structure

### Permanent Knowledge (Preserved Across Sprints)
* **`permanent/architecture/`**: System architecture, multi-tenancy isolation (`stancl/tenancy`), capability engine, and integration patterns.
* **`permanent/glossary/`**: Ubiquitous domain language (Vehicles, Fleets, Drivers, Bookings, Fuel Settlement Policies, Pricing Modes, Booking Requests).
* **`permanent/standards/`**: Laravel 13, React/Inertia v2, modular domain structure (`Modules/Rental`), and Pest testing conventions.
* **`permanent/adr/`**: Architecture Decision Records.

### Transient Knowledge (Sprint & Hand-off Context)
* **`transient/sprint/`**: Current sprint focus, active implementation tasks, and operational readiness.
* **`transient/handoffs/`**: Detailed session-by-session handoffs documenting code migrations, bugfixes, and deployment steps.
* **`transient/backlog/`**: Prioritized future enhancements (e.g. dedicated driver PWA app, telematics integrations).

### Indexes & Reference
* **`indexes/repository.md`**: Maps business concepts to directories, models, controllers, and services.
