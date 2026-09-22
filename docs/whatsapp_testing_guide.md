# How to Test Real WhatsApp Business Integration

To test the actual WhatsApp bot with your WABA number, you'll need to hook up Meta's Webhooks to your local development environment. 

I've already updated the `BotController` to dynamically use the `wa_access_token` and `wa_phone_number_id` specific to the Tenant receiving the message, so your multi-tenant architecture is ready to go!

## Step 1: Prepare the Tenant Data
Ensure that the tenant you are testing with has their WhatsApp credentials saved in the database.
You can do this via Laravel Tinker (`php artisan tinker`):
```php
$tenant = App\Models\Tenant::find('your_tenant_id');
$tenant->wa_phone_number_id = '123456789012345'; // From Meta App Dashboard
$tenant->wa_access_token = 'EAAB...'; // Your Permanent or Temporary Access Token
$tenant->save();
```

## Step 2: Configure Environment Variables
In your `.env` file, ensure you have a verification token set up for Meta's webhook handshake:
```env
WHATSAPP_VERIFY_TOKEN=my_secure_token_123
```

## Step 3: Route via your Cloudflare Tunnel
Since you are using a local Docker CF tunnel (`samwebdevs.dpdns.org`), ensure your Laravel server is running and accessible to the CF tunnel container.
1. Start your Laravel server locally on a known port (e.g., `php artisan serve --host=0.0.0.0 --port=8000`).
2. Make sure your CF tunnel is configured to route traffic from `https://samwebdevs.dpdns.org` to your local Laravel app port.

## Step 4: Configure the Meta Developer Dashboard
1. Go to your App in the **Meta Developer Dashboard**.
2. Navigate to **WhatsApp > Configuration** in the left sidebar.
3. Click **Edit** under Webhook.
4. **Callback URL:** Enter your CF tunnel URL followed by the webhook route: 
   `https://samwebdevs.dpdns.org/api/bot/whatsapp/webhook`
5. **Verify Token:** Enter the exact token you set in your `.env` file (`my_secure_token_123`).
6. Click **Verify and Save**.

## Step 5: Subscribe to Messages
Once the webhook is verified, click **Manage** under the Webhook fields section on the same page.
* Find the **`messages`** row and click **Subscribe**.

## Step 6: Test!
Send a WhatsApp message (e.g., "Hi" or "Menu") to your WABA test number from your personal phone. 
Watch your Ngrok terminal—you should see a `POST /api/bot/whatsapp/webhook` request come in, and the bot should immediately reply!
