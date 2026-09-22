Yes. Since the Evolution endpoint is already live at `https://evoapi.alamiaai.com`, I’d make this a **focused integration sprint**, not a rewrite of your existing bot. Evolution supports instance creation, QR generation, connection-state management, webhooks/events, and message sending through its API; importantly, instance creation can include the webhook configuration and selected events. ([Evolution API Documentation][1])

## Sprint: WhatsApp Channel Integration — Evolution API

**Objective:** A Restaurant OS tenant can connect its own WhatsApp number from the Laravel dashboard, receive customer messages through Evolution, process them through the existing Bot Engine, and send responses back through Evolution.

### 1. Integration Foundation

Create a dedicated WhatsApp integration layer:

```text
Modules/WhatsApp/
├── Contracts/
│   └── WhatsAppProvider.php
├── Providers/
│   └── EvolutionApiProvider.php
├── Services/
│   ├── EvolutionInstanceService.php
│   └── WhatsAppMessagingService.php
├── Webhooks/
│   └── EvolutionWebhookController.php
├── Jobs/
│   └── ProcessIncomingWhatsAppMessage.php
└── DTOs/
```

**Important:** existing Bot/Orders/Menu modules must not directly call Evolution.

### 2. Tenant WhatsApp Connection

Add a tenant-scoped `whatsapp_connections` record containing approximately:

```text
id
tenant_id
provider = evolution
instance_name
instance_token (encrypted)
phone_number
status
evolution_instance_id
connected_at
last_seen_at
metadata
timestamps
```

Your application becomes the source of truth; Evolution is infrastructure.

### 3. Restaurant Dashboard UX

Implement:

```text
Settings
  → WhatsApp
      → Connect WhatsApp
          → Enter WhatsApp Number
          → Create Connection
          → Display QR
          → Waiting for scan...
          → Connected ✓
```

The customer should **never see Evolution Manager**.

Laravel calls Evolution's instance creation endpoint with `WHATSAPP-BAILEYS`, QR enabled, the restaurant's number, and the restaurant-specific webhook. ([Evolution API Documentation][1])

### 4. Webhook Pipeline

Evolution → Laravel:

```text
Evolution
   ↓
POST /webhooks/whatsapp/evolution
   ↓
Validate/authenticate
   ↓
Resolve instance
   ↓
Resolve tenant
   ↓
Persist message/event
   ↓
Queue job
   ↓
Bot Engine
```

Initially handle only:

* `MESSAGES_UPSERT`
* `MESSAGES_UPDATE`
* `CONNECTION_UPDATE`
* `QRCODE_UPDATED`
* `SEND_MESSAGE`

Evolution supports considerably more events, but don't implement everything in Sprint 1. ([GitHub][2])

### 5. Incoming Message → Existing Bot

The key integration should be:

```text
Customer
   ↓
WhatsApp
   ↓
Evolution
   ↓
Laravel Webhook
   ↓
WhatsApp Message
   ↓
Existing Bot Engine
   ↓
Intent / AI
   ↓
Cart / Menu / Order
```

**Do not rewrite your existing Gemini/Bot logic.** Build an adapter that converts Evolution's incoming event into your application's existing conversation/message format.

### 6. Outgoing Messages

Create the reverse path:

```text
Bot Engine
    ↓
WhatsAppMessagingService
    ↓
EvolutionApiProvider
    ↓
POST /message/sendText/{instance}
    ↓
Customer
```

Evolution exposes dedicated message endpoints, including text and media sending. ([GitHub][3])

### 7. Connection Lifecycle

Dashboard should support:

```text
Connected
Disconnected
Connecting
Reconnecting
Failed
```

And actions:

* Connect
* Show QR
* Refresh QR
* Disconnect
* Reconnect
* Remove WhatsApp connection

Evolution exposes connection-state, restart, logout and delete-instance operations for this lifecycle. ([GitHub][3])

### 8. Security

**Critical:**

* Evolution API key stays **server-side only**.
* Never expose it to React/browser.
* Encrypt per-instance tokens.
* Authenticate Evolution webhook requests.
* Verify the webhook belongs to a known Evolution instance.
* Tenant isolation must happen **before processing the message**.
* Rate-limit webhook endpoint.
* Queue incoming messages instead of doing Gemini processing inside the webhook request.

### 9. Acceptance Test

The sprint is complete when you can do this entirely from the Restaurant OS UI:

```text
Restaurant Admin
      ↓
Connect WhatsApp
      ↓
Enter +92 number
      ↓
QR displayed
      ↓
Scan with WhatsApp
      ↓
Connected ✓
      ↓
Customer sends:
"Hi"
      ↓
Bot responds
      ↓
Customer:
"Show me your pizzas"
      ↓
Bot shows menu
      ↓
Customer creates cart
      ↓
Customer confirms order
      ↓
Order appears in Restaurant OS
      ↓
KDS receives order
      ↓
Bot sends confirmation
```

Then repeat with **Restaurant B using a different WhatsApp number** and prove that messages, instances, conversations, orders and webhook routing **cannot cross tenants**.

### One architectural rule I'd give the dev agent

> **Evolution API is an infrastructure provider, not part of the Restaurant domain.**

Build `WhatsAppProvider` → `EvolutionApiProvider` now. Later you can add:

```text
EvolutionApiProvider
MetaCloudProvider
```

without touching the Bot, Orders, Menu or KDS modules.

That abstraction is the most important part of this sprint because you're clearly heading toward **a reusable WhatsApp channel platform across Restaurant OS, KamalExpress, and future SaaS products**.

[1]: https://evolution-74046672.mintlify.app/v1/api-reference/instance-controller/create-instance-basic?utm_source=chatgpt.com "Create Instance Basic - Evolution API Documentation"
[2]: https://github.com/evolution-foundation/evolution-api/blob/main/.env.example?utm_source=chatgpt.com "evolution-api/.env.example at main · evolution-foundation/evolution-api · GitHub"
[3]: https://github.com/pedronauck/skills/blob/main/skills/community/evolution-api/references/api-endpoints.md?utm_source=chatgpt.com "skills/skills/community/evolution-api/references/api-endpoints.md at main · pedronauck/skills · GitHub"
