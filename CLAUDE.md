# 3WE Discuss

A self-hosted discussion forum for the 3WE Robot Platform community. Deployed as a Cloudflare Worker at `discussion.3we.org`.

## Tech Stack

- **Frontend**: SolidJS + @solidjs/router + Tailwind CSS v4
- **Backend**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **Sessions**: Cloudflare KV
- **Auth**: GitHub OAuth
- **Build**: Vite + vite-plugin-solid

## Architecture

```
src/worker.ts          → CF Worker entry: routes /api/* to handlers, SPA fallback for everything else
src/api/*.ts           → API route handlers (auth, posts, replies, votes, categories, search, users)
src/database.ts        → D1 query functions
src/session.ts         → Cookie session management via KV
src/types.ts           → Shared TypeScript types and Env interface
src/views/*.tsx        → SolidJS page components
src/stores/*.ts        → SolidJS reactive state
src/components/ui/*.tsx → Reusable UI components
```

## Development

```bash
npm install
npm run db:local:init     # Initialize local D1 database
npm run dev:full          # Start Vite (port 3000) + Wrangler (port 8787)
npm run dev               # Frontend only (proxies /api to :8787)
npm run dev:worker        # Worker only
```

## Deployment

```bash
npm run deploy            # Build + deploy to production
```

Secrets (set via `wrangler secret put --env production`):
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SESSION_SECRET`

## Code Conventions

- TypeScript strict mode
- API responses always `{ success: boolean, data?: T, error?: string }`
- Database columns: `snake_case`; TypeScript interfaces: `camelCase`
- No unused imports, no `any`
- File naming: `PascalCase.tsx` for components/views, `camelCase.ts` for utilities
- Tailwind for all styling — no custom CSS classes except in `index.css`

## Database

Schema lives in `sql/`. Run migrations in order:
```bash
wrangler d1 execute 3we-discuss-db --remote --file sql/001_init.sql
wrangler d1 execute 3we-discuss-db --remote --file sql/002_seed_categories.sql
```

## Testing

```bash
npm run type-check        # TypeScript validation
npm run build             # Verify production build
```
