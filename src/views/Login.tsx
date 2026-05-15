import { Github, MessageSquare } from 'lucide-solid';

export default function Login() {
  return (
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="max-w-sm w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-card overflow-hidden animate-scale-in">
        <div class="h-1.5 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500" />

        <div class="p-8 text-center">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-5 shadow-lg">
            <MessageSquare size={28} class="text-white" />
          </div>

          <h1 class="font-display text-2xl font-bold text-stone-900 dark:text-white mb-2">
            Sign in to 3WE Discuss
          </h1>
          <p class="text-stone-500 dark:text-stone-400 mb-8">
            Join the community to ask questions, share ideas, and collaborate.
          </p>

          <a
            href="/api/auth/github"
            rel="external"
            class="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg font-display font-semibold text-sm active:scale-[0.97] transition-all duration-150 border border-stone-200 dark:border-stone-700"
          >
            <Github size={20} />
            Continue with GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
