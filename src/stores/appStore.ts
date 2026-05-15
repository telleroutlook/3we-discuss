import { createSignal } from 'solid-js';

const stored = typeof window !== 'undefined' ? localStorage.getItem('darkMode') : null;
const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialDark = stored !== null ? stored === 'true' : prefersDark;

const [darkMode, setDarkMode] = createSignal(initialDark);

if (initialDark) {
  document.documentElement.classList.add('dark');
}

export function toggleDarkMode() {
  setDarkMode(!darkMode());
  document.documentElement.classList.toggle('dark', darkMode());
  localStorage.setItem('darkMode', String(darkMode()));
}

export { darkMode };
