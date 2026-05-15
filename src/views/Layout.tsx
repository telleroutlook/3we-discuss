import { type ParentProps, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { currentUser, logout, loading } from '../stores/authStore';
import { darkMode, toggleDarkMode } from '../stores/appStore';
import { Sun, Moon, Search, LogOut, MessageSquare, Github } from 'lucide-solid';

export default function Layout(props: ParentProps) {
  return (
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header class="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <A href="/" class="flex items-center gap-2 font-semibold text-lg text-gray-900 dark:text-white">
            <MessageSquare size={24} class="text-brand-600" />
            <span>3WE Discuss</span>
          </A>

          <div class="flex items-center gap-3">
            <A href="/search" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <Search size={20} />
            </A>

            <button onClick={toggleDarkMode} class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <Show when={darkMode()} fallback={<Moon size={20} />}>
                <Sun size={20} />
              </Show>
            </button>

            <Show
              when={currentUser()}
              fallback={
                <Show when={!loading()}>
                  <a href="/api/auth/github" rel="external" class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                    <Github size={16} />
                    Sign in
                  </a>
                </Show>
              }
            >
              {(user) => (
                <div class="flex items-center gap-2">
                  <A href={`/u/${user().username}`} class="flex items-center gap-2">
                    <img src={user().avatarUrl || ''} alt="" class="w-8 h-8 rounded-full" />
                  </A>
                  <button onClick={logout} class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <LogOut size={18} />
                  </button>
                </div>
              )}
            </Show>
          </div>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-4 py-6">
        {props.children}
      </main>
    </div>
  );
}
