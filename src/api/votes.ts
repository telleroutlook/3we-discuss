import type { Env } from '../types';
import { getSessionUser } from '../session';
import { castVote } from '../database';

export async function handleVotes(request: Request, env: Env, path: string): Promise<Response> {
  if (request.method !== 'POST' || path !== '/api/votes') {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  const user = await getSessionUser(request, env);
  if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as { targetType: 'post' | 'reply'; targetId: string; value: 1 | -1 };
  if (!body.targetType || !body.targetId || ![1, -1].includes(body.value)) {
    return Response.json({ success: false, error: 'Invalid vote data' }, { status: 400 });
  }

  await castVote(env, user.id, body.targetType, body.targetId, body.value);
  return Response.json({ success: true });
}
