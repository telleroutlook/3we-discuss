import type { Env } from '../types';
import { searchPosts } from '../database';

export async function handleSearch(request: Request, env: Env, path: string): Promise<Response> {
  if (request.method !== 'GET' || path !== '/api/search') {
    return Response.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get('q');
  if (!query || query.length < 2) {
    return Response.json({ success: false, error: 'Query too short' }, { status: 400 });
  }

  const page = parseInt(url.searchParams.get('page') || '1');
  const result = await searchPosts(env, query, page);
  return Response.json({ success: true, data: result });
}
