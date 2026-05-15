import { createSignal, createResource, For, Show } from 'solid-js';
import { A, useSearchParams } from '@solidjs/router';
import type { Post, ApiResponse } from '../types';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = createSignal((searchParams.q as string) || '');

  const [results] = createResource(
    () => searchParams.q as string | undefined,
    async (q) => {
      if (!q || q.length < 2) return null;
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json: ApiResponse<{ posts: Post[]; total: number }> = await res.json();
      return json.data || null;
    }
  );

  function submit(e: Event) {
    e.preventDefault();
    setSearchParams({ q: query() });
  }

  return (
    <div class="max-w-3xl">
      <form onSubmit={submit} class="mb-6">
        <input
          type="text"
          value={query()}
          onInput={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search discussions..."
          class="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </form>

      <Show when={results()}>
        {(r) => (
          <div class="space-y-2">
            <p class="text-sm text-gray-500 mb-4">{r().total} results</p>
            <For each={r().posts}>
              {(post) => (
                <A
                  href={`/p/${post.id}`}
                  class="block p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-brand-300 transition-colors"
                >
                  <h3 class="font-medium text-gray-900 dark:text-white">{post.title}</h3>
                  <p class="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                </A>
              )}
            </For>
          </div>
        )}
      </Show>
    </div>
  );
}
