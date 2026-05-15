import { useParams } from '@solidjs/router';
import { createResource, Show } from 'solid-js';
import type { User, ApiResponse } from '../types';
import Breadcrumb from '../components/ui/Breadcrumb';

export default function UserProfile() {
  const params = useParams<{ username: string }>();

  const [user] = createResource(
    () => params.username,
    async (username) => {
      const res = await fetch(`/api/users/${username}`);
      if (!res.ok) return null;
      const json: ApiResponse<User> = await res.json();
      return json.data || null;
    }
  );

  return (
    <Show when={user()} fallback={<p class="text-stone-500 dark:text-stone-400 font-display">User not found.</p>}>
      {(u) => (
        <div class="max-w-2xl mx-auto">
          <Breadcrumb items={[{ label: `@${u().username}`, href: `/u/${u().username}` }]} />
          <div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-card overflow-hidden animate-fade-in">
            <div class="h-24 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500" />

            <div class="px-6 pb-6">
              <div class="flex items-end gap-4 -mt-10 mb-4">
                <img
                  src={u().avatarUrl || ''}
                  alt=""
                  class="w-20 h-20 rounded-full ring-4 ring-white dark:ring-stone-900 shadow-lg"
                />
                <div class="pb-1">
                  <h1 class="font-display text-xl font-bold text-stone-900 dark:text-white">
                    {u().displayName || u().username}
                  </h1>
                  <p class="text-sm font-mono text-stone-500 dark:text-stone-400">@{u().username}</p>
                </div>
              </div>

              <div class="flex items-center gap-4 text-xs font-mono text-stone-400 dark:text-stone-500 mb-4">
                <span>Joined {new Date(u().createdAt).toLocaleDateString()}</span>
              </div>

              <Show when={u().bio}>
                <p class="text-stone-700 dark:text-stone-300 border-t border-stone-100 dark:border-stone-800 pt-4">
                  {u().bio}
                </p>
              </Show>
            </div>
          </div>
        </div>
      )}
    </Show>
  );
}
