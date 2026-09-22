# ADR-0002: PostgreSQL for Database

**Status**: Accepted

**Context**
Robust relational database needed for complex multi-tenant restaurant data.

**Decision**
Use PostgreSQL. Local development will connect to the existing `postgres_dev` Docker container rather than spinning up a new DB service.

**Consequences**
+ Strong JSON support for dynamic schemas.
+ Excellent concurrency control.
+ Sharing an existing container avoids duplicate local DB instances.
