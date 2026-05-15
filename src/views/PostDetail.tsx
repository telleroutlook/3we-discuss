import { createResource, createSignal, For, Show } from 'solid-js';
import { useParams } from '@solidjs/router';
import type { Post, Reply, ApiResponse } from '../types';
import { currentUser } from '../stores/authStore';
import { Github, Check } from 'lucide-solid';
import { timeAgo } from '../utils/format';
import Breadcrumb from '../components/ui/Breadcrumb';

export default function PostDetail() {
  const params = useParams<{ id: string }>();
  const [replyContent, setReplyContent] = createSignal('');

  const [post, { refetch: refetchPost }] = createResource(
    () => params.id,
    async (id) => {
      const res = await fetch(`/api/posts/${id}`);
      const json: ApiResponse<Post> = await res.json();
      return json.data || null;
    }
  );

  const [replies, { refetch: refetchReplies }] = createResource(
    () => params.id,
    async (id) => {
      const res = await fetch(`/api/posts/${id}/replies`);
      const json: ApiResponse<Reply[]> = await res.json();
      return json.data || [];
    }
  );

  async function submitReply(e: Event) {
    e.preventDefault();
    if (!replyContent().trim()) return;

    await fetch(`/api/posts/${params.id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyContent() }),
    });

    setReplyContent('');
    refetchReplies();
    refetchPost();
  }

  const breadcrumbItems = () => {
    const p = post();
    const items = [];
    if (p?.category) {
      items.push({ label: p.category.name, href: `/c/${p.category.slug}` });
    }
    if (p) {
      items.push({ label: p.title.length > 40 ? p.title.slice(0, 40) + '…' : p.title, href: `/p/${p.id}` });
    }
    return items;
  };

  return (
    <div class="max-w-3xl mx-auto">
      <Show when={post()}>
        {(p) => (
          <>
            <Breadcrumb items={breadcrumbItems()} />
            <article class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-card overflow-hidden animate-fade-in">
              <div class="h-1 bg-gradient-to-r from-brand-500 to-accent-500" />

              <div class="p-6 md:p-8">
                <h1 class="font-display text-2xl font-bold text-stone-900 dark:text-white mb-3">
                  {p().title}
                </h1>

                <div class="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
                  <Show when={p().author}>
                    <img src={p().author!.avatarUrl || ''} alt="" class="w-8 h-8 rounded-full ring-2 ring-brand-100 dark:ring-brand-900" />
                    <span class="text-sm font-medium text-stone-700 dark:text-stone-300">
                      {p().author!.displayName || p().author!.username}
                    </span>
                  </Show>
                  <span class="text-xs font-mono text-stone-400">{timeAgo(p().createdAt)}</span>
                  <div class="ml-auto flex items-center gap-3 text-xs font-mono text-stone-500 dark:text-stone-400">
                    <span>{p().voteCount} votes</span>
                    <span>{p().replyCount} replies</span>
                    <span>{p().viewCount} views</span>
                  </div>
                </div>

                <div class="prose prose-stone dark:prose-invert max-w-none whitespace-pre-wrap">
                  {p().content}
                </div>
              </div>
            </article>

            <section class="mt-8">
              <h2 class="font-display text-sm font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-4">
                Replies ({replies()?.length || 0})
              </h2>

              <div class="space-y-0">
                <For each={replies()}>
                  {(reply, index) => (
                    <div class="relative pl-8 pb-6 last:pb-0">
                      <Show when={index() < (replies()?.length || 0) - 1}>
                        <div class="absolute left-3.5 top-10 bottom-0 w-px bg-stone-200 dark:bg-stone-700" />
                      </Show>
                      <div class="absolute left-2 top-3 w-3 h-3 rounded-full border-2 border-brand-400 bg-white dark:bg-stone-900" />

                      <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg p-4 shadow-card">
                        <div class="flex items-center gap-2 mb-2">
                          <Show when={reply.author}>
                            <img src={reply.author!.avatarUrl || ''} alt="" class="w-6 h-6 rounded-full" />
                            <span class="text-sm font-medium text-stone-700 dark:text-stone-300">
                              {reply.author!.displayName || reply.author!.username}
                            </span>
                          </Show>
                          <span class="text-xs font-mono text-stone-400">{timeAgo(reply.createdAt)}</span>
                          <Show when={reply.isAccepted}>
                            <span class="inline-flex items-center gap-1 ml-auto px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                              <Check size={12} /> Accepted
                            </span>
                          </Show>
                        </div>
                        <div class="text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                          {reply.content}
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </section>

            <Show
              when={currentUser()}
              fallback={
                <div class="mt-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 text-center shadow-card">
                  <p class="text-stone-600 dark:text-stone-400 mb-4 font-display">Sign in to join the discussion</p>
                  <a href="/api/auth/github" rel="external" class="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg font-display font-semibold text-sm hover:bg-stone-800 dark:hover:bg-stone-100 active:scale-[0.97] transition-all duration-150">
                    <Github size={18} />
                    Sign in with GitHub
                  </a>
                </div>
              }
            >
              <form onSubmit={submitReply} class="mt-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-card">
                <div class="h-0.5 bg-gradient-to-r from-brand-500/30 to-accent-500/30" />
                <div class="p-5">
                  <textarea
                    value={replyContent()}
                    onInput={(e) => setReplyContent(e.currentTarget.value)}
                    placeholder="Write a reply..."
                    class="w-full min-h-[120px] px-4 py-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-y transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 shadow-inset-soft"
                  />
                  <div class="mt-4 flex justify-end">
                    <button type="submit" class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-display font-semibold text-sm active:scale-[0.97] transition-all duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2">
                      Reply
                    </button>
                  </div>
                </div>
              </form>
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}
