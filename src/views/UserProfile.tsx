import { useParams } from '@solidjs/router';
import { createResource, Show } from 'solid-js';
import type { User, ApiResponse } from '../types';

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
    <Show when={user()} fallback={<p class="text-gray-500">User not found.</p>}>
      {(u) => (
        <div class="max-w-2xl">
          <div class="flex items-center gap-4 mb-6">
            <img src={u().avatarUrl || ''} alt="" class="w-16 h-16 rounded-full" />
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">{u().displayName || u().username}</h1>
              <p class="text-sm text-gray-500">@{u().username}</p>
              <p class="text-xs text-gray-400 mt-1">Joined {new Date(u().createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <Show when={u().bio}>
            <p class="text-gray-700 dark:text-gray-300">{u().bio}</p>
          </Show>
        </div>
      )}
    </Show>
  );
}
