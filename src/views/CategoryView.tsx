import { createResource, For, Show } from 'solid-js';
import { A, useParams } from '@solidjs/router';
import type { Post, ApiResponse } from '../types';
import { currentUser } from '../stores/authStore';
import { MessageSquare } from 'lucide-solid';
import { timeAgo } from '../utils/format';
import Breadcrumb from '../components/ui/Breadcrumb';

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

  const categoryName = () => params.slug.replace(/-/g, ' ');

  return (
    <div>
      <Breadcrumb items={[{ label: categoryName(), href: `/c/${params.slug}` }]} />

      <div class="flex items-center justify-between mb-6">
        <h1 class="font-display text-xl font-bold text-stone-900 dark:text-white capitalize">
          {categoryName()}
        </h1>
        <Show when={currentUser()}>
          <A href="/new" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-display font-semibold text-sm active:scale-[0.97] transition-all duration-150 shadow-sm hover:shadow-md">
            New Post
          </A>
        </Show>
      </div>

      <div class="space-y-3">
        <For each={data()?.posts} fallback={
          <div class="text-center py-12">
            <MessageSquare size={40} class="mx-auto text-stone-300 dark:text-stone-700 mb-3" />
            <p class="text-stone-500 dark:text-stone-400 font-display">No posts yet. Be the first to start a discussion!</p>
          </div>
        }>
          {(post, index) => (
            <A
              href={`/p/${post.id}`}
              class="group block p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-200 ease-out animate-start animate-fade-in-up"
              style={{ 'animation-delay': `${index() * 0.04}s` }}
            >
              <div class="flex items-start gap-4">
                <div class="flex flex-col items-center gap-0.5 min-w-[40px] pt-0.5">
                  <div class="text-sm font-mono font-medium text-brand-600 dark:text-brand-400">
                    {post.voteCount}
                  </div>
                  <div class="text-[10px] font-mono uppercase text-stone-400 dark:text-stone-500">votes</div>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="font-display font-semibold text-stone-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
                    {post.title}
                  </h3>
                  <div class="mt-2 flex items-center gap-3 text-xs font-mono text-stone-500 dark:text-stone-400">
                    <span class="inline-flex items-center gap-1">
                      <MessageSquare size={12} />
                      {post.replyCount}
                    </span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>

                <Show when={post.replyCount > 0}>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                    {post.replyCount} replies
                  </span>
                </Show>
              </div>
            </A>
          )}
        </For>
      </div>
    </div>
  );
}
