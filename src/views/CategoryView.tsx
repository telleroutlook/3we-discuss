import { createResource, For, Show } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import type { Post, ApiResponse } from '../types';
import { currentUser } from '../stores/authStore';

export default function CategoryView() {
  const params = useParams<{ slug: string }>();

  const [data] = createResource(
    () => params.slug,
    async (slug) => {
      const res = await fetch(`/api/posts?category=${slug}`);
      const json: ApiResponse<{ posts: Post[]; total: number }> = await res.json();
      return json.data || { posts: [], total: 0 };
    }
  );

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white capitalize">{params.slug.replace(/-/g, ' ')}</h1>
        <Show when={currentUser()}>
          <A href="/new" class="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
            New Post
          </A>
        </Show>
      </div>

      <div class="space-y-2">
        <For each={data()?.posts} fallback={<p class="text-gray-500 dark:text-gray-400">No posts yet. Be the first to start a discussion!</p>}>
          {(post) => (
            <A
              href={`/p/${post.id}`}
              class="block p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
            >
              <h3 class="font-medium text-gray-900 dark:text-white">{post.title}</h3>
              <div class="mt-1 flex items-center gap-4 text-xs text-gray-500">
                <span>{post.voteCount} votes</span>
                <span>{post.replyCount} replies</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </A>
          )}
        </For>
      </div>
    </div>
  );
}
