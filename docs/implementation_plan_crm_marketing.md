# Future Sprints Plan: Advanced CRM & WhatsApp Marketing

This document outlines how we will break down the advanced CRM, WhatsApp Marketing, and Super Admin infrastructure features into manageable, iterative sprints. These will be executed *after* we finish the pending items from our current roadmap (e.g., interactive bot flow, KDS websockets).

---

## Sprint 6: WhatsApp Foundation & Operational CRM
**Goal:** Establish a production-ready WhatsApp connection and an operational interface for staff.

* **Embedded WhatsApp Onboarding:** Implement Meta's embedded signup flow so new tenants can connect their numbers, verify webhooks, and validate permissions entirely within the app.
* **Operational Customer Profiles:** Core profile management (Timeline, Notes, Addresses, Order History, Chat History).
* **Omnichannel Shared Inbox:** Foundational chat interface designed generically for `Conversations` (initially WhatsApp, easily extensible to Instagram, Messenger, etc.).
* **Agent Takeover:** Allow human agents to pause the bot and take over a conversation from the shared inbox.

---

## Sprint 7: Customer Intelligence & Promotions
**Goal:** Build the analytics layer for customer segmentation and reusable promotions.

* **Customer 360 View:** A flagship dashboard showing LTV, Order Frequency, Churn Probability, Recent Campaigns Viewed, and Favorite items in a single screen.
* **Dynamic Segments:** Rules-based audiences evaluated in real-time (e.g., `LTV > 50,000 AND Orders > 15`) rather than static tags.
* **Marketing Consent Management:** Track opt-in/opt-out status by channel (WhatsApp, SMS, Email) to ensure compliance.
* **Promotions Engine:** Build reusable promotions (Coupons, Free delivery, Buy X Get Y, Category/Item discounts) that can be referenced later in campaigns.

---

## Sprint 8: Campaigns & Meta Integration
**Goal:** Give tenants the ability to compose, schedule, and send targeted WhatsApp broadcasts.

* **Meta Template Management:** Centralized dashboard to submit, track, and manage Meta-approved message templates across all tenants.
* **Campaign Builder UI:** Interface to select dynamic segments, attach reusable promotions, compose messages, and preview them.
* **Intelligent Scheduling & Targeting:** Schedule sends and evaluate dynamic audience rules at the time of execution.

---

## Sprint 9: AI Marketing
**Goal:** Supercharge marketing efforts with AI-driven optimization and safeguards.

* **AI Marketing Assistant:** Beyond just generating copy, the AI will take a prompt (e.g. "Increase weekday lunch sales") and suggest the audience, template, timing, coupon code, and imagery.
* **Frequency Controls & Safeguards:** Protect sender reputation with built-in caps on promotional frequency per user.
* **A/B Testing & Send-Time Recommendations:** Optimize campaigns based on open rates and historical data.
* **Campaign Optimization:** Full-funnel KPI tracking (Sent → Delivered → Read → Replies → Orders Generated → Revenue → ROI).

---

## Sprint 10: SaaS Operations (Super Admin)
**Goal:** Harden the platform for scale, ensuring reliable delivery and accurate tracking for the SaaS owner.

* **Extensive Usage Metering:** Track multiple metrics per tenant (Orders, Revenue Processed, WhatsApp Messages, AI Tokens, Storage, API Calls, Campaigns).
* **Billing Integration:** Drive monthly invoicing and plan limits based on the gathered usage metrics.
* **Reliability & Tracking:** Webhook router with background retry queues ensuring delivery even if Meta's API has downtime.
* **Audit Logs & Tenant Analytics:** System-wide monitoring and platform health dashboards.
