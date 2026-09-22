# WhatsApp Integration Guide for Restaurant Owners

This guide explains how to connect your WhatsApp Business number to **OrmEasy OS** so your incoming customer chats automatically receive your 1-click PWA Mini-App ordering links and status updates.

---

## Connection Options

OrmEasy OS supports two simple ways to connect your WhatsApp number:

1. **Option A — Evolution API (1-Click QR Code Scan)**: Best for instant setup using your existing WhatsApp / WhatsApp Business mobile app.
2. **Option B — Meta WhatsApp Cloud API**: Best for high-volume official Business Accounts.

---

## Option A: 1-Click QR Code Scan (Evolution API)

1. Log into your **OrmEasy OS Restaurant Dashboard**.
2. Navigate to **Settings** -> **Integrations** in the left sidebar.
3. Under **WhatsApp Connection**, click **Generate Connection QR Code**.
4. Open WhatsApp on your phone -> **Settings / Menu** -> **Linked Devices** -> **Link a Device**.
5. Scan the QR code displayed on your screen.
6. Once connected, your status will turn **Connected (Active)** immediately.

---

## Option B: Meta WhatsApp Cloud API

### 1. What You Need
- A Meta Developer Account (https://developers.facebook.com/)
- A registered Meta App (type: Business)
- A WhatsApp Business Account linked to your App

### 2. Get Your Credentials
You need two pieces of information from Meta:
1. **Phone Number ID**
2. **Permanent Access Token**

#### How to find your Phone Number ID
1. Log in to your [Meta Developer Dashboard](https://developers.facebook.com/apps/) and select your app.
2. In the left sidebar under **WhatsApp**, click **API Setup**.
3. Scroll down to the "Send and receive messages" section.
4. Copy the number listed under **Phone number ID**.

#### How to generate a Permanent Access Token
1. Go to your [Meta Business Settings](https://business.facebook.com/settings).
2. In the left sidebar, click **Users** -> **System Users**.
3. Click **Add** to create a new system user (e.g., name it "OrmEasy API"). Assign them an **Admin** role.
4. Click on the newly created System User, then click **Add Assets**. Assign your WhatsApp Business Account to this user with full control.
5. Click **Generate New Token**.
6. Select your app from the dropdown.
7. Check the boxes for these two permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
8. Click **Generate Token** and copy the long string of characters. **Save this somewhere safe, as Meta will not show it again.**

### 3. Save Credentials in Your Dashboard
1. Log into your **OrmEasy OS Dashboard**.
2. Navigate to **Settings** -> **Integrations**.
3. Select **Meta Cloud API** as your provider.
4. Paste your **Phone Number ID** and **Permanent Access Token**.
5. Click **Save Changes**.

---

That's it! Your WhatsApp number is now connected, and OrmEasy OS will automatically send your branded 1-click PWA Mini-App ordering links to incoming customers.
