import { createResource, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import type { Category, ApiResponse } from '../types';
import { currentUser } from '../stores/authStore';
import { Plus } from 'lucide-solid';
import CategoryIcon from '../components/ui/CategoryIcon';
import Breadcrumb from '../components/ui/Breadcrumb';

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  const json: ApiResponse<Category[]> = await res.json();
  return json.data || [];
}

export default function Home() {
  const [categories] = createResource(fetchCategories);

  return (
    <div>
      <Breadcrumb />
      <section class="mb-10">
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 p-8 md:p-12">
          <div class="absolute inset-0 bg-dotgrid opacity-20" />
          <div class="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-accent-500/10 blur-3xl" />
          <div class="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-brand-400/10 blur-3xl" />

          <div class="relative z-10">
            <h1 class="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              3WE Robot Platform Discussions
            </h1>
            <p class="text-brand-200 text-lg max-w-2xl">
              Ask questions, share ideas, and connect with the community.
            </p>
            <Show when={currentUser()}>
              <A href="/new" class="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-accent-600 hover:bg-accent-700 text-white rounded-lg font-display font-semibold text-sm active:scale-[0.97] transition-all duration-150 shadow-sm hover:shadow-md">
                <Plus size={18} />
                New Discussion
              </A>
            </Show>
          </div>
        </div>
      </section>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <For each={categories()}>
          {(cat, index) => (
            <A
              href={`/c/${cat.slug}`}
              class="group block p-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-200 ease-out animate-start animate-fade-in-up"
              style={{ 'animation-delay': `${index() * 0.06}s` }}
            >
              <div class="flex items-start justify-between mb-3">
                <div
                  class="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}
                >
                  <CategoryIcon name={cat.icon} size={20} />
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                  {cat.postCount} posts
                </span>
              </div>

              <h3 class="font-display font-semibold text-stone-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {cat.name}
              </h3>
              <p class="mt-1 text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
                {cat.description}
              </p>
            </A>
          )}
        </For>
      </div>
    </div>
  );
}
