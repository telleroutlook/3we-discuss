import type { Env, SessionData, User } from './types';

const SESSION_TTL = 7 * 24 * 60 * 60;

export function generateId(): string {
  return crypto.randomUUID();
}

export function getSessionCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

export async function getSessionUser(request: Request, env: Env): Promise<User | null> {
  const token = getSessionCookie(request);
  if (!token) return null;

  const raw = await env.KV.get(`session:${token}`);
  if (!raw) return null;

  const session: SessionData = JSON.parse(raw);
  if (Date.now() > session.expiresAt) {
    await env.KV.delete(`session:${token}`);
    return null;
  }

  const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(session.userId).first();
  if (!row) return null;

  return mapUser(row);
}

export async function createSession(env: Env, userId: string): Promise<string> {
  const token = generateId();
  const session: SessionData = {
    userId,
    expiresAt: Date.now() + SESSION_TTL * 1000,
  };
  await env.KV.put(`session:${token}`, JSON.stringify(session), { expirationTtl: SESSION_TTL });
  return token;
}

export function setSessionCookie(token: string, baseUrl: string): string {
  const secure = baseUrl.startsWith('https');
  return `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL}${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie(baseUrl: string): string {
  const secure = baseUrl.startsWith('https');
  return `session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}

export function mapUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    githubId: row.github_id as number,
    username: row.username as string,
    displayName: row.display_name as string | null,
    avatarUrl: row.avatar_url as string | null,
    bio: row.bio as string | null,
    isAdmin: Boolean(row.is_admin),
    createdAt: row.created_at as string,
    lastActive: row.last_active as string,
  };
}
