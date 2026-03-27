"use client";

import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationType } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TYPE_ICON: Record<NotificationType, string> = {
  PAYMENT_SUCCESS: "✅",
  RESERVATION_AUTO_CANCELLED: "❌",
  EVENT_REMINDER: "🔔",
  TICKET_CANCELLED: "🚫",
};

const TYPE_LABEL: Record<NotificationType, string> = {
  PAYMENT_SUCCESS: "Paiement confirmé",
  RESERVATION_AUTO_CANCELLED: "Réservation annulée",
  EVENT_REMINDER: "Rappel d'événement",
  TICKET_CANCELLED: "Billet annulé",
};

const TYPE_COLOR: Record<NotificationType, string> = {
  PAYMENT_SUCCESS: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  RESERVATION_AUTO_CANCELLED: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  EVENT_REMINDER: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
  TICKET_CANCELLED: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
};

const TYPE_BADGE: Record<NotificationType, string> = {
  PAYMENT_SUCCESS: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  RESERVATION_AUTO_CANCELLED: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  EVENT_REMINDER: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
  TICKET_CANCELLED: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ALL_FILTER = "ALL";
type Filter = NotificationType | typeof ALL_FILTER;

export default function NotificationsPage() {
  const { isAuthenticated, initialized } = useAuth();
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications(isAuthenticated);

  const [filter, setFilter] = useState<Filter>(ALL_FILTER);

  useEffect(() => {
    if (initialized && !isAuthenticated) router.push("/login");
  }, [initialized, isAuthenticated, router]);

  const filtered =
    filter === ALL_FILTER
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const filters: { key: Filter; label: string }[] = [
    { key: ALL_FILTER, label: "Toutes" },
    { key: "PAYMENT_SUCCESS", label: "Paiements" },
    { key: "EVENT_REMINDER", label: "Rappels" },
    { key: "RESERVATION_AUTO_CANCELLED", label: "Annulations auto" },
    { key: "TICKET_CANCELLED", label: "Billets annulés" },
  ];

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 px-4 py-8 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filters.map(({ key, label }) => {
            const count =
              key === ALL_FILTER
                ? notifications.length
                : notifications.filter((n) => n.type === key).length;
            if (key !== ALL_FILTER && count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  filter === key
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-500"
                }`}
              >
                {label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 ${
                      filter === key ? "opacity-80" : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-5xl mb-4">🔕</span>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Aucune notification
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">
              Vous êtes à jour !
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => { if (!n.read) markRead(n.id); }}
                className={`relative rounded-2xl border p-4 transition-all cursor-pointer hover:shadow-md ${
                  !n.read
                    ? TYPE_COLOR[n.type]
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 opacity-70 hover:opacity-100"
                }`}
              >
                {/* Unread dot */}
                {!n.read && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                )}

                <div className="flex gap-3 items-start">
                  <span className="text-2xl shrink-0 mt-0.5">{TYPE_ICON[n.type]}</span>
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE[n.type]}`}
                      >
                        {TYPE_LABEL[n.type]}
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-0.5">
                      {n.title}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
