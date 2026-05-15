import { createSignal } from 'solid-js';
import type { User, ApiResponse } from '../types';

const [currentUser, setCurrentUser] = createSignal<User | null>(null);
const [loading, setLoading] = createSignal(true);

export async function fetchCurrentUser() {
  setLoading(true);
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const json: ApiResponse<User> = await res.json();
      setCurrentUser(json.data || null);
    } else {
      setCurrentUser(null);
    }
  } catch {
    setCurrentUser(null);
  } finally {
    setLoading(false);
  }
}

export function logout() {
  fetch('/api/auth/logout', { method: 'POST' }).then(() => {
    setCurrentUser(null);
    window.location.href = '/';
  });
}

export { currentUser, loading };
