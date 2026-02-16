# Vibecheck

Code review marketplace for AI-generated code. Vibecoders post review requests, senior devs bid and deliver structured reports.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your GitHub OAuth credentials (see .env.example for details)

# Seed the database (optional — creates sample users, reviewers, and a request)
npm run db:seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with GitHub.

## Architecture

- **Framework**: Next.js 15 (App Router) + React 19
- **Database**: SQLite via better-sqlite3 (file: `vibecheck.db` in project root)
- **Auth**: NextAuth v5 with GitHub OAuth provider
- **Styling**: Tailwind CSS v4 with CSS custom properties for theming
- **Deployment**: Not yet configured — runs locally only

### Directory Structure

```
src/
  app/                    # Next.js App Router pages and API routes
    api/                  # REST API endpoints
    dashboard/            # Vibecoder dashboard
    reviewer/             # Reviewer dashboard, browse, review workspace
    reviewers/            # Public reviewer directory
    requests/             # Request detail, creation, payment
    messages/             # Messaging UI
    settings/             # User preferences
  components/             # Shared React components
  lib/
    auth.ts               # NextAuth config + getCurrentUser helper
    constants.ts          # Centralized constants (statuses, roles, limits)
    db/schema.ts          # Database schema + migrations
    db/seed.ts            # Sample data seeder
    email.ts              # Email notifications (console.log mock — not wired to a provider)
    models.ts             # TypeScript interfaces for all DB entities
    time-ago.ts           # Relative time formatting
    utils.ts              # Score color helpers, JSON parsing
```

### Key Patterns

- **Auth**: API routes use `getCurrentUser()` from `lib/auth.ts`. Returns `User | null`.
- **Database**: `getDb()` returns a singleton better-sqlite3 instance. Schema is auto-created on first access.
- **Theming**: Light/dark mode via `data-theme` attribute on `<html>`. Colors defined as CSS custom properties in `globals.css`. Accent: slate blue (#475569), CTAs: amber (#f59e0b).

### Database

SQLite with WAL mode. Schema is defined in `src/lib/db/schema.ts`. Migrations run automatically on app start via column-existence checks (no version tracking — see Known Limitations).

Core tables: `users`, `reviewer_profiles`, `review_requests`, `quotes`, `reviews`, `messages`, `notifications`, `attachments`, `reviewer_ratings`, `user_settings`, `conversation_reads`.

### Environment Variables

| Variable | Description |
|---|---|
| `AUTH_SECRET` | NextAuth encryption secret |
| `GITHUB_ID` | GitHub OAuth App client ID |
| `GITHUB_SECRET` | GitHub OAuth App client secret |

## Known Limitations

- **Email**: All email notifications log to console. Swap in Resend/SendGrid in `src/lib/email.ts`.
- **Payments**: The payment flow is a UI mock. Stripe integration is not implemented.
- **Migrations**: No version tracking. All migration checks run on every app start. Works for SQLite but won't scale to a team or CI/CD without a proper migration tool.
- **File uploads**: Stored on local disk in `uploads/`. Not suitable for multi-server deployment.
- **No tests**: Zero test coverage. The code is structured to be testable but no tests exist.
