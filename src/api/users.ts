import type { Env } from '../types';
import { mapUser } from '../session';

export async function handleUsers(request: Request, env: Env, path: string): Promise<Response> {
  const userMatch = path.match(/^\/api\/users\/([^/]+)$/);
  if (request.method === 'GET' && userMatch) {
    const row = await env.DB.prepare('SELECT * FROM users WHERE username = ?').bind(userMatch[1]).first();
    if (!row) return Response.json({ success: false, error: 'User not found' }, { status: 404 });
    return Response.json({ success: true, data: mapUser(row) });
  }

  return Response.json({ success: false, error: 'Not found' }, { status: 404 });
}
