# OrmEasy OS — Direct Car Rental Commerce & WhatsApp PWA Platform

**OrmEasy OS** is a modern multi-tenant SaaS application that transforms WhatsApp into a high-converting gateway for direct Car Rental ordering. 

Rather than forcing customers through clumsy, text-only chat menus, OrmEasy OS pairs a fast **WhatsApp Inbound Gateway** with a high-fidelity **Mobile PWA Mini-App**, giving Car Rental owners their own branded direct channel while bypassing 20–30% third-party aggregator commissions (e.g. Foodpanda, UberEats).

---

## 🚀 Architectural Paradigm: PWA Mini-App + WhatsApp Gateway

OrmEasy OS decouples **traffic acquisition & notification** from the **commerce transaction layer**:

```text
               CUSTOMER
                  │
            "Hi" on WhatsApp  (or QR / Short Link /t/{token})
                  │
                  ▼
        WhatsApp Gateway (Evolution API / Meta Cloud)
                  │
                  ▼
        [1. Upsert Customer in CRM with verified Phone]
        [2. Generate 15-minute Opaque Exchange Token]
                  │
                  ▼
       "Order from ABC Pizza 👇 [Signed Link /t/x8k2p9m1]"
                  │
                  ▼
       Token Exchange Endpoint (/t/{token})
        [3. Validate & Consume Token -> Set HttpOnly Session]
        [4. 302 Redirect -> Clean PWA URL /app/{tenant_slug}/order]
                  │
                  ▼
      ┌───────────────────────────────────┐
      │   Branded PWA Mini-App            │
      │                                   │
      │ 🍕 Interactive Visual Menu        │
      │ 🏷️ Variants, Sizes & Modifiers    │
      │ 🛒 Persistent Cart                │
      │ 📍 Delivery Address & Pin         │
      │ 💳 COD & Direct Bank Transfer     │
      │ 📦 Live Status Order Tracking     │
      └─────────────────┬─────────────────┘
                        │
                        ▼
        Laravel Multi-Tenant APIs (`/api/pwa/*`)
        [5. Create Order & Update Customer LTV]
        [6. Push Order to Kitchen via Reverb WebSockets]
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
      Tenant CRM    Orders DB    Unified KDS (Reverb)
                        │
                        ▼
        WhatsApp Transactional Milestone Updates
        ("Preparing 🍕", "Ready 📦", "Out for Delivery 🚴")
```

---

## 🌟 Key Features

### 1. Branded PWA Mini-App (Customer Experience)
- **Instant Token Exchange**: Decoupled 15-minute opaque signed links (`/t/{token}`) convert incoming WhatsApp chats into zero-friction `HttpOnly` sessions.
- **Visual Food Catalog**: Categorized categories, item variants, add-on modifiers, special instructions, and persistent local cart.
- **1-Click Reorder CTA**: High-visibility reordering on order tracking screens for rapid repeat customer retention.
- **Live Order Tracking**: Dynamic step progress with real-time status updates.

### 2. WhatsApp Inbound Gateway & Visual Workflow Builder
- **Dual Engine Gateway**: Supports both Meta WhatsApp Cloud API and Evolution API (Baileys/WA-Web-JS).
- **Bot Workflow Builder**: Visual node-based workflow editor (`/admin/bot-workflows`) supporting `trigger`, `message`, `catalog_menu`, `pwa_link`, and `system_action` nodes with live WhatsApp message bubble previews.
- **Automated Milestone Alerts**: Queued, retry-safe notifications sent on status changes (Preparing, Ready, Delivered).

### 3. Kitchen Operations (Real-Time KDS & POS)
- **Unified KDS Screen**: Real-time order fulfillment Kanban board powered by **Laravel Reverb WebSockets** with visual state transitions.
- **Manual POS Interface**: POS screen for handling walk-in customers and phone-in orders directly into kitchen workflows.

### 4. Merchant ROI Engine & 10-Minute Launch Checklist
- **Direct ROI Calculator**: Real-time calculation of direct revenue, Average Order Value (AOV), repeat retention %, and estimated 3rd-party marketplace commission savings (vs. configurable 25% benchmarks).
- **10-Minute Stepper**: Interactive onboarding guide covering menu creation, WhatsApp integration, branding, delivery rules, and KDS testing. Easily hidden from dashboard and restored via settings.

### 5. Multi-Tenant SaaS Engine
- **Single-Database Tenant Isolation**: Tenant scope protection (`stancl/tenancy` mapped with `tenant_id` global scopes) with security test suite verifying zero cross-tenant leakage.
- **Platform SaaS Admin**: Centralized tenant management, capability toggles, and global system metrics.

---

## 🛠 Tech Stack

- **Backend Framework**: Laravel 13 (PHP 8.3)
- **Frontend Engine**: React 18, Inertia.js v2, Tailwind CSS v3
- **Database**: PostgreSQL 16 / SQLite (Single-Database Multi-Tenancy via `stancl/tenancy`)
- **Real-Time WebSockets**: Laravel Reverb
- **Code Formatter & Linter**: Laravel Pint
- **Test Suite**: Pest PHP 4

---

## 🚀 Local Development & Setup

### Prerequisites
- PHP 8.3+
- Composer
- Node.js 20+ & npm
- PostgreSQL 16+ or SQLite

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/amrshah/Whatsapp-Order-bot.git
cd Whatsapp-Order-bot

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env
php artisan key:generate
```

### 2. Database & Migrations

```bash
# Run database migrations
php artisan migrate

# Seed initial data (optional)
php artisan db:seed
```

### 3. Build & Run Local Servers

```bash
# Terminal 1: Vite Development Server
npm run dev

# Terminal 2: Laravel Web Server
php artisan serve --port=8000

# Terminal 3: Reverb WebSocket Server
php artisan reverb:start --port=8080
```

### 4. Running Tests

```bash
# Run full Pest test suite
php artisan test --compact
```

---

## 📄 License

This project is proprietary software. All rights reserved.
