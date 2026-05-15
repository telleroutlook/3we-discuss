import { createSignal, createResource, For, Show } from 'solid-js';
import { A, useSearchParams } from '@solidjs/router';
import type { Post, ApiResponse } from '../types';
import { Search as SearchIcon, SearchX } from 'lucide-solid';

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
    <div class="max-w-3xl mx-auto">
      <form onSubmit={submit} class="mb-8">
        <div class="relative">
          <SearchIcon size={20} class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none" />
          <input
            type="text"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            placeholder="Search discussions..."
            class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 shadow-card text-lg"
          />
        </div>
      </form>

      <Show when={results()}>
        {(r) => (
          <div>
            <p class="text-sm font-mono text-stone-500 dark:text-stone-400 mb-4">{r().total} results</p>
            <div class="space-y-3">
              <For each={r().posts} fallback={
                <div class="text-center py-12">
                  <SearchX size={40} class="mx-auto text-stone-300 dark:text-stone-700 mb-3" />
                  <p class="text-stone-500 dark:text-stone-400 font-display">No results found</p>
                </div>
              }>
                {(post, index) => (
                  <A
                    href={`/p/${post.id}`}
                    class="group block p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-200 ease-out animate-start animate-fade-in-up"
                    style={{ 'animation-delay': `${index() * 0.04}s` }}
                  >
                    <h3 class="font-display font-semibold text-stone-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {post.title}
                    </h3>
                    <p class="text-sm text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-2">{post.content}</p>
                  </A>
                )}
              </For>
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
