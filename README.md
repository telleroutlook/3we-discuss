# 3WE Discuss

A lightweight, self-hosted discussion forum for the [3WE Robot Platform](https://github.com/telleroutlook/3we-robot-platform) community. Built with SolidJS and Cloudflare Workers, deployed at [discussion.3we.org](https://discussion.3we.org).

## Features

- **GitHub Authentication** — Sign in with your GitHub account
- **Discussion Categories** — Announcements, Q&A, Ideas, Show & Tell, General
- **Threaded Replies** — Nested conversations with Markdown support
- **Voting** — Upvote/downvote posts and replies
- **Full-text Search** — Powered by SQLite FTS5
- **Dark Mode** — Automatic or manual toggle
- **Zero External Dependencies** — No database servers, no Redis, no third-party services

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SolidJS, @solidjs/router, Tailwind CSS v4 |
| Backend | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite at the edge) |
| Sessions | Cloudflare KV |
| Auth | GitHub OAuth |
| Build | Vite |

## Getting Started

### Prerequisites

- Node.js 20+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Cloudflare account
- GitHub OAuth App ([create one here](https://github.com/settings/developers))

### Setup

```bash
git clone https://github.com/telleroutlook/3we-discuss.git
cd 3we-discuss
npm install

# Create Cloudflare resources
wrangler d1 create 3we-discuss-db
wrangler kv namespace create KV
# Update wrangler.jsonc with the generated IDs

# Initialize database
npm run db:local:init

# Set secrets for production
wrangler secret put GITHUB_CLIENT_ID --env production
wrangler secret put GITHUB_CLIENT_SECRET --env production
wrangler secret put SESSION_SECRET --env production

# Start development
npm run dev:full
```

### Deploy

```bash
npm run deploy
```

## Project Structure

```
├── sql/                 # Database migrations
├── src/
│   ├── api/             # API route handlers
│   ├── components/ui/   # Reusable UI components
│   ├── hooks/           # SolidJS hooks
│   ├── stores/          # Reactive state management
│   ├── views/           # Page components
│   ├── database.ts      # D1 query layer
│   ├── session.ts       # Session management
│   ├── types.ts         # TypeScript types
│   └── worker.ts        # Worker entry point
├── App.tsx              # Root component with routing
├── main.tsx             # Client entry point
└── wrangler.jsonc       # Cloudflare Worker config
```

## License

MIT
