import { createSignal, createResource, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import type { Category, ApiResponse, Post } from '../types';
import { currentUser } from '../stores/authStore';
import { Github } from 'lucide-solid';

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
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Show when={currentUser()} fallback={
      <div class="text-center py-12">
        <p class="text-stone-600 dark:text-stone-400 mb-4 font-display">Please sign in to create a post.</p>
        <a href="/api/auth/github" rel="external" class="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg font-display font-semibold text-sm hover:bg-stone-800 dark:hover:bg-stone-100 active:scale-[0.97] transition-all duration-150">
          <Github size={18} />
          Sign in with GitHub
        </a>
      </div>
    }>
      <div class="max-w-2xl mx-auto">
        <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-card overflow-hidden animate-fade-in">
          <div class="h-1 bg-gradient-to-r from-brand-500 to-accent-500" />

          <div class="p-6 md:p-8">
            <h1 class="font-display text-xl font-bold text-stone-900 dark:text-white mb-6">New Discussion</h1>

            <Show when={error()}>
              <div class="mb-5 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                {error()}
              </div>
            </Show>

            <form onSubmit={submit} class="space-y-5">
              <div>
                <label class="block font-display text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Category</label>
                <select
                  value={categoryId()}
                  onChange={(e) => setCategoryId(e.currentTarget.value)}
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 shadow-inset-soft"
                >
                  <option value="">Select a category...</option>
                  <For each={categories()}>
                    {(cat) => <option value={cat.id}>{cat.name}</option>}
                  </For>
                </select>
              </div>

              <div>
                <label class="block font-display text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Title</label>
                <input
                  type="text"
                  value={title()}
                  onInput={(e) => setTitle(e.currentTarget.value)}
                  placeholder="What's your question or topic?"
                  class="w-full px-4 py-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 shadow-inset-soft"
                />
              </div>

              <div>
                <label class="block font-display text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Content <span class="text-stone-400 font-normal">(Markdown supported)</span></label>
                <textarea
                  value={content()}
                  onInput={(e) => setContent(e.currentTarget.value)}
                  placeholder="Describe your topic in detail..."
                  class="w-full min-h-[200px] px-4 py-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 resize-y font-mono text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 shadow-inset-soft"
                />
              </div>

              <div class="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting()}
                  class="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-display font-semibold text-sm active:scale-[0.97] transition-all duration-150 shadow-sm hover:shadow-md disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2"
                >
                  {submitting() ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Show>
  );
}
