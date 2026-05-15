import type { Env } from '../types';
import { createSession, setSessionCookie, clearSessionCookie, getSessionUser, generateId } from '../session';
import { upsertUser } from '../database';

export async function handleAuth(request: Request, env: Env, path: string): Promise<Response> {
  if (path === '/api/auth/github') return handleGitHubRedirect(env);
  if (path === '/api/auth/github/callback') return handleGitHubCallback(request, env);
  if (path === '/api/auth/me') return handleMe(request, env);
  if (path === '/api/auth/logout') return handleLogout(request, env);
  return new Response(JSON.stringify({ success: false, error: 'Not found' }), { status: 404 });
}

async function handleGitHubRedirect(env: Env): Promise<Response> {
  const state = generateId();
  await env.KV.put(`oauth_state:${state}`, '1', { expirationTtl: 600 });
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${env.BASE_URL}/api/auth/github/callback`,
    scope: 'read:user',
    state,
  });
  return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
}

async function handleGitHubCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return Response.redirect(`${env.BASE_URL}/login?error=missing_params`, 302);
  }

  const storedState = await env.KV.get(`oauth_state:${state}`);
  if (!storedState) {
    return Response.redirect(`${env.BASE_URL}/login?error=invalid_state`, 302);
  }
  await env.KV.delete(`oauth_state:${state}`);

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
  if (!tokenData.access_token) {
    return Response.redirect(`${env.BASE_URL}/login?error=token_failed`, 302);
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': '3WE-Discuss' },
  });
  const ghUser = await userRes.json() as { id: number; login: string; name: string | null; avatar_url: string };

  const user = await upsertUser(env, ghUser.id, ghUser.login, ghUser.name, ghUser.avatar_url);
  const token = await createSession(env, user.id);

  return new Response(null, {
    status: 302,
    headers: {
      Location: env.BASE_URL,
      'Set-Cookie': setSessionCookie(token, env.BASE_URL),
    },
  });
}

async function handleMe(request: Request, env: Env): Promise<Response> {
  const user = await getSessionUser(request, env);
  if (!user) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  return Response.json({ success: true, data: user });
}

async function handleLogout(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const match = cookie.match(/session=([^;]+)/);
    if (match) await env.KV.delete(`session:${match[1]}`);
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(env.BASE_URL),
    },
  });
}
