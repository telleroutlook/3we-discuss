import type { Env } from '../types';
import { getSessionUser } from '../session';
import { getPostsByCategory, getPost, createPost } from '../database';

export async function handlePosts(request: Request, env: Env, path: string): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === 'GET' && path === '/api/posts') {
    const category = url.searchParams.get('category') || 'general';
    const page = parseInt(url.searchParams.get('page') || '1');
    const result = await getPostsByCategory(env, category, page);
    return Response.json({ success: true, data: result });
  }

  const postMatch = path.match(/^\/api\/posts\/([^/]+)$/);
  if (request.method === 'GET' && postMatch) {
    const post = await getPost(env, postMatch[1]);
    if (!post) return Response.json({ success: false, error: 'Not found' }, { status: 404 });
    return Response.json({ success: true, data: post });
  }

  if (request.method === 'POST' && path === '/api/posts') {
    const user = await getSessionUser(request, env);
    if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { categoryId: string; title: string; content: string };
    if (!body.categoryId || !body.title || !body.content) {
      return Response.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const post = await createPost(env, user.id, body.categoryId, body.title, body.content);
    return Response.json({ success: true, data: post }, { status: 201 });
  }

  return Response.json({ success: false, error: 'Not found' }, { status: 404 });
}
