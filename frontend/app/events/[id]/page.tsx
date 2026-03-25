"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { eventsService } from "@/lib/services/events";
import { ticketsService } from "@/lib/services/tickets";
import { EventResponse } from "@/types";
import { useAuth } from "@/context/AuthContext";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    eventsService
      .getById(Number(id))
      .then((res) => setEvent(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setReserving(true);
    setError("");
    try {
      await ticketsService.reserve({ eventId: Number(id), quantity });
      setSuccess(`${quantity} billet(s) réservé(s) avec succès !`);
      const res = await eventsService.getById(Number(id));
      setEvent(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de réservation");
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-300 border-t-zinc-900 rounded-full" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-900">
        <p className="text-red-500">{error}</p>
        <Link href="/events" className="text-sm underline text-zinc-700 dark:text-zinc-300">
          Retour aux événements
        </Link>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/events"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
          >
            ← Retour aux événements
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 mb-3">
                  {event.category}
                </span>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {event.title}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                  par {event.organizerName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {event.price === 0 ? "Gratuit" : `${event.price} €`}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">par billet</p>
              </div>
            </div>

            <p className="text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-700/50 p-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Date</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {formatDate(event.eventDate)}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-700/50 p-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Lieu</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {event.location}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-700/50 p-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Places disponibles</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {event.availableSeats} / {event.totalSeats}
                </p>
              </div>
            </div>

            {success && (
              <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {event.availableSeats > 0 ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={event.availableSeats}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-400"
                  />
                </div>
                <button
                  onClick={handleReserve}
                  disabled={reserving}
                  className="rounded-lg bg-zinc-900 dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60"
                >
                  {reserving ? "Réservation…" : "Réserver maintenant"}
                </button>
                {!isAuthenticated && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Vous serez redirigé vers la connexion
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                Complet — plus aucune place disponible
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
