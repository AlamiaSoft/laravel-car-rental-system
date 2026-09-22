const fs = require('fs');
const path = require('path');

const dirs = [
    '.agents',
    'docs',
    'ADR',
    'knowledge/architecture',
    'knowledge/api',
    'knowledge/ui',
    'knowledge/business-rules',
    'knowledge/database',
    'knowledge/integrations',
    'knowledge/experiments',
    'knowledge/decisions',
    'knowledge/mistakes',
    'knowledge/performance',
    'knowledge/gotchas',
    'knowledge/lessons',
    'prompts',
    'tasks',
    'Modules/Authentication',
    'Modules/Orders',
    'Modules/Menu',
    'Modules/Inventory',
    'Modules/Kitchen',
    'Modules/CRM',
    'Modules/Marketing',
    'Modules/POS',
    'Modules/Finance',
    'Modules/Analytics',
    'Modules/AI',
    'Modules/Shared',
];

const files = {
    '.agents/README.md': `# AI Development Operating System\n\nThis directory contains specialized operating manuals for different AI agents (e.g., backend, frontend, database). Agents must read their specific manual to understand their boundaries and rules.\n`,
    '.agents/backend.md': `# Backend Agent\n\n**Responsibilities**\n- Domain logic\n- Services\n- API\n- Events\n\n**Never**\n- Change frontend\n- Edit migrations without ADR\n\n**Must**\n- Search knowledge/\n- Search ADR\n- Search architecture docs before implementing anything.\n\n**Always**\n- Update documentation.\n- Follow Laravel 13 Domain-Driven Design (DDD) in the \`Modules/\` directory.\n- Ensure the application connects to the \`postgres_dev\` Docker container.\n`,
    'docs/PRD.md': `# Product Requirements Document (PRD)\n\n## Product Vision\n**Alamia Restaurant OS**: A multi-tenant SaaS enabling restaurants to receive direct orders over WhatsApp, manage kitchen operations, inventory, POS, customers, and marketing from one platform.\n\n## Target Customers\n- Small to medium food businesses (Pizza shops, Cloud kitchens, etc.)\n\n## Monetization\n- Setup fee: 2,000-3,000 PKR.\n- Commission model: 1.5% commission on orders (High adoption rate vs Foodpanda's 20-30%).\n\n## Core Principles\n- Increase sales OR reduce staff workload OR increase repeat customers.\n`,
    'docs/ROADMAP.md': `# Roadmap\n\n- **Sprint 0**: Foundation (Auth, Multi-tenancy, RBAC)\n- **Sprint 1**: WhatsApp Ordering MVP\n- **Sprint 2**: AI Ordering (Natural language)\n- **Sprint 3**: Kitchen Display System (KDS)\n- **Sprint 4**: Dashboard & Reporting\n- **Sprint 5+**: CRM, Inventory, POS, Analytics, AI Advisor.\n`,
    'docs/ARCHITECTURE.md': `# Architecture\n\n- **Backend**: Laravel 13 (Modular Monolith / DDD)\n- **Performance**: Laravel Octane (Swoole/RoadRunner)\n- **Database**: PostgreSQL (using shared \`postgres_dev\` Docker container)\n- **Cache/Queue**: Redis + Horizon\n- **Realtime**: Laravel Reverb\n- **AI**: OpenAI (GPT-4o-mini via first-party Laravel 13 AI SDK)\n- **Infrastructure**: Hetzner CX43 & Oracle A1 Flex.\n`,
    'ADR/ADR-0001-laravel.md': `# ADR-0001: Laravel 13 as Core Framework\n\n**Status**: Accepted\n\n**Context**\nNeed rapid SaaS development with built-in Auth, Queues, Multi-tenancy, and AI integration.\n\n**Decision**\nUse Laravel 13 with Octane and Reverb.\n\n**Consequences**\n+ Faster development and vast ecosystem.\n+ First-party AI capabilities.\n- Slightly more memory usage compared to bare FastAPI.\n`,
    'ADR/ADR-0002-postgresql.md': `# ADR-0002: PostgreSQL for Database\n\n**Status**: Accepted\n\n**Context**\nRobust relational database needed for complex multi-tenant restaurant data.\n\n**Decision**\nUse PostgreSQL. Local development will connect to the existing \`postgres_dev\` Docker container rather than spinning up a new DB service.\n\n**Consequences**\n+ Strong JSON support for dynamic schemas.\n+ Excellent concurrency control.\n+ Sharing an existing container avoids duplicate local DB instances.\n`,
    'knowledge/architecture/module-structure.md': `# Modular Structure\n\nThe codebase is divided into bounded contexts inside the \`Modules/\` directory. Each module (e.g., Orders, Inventory) contains its own Controllers, Models, Events, and Services following DDD principles.\n`,
    'knowledge/api/whatsapp-cloud-api.md': `# WhatsApp Cloud API\n\n- **Costs**: Utility conversations cost ~$0.008 to $0.015 per 24 hours.\n- **Interaction**: Use Meta List Messages and Reply Buttons for menus to save AI token costs. Fallback to AI (GPT-4o-mini) only for unstructured queries/FAQs.\n`,
    'knowledge/business-rules/order-status.md': `# Order Status Flow\n\nPending -> Confirmed -> Preparing -> Ready -> Completed -> Archived\n`,
    'prompts/new-feature.md': `# New Feature Prompt\n\nWhen starting a new feature, follow the AI Workflow:\n1. Read PRD & Roadmap\n2. Read relevant ADRs\n3. Check existing knowledge/\n4. Search existing code\n5. Design & Propose\n6. Implement & Test\n7. Document & Commit\n`,
};

// Create empty template files for other `.agents`
const agentFiles = ['architect.md', 'frontend.md', 'database.md', 'uiux.md', 'qa.md', 'security.md', 'devops.md', 'documentation.md', 'ai.md', 'reviewer.md', 'release.md'];
agentFiles.forEach(file => {
    if (!files['.agents/' + file]) files['.agents/' + file] = `# ${file.replace('.md', '').toUpperCase()} Agent\n\nFollow role-specific instructions.\n`;
});

// Create empty template files for `docs`
const docsFiles = ['DOMAIN_MODEL.md', 'API_GUIDELINES.md', 'CODING_STANDARDS.md', 'UI_GUIDELINES.md', 'SECURITY.md', 'PERFORMANCE.md', 'TENANCY.md'];
docsFiles.forEach(file => {
    if (!files['docs/' + file]) files['docs/' + file] = `# ${file.replace('.md', '').replace(/_/g, ' ')}\n\nDocumentation pending.\n`;
});

// Create empty template files for `ADR`
const adrFiles = ['ADR-0003-multi-tenancy.md', 'ADR-0004-events.md', 'ADR-0005-domain-driven-design.md', 'template.md'];
adrFiles.forEach(file => {
    if (!files['ADR/' + file]) files['ADR/' + file] = `# ${file.replace('.md', '')}\n\nDocumentation pending.\n`;
});

// Create empty template files for `prompts`
const promptFiles = ['sprint.md', 'bugfix.md', 'feature.md', 'review.md', 'refactor.md', 'bug.md', 'migration.md', 'documentation.md'];
promptFiles.forEach(file => {
    if (!files['prompts/' + file]) files['prompts/' + file] = `# ${file.replace('.md', '')}\n\nPrompt template pending.\n`;
});

dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log('Created dir:', fullPath);
    }
});

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    // don't overwrite if it exists, to be safe
    if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, content);
        console.log('Created file:', fullPath);
    } else {
        console.log('Skipping existing file:', fullPath);
    }
}

console.log('Scaffolding complete.');
