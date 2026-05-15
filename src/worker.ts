import type { Env } from './types';
import { handleAuth } from './api/auth';
import { handlePosts } from './api/posts';
import { handleReplies } from './api/replies';
import { handleVotes } from './api/votes';
import { handleCategories } from './api/categories';
import { handleSearch } from './api/search';
import { handleUsers } from './api/users';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    const origin = env.ENVIRONMENT === 'production' ? env.BASE_URL : '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      let response: Response;

      if (path.startsWith('/api/auth/')) {
        response = await handleAuth(request, env, path);
      } else if (path.startsWith('/api/posts') && path.includes('/replies')) {
        response = await handleReplies(request, env, path);
      } else if (path.startsWith('/api/posts')) {
        response = await handlePosts(request, env, path);
      } else if (path.startsWith('/api/votes')) {
        response = await handleVotes(request, env, path);
      } else if (path.startsWith('/api/categories')) {
        response = await handleCategories(request, env, path);
      } else if (path.startsWith('/api/search')) {
        response = await handleSearch(request, env, path);
      } else if (path.startsWith('/api/users')) {
        response = await handleUsers(request, env, path);
      } else if (path === '/api/health') {
        response = Response.json({
          status: 'ok',
          version: env.APP_VERSION,
          environment: env.ENVIRONMENT,
        });
      } else {
        response = Response.json({ success: false, error: 'Not found' }, { status: 404 });
      }

      return addCors(response, origin);
    } catch (err) {
      console.error('Worker error:', err);
      return addCors(
        Response.json({ success: false, error: 'Internal server error' }, { status: 500 }),
        origin
      );
    }
  },
} satisfies ExportedHandler<Env>;

function corsHeaders(origin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function addCors(response: Response, origin: string): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', origin);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
