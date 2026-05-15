import { createResource, createSignal, For, Show } from 'solid-js';
import { useParams } from '@solidjs/router';
import type { Post, Reply, ApiResponse } from '../types';
import { currentUser } from '../stores/authStore';

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

  return (
    <div class="max-w-3xl">
      <Show when={post()}>
        {(p) => (
          <>
            <article class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6">
              <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{p().title}</h1>
              <div class="text-xs text-gray-500 mb-4">
                {p().voteCount} votes · {p().replyCount} replies · {new Date(p().createdAt).toLocaleDateString()}
              </div>
              <div class="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {p().content}
              </div>
            </article>

            <section class="space-y-3 mb-6">
              <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Replies ({replies()?.length || 0})</h2>
              <For each={replies()}>
                {(reply) => (
                  <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div class="text-xs text-gray-500 mb-2">{new Date(reply.createdAt).toLocaleDateString()}</div>
                    <div class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{reply.content}</div>
                  </div>
                )}
              </For>
            </section>

            <Show
              when={currentUser()}
              fallback={
                <div class="text-center py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                  <p class="text-gray-600 dark:text-gray-400 mb-3">Sign in to join the discussion</p>
                  <a href="/api/auth/github" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100">
                    Sign in with GitHub
                  </a>
                </div>
              }
            >
              <form onSubmit={submitReply} class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <textarea
                  value={replyContent()}
                  onInput={(e) => setReplyContent(e.currentTarget.value)}
                  placeholder="Write a reply..."
                  class="w-full min-h-[100px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div class="mt-3 flex justify-end">
                  <button type="submit" class="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
                    Reply
                  </button>
                </div>
              </form>
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}
