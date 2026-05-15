import { createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { Category, ApiResponse, Post } from '../types';
import { currentUser } from '../stores/authStore';

export default function NewPost() {
  const navigate = useNavigate();
  const [title, setTitle] = createSignal('');
  const [content, setContent] = createSignal('');
  const [categoryId, setCategoryId] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);

  const [categories] = createResource(async () => {
    const res = await fetch('/api/categories');
    const json: ApiResponse<Category[]> = await res.json();
    return json.data || [];
  });

  async function submit(e: Event) {
    e.preventDefault();
    if (!title().trim() || !content().trim() || !categoryId()) return;

    setSubmitting(true);
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: categoryId(), title: title(), content: content() }),
    });

    if (res.ok) {
      const json: ApiResponse<Post> = await res.json();
      navigate(`/p/${json.data!.id}`);
    }
    setSubmitting(false);
  }

  return (
    <Show when={currentUser()} fallback={<p class="text-gray-500">Please sign in to create a post.</p>}>
      <div class="max-w-2xl">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-6">New Discussion</h1>

        <form onSubmit={submit} class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={categoryId()}
              onChange={(e) => setCategoryId(e.currentTarget.value)}
              class="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select a category...</option>
              <For each={categories()}>
                {(cat) => <option value={cat.id}>{cat.name}</option>}
              </For>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              placeholder="What's your question or topic?"
              class="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content (Markdown supported)</label>
            <textarea
              value={content()}
              onInput={(e) => setContent(e.currentTarget.value)}
              placeholder="Describe your topic in detail..."
              class="w-full min-h-[200px] p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
            />
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              disabled={submitting()}
              class="px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting() ? 'Posting...' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>
    </Show>
  );
}
