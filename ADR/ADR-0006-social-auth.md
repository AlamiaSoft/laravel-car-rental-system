# ADR-0006: Social Authentication Strategy

**Status**: Accepted

**Context**
The Restaurant OS requires a frictionless onboarding process for restaurant owners. Additionally, the core offering relies heavily on the Meta WhatsApp Business Cloud API. We need an efficient, maintainable way to handle social sign-ins (OAuth) without building custom OAuth flows from scratch.

**Decision**
We will use **Laravel Socialite** as the official package for handling all social authentication.

**Primary Providers to Implement:**
1. **Google**: The industry standard for B2B SaaS dashboard logins. Provides the highest conversion rate for sign-ups.
2. **Facebook (Meta)**: Crucial for our specific business model. Since we integrate with the WhatsApp Cloud API, having restaurants log in via Facebook streamlines the process of linking their Meta Business Suite and WhatsApp numbers later on.

**Consequences**
+ **Extremely Fast Integration**: Socialite is a first-party package with out-of-the-box support for OAuth1 and OAuth2.
+ **Maintained by Laravel**: Guaranteed compatibility with Laravel 13 and future versions.
+ **Strategic Alignment**: The Facebook provider reduces friction when onboarding businesses to the WhatsApp API.
- Requires setting up and maintaining API keys/OAuth consent screens in Google Cloud Console and Meta Developer Dashboard.
