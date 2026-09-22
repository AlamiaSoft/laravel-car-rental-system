# R&D: Tenant Payment Collection Strategy

## Overview
This document outlines the strategy for collecting subscription or commission-based payments from tenants (restaurants) using the Hotel Wala Bot platform, specifically tailored for the Pakistani market.

## Billing Frequency
- **Proposed Default:** Weekly billing.
- **Why Weekly?** Cash flow is critical for restaurants. Weekly billing ensures the platform receives its cut (or subscription fee) regularly without accumulating a large monthly balance that might be harder for a small restaurant to pay off at once.
- **Configurability:** The billing frequency (Weekly, Bi-Weekly, Monthly, Annually) must be configurable globally via the Super Admin panel, with the ability to override on a per-tenant basis for special contracts.

## Collection Models
1. **Fixed Subscription:** A flat fee (e.g., Rs. 5,000/week) for access to the platform.
2. **Commission-Based:** A percentage of the total GMV (Gross Merchandise Value) processed through the bot.
3. **Hybrid:** A small base fee + a lower commission percentage.

## Payment Integration Options (Pakistani Market)

Since Stripe is not natively supported for businesses registered strictly in Pakistan, we must consider Merchant of Record (MoR) solutions or local payment gateways.

### 1. Merchant of Record (Global Solutions)
- **LemonSqueezy / Paddle:**
  - **Pros:** Handles all taxation, invoicing, and global compliance. Supports payouts to Pakistani bank accounts via Wire Transfer or Payoneer.
  - **Cons:** Higher transaction fees (approx. 5% + fixed fee). Requires approval and might be overkill if all tenants are purely local Pakistani businesses paying in PKR.

### 2. Local Pakistani Payment Gateways
- **Safepay:**
  - **Pros:** Modern API, excellent developer experience, supports recurring billing via card tokenization.
  - **Cons:** Requires a registered Pakistani company (SECP) and corporate bank account.
- **PayFast / NIFT ePay:**
  - **Pros:** Deep integration with local banks, supports bank transfers and local debit/credit cards.
  - **Cons:** APIs can be older; recurring billing might be harder to automate seamlessly compared to Stripe.
- **JazzCash / EasyPaisa (Mobile Wallets):**
  - **Pros:** Extremely high penetration in Pakistan.
  - **Cons:** Better suited for consumer-to-business (B2C) payments rather than automated B2B SaaS recurring billing.

### 3. Manual Invoicing & Bank Transfers (MVP Approach)
- **How it works:** The system automatically generates a weekly invoice based on the tenant's usage and emails/WhatsApp's it to the restaurant owner.
- **Payment Method:** The owner pays via direct IBAN bank transfer or Raast ID.
- **Reconciliation:** The Super Admin manually marks the invoice as 'Paid' in the Admin Panel.
- **Pros:** Zero gateway fees, easiest to implement immediately.
- **Cons:** Manual operational overhead as the platform scales.

## Recommended Approach
1. **Phase 1 (MVP):** Implement automated **Manual Invoicing & Bank Transfers**. Generate weekly invoices, notify tenants via WhatsApp, and provide a Raast ID / IBAN for payment. Add an interface in the Super Admin panel to mark invoices as Paid.
2. **Phase 2 (Automated):** Integrate **Safepay** for automated recurring card payments if the tenants have debit/credit cards, OR integrate a local gateway like **Kuickpay** which generates a unique consumer number for tenants to pay via their banking app easily.

## Next Steps
1. Create a billing or invoices table to track weekly generated charges.
2. Build a Cron job that runs every Monday to calculate the previous week's dues and generate an invoice.
3. Add a Billing section to the Super Admin panel to track unpaid invoices.
