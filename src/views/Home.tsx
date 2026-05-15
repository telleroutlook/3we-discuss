import { createResource, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import type { Category, ApiResponse } from '../types';
import { currentUser } from '../stores/authStore';

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  const json: ApiResponse<Category[]> = await res.json();
  return json.data || [];
}

export default function Home() {
  const [categories] = createResource(fetchCategories);

  return (
    <div>
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">3WE Robot Platform Discussions</h1>
          <p class="mt-1 text-gray-600 dark:text-gray-400">Ask questions, share ideas, and connect with the community.</p>
        </div>
        <Show when={currentUser()}>
          <A href="/new" class="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 whitespace-nowrap">
            New Post
          </A>
        </Show>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <For each={categories()}>
          {(cat) => (
            <A
              href={`/c/${cat.slug}`}
              class="block p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
            >
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg" style={{ background: cat.color }}>
                  {cat.name[0]}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                  <span class="text-xs text-gray-500">{cat.postCount} posts</span>
                </div>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">{cat.description}</p>
            </A>
          )}
        </For>
      </div>
    </div>
  );
}
