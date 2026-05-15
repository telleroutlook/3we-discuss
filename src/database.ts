import type { Env, Post, Reply, Category, User } from './types';
import { generateId, mapUser } from './session';

export function mapCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    description: row.description as string | null,
    icon: row.icon as string | null,
    color: row.color as string,
    sortOrder: row.sort_order as number,
    postCount: row.post_count as number,
    createdAt: row.created_at as string,
  };
}

export function mapPost(row: Record<string, unknown>): Post {
  const post: Post = {
    id: row.id as string,
    categoryId: row.category_id as string,
    authorId: row.author_id as string,
    title: row.title as string,
    content: row.content as string,
    isPinned: Boolean(row.is_pinned),
    isLocked: Boolean(row.is_locked),
    voteCount: row.vote_count as number,
    replyCount: row.reply_count as number,
    viewCount: row.view_count as number,
    lastReplyAt: row.last_reply_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
  if (row.author_username) {
    post.author = {
      id: row.author_id as string,
      githubId: 0,
      username: row.author_username as string,
      displayName: (row.author_display_name as string | null) || null,
      avatarUrl: (row.author_avatar as string | null) || null,
      bio: null,
      isAdmin: false,
      createdAt: '',
      lastActive: '',
    };
  }
  return post;
}

export function mapReply(row: Record<string, unknown>): Reply {
  const reply: Reply = {
    id: row.id as string,
    postId: row.post_id as string,
    authorId: row.author_id as string,
    content: row.content as string,
    parentReplyId: row.parent_reply_id as string | null,
    voteCount: row.vote_count as number,
    isAccepted: Boolean(row.is_accepted),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
  if (row.author_username) {
    reply.author = {
      id: row.author_id as string,
      githubId: 0,
      username: row.author_username as string,
      displayName: (row.author_display_name as string | null) || null,
      avatarUrl: (row.author_avatar as string | null) || null,
      bio: null,
      isAdmin: false,
      createdAt: '',
      lastActive: '',
    };
  }
  return reply;
}

export async function getCategories(env: Env): Promise<Category[]> {
  const { results } = await env.DB.prepare(
    'SELECT * FROM categories ORDER BY sort_order ASC'
  ).all();
  return results.map(mapCategory);
}

export async function getPostsByCategory(
  env: Env,
  categorySlug: string,
  page: number = 1,
  limit: number = 20
): Promise<{ posts: Post[]; total: number }> {
  const offset = (page - 1) * limit;
  const category = await env.DB.prepare('SELECT id FROM categories WHERE slug = ?').bind(categorySlug).first();
  if (!category) return { posts: [], total: 0 };

  const countResult = await env.DB.prepare(
    'SELECT COUNT(*) as count FROM posts WHERE category_id = ?'
  ).bind(category.id).first();

  const { results } = await env.DB.prepare(`
    SELECT p.*, u.username as author_username, u.display_name as author_display_name, u.avatar_url as author_avatar
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.category_id = ?
    ORDER BY p.is_pinned DESC, p.created_at DESC
    LIMIT ? OFFSET ?
  `).bind(category.id, limit, offset).all();

  return {
    posts: results.map(mapPost),
    total: (countResult?.count as number) || 0,
  };
}

export async function getPost(env: Env, postId: string): Promise<Post | null> {
  const row = await env.DB.prepare(`
    SELECT p.*, u.username as author_username, u.display_name as author_display_name, u.avatar_url as author_avatar
    FROM posts p JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `).bind(postId).first();
  if (!row) return null;

  await env.DB.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').bind(postId).run();
  return mapPost(row);
}

export async function createPost(
  env: Env,
  authorId: string,
  categoryId: string,
  title: string,
  content: string
): Promise<Post> {
  const id = generateId();
  await env.DB.prepare(`
    INSERT INTO posts (id, category_id, author_id, title, content) VALUES (?, ?, ?, ?, ?)
  `).bind(id, categoryId, authorId, title, content).run();

  await env.DB.prepare(
    'UPDATE categories SET post_count = post_count + 1 WHERE id = ?'
  ).bind(categoryId).run();

  const row = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
  return mapPost(row!);
}

export async function getReplies(
  env: Env,
  postId: string,
  page: number = 1,
  limit: number = 50
): Promise<Reply[]> {
  const offset = (page - 1) * limit;
  const { results } = await env.DB.prepare(`
    SELECT r.*, u.username as author_username, u.display_name as author_display_name, u.avatar_url as author_avatar
    FROM replies r JOIN users u ON r.author_id = u.id
    WHERE r.post_id = ?
    ORDER BY r.created_at ASC
    LIMIT ? OFFSET ?
  `).bind(postId, limit, offset).all();
  return results.map(mapReply);
}

export async function createReply(
  env: Env,
  postId: string,
  authorId: string,
  content: string,
  parentReplyId?: string
): Promise<Reply> {
  const id = generateId();
  await env.DB.prepare(`
    INSERT INTO replies (id, post_id, author_id, content, parent_reply_id) VALUES (?, ?, ?, ?, ?)
  `).bind(id, postId, authorId, content, parentReplyId || null).run();

  await env.DB.prepare(`
    UPDATE posts SET reply_count = reply_count + 1, last_reply_at = datetime('now') WHERE id = ?
  `).bind(postId).run();

  const row = await env.DB.prepare('SELECT * FROM replies WHERE id = ?').bind(id).first();
  return mapReply(row!);
}

export async function castVote(
  env: Env,
  userId: string,
  targetType: 'post' | 'reply',
  targetId: string,
  value: 1 | -1
): Promise<void> {
  const existing = await env.DB.prepare(
    'SELECT value FROM votes WHERE user_id = ? AND target_type = ? AND target_id = ?'
  ).bind(userId, targetType, targetId).first();

  const table = targetType === 'post' ? 'posts' : 'replies';

  if (existing) {
    const oldValue = existing.value as number;
    if (oldValue === value) {
      await env.DB.batch([
        env.DB.prepare(
          'DELETE FROM votes WHERE user_id = ? AND target_type = ? AND target_id = ?'
        ).bind(userId, targetType, targetId),
        env.DB.prepare(
          `UPDATE ${table} SET vote_count = vote_count - ? WHERE id = ?`
        ).bind(value, targetId),
      ]);
    } else {
      await env.DB.batch([
        env.DB.prepare(
          'UPDATE votes SET value = ? WHERE user_id = ? AND target_type = ? AND target_id = ?'
        ).bind(value, userId, targetType, targetId),
        env.DB.prepare(
          `UPDATE ${table} SET vote_count = vote_count + ? WHERE id = ?`
        ).bind(value * 2, targetId),
      ]);
    }
  } else {
    const id = generateId();
    await env.DB.batch([
      env.DB.prepare(
        'INSERT INTO votes (id, user_id, target_type, target_id, value) VALUES (?, ?, ?, ?, ?)'
      ).bind(id, userId, targetType, targetId, value),
      env.DB.prepare(
        `UPDATE ${table} SET vote_count = vote_count + ? WHERE id = ?`
      ).bind(value, targetId),
    ]);
  }
}

export async function searchPosts(
  env: Env,
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<{ posts: Post[]; total: number }> {
  const offset = (page - 1) * limit;
  const sanitized = '"' + query.replace(/"/g, '""') + '"';

  const countResult = await env.DB.prepare(`
    SELECT COUNT(*) as count FROM posts p
    JOIN posts_fts ON posts_fts.rowid = p.rowid
    WHERE posts_fts MATCH ?
  `).bind(sanitized).first();

  const { results } = await env.DB.prepare(`
    SELECT p.* FROM posts p
    JOIN posts_fts ON posts_fts.rowid = p.rowid
    WHERE posts_fts MATCH ?
    ORDER BY rank
    LIMIT ? OFFSET ?
  `).bind(sanitized, limit, offset).all();

  return { posts: results.map(mapPost), total: (countResult?.count as number) || 0 };
}

export async function upsertUser(
  env: Env,
  githubId: number,
  username: string,
  displayName: string | null,
  avatarUrl: string | null
): Promise<User> {
  const existing = await env.DB.prepare('SELECT * FROM users WHERE github_id = ?').bind(githubId).first();

  if (existing) {
    await env.DB.prepare(`
      UPDATE users SET username = ?, display_name = ?, avatar_url = ?, last_active = datetime('now')
      WHERE github_id = ?
    `).bind(username, displayName, avatarUrl, githubId).run();
    return mapUser({ ...existing, username, display_name: displayName, avatar_url: avatarUrl });
  }

  const id = generateId();
  await env.DB.prepare(`
    INSERT INTO users (id, github_id, username, display_name, avatar_url) VALUES (?, ?, ?, ?, ?)
  `).bind(id, githubId, username, displayName, avatarUrl).run();

  const row = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  return mapUser(row!);
}
