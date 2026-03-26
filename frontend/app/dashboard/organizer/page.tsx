"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dashboardService } from "@/lib/services/dashboard";
import { eventsService } from "@/lib/services/events";
import { subscriptionService } from "@/lib/services/subscription";
import { EventResponse, EventStatsResponse, EventStatus, SubscriptionResponse } from "@/types";
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

type ActionType = "publish" | "cancel" | "delete";

export default function OrganizerDashboardPage() {
  const router = useRouter();
  const { hasRole, isAuthenticated, initialized } = useAuth();
  const [stats, setStats] = useState<EventStatsResponse[]>([]);
  const [eventsMap, setEventsMap] = useState<Map<number, EventResponse>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<number, ActionType | null>>({});
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, eventsRes] = await Promise.all([
        dashboardService.getOrganizerDashboard(),
        eventsService.getAll(),
      ]);
      setStats(statsRes.data);
      const map = new Map<number, EventResponse>();
      eventsRes.data.forEach((ev) => map.set(ev.id, ev));
      setEventsMap(map);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await subscriptionService.getMy();
      setSubscription(res.data);
    } catch {
      setSubscription(null);
    }
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!hasRole("ORGANIZER", "ADMIN")) { router.push("/events"); return; }
    fetchData();
    fetchSubscription();
  }, [initialized, isAuthenticated, hasRole, router, fetchData, fetchSubscription]);

  const handleAction = async (eventId: number, action: ActionType) => {
    if (action === "delete" && !confirm("Supprimer cet événement ? Cette action est irréversible.")) return;
    if (action === "cancel" && !confirm("Annuler cet événement ? Les billets réservés seront affectés.")) return;
    setActionLoading((prev) => ({ ...prev, [eventId]: action }));
    setError("");
    try {
      if (action === "publish") await eventsService.publish(eventId);
      else if (action === "cancel") await eventsService.cancel(eventId);
      else if (action === "delete") await eventsService.delete(eventId);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'action";
      if (msg.includes("abonnement")) {
        router.push("/dashboard/organizer/subscription");
        return;
      }
      setError(msg);
      setActionLoading((prev) => ({ ...prev, [eventId]: null }));
    }
  };

  const totalRevenue = stats.reduce((sum, s) => sum + Number(s.revenue), 0);
  const totalTickets = stats.reduce((sum, s) => sum + s.ticketsSold, 0);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-300 border-t-zinc-900 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Dashboard Organisateur
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Gérez vos événements et suivez vos statistiques
            </p>
          </div>
          <Link
            href="/events/new"
            className="rounded-xl bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            + Créer un événement
          </Link>
        </div>

        {/* Subscription banner */}
        {subscription?.active ? (
          <div className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <span>✅</span>
              <span>
                Abonnement <strong>{subscription.plan === "YEARLY" ? "Annuel" : "Mensuel"}</strong> actif —{" "}
                {subscription.daysRemaining} jours restants
              </span>
            </div>
            <Link
              href="/dashboard/organizer/subscription"
              className="text-xs text-green-700 dark:text-green-400 underline underline-offset-2 shrink-0"
            >
              Gérer
            </Link>
          </div>
        ) : (
          <div className="mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
              <span>⚠️</span>
              <span>Aucun abonnement actif — vous ne pouvez pas publier d&apos;événements.</span>
            </div>
            <Link
              href="/dashboard/organizer/subscription"
              className="shrink-0 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
            >
              S&apos;abonner
            </Link>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-zinc-800 h-32 animate-pulse" />
            ))}
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 dark:text-zinc-500 mb-4">
              Vous n&apos;avez pas encore d&apos;événements.
            </p>
            <Link
              href="/events/new"
              className="rounded-xl bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Créer votre premier événement
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Événements</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.length}</p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Billets vendus</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{totalTickets}</p>
              </div>
              <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5 col-span-2 sm:col-span-1">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Revenus totaux</p>
                <p className="text-3xl font-bold text-zinc-900 dark:text-white">{totalRevenue.toLocaleString("fr-FR")} €</p>
              </div>
            </div>

            <div className="space-y-3">
              {stats.map((ev) => {
                const fullEvent = eventsMap.get(ev.eventId);
                const status = fullEvent?.status;
                const isActing = !!actionLoading[ev.eventId];

                return (
                  <div
                    key={ev.eventId}
                    className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {status && (
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[status]}`}>
                              {STATUS_LABELS[status]}
                            </span>
                          )}
                          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                            {ev.eventTitle}
                          </h2>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                           {ev.location}
                          {fullEvent?.eventDate && (
                            <> · 📅 {new Date(fullEvent.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {status === "DRAFT" && (
                          <button
                            onClick={() => handleAction(ev.eventId, "publish")}
                            disabled={isActing}
                            className="rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 px-3 py-1.5 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                          >
                            {actionLoading[ev.eventId] === "publish"
                              ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />Publication…</>
                              : "✅ Publier"}
                          </button>
                        )}
                        {status === "PUBLISHED" && (
                          <button
                            onClick={() => handleAction(ev.eventId, "cancel")}
                            disabled={isActing}
                            className="rounded-lg border border-orange-300 dark:border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 disabled:opacity-60 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            {actionLoading[ev.eventId] === "cancel"
                              ? <><span className="w-3 h-3 border-2 border-orange-400/40 border-t-orange-400 rounded-full animate-spin" />Annulation…</>
                              : "Annuler l'événement"}
                          </button>
                        )}
                        {(status === "DRAFT" || status === "CANCELLED") && (
                          <button
                            onClick={() => handleAction(ev.eventId, "delete")}
                            disabled={isActing}
                            className="rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5"
                          >
                            {actionLoading[ev.eventId] === "delete"
                              ? <><span className="w-3 h-3 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />Suppression…</>
                              : "🗑 Supprimer"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                        <span>Remplissage</span>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {ev.ticketsSold} / {ev.totalSeats} places — {ev.occupancyRate.toFixed(1)}%
                          &nbsp;·&nbsp; {Number(ev.revenue).toLocaleString("fr-FR")} €
                        </span>
                      </div>
                      <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            ev.occupancyRate >= 90 ? "bg-red-500"
                            : ev.occupancyRate >= 60 ? "bg-yellow-500"
                            : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(ev.occupancyRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
