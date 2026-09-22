
# you asked

need a oss repo for whatapp bot making; user should have options to enter name of the bot and customize what menu/sub-menu items are shown to customer

---

# consultant

Yes. What you want is **more than a WhatsApp API library** — you want a **self-hosted bot/menu builder** where a non-developer can configure:

- Bot name / business name
- Welcome message
- Main menu
- Menu items
- Sub-menus
- Button/list labels
- Actions behind each item
- Back / Home navigation
- Potentially API/webhook actions later

### Best OSS starting point

**** is probably the closest match I found.

It is an MIT-licensed MERN WhatsApp chatbot builder with a visual React Flow editor. It already supports:

- Message nodes
- Button nodes
- List nodes
- Input collection
- Conditions
- API calls
- AI replies
- Loops
- Subflows
- End nodes
- Browser simulator
- Draft → validate → deploy workflow ([GitHub](https://github.com/theabhipatel/wa_flow_builder?utm_source=chatgpt.com))

However, **it's probably more complex than you need** if your goal is something like a simple configurable WhatsApp business menu.

### Another strong candidate

**** is newer and architecturally interesting. It's designed as a self-hostable WhatsApp automation workspace with visual flows, devices, contacts, execution state, webhooks and human handoff. ([GitHub](https://github.com/nizarfadlan/whatsapp-flow?utm_source=chatgpt.com))

It uses **Baileys** as a provider, which is useful because Baileys already supports WhatsApp list messages, buttons and interactive/native-flow menus. ([GitHub](https://github.com/yemo-dev/baileys?utm_source=chatgpt.com))

### What I'd actually do for your use case

Don't build a generic "flow builder" first.

Build a **WhatsApp Bot Menu Builder** on top of Baileys:

```text
Bot
├── Name: "KamalExpress"
├── Welcome Message
│
├── Main Menu
│   ├── ✈️ Flight Tickets
│   │   ├── Domestic
│   │   ├── International
│   │   └── Talk to Agent
│   │
│   ├── 🕋 Umrah
│   │   ├── Packages
│   │   ├── Visa
│   │   └── Contact Agent
│   │
│   ├── 🛂 Visa Services
│   │   ├── Saudi Arabia
│   │   ├── UAE
│   │   └── Other Countries
│   │
│   └── 📞 Contact Us
```

Then the admin UI simply lets the user:

**Bot Settings**

```text
Bot Name       [ KamalExpress          ]

Welcome Text   [ Assalam-o-Alaikum... ]

Main Menu
────────────────────────────
☰ Flight Tickets       [Edit] [↑] [↓] [Delete]
☰ Umrah                [Edit] [↑] [↓] [Delete]
☰ Visa Services        [Edit] [↑] [↓] [Delete]
☰ Contact Us            [Edit] [↑] [↓] [Delete]

              [+ Add Menu Item]
```

Click **Umrah → Edit**:

```text
Title:       🕋 Umrah
Description: Umrah packages and services

Sub-menu:
  ├── Packages
  ├── Visa
  ├── Hotels
  └── Talk to Agent

Action:
  ○ Open submenu
  ○ Send message
  ○ Call API
  ○ Open URL
  ○ Human handoff
```

This is **much easier for an SMB user** than exposing React Flow nodes.

### Architecture I'd recommend

```text
                Admin UI
                   │
                   ▼
          Bot/Menu Configuration
                   │
                   ▼
             JSON Definition
                   │
                   ▼
          WhatsApp Bot Runtime
                   │
             ┌─────┴─────┐
             ▼           ▼
          Baileys      Webhooks/API
             │
             ▼
          WhatsApp
```

Example configuration:

```json
{
  "name": "KamalExpress",
  "welcome": "Welcome to KamalExpress ✈️",
  "menu": [
    {
      "id": "flights",
      "label": "✈️ Flight Tickets",
      "type": "menu",
      "children": [
        {
          "id": "domestic",
          "label": "Domestic",
          "action": "message",
          "message": "Please tell us your destination."
        },
        {
          "id": "international",
          "label": "International",
          "action": "message"
        }
      ]
    },
    {
      "id": "umrah",
      "label": "🕋 Umrah",
      "type": "menu",
      "children": []
    }
  ]
}
```

That gives you a **generic engine** where the customer can create virtually any menu hierarchy without touching code.

**My recommendation:** use **WA Flow Builder** if you want to fork something substantial, but if this is for your Alamia/WhatsApp Restaurant OS style architecture, I'd take **Baileys + a simple menu-schema/admin UI** rather than adopting a huge visual flow builder. The latter will become unnecessary complexity very quickly. ([GitHub](https://github.com/theabhipatel/wa_flow_builder?utm_source=chatgpt.com))

---

# you asked

yes; here are some google search suggestions as well:

To launch your own commercial, production-grade WhatsApp chatbot SaaS or white-label service, you need an architecture that supports multi-tenancy, visual flow builders, and flexible infrastructure management. [1] 

Because you want to offer this as a scalable B2B service, the "stack" is typically split into two layers: **The Visual Flow Builder / CRM Dashboard** (what your customers see) and **The WhatsApp Gateway Engine** (the underlying infrastructure that connects the numbers). [2, 3] 

The best open-source, production-grade tools can be grouped by how you want to build and package your service:

These platforms provide the customer-facing dashboard, visual drag-and-drop flow builders, and user management systems you need to launch a true white-label product.

-
- [**Typebot**](https://typebot.com/)**:** A premier open-source conversational chat builder. It has a beautiful visual block canvas, native OpenAI/LLM integrations, and a clean interface. It is highly optimized for self-hosting via Docker and includes native support for multi-tenancy, making it easy to create a SaaS where users build their own flows. It connects natively to WhatsApp APIs.
- [**Chatwoot**](https://www.chatwoot.com/)**:** If your goal is to sell a "WhatsApp Customer Support Desk" service (like an open-source Intercom or [Zendesk](https://www.zendesk.com/)), Chatwoot is the industry standard. It features multi-tenancy out of the box, multi-agent shared inboxes, contacts management, and robust WhatsApp Business API integration. [2, 4] 
- [**Flowise**](https://cloud.flowiseai.com/*) **/ Langflow:** If your service targets advanced AI agents (RAG, memory, tool use), these visual node-based builders allow you to assemble production-grade AI frameworks. They can expose API endpoints or webhooks that hook right into WhatsApp. [5] 
-

If you want to code the entire core infrastructure yourself and build a highly customized, proprietary UI on top, leverage these code-first frameworks:

-
- [**BuilderBot (formerly Chatbot-Converter)**](https://www.builderbot.app/)**:** Winner of the OpenExpo 2024 prize, this TypeScript/Node.js framework is explicitly built for scaling WhatsApp automation. It handles heavy concurrency, state management, and abstraction layers across different WhatsApp providers flawlessly. [6, 7, 8, 9] 
- [**Rasa Open Source**](https://legacy-docs-oss.rasa.com/docs/rasa/)**:** The enterprise standard for Python teams. It is incredibly robust and handles complex, mission-critical logic, but it lacks a native visual builder for non-technical users. [4, 10] 
-

When launching a B2B service, how your platform links to WhatsApp will dictate your business model and infrastructure stability: [11] 

| StrategyTools to UseProsCons       |                                                                                                                                                                         |                                                                                                    |                                                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Official Meta Cloud API**        | Integrated into Typebot / Chatwoot                                                                                                                                      | 100% compliant; zero risk of number bans; handles massive production volume.                       | Meta charges per conversation, adding overhead costs to your service.                       |
| **Unofficial Open-Source Gateway** | [**OpenWA**](https://www.open-wa.org/), [**WAHA**](https://waha.en.uptodown.com/android), or [**Evolution API**](https://github.com/evolution-foundation/evolution-api) | **No Meta per-message fees**; users link accounts via QR code instantly. Multi-session management. | Risk of number bans if users spam; requires constant updates to match WhatsApp Web changes. |

To launch a stable, high-margin product quickly, standard production architecture pairs **Typebot** (the visual customer UI) with **Evolution API** or the **Official Meta API** (the connection engine), orchestrated together using a self-hosted automation runner like [**n8n**](https://n8n.io/). [2, 12, 13] 

To help narrow down the infrastructure architecture, tell me:

-
- Do you want your end-customers to pay **Meta's official usage fees**, or are you looking to provide a **"free unlimited messaging"** model using QR-code scanning?
- Do you prefer a **Node.js/TypeScript** or a **Python** ecosystem for your core development team?
-

[1] [https://github.com](https://github.com)

[2] [https://dev.to](https://dev.to)

[3] [https://blueticks.co](https://blueticks.co)

[4] [https://www.zarghamlabs.com](https://www.zarghamlabs.com)

[5] [https://www.chatarchitect.com](https://www.chatarchitect.com)

[6] [https://railway.com](https://railway.com)

[7] [https://www.builderbot.app](https://www.builderbot.app)

[8] [https://www.builderbot.app](https://www.builderbot.app)

[9] [https://github.com](https://github.com)

[10] [https://usebasalt.com](https://usebasalt.com)

[11] [https://www.buildmvpfast.com](https://www.buildmvpfast.com)

[12] [https://www.freecodecamp.org](https://www.freecodecamp.org)

[13] [https://dev.to](https://dev.to)

---

# consultant

Yes. Your Google results are directionally right, but I would **not** adopt the suggested stack blindly.

For what you described, there are actually **three separate problems**:

1. **WhatsApp connection/transport**
2. **Bot/menu builder**
3. **Customer/admin SaaS UI**

And I think your requirement is narrower than Typebot/Flowise: you want a **business menu bot builder**, not necessarily a general-purpose conversational programming platform.

### My ranking for your use case

| Project | Role | Fit | My take |
|---|---|---:|---|
|  | WhatsApp gateway | ⭐⭐⭐⭐⭐ | **Use this as the engine** |
|  | Visual bot builder | ⭐⭐⭐⭐ | Excellent if you want generic flows |
|  | Inbox/CRM/support | ⭐⭐⭐⭐ | Add later if support is important |
| BuilderBot | Bot framework | ⭐⭐⭐ | Good if coding your own runtime |
| Flowise | AI agent builder | ⭐⭐ | Overkill for simple menus |
| Rasa | Conversational AI | ⭐⭐ | Massive overkill for this requirement |

Evolution is particularly interesting because its current architecture already supports **Baileys/WhatsApp Web and official WhatsApp Cloud API**, multiple instances, webhooks, and integrations with Typebot, Chatwoot, n8n, Flowise, etc. ([GitHub](https://github.com/evolution-foundation/evolution-api?utm_source=chatgpt.com))

![Платите за Wazzup, Chat-API или Green API? Вот бесплатная альтернатива: Evolution API v2 + n8n на VPS / Хабр](https://images.openai.com/static-rsc-4/zQ-LlcbR0KqzOx7K8i0YmiS8nrPGI5hWKpUHcCICtQuNMKDduovNWHrvcrFF3whI6korSbG1KJSCEVHeXTfli-m7uYNFnRCfHsJGA97s8GHxd3ulsqcS45gusytdX1HgY2UA4BbBHBPnwZD7ZgxZm7SDRUW5iOC0fRTGHg8XgQTLF0WIjT2gzex8XICU9TUX?purpose=fullsize)

[Платите за Wazzup, Chat-API или Green API? Вот бесплатная альтернатива: Evolution API v2 + n8n на VPS / Хабр](https://habr.com/ru/articles/965680/?utm_source=chatgpt.com)

![Conheça o Typebot. Editor Visual de Chatbot OpenSource - Promovaweb](https://images.openai.com/static-rsc-4/e6nh-g8HBxXJxshXcR-1wEZN-Pw5jmjjHeiRooVEakeMO2x3mTH3n6_hbILE_K8CNBluZnOk0gbjKZw19zf5sNPU1hHHXjse9mx38JLkylPiYaCrLHxWDShKMDEFh1kw4Ido6-lTbYZEGgobmI9DFCHHYIjGpuYw34nN6yLwWkJyi6DCh0OBZ803dLf5AsCc?purpose=fullsize)

[Conheça o Typebot. Editor Visual de Chatbot OpenSource - Promovaweb](https://promovaweb.com/apps/typebot?utm_source=chatgpt.com)

![Zero to live with Vue — How we built Chatwoot | by Pranav Raj S | Medium](https://images.openai.com/static-rsc-4/-ulCbO1r1gwws7v18MEValna9f_Q5BUk0LUhlDrwIZ_1EwGMWtRgHAcLnCJYSmDlHh40DgEEsHzEaRsttnx-IyAk8ijUm6BLuZZsjiMECZdD9Q5Vqx6ZX3pvuL1lwGK4XG24fNA3ET3mGZAmnTdLgiJagva-D1cLNGVDCG1niwHNGZIlvdUkjC4dsMgRC3Oq?purpose=fullsize)

[Zero to live with Vue — How we built Chatwoot | by Pranav Raj S | Medium](https://medium.com/hackernoon/zero-to-live-with-vue-how-we-built-chatwoot-c7304e596d62?utm_source=chatgpt.com)

![Evolution API: Instale uma API Não Oficial do WhatsApp em sua VPS e Automatize o Envio de Mensagens](https://images.openai.com/static-rsc-4/ALi9vHpKdONdMMPUfaHE9PHkPSZ-CHKjBnR0A6Sns1KTTMz4oG_sQQ_31ukEe01AYg-XFMUr9hk7dvBhwrWaWh4mmyk_3H7a7ILy6nBcR2qEnoftrsRsDVxooY_K16i6oUC9yeHGEqxH7b8YLEiHGgLZjUbkZ_hjnbvktKT29Mq_qY8ctIZk6BI4FaQJien1?purpose=fullsize)

[Evolution API: Instale uma API Não Oficial do WhatsApp em sua VPS e Automatize o Envio de Mensagens](https://www.palomamacetko.com.br/evolution-api-instale-uma-api-nao-oficial-do-whatsapp-em-sua-vps-e-automatize-o-envio-de-mensagens/?utm_source=chatgpt.com)

![How to create a Whatsapp channel using 360Dialog API? | Unirsal Docs](https://images.openai.com/static-rsc-4/VpfThWo9w5_cU73hT7RpeAcKwXEaZEOgkXy0uZi6W65sKZEpECW8S7vdcbFgbN1k7zJE-l5sVrBGVo1uPIm-nfxx-rLSw76YNk5Mbk1WeTtM8wGZ6zgTKssCNz7SlZyVDze8pf4PMAzxmMbMoeW9Bs0wg_s9lxrBT93bUNNAQLybH_vy-pMIjk-cCDpsPoiG?purpose=fullsize)

[How to create a Whatsapp channel using 360Dialog API? | Unirsal Docs](https://docs.prod.unirsal.com/docs/unilink/product/channels/whatsapp/360dialog/?utm_source=chatgpt.com)

## But here's what I'd build

For your specific requirement:

```text
                 YOUR SAAS
                    │
        ┌───────────┴───────────┐
        │                       │
   Bot Builder              Inbox
        │                       │
        └───────────┬───────────┘
                    │
              Bot Runtime
                    │
             Evolution API
                    │
          ┌─────────┴─────────┐
          │                   │
      WhatsApp Web       Meta Cloud API
       / QR pairing          / Official
```

The **customer never needs to see Evolution API**.

They see:

```text
My WhatsApp Bots

┌─────────────────────────────────┐
│ 🟢 KamalExpress                │
│ WhatsApp: +92 xxx              │
│                                 │
│ [Edit Bot] [Test] [Analytics]  │
└─────────────────────────────────┘

             [+ Create Bot]
```

Then:

### Bot configuration

```text
Bot Name
[KamalExpress                         ]

Welcome Message
[Assalam-o-Alaikum! Welcome to
 KamalExpress. How can we help?]

Main Menu
─────────────────────────────────────
☰ ✈️ Flight Tickets       Edit  ⋮
☰ 🕋 Umrah                Edit  ⋮
☰ 🛂 Visa Services        Edit  ⋮
☰ 📞 Contact Us           Edit  ⋮

             [+ Add Menu Item]
```

Click **Umrah**:

```text
🕋 Umrah

Type:
● Sub-menu
○ Message
○ API Action
○ Human Agent

Sub-menu items
────────────────────────────────
☰ Packages
☰ Visa
☰ Hotels
☰ Transport
☰ Talk to Agent

[+ Add Item]

                 [Save]
```

That's the product.

---

## And this is where Typebot becomes interesting

If you eventually want customers to create:

```text
Welcome
   ↓
Main Menu
   ↓
Umrah
   ↓
Choose Package
   ↓
Collect Name
   ↓
Collect Passport #
   ↓
API lookup
   ↓
Show packages
   ↓
Book
   ↓
Human agent
```

then **Typebot becomes a very strong underlying builder**.

Instead of building your own React Flow editor, you could potentially fork/customize Typebot and make your own **WhatsApp-specific SaaS shell** around it.

The Evolution API ↔ Typebot integration is already part of Evolution's ecosystem. ([GitHub](https://github.com/evolution-foundation/evolution-api?utm_source=chatgpt.com))

### So I see two paths

**Path A — fastest MVP**

```text
Your Laravel/React UI
        ↓
Simple Bot JSON
        ↓
Your Bot Runtime
        ↓
Evolution API
```

Best if you only need:

- name
- welcome message
- menus
- submenus
- buttons/lists
- messages
- URLs
- API actions
- human handoff

**Path B — serious platform**

```text
Your SaaS
   ↓
Customized Typebot
   ↓
Evolution API
   ↓
WhatsApp
```

Add Chatwoot for:

```text
AI/Bot
  ↓
"Talk to human"
  ↓
Chatwoot Inbox
  ↓
Agent
```

Chatwoot is explicitly designed as a self-hosted customer-support platform and has APIs for building custom integrations. ([GitHub](https://github.com/chatwoot/docs/blob/main/self-hosted.mdx?utm_source=chatgpt.com))

---

### One important correction to the Google advice

I **wouldn't market the QR/Baileys route as "free unlimited WhatsApp messaging."**

That's technically attractive, but operationally it means you're building on WhatsApp Web behavior rather than Meta's official business API. Evolution itself distinguishes the Baileys connection from the official Cloud API and notes the limitations of the web-based approach. ([GitHub](https://github.com/evolution-foundation/evolution-api?utm_source=chatgpt.com))

For an Alamia-style product I'd support **both**:

```text
Connection
────────────────────
○ WhatsApp Cloud API
  Production / official

○ QR Code
  Self-hosted / WhatsApp Web
```

Then the **bot/menu layer stays identical** regardless of transport.

That is the architecture I'd choose.