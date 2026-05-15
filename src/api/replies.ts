import type { Env } from '../types';
import { getSessionUser } from '../session';
import { getReplies, createReply } from '../database';

export async function handleReplies(request: Request, env: Env, path: string): Promise<Response> {
  const repliesMatch = path.match(/^\/api\/posts\/([^/]+)\/replies$/);

  if (request.method === 'GET' && repliesMatch) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const replies = await getReplies(env, repliesMatch[1], page);
    return Response.json({ success: true, data: replies });
  }

  if (request.method === 'POST' && repliesMatch) {
    const user = await getSessionUser(request, env);
    if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { content: string; parentReplyId?: string };
    if (!body.content) {
      return Response.json({ success: false, error: 'Content required' }, { status: 400 });
    }

    const reply = await createReply(env, repliesMatch[1], user.id, body.content, body.parentReplyId);
    return Response.json({ success: true, data: reply }, { status: 201 });
  }

  return Response.json({ success: false, error: 'Not found' }, { status: 404 });
}
