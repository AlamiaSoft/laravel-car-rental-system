# Analytics and Features Roadmap

## For Tenants (Restaurants)

### Marketing & Campaigns
* **Campaign Builder**: A visual interface allowing restaurants to create and schedule WhatsApp broadcast messages (like "20% off pizzas tonight"). It allows filtering the recipient list so messages only go to relevant customers.
* **AI Campaign Generator**: A smart assistant that takes a short idea (e.g., "Rainy day offer") and automatically generates engaging, WhatsApp-optimized promotional copy with emojis and call-to-action buttons.
* **Intelligent Timing**: An analytics-driven feature that suggests the highest-converting times to send messages, such as sending lunch specials at 11 AM or family deals on Saturday mornings.
* **Smart Frequency Limits**: Built-in safeguards that automatically cap how often a single customer receives promotions (e.g., max 2 per week) to prevent spam reports and protect the restaurant's sender reputation.

### Customer Relationship Management (CRM)
* **Automatic Customer Segments**: The system automatically groups customers based on order history and behavior. 
  * Examples: *VIP customers (spent > Rs. 10k)*, *Churn-risk (hasn't ordered in 90 days)*, or *Pizza lovers*. This enables highly targeted marketing instead of blindly messaging everyone.
* **Contact Management**: A centralized mini-CRM showing a customer's lifetime value, past orders, preferences, and complete chat history in one unified view.
* **Shared Team Inbox**: A collaborative chat interface where human agents (like front-desk staff) can step in, read history, and reply manually to customers if the automated bot cannot handle a complex query.

### Analytics
* **Campaign Performance**: Dashboards showing real-time metrics for marketing broadcasts, including how many messages were successfully delivered, read, and replied to, allowing restaurants to measure their marketing ROI.

---

## For SaaS Admins (Super Admin)

### Platform & Infrastructure
* **Embedded WhatsApp Onboarding**: A seamless, in-app signup flow that allows new restaurants to connect their WhatsApp Business numbers and verify them without needing manual API configuration.
* **Template Management**: A centralized dashboard to submit, track, and manage Meta-approved message templates across all tenants, ensuring compliance with WhatsApp policies.
* **Webhook Management**: A system-wide router that logs incoming WhatsApp events, handles errors, and ensures messages are delivered to the correct tenant's bot logic.
* **Reliability & Tracking**: Background retry queues that ensure messages are delivered even if Meta's API has temporary downtime, alongside system-wide failure alerts for the admins.

### Billing & Usage
* **Tenant Billing Analytics**: A dashboard tracking exactly how many API messages each tenant sends and receives, their active user counts, and campaign frequency. This data drives monthly invoicing and enforces plan limits.
