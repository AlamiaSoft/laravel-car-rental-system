
# User

message time: 2026-07-08 17:10:27

this guide is for old fb setup i think; can you update for new create app interface of fb?

# SaaS Admin: Meta WhatsApp Cloud API Setup

This guide explains how the **SaaS Administrator** should configure the global Meta App to receive webhooks and manage WhatsApp integration for all tenants on the Bracemen Bot platform.

## 1. Create the Global Meta App
1. Log in to your [Meta Developer Dashboard](https://developers.facebook.com/apps/).
2. Click **Create App** and select **Other** -> **Business**.
3. Name your app (e.g., "Bracemen Bot").
4. Under "Add products to your app", locate **WhatsApp** and click **Set up**.

## 2. Configure the Global Webhook
Because this is a multi-tenant application, you only need **one global webhook**. The system will automatically route incoming messages to the correct tenant based on the wa_phone_number_id attached to the message.

1. Go to **WhatsApp** -> **Configuration** in the left sidebar.
2. Click **Edit** next to Webhook.
3. Enter your **Callback URL**. 
   - Example: https://silver-stable.samwebdevs.dpdns.org/api/bot/whatsapp/webhook
4. Enter a **Verify Token**.
   - This must exactly match the WHATSAPP_VERIFY_TOKEN value in your Laravel .env file.
5. Click **Verify and Save**.

## 3. Subscribe to Webhook Fields
Once the webhook is verified, you must tell Meta which events to send to your webhook.
1. Still on the Configuration page, click **Manage** next to Webhook fields.
2. Check the box for messages.
3. Click **Done**.

## 4. Environment Variables
Ensure your .env contains the webhook verification token:
`env
WHATSAPP_VERIFY_TOKEN=your_secure_random_token_here
`

---

*Note: You do NOT need to configure the Phone Number ID or Access Token in your .env file. Those are handled on a per-tenant basis. Please see the TENANT_WHATSAPP_ONBOARDING.md guide for instructions you can share with your restaurant owners.*

---

# Assistant

Yes. Meta's developer console has changed significantly. The old **Create App → Other → Business** flow is no longer the default for many accounts, and the WhatsApp configuration pages have also moved around.

Here's an updated guide based on the current (2026) Meta Developer interface.

---

# SaaS Admin: Meta WhatsApp Cloud API Setup

This guide explains how the **platform administrator** configures the single Meta application used by all restaurants on the Bracemen Bot platform.

> **Important**
>
> This setup is performed **once** for the entire SaaS platform. Every restaurant (tenant) will later connect its own WhatsApp Business Account and phone number.

---

# 1. Create a Meta App

1. Open the Meta Developer Dashboard:
   https://developers.facebook.com/apps

2. Click **Create App**.

3. Choose

   **Business**

   (Meta may show slightly different wording such as **Business App** depending on your account.)

4. Click **Next**.

5. Enter:

- **App Name**
  - Example:
    ```
    Bracemen Bot
    ```

- **App Contact Email**

- **Business Portfolio**
  - Select your Meta Business portfolio if available.

6. Click **Create App**.

---

# 2. Add the WhatsApp Product

After the app is created:

1. Open your app dashboard.

2. Click

```
Add Products
```

or

```
Use Cases
```

(depending on the current interface)

3. Find

```
WhatsApp
```

4. Click

```
Set Up
```

This enables the WhatsApp Cloud API for your application.

---

# 3. Configure the Webhook

Open:

```
WhatsApp
    ↓
Configuration
```

Locate the **Webhooks** section.

Click

```
Edit
```

or

```
Configure
```

depending on the interface.

Enter:

### Callback URL

Example:

```
https://your-domain.com/api/bot/whatsapp/webhook
```

Example for development:

```
https://silver-stable.samwebdevs.dpdns.org/api/bot/whatsapp/webhook
```

---

### Verify Token

Enter a secure random string.

Example:

```
my_super_secure_verify_token
```

This **must exactly match**:

```env
WHATSAPP_VERIFY_TOKEN=my_super_secure_verify_token
```

inside your Laravel `.env`.

Click

```
Verify and Save
```

If verification succeeds, Meta will display the webhook as **Verified**.

---

# 4. Subscribe to Webhook Events

After verification, subscribe the webhook to receive WhatsApp events.

Open:

```
WhatsApp
    ↓
Configuration
```

or

```
Webhooks
```

Click

```
Manage
```

(or **Edit Subscriptions**).

Enable at minimum:

- ✅ messages

Recommended:

- ✅ message_template_status_update
- ✅ message_template_quality_update
- ✅ phone_number_name_update
- ✅ phone_number_quality_update

The only required event for messaging is:

```
messages
```

---

# 5. App Mode

During development, the app remains in:

```
Development Mode
```

Once your platform is ready for production:

Switch the app to

```
Live Mode
```

This allows real businesses to connect their WhatsApp accounts.

---

# 6. Environment Variables

Only the webhook verification token is stored globally.

```env
WHATSAPP_VERIFY_TOKEN=my_super_secure_verify_token
```

No global access token or phone number should be configured.

---

# 7. Multi-Tenant Architecture

The Bracemen Bot platform uses **one webhook** for every connected restaurant.

Incoming webhook payloads contain:

- WhatsApp Business Account ID
- Phone Number ID
- Sender phone number

The platform automatically determines which tenant owns the Phone Number ID and routes the message to the correct restaurant.

Because of this architecture:

- Only **one Meta App** is required.
- Only **one webhook** is required.
- Every restaurant uses its own:
  - Access Token
  - Phone Number ID
  - WhatsApp Business Account
- Tenant credentials are stored securely in the tenant database.

---

# 8. Tenant Onboarding

After the global Meta App is configured:

Each restaurant owner should complete the onboarding process described in:

```
TENANT_WHATSAPP_ONBOARDING.md
```

The tenant will:

1. Connect their Meta Business Account.
2. Select their WhatsApp Business Account.
3. Choose their phone number.
4. Provide their Phone Number ID and permanent access token.
5. Start receiving messages immediately through the shared webhook.

---

## Notes

- Only one webhook endpoint is needed for the entire SaaS platform.
- The webhook URL does **not** change when new restaurants join.
- No changes are required in the Meta App when onboarding additional tenants—only tenant-specific credentials are added inside your application.

---

# User

message time: 2026-07-08 17:30:14

so i see a pyment method will also be needed for saas admin right?? any way we can test in the sandbox only? we are still in development?

---

# Assistant

Yes, but there are two different things to distinguish:

1. **Developing and testing the platform** (free)
2. **Using real customer phone numbers in production** (may require business verification/payment setup)

For your multi-tenant SaaS, you can develop almost the entire platform without adding a payment method.

### During development

Meta provides a **developer sandbox** for WhatsApp Cloud API.

With a newly created app you get:

- ✅ A test WhatsApp Business Account
- ✅ A test phone number provided by Meta
- ✅ Up to 5 recipient numbers that you manually add
- ✅ Free messaging for development
- ✅ Webhook testing
- ✅ Sending and receiving messages
- ✅ Template testing

This is more than enough to build:

- Tenant onboarding
- CRM
- Order flow
- AI conversation
- KDS
- POS
- Multi-tenant routing
- Cloudflare webhook
- Message parsing

without paying anything.

---

### When is a payment method needed?

Generally **not** for basic development.

A payment method becomes relevant when you want to:

- onboard real restaurant businesses
- move beyond the developer testing environment
- send production conversations at scale
- use a production WhatsApp Business Account that incurs conversation-based charges where applicable

Meta's requirements evolve over time, but production use typically also involves:
- Business verification
- Accepting platform terms
- In many cases, adding a payment method for billable usage

---

### Your SaaS architecture

For Bracemen Bot, I'd recommend this flow:

**Phase 1 (now)**

- One Meta App
- One developer WABA
- One test phone number
- One webhook
- Test with your own WhatsApp
- Build the complete platform

No restaurant needs to onboard yet.

---

**Phase 2 (beta)**

When your first restaurant is ready:

- Restaurant logs into Meta
- Connects their own WhatsApp Business Account
- Uses their own phone number
- Your SaaS stores:
  - Phone Number ID
  - Permanent Access Token
  - WABA ID

Your webhook remains exactly the same.

---

**Phase 3 (production)**

Once you have paying customers:

- Put the app into Live Mode
- Complete any required business verification
- Add a payment method if Meta requires it for your account and expected usage
- Restaurants use their own WhatsApp numbers

---

## One thing I'd change in your current plan

I would **not** ask restaurant owners to manually copy and paste:

- Phone Number ID
- Permanent Access Token

That's acceptable for an internal MVP, but it's a poor onboarding experience.

Instead, after the platform is stable, implement Meta's **Embedded Signup** flow. With Embedded Signup:

- Restaurant clicks **Connect WhatsApp**.
- They log into Meta.
- They choose or create their WhatsApp Business Account.
- They grant your app permission.
- Your SaaS automatically receives the business identifiers and tokens—no copy-pasting required.

This is how platforms such as Respond.io, Interakt, WATI, and others onboard customers. It also reduces setup errors and makes onboarding much smoother.