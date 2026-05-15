import { Github } from 'lucide-solid';

export default function Login() {
  return (
    <div class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to 3WE Discuss</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">Join the community to ask questions, share ideas, and collaborate.</p>
        <a
          href="/api/auth/github"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <Github size={20} />
          Continue with GitHub
        </a>
      </div>
    </div>
  );
}
