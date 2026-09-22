Yes. Treat this as a **Tenant Mini-App Configuration layer**, not scattered settings. The dev agent should make all tenant-specific behavior data-driven.

### Tenant Mini-App Settings

| Group                 | Settings                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **Branding**          | Logo, favicon, primary/secondary colors, button style, font, cover/banner, business name/tagline        |
| **Mini-App**          | App title, welcome headline, welcome description, menu layout, featured items, announcement/banner      |
| **Business Hours**    | Opening/closing times, day-wise schedule, holidays, timezone                                            |
| **Ordering**          | Delivery/takeaway/both, minimum order, delivery fee, free-delivery threshold, preparation-time estimate |
| **Locations**         | Branches, addresses, GPS coordinates, service radius                                                    |
| **Payments**          | COD, bank transfer, online payment providers, payment instructions                                      |
| **Customer**          | Required checkout fields, address requirements, notes, customer consent/preferences                     |
| **WhatsApp Messages** | Welcome, PWA link, order received, confirmed, preparing, ready, out-for-delivery, delivered, cancelled  |
| **Message Controls**  | Enable/disable individual notifications, rate limits, quiet hours, duplicate protection                 |
| **PWA Links**         | Public menu URL, campaign links, QR code generation                                                     |
| **CRM**               | Customer auto-capture, tags, source/channel, lead status, custom fields                                 |
| **Brand Content**     | About business, contact info, social links, policies, delivery information                              |
| **Advanced**          | Custom CSS/theme overrides **only if safely sandboxed**, feature flags                                  |

### Important architecture

Create something like:

```text
tenant_settings
├── branding
├── business_hours
├── ordering
├── delivery
├── payments
├── whatsapp
├── crm
├── pwa
└── content
```

And expose it through a single tenant configuration service:

```php
$settings = $tenant->settings();
```

The PWA, WhatsApp gateway, checkout, CRM and notification system should all consume this configuration rather than hardcoding tenant behavior.

### One thing I'd add now

**Preview mode.**

Admin changes:

> Branding → Message → Save → **Preview Mini-App**

and sees the exact customer-facing experience before publishing.

Also add **Draft / Published** configuration states so an owner can safely change things without immediately breaking the live ordering experience.
