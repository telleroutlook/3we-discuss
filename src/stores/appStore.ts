import { createSignal } from 'solid-js';

const [darkMode, setDarkMode] = createSignal(
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
);

export function toggleDarkMode() {
  setDarkMode(!darkMode());
  document.documentElement.classList.toggle('dark', darkMode());
}

export { darkMode };
