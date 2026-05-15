# Implementation Plan — 3WE Discuss

## Overview

A self-hosted discussion forum replacing Discord/WeChat for the 3WE Robot Platform community.
Deployed as a Cloudflare Worker at `discussion.3we.org`.

---

## Phase 1: Foundation (Current) ✅

- [x] Project scaffold from trustavo31
- [x] Build tooling (Vite + SolidJS + Tailwind + Wrangler)
- [x] Database schema (users, categories, posts, replies, votes, FTS5)
- [x] Worker entry point with API routing
- [x] GitHub OAuth flow
- [x] Core API endpoints (posts, replies, votes, categories, search, users)
- [x] Frontend shell (Layout, routing, auth store)
- [x] Page views (Home, Category, Post Detail, New Post, Search, Login, Profile)
- [x] CLAUDE.md + README.md

---

## Phase 2: Core Polish

- [ ] Create Cloudflare resources (D1, KV) and update wrangler.jsonc with real IDs
- [ ] Create GitHub OAuth App and set secrets
- [ ] Markdown rendering in post content and replies (using `marked`)
- [ ] Vote buttons UI (upvote/downvote with optimistic updates)
- [ ] Post author display with avatar in all list/detail views
- [ ] Reply threading UI (indent nested replies)
- [ ] Pagination component for post lists
- [ ] Loading states and error handling throughout
- [ ] Toast notifications for actions (post created, vote cast, errors)
- [ ] Mobile responsive refinements

---

## Phase 3: Enhanced Features

- [ ] Edit/delete posts (owner + admin)
- [ ] Edit/delete replies (owner + admin)
- [ ] Pin/lock posts (admin only)
- [ ] Mark reply as accepted answer (Q&A category, post author only)
- [ ] User profile page with post history
- [ ] Sort posts by: latest, most votes, most replies, unanswered
- [ ] Category post count kept in sync
- [ ] "Last active" timestamp updates on user actions
- [ ] SEO: meta tags per page, og:image for link sharing

---

## Phase 4: Admin & Moderation

- [ ] Admin dashboard (accessible to is_admin users)
- [ ] User management (ban, promote to admin)
- [ ] Content moderation (hide/remove posts or replies)
- [ ] Rate limiting on post/reply creation
- [ ] Spam detection (simple heuristics)
- [ ] Audit log

---

## Phase 5: Community & Growth

- [ ] Email notifications (via Cloudflare Email Workers or Mailchannels)
- [ ] RSS feed for categories and user activity
- [ ] Webhook integrations (notify on new posts)
- [ ] API documentation (OpenAPI spec)
- [ ] Contributor stats and leaderboard
- [ ] Import existing GitHub Discussions content

---

## Phase 6: Performance & Reliability

- [ ] KV caching for hot categories and post lists
- [ ] Edge-side rendering for SEO (optional SSR via Workers)
- [ ] Analytics dashboard (view counts, active users)
- [ ] Automated backups (D1 export)
- [ ] Health monitoring and alerting
- [ ] Load testing

---

## Infrastructure Setup Checklist

```bash
# 1. Create Cloudflare resources
wrangler d1 create 3we-discuss-db
wrangler kv namespace create KV
wrangler kv namespace create KV --preview

# 2. Update wrangler.jsonc with generated IDs

# 3. Run database migrations
wrangler d1 execute 3we-discuss-db --remote --file sql/001_init.sql
wrangler d1 execute 3we-discuss-db --remote --file sql/002_seed_categories.sql

# 4. Create GitHub OAuth App
#    Homepage: https://discussion.3we.org
#    Callback: https://discussion.3we.org/api/auth/github/callback

# 5. Set worker secrets
wrangler secret put GITHUB_CLIENT_ID --env production
wrangler secret put GITHUB_CLIENT_SECRET --env production
wrangler secret put SESSION_SECRET --env production

# 6. Configure custom domain
#    Add CNAME: discussion.3we.org → 3we-discuss.workers.dev

# 7. Deploy
npm run deploy

# 8. Verify
curl https://discussion.3we.org/api/health
```

---

## Design Principles

1. **Minimal infrastructure** — D1 + KV only. No Redis, no Postgres, no external services.
2. **Fast by default** — Edge-deployed, <50KB JS bundle, instant navigation.
3. **GitHub-native** — One-click login for developers, avatars from GitHub.
4. **Low maintenance** — No servers to manage, auto-scaling, Cloudflare free tier.
5. **Content-first** — Clean typography, readable discussions, no distractions.
