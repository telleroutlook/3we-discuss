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
  const [error, setError] = createSignal('');

  const [categories] = createResource(async () => {
    const res = await fetch('/api/categories');
    const json: ApiResponse<Category[]> = await res.json();
    return json.data || [];
  });

  async function submit(e: Event) {
    e.preventDefault();
    setError('');
    if (!categoryId()) { setError('Please select a category'); return; }
    if (!title().trim()) { setError('Please enter a title'); return; }
    if (!content().trim()) { setError('Please enter content'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: categoryId(), title: title(), content: content() }),
      });

      const json: ApiResponse<Post> = await res.json();
      if (res.ok && json.data) {
        navigate(`/p/${json.data.id}`);
      } else {
        setError(json.error || `Failed to create post (${res.status})`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Show when={currentUser()} fallback={
      <div class="text-center py-12">
        <p class="text-gray-600 dark:text-gray-400 mb-4">Please sign in to create a post.</p>
        <a href="/api/auth/github" rel="external" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium">
          Sign in with GitHub
        </a>
      </div>
    }>
      <div class="max-w-2xl">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white mb-6">New Discussion</h1>

        <Show when={error()}>
          <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error()}
          </div>
        </Show>

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
