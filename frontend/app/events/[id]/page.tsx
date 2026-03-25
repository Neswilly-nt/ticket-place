"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { eventsService } from "@/lib/services/events";
import { ticketsService } from "@/lib/services/tickets";
import { EventResponse, EventStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  CANCELLED: "Annulé",
  COMPLETED: "Terminé",
};

const STATUS_COLORS: Record<EventStatus, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400",
  PUBLISHED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
};

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
  const { isAuthenticated, initialized, hasRole } = useAuth();
  const isPrivileged = initialized && hasRole("ADMIN", "ORGANIZER");
  const [event, setEvent] = useState<EventResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [success, setSuccess] = useState("");
  const [managing, setManaging] = useState<"publish" | "cancel" | "delete" | null>(null);
  const [manageError, setManageError] = useState("");

  useEffect(() => {
    eventsService
      .getById(Number(id))
      .then((res) => setEvent(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/events/${id}`);
      return;
    }
    setReserving(true);
    setError("");
    try {
      await ticketsService.reserve({ eventId: Number(id), quantity });
      setSuccess(`✅ ${quantity} billet(s) réservé(s) ! Rendez-vous dans vos billets pour finaliser le paiement.`);
      const res = await eventsService.getById(Number(id));
      setEvent(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de réservation");
    } finally {
      setReserving(false);
    }
  };

  const handleManage = async (action: "publish" | "cancel" | "delete") => {
    if (action === "delete" && !confirm("Supprimer cet événement ? Cette action est irréversible.")) return;
    if (action === "cancel" && !confirm("Annuler cet événement ?")) return;
    setManaging(action);
    setManageError("");
    try {
      if (action === "publish") {
        const res = await eventsService.publish(Number(id));
        setEvent(res.data);
      } else if (action === "cancel") {
        const res = await eventsService.cancel(Number(id));
        setEvent(res.data);
      } else {
        await eventsService.delete(Number(id));
        router.push("/dashboard/organizer");
      }
    } catch (err: unknown) {
      setManageError(err instanceof Error ? err.message : "Erreur lors de l'action");
    } finally {
      setManaging(null);
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
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6"
        >
          ← Retour aux événements
        </Link>
        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-300 dark:text-zinc-600 text-6xl">
              🎟️
            </div>
          )}
          <div className="p-8">
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="inline-block rounded-full px-3 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                    {event.category}
                  </span>
                  {isPrivileged && (
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[event.status]}`}>
                      {STATUS_LABELS[event.status]}
                    </span>
                  )}
                </div>
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

            {isPrivileged && (
              <div className="mb-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">Gestion de l&apos;événement</p>
                {manageError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mb-2">{manageError}</p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {event.status === "DRAFT" && (
                    <button
                      onClick={() => handleManage("publish")}
                      disabled={!!managing}
                      className="rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 px-4 py-2 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                    >
                      {managing === "publish" ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Publication&hellip;</> : "✅ Publier"}
                    </button>
                  )}
                  {event.status === "PUBLISHED" && (
                    <button
                      onClick={() => handleManage("cancel")}
                      disabled={!!managing}
                      className="rounded-lg border bg-orange-500 border-orange-300 dark:border-orange-600 text-white hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-60 px-4 py-2 text-xs font-semibold transition-colors text-center flex items-center gap-1.5"
                    >
                      {managing === "cancel" ? <><span className="w-3 h-3 border-2 border-orange-400/40 border-t-orange-400 rounded-full animate-spin" />Annulation&hellip;</> : "Annuler l'événement"}
                    </button>
                  )}
                  {(event.status === "DRAFT" || event.status === "CANCELLED") && (
                    <button
                      onClick={() => handleManage("delete")}
                      disabled={!!managing}
                      className="rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      {managing === "delete" ? <><span className="w-3 h-3 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />Suppression&hellip;</> : "🗑 Supprimer"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-4">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-3">{success}</p>
                <Link
                  href="/tickets"
                  className="inline-block rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  💳 Payer
                </Link>
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            {event.availableSeats > 0 && !success ? (
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
                  disabled={reserving || !initialized}
                  className="rounded-lg bg-zinc-900 dark:bg-white px-6 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {reserving ? (
                    <><span className="w-4 h-4 border-2 border-white/40 dark:border-zinc-900/40 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />Réservation…</>
                  ) : "Réserver maintenant"}
                </button>
                {!isAuthenticated && initialized && (
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
