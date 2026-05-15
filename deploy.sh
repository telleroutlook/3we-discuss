#!/usr/bin/env bash
set -euo pipefail

unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY

echo "Building..."
npm run build

echo "Deploying to Cloudflare Workers..."
npx wrangler deploy --env production

echo "Done. Verifying health..."
curl -sf https://discussion.3we.org/api/health && echo ""
