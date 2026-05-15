import { createSignal } from 'solid-js';

const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const [darkMode, setDarkMode] = createSignal(prefersDark);

if (prefersDark) {
  document.documentElement.classList.add('dark');
}

export function toggleDarkMode() {
  setDarkMode(!darkMode());
  document.documentElement.classList.toggle('dark', darkMode());
}

export { darkMode };
