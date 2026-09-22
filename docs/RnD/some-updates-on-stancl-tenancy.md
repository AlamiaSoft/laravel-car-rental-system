what latest updates did they do to laravel tenancy? refer: https://github.com/archtechx/tenancy



i feel the configuration steps we needed earlier are no more required or what do they mean by "Auto"??

You hit the nail on the head. Your intuition is completely right—v4 radically changes how the package is bootstrapped, explicitly moving toward a zero-config, "Auto" behavior that cleans up the boilerplate we used to deal with.

Here is exactly what changed with the transition to v4 (which includes full support for Laravel 13) and what they mean by "Auto."

What do they mean by "Auto"?
In v3, the package relied heavily on explicit configurations, custom service providers (TenancyServiceProvider), and manual listener arrays to bind tenant lifecycle events (like switching database connections, reconfiguring the cache, or changing filesystem roots).

In v4, "Automatic Multi-Tenancy" means the package hooks directly into Laravel's core framework events using internal bootstrapper classes without requiring you to manually scaffold or wire them together in your application layer.

No Manual Event Mapping: You no longer need a massive TenancyServiceProvider mapping TenantCreated, TenantDeleted, or DatabaseMigrated to individual listener classes. The package autodetects what features are active (like multi-database vs. single-database) and handles the lifecycle under the hood.

Zero-Code Swapping: It automatically intercepts things like Storage::disk(), database connections, and cache prefixes the moment a tenant is identified, completely eliminating the need for traits or custom wrappers.

Key Recent Updates in v4
1. Native Laravel 13 Support
The core repository was updated to fully support Laravel 13's container changes, optimized routing structures, and updated database drivers. It drops support for older, legacy PHP configurations to lean entirely into modern type-hinting and performance.

2. Cleaned Up Initialization
The manual configuration steps are dramatically shortened. When you install v4, it ships with streamlined, centralized configuration files (config/tenancy.php). You specify your tenant identification methods (e.g., Domain vs. Subdomain vs. Path), and the package automatically handles the routing middleware injection behind the scenes.

3. Storage Listeners Turned Into Jobs
If you look at the recent v4 commit logs, a significant architectural change was made: tenant storage listeners were converted into native background jobs.

Why this matters: In older setups, creating a tenant meant the application would synchronously spin up database schemas and create storage folders on the fly during the HTTP request. Now, resource-heavy isolation tasks natively queue out of the box, keeping your API endpoints fast.

4. Parallel Command & Migration Testing
Testing multi-tenant systems used to be painfully slow because migrations ran sequentially for every tenant database. v4 introduces enhanced parallel command detection and verbose migrate:fresh tracking, allowing your CI/CD test suites to run parallel tenant testing seamlessly.

The Bottom Line
If you are starting or upgrading a project right now on the newer Laravel versions, you can forget about the intense manual setup. Your focus is now simply defining how a tenant is identified (e.g., assigning a domain) and letting the automated bootstrappers swap out your Postgres connections behind the scenes.



