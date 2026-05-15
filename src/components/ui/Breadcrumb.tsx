import { For } from 'solid-js';
import { A } from '@solidjs/router';

export interface BreadcrumbItem {
  label: string;
  href: string;
  external?: boolean;
}

export default function Breadcrumb(props: { items?: BreadcrumbItem[] }) {
  const allItems = () => [
    { label: '3WE', href: 'https://3we.org', external: true },
    { label: 'Home', href: '/' },
    ...(props.items || []),
  ];

  return (
    <nav class="flex items-center gap-1.5 text-sm font-mono text-stone-500 dark:text-stone-400 mb-5">
      <For each={allItems()}>
        {(item, index) => (
          <>
            {index() > 0 && <span class="text-stone-300 dark:text-stone-600">›</span>}
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <A
                href={item.href}
                class="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {item.label}
              </A>
            )}
          </>
        )}
      </For>
    </nav>
  );
}
