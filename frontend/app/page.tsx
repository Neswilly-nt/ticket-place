import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="text-center max-w-xl">
        <div className="text-6xl mb-6">🎟</div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
          Ticket Place
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-10">
          Découvrez et réservez des billets pour les meilleurs concerts, festivals,
          conférences et bien plus encore.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/events"
            className="rounded-xl bg-zinc-900 dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Voir les événements
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-zinc-300 dark:border-zinc-600 px-6 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
