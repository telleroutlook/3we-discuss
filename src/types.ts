export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ASSETS: Fetcher;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SESSION_SECRET: string;
  BASE_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  ENVIRONMENT: string;
}

export interface User {
  id: string;
  githubId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isAdmin: boolean;
  createdAt: string;
  lastActive: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  sortOrder: number;
  postCount: number;
  createdAt: string;
}

export interface Post {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  voteCount: number;
  replyCount: number;
  viewCount: number;
  lastReplyAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
  category?: Category;
}

export interface Reply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentReplyId: string | null;
  voteCount: number;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface Vote {
  id: string;
  userId: string;
  targetType: 'post' | 'reply';
  targetId: string;
  value: 1 | -1;
  createdAt: string;
}

export interface SessionData {
  userId: string;
  expiresAt: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
