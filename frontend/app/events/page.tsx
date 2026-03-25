"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { eventsService } from "@/lib/services/events";
import { EventCategory, EventResponse, EventStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};

const STATUS_BADGE: Record<EventStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  CONCERT: "Concert",
  THEATRE: "Théâtre",
  CONFERENCE: "Conférence",
  SPORT: "Sport",
  FESTIVAL: "Festival",
  OTHER: "Autre",
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  CONCERT: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  THEATRE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  CONFERENCE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  SPORT: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  FESTIVAL: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  OTHER: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventsPage() {
  const { hasRole, initialized } = useAuth();
  const isPrivileged = initialized && hasRole("ADMIN", "ORGANIZER");

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "">("");
  const [statusFilter, setStatusFilter] = useState<EventStatus | "">("PUBLISHED");

  useEffect(() => {
    if (!initialized) return;
    const status = isPrivileged ? statusFilter : "PUBLISHED";
    const loader = status
      ? eventsService.getByStatus(status as EventStatus)
      : eventsService.getAll();
    loader
      .then((res) => setEvents(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [initialized, isPrivileged, statusFilter]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await eventsService.search(search);
      setEvents(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de recherche");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (cat: EventCategory | "") => {
    setCategoryFilter(cat);
    setLoading(true);
    try {
      const status = isPrivileged ? statusFilter : "PUBLISHED";
      const res = cat
        ? await eventsService.filter({ category: cat, status: status as EventStatus || undefined })
        : status
        ? await eventsService.getByStatus(status as EventStatus)
        : await eventsService.getAll();
      setEvents(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de filtrage");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = async (s: EventStatus | "") => {
    setStatusFilter(s);
    setLoading(true);
    try {
      const res = s ? await eventsService.getByStatus(s) : await eventsService.getAll();
      setEvents(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de filtrage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
            Événements
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Découvrez et réservez les meilleurs événements
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un événement…"
              className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Chercher
            </button>
          </form>

          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value as EventCategory | "")}
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
          >
            <option value="">Toutes les catégories</option>
            {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((cat) => (
              <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
            ))}
          </select>

          {isPrivileged && (
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as EventStatus | "")}
              className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
            >
              <option value="">Tous les statuts</option>
              {(Object.keys(STATUS_LABELS) as EventStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-zinc-800 p-5 animate-pulse"
              >
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2 mb-6" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-2" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 dark:text-zinc-500">
            Aucun événement trouvé.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group block rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_COLORS[event.category]}`}>
                      {CATEGORY_LABELS[event.category]}
                    </span>
                    {isPrivileged && event.status !== "PUBLISHED" && (
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[event.status]}`}>
                        {STATUS_LABELS[event.status]}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {event.price === 0 ? "Gratuit" : `${event.price} €`}
                  </span>
                </div>

                <h2 className="text-base font-semibold text-zinc-900 dark:text-white group-hover:underline mb-1 line-clamp-2">
                  {event.title}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🎫</span>
                    <span>
                      {event.availableSeats} place
                      {event.availableSeats > 1 ? "s" : ""} disponible
                      {event.availableSeats > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
