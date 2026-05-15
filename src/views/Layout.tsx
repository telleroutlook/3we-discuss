import { type ParentProps, Show, ErrorBoundary } from 'solid-js';
import { A } from '@solidjs/router';
import { currentUser, logout, loading } from '../stores/authStore';
import { darkMode, toggleDarkMode } from '../stores/appStore';
import { Sun, Moon, Search, LogOut, MessageSquare, Github } from 'lucide-solid';

export default function Layout(props: ParentProps) {
  return (
    <div class="min-h-screen bg-stone-50 dark:bg-stone-950 bg-dotgrid dark:bg-dotgrid-dark">
      <header class="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-stone-900/80 border-b border-stone-200/50 dark:border-stone-800/50">
        <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <A href="/" class="flex items-center gap-2.5 font-display font-bold text-lg text-stone-900 dark:text-white">
            <MessageSquare size={24} class="text-brand-500" />
            <span>3WE Discuss</span>
          </A>

          <div class="flex items-center gap-2">
            <A href="/search" class="p-2.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-all duration-150">
              <Search size={20} />
            </A>

            <button onClick={toggleDarkMode} class="p-2.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-all duration-150">
              <Show when={darkMode()} fallback={<Moon size={20} />}>
                <Sun size={20} />
              </Show>
            </button>

            <Show
              when={currentUser()}
              fallback={
                <Show when={!loading()}>
                  <a href="/api/auth/github" rel="external" class="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-lg text-sm font-display font-semibold hover:bg-stone-800 dark:hover:bg-stone-100 active:scale-[0.97] transition-all duration-150 ml-1">
                    <Github size={16} />
                    Sign in
                  </a>
                </Show>
              }
            >
              {(user) => (
                <div class="flex items-center gap-2 ml-1">
                  <A href={`/u/${user().username}`} class="flex items-center">
                    <img src={user().avatarUrl || ''} alt="" class="w-8 h-8 rounded-full ring-2 ring-brand-200 dark:ring-brand-800 transition-all duration-150 hover:ring-brand-400 dark:hover:ring-brand-600" />
                  </A>
                  <button onClick={logout} class="p-2.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-all duration-150">
                    <LogOut size={18} />
                  </button>
                </div>
              )}
            </Show>
          </div>
        </div>
        <div class="h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
      </header>

      <main class="max-w-7xl mx-auto px-6 py-8">
        <ErrorBoundary fallback={(err) => (
          <div class="text-center py-16">
            <h2 class="font-display text-xl font-bold text-stone-900 dark:text-white mb-2">Something went wrong</h2>
            <p class="text-stone-500 dark:text-stone-400 text-sm">{err.message || 'An unexpected error occurred.'}</p>
            <a href="/" class="inline-block mt-4 text-sm font-medium text-brand-600 hover:text-brand-700">Return home</a>
          </div>
        )}>
          {props.children}
        </ErrorBoundary>
      </main>
    </div>
  );
}
