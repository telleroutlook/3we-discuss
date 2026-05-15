import type { Env } from '../types';
import { getCategories } from '../database';

export async function handleCategories(request: Request, env: Env, path: string): Promise<Response> {
  if (request.method === 'GET' && path === '/api/categories') {
    const categories = await getCategories(env);
    return Response.json({ success: true, data: categories });
  }
  return Response.json({ success: false, error: 'Not found' }, { status: 404 });
}
