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
