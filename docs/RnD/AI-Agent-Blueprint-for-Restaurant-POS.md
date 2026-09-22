
# User

need to list ui/ux/features of https://www.tarkabot.online for my ai dev agent so it can implement a similar agent

---

# assistant

Based on the official product data from **TarkaBot AI** (`tarkabot.online`), here is a structured breakdown of the system's features, core UI components, and user experience flows. 

You can feed this architectural blueprint directly to your AI dev agent to construct a similar autonomous restaurant management system.

---

### 1. Functional System Features
To build a clone, your agent needs to implement three distinct subsystems: the **AI Chat Agent**, the **Kitchen Display System (KDS)**, and the **Unified POS Terminal**.

*   **Autonomous Conversational Ordering (WhatsApp Bot):**
    *   **Natural Language Processing:** Processes raw conversational text (e.g., *"2 Zinger Burger aur 1 Large Fries, COD delivery chahiye"*). It supports Roman Urdu, English, and bilingual code-switching.
    *   **Dynamic Intent Recognition:** Identifies menus requests, item additions, quantity modifications, payment methods (like Cash on Delivery), and delivery addresses.
    *   **Ultra-Fast Response Loop:** Confirms orders, calculates subtotals/taxes/delivery charges, and responds to the customer via WhatsApp in under 3 seconds.
*   **Unified Omnichannel POS Dashboard:**
    *   Aggregates separate incoming streams (WhatsApp automated orders, in-person walk-ins/counter sales, and traditional dine-in/takeaway) into one central pipeline.
*   **Digital Kitchen Display System (KDS):**
    *   Replaces physical paper tickets with automated digital order cards.
    *   Includes **real-time live-syncing** and audio alerts to inform kitchen staff when a new order drops.
*   **Customer Data & Growth Analytics:**
    *   Maintains a direct-to-consumer data pipeline (eliminating third-party delivery app control over customer lists).
    *   Includes a system to trigger commission-free WhatsApp marketing campaigns directly back to existing customer phone numbers.

---

### 2. Core User Interface (UI) Blueprints
Your dev agent should design the frontend layout using these specific interface containers:

#### A. The Multi-Column KDS Terminal Screen
*   **New Orders Column:** Houses newly received automated order cards.
*   **Preparing Column:** Holds tickets currently being cooked by staff.
*   **Ready / Out Column:** Displays finished orders or orders currently with delivery riders.
*   **Individual Ticket Card Components:** Must render:
    *   Unique Order ID (e.g., `#TB-8874`)
    *   Order Type Tag (e.g., `WhatsApp`, `Dine In`, `Counter`)
    *   Item List with explicit quantity indicators (e.g., `1x Chicken Biryani`, `1x Mint Raita`)
    *   Fulfillment status dropdown or button switcher (`Complete`, `Advance Step`).

#### B. The Customer-Facing Bot Interface (WhatsApp Mockup)
*   Standard messaging UI tracking the chat flow:
    *   *Greeting:* "Assalamu Alaikum! Humare restaurant mein khushamdeed..."
    *   *User Prompt:* Natural input outlining items.
    *   *Bot Resolution:* Structured text receipt summarizing the order (`1x Burger`, `2x Fries`, `Total Rs. 1,200`) accompanied by a confirmation checkmark (✅).

---

### 3. Critical User Experience (UX) Behaviors
When instructing your AI dev agent on how the system must *feel* and act, emphasize these three logic behaviors:

1. **The "Zero-Latency" Fallback (Speed-First UX):** Manual order entry can take minutes; the bot must process the text block, ping the database to verify item existence, calculate total costs, and output a formatted receipt message in under 3 seconds to keep user engagement from dropping.
2. **The Residual Kitchen Alert:** When the backend transitions an order state from the bot to the KDS, the interface must deploy a persistent **audio ping**. Kitchens are noisy, high-friction environments; visual updates alone fail UX requirements.
3. **The ROI Metric-First Dashboard:** The merchant facing admin analytics panel should prioritize showing **Saved Commission Percentages** right alongside traditional metrics like gross sales. (e.g., showing a side-by-side comparison of standard 30% aggregator platform commissions vs. the platform's flat SaaS fee model). 

---

<ElicitationsGroup message="How should we prepare your AI agent next?">
  <Elicitation label="Draft the prompt instructions for the AI agent" query="Write a detailed system prompt for an AI agent that extracts restaurant menu items, quantities, addresses, and payment methods from Roman Urdu and English WhatsApp messages."/>
  <Elicitation label="Outline the database schema for the POS" query="Design a PostgreSQL database schema suitable for an omnichannel restaurant POS handling WhatsApp bot orders, kitchen statuses, and customer analytics."/>
</ElicitationsGroup>