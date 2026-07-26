<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues are tracked on GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

The default 5 canonical labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.

## Database & Migration Rules

- **No Ad-hoc DDL**: Agents must NEVER execute direct/ad-hoc DDL statements (e.g., `CREATE TABLE`, `ALTER TABLE`, or manual SQL queries mutating structure).
- **Schema Single Source of Truth**: All database schema changes MUST be made directly in [src/db/schema.js](src/db/schema.js).
- **Migration Generation**: SQL migration files MUST be generated using `npm run generate` (`drizzle-kit generate`). Migration files should NOT be edited manually.
- **Migration Execution**: Database migrations should be executed either manually via `npm run migrate` (`drizzle-kit migrate`) or automatically by restarting the Next.js dev server (handled by [src/db/init.js](src/db/init.js)).


