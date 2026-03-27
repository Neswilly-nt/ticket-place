"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ticketsService } from "@/lib/services/tickets";
import { TicketResponse, TicketStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Lottie from "lottie-react";
import successAnimation from "@/assets/animations/lottieflow-ecommerce-14-16-000000-easey.json";

function Icon({ d }: { d: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 shrink-0"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  events:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  tickets:
    "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
  adminDash:
    "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  organizer:
    "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  logout:
    "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  newEvent:
    "M12 4v16m8-8H4",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  RESERVED: "Réservé",
  PAID: "Payé",
  USED: "Utilisé",
  CANCELLED: "Annulé",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  RESERVED: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  USED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400",
  CANCELLED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketsPage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<number, "cancel" | null>>({});
  const [expandedQr, setExpandedQr] = useState<number | null>(null);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push("/login?redirect=/tickets");
      return;
    }
    ticketsService
      .getMyTickets()
      .then((res) => setTickets(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [initialized, isAuthenticated, router]);

  const handleCancel = async (id: number) => {
    if (!confirm("Annuler ce billet ? Cette action est irréversible.")) return;
    setActionLoading((prev) => ({ ...prev, [id]: "cancel" }));
    setError("");
    try {
      const res = await ticketsService.cancel(id);
      setTickets((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur d'annulation");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-300 border-t-zinc-900 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
          Mes billets
        </h1>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-zinc-800 p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 dark:text-zinc-500 mb-4">
              Vous n&apos;avez pas encore de billets.
            </p>
            <Link
              href="/events"
              className="rounded-lg bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
            >
              Voir les événements
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const isActing = !!actionLoading[ticket.id];
              const showQr = ticket.status === "PAID" && ticket.qrCodeImage;
              const qrExpanded = expandedQr === ticket.id;

              return (
                <div
                  key={ticket.id}
                  className={`rounded-2xl bg-white dark:bg-zinc-800 border transition-all ${
                    ticket.status === "PAID"
                      ? "border-green-300 dark:border-green-700"
                      : "border-zinc-200 dark:border-zinc-700"
                  } p-5`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                          {STATUS_LABELS[ticket.status]}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-zinc-900 dark:text-white truncate">
                        {ticket.eventTitle}
                      </h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Icon d={ICONS.calendar} />
                          {formatDate(ticket.eventDate)}
                        </span>
                        <span>{ticket.eventLocation}</span>
                        <span className="font-medium">{ticket.price} €</span>
                        {ticket.organizerName && (
                          <span className="text-zinc-400 dark:text-zinc-500">Par {ticket.organizerName}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                        <span>Réservé le {formatDate(ticket.reservedAt)}</span>
                        {ticket.paidAt && <span>· Payé le {formatDate(ticket.paidAt)}</span>}
                        {ticket.cancelledAt && <span>· Annulé le {formatDate(ticket.cancelledAt)}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ticket.status === "RESERVED" && (
                        <Link
                          href={`/tickets/${ticket.id}/pay`}
                          className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                        >
                          💳 Payer
                        </Link>
                      )}
                      {showQr && (
                        <button
                          onClick={() => setExpandedQr(qrExpanded ? null : ticket.id)}
                          className="rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                        >
                          {qrExpanded ? "Masquer QR" : "Voir QR"}
                        </button>
                      )}
                      {(ticket.status === "RESERVED" || ticket.status === "PAID") && (
                        <button
                          onClick={() => handleCancel(ticket.id)}
                          disabled={isActing}
                          className="rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          {actionLoading[ticket.id] === "cancel" ? (
                            <><span className="w-3 h-3 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />Annulation…</>
                          ) : "Annuler"}
                        </button>
                      )}
                    </div>
                  </div>

                  {showQr && qrExpanded && (
                    <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-700">
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src={`data:image/png;base64,${ticket.qrCodeImage}`}
                            alt="QR Code billet"
                            className="w-44 h-44 rounded-xl border-2 border-green-200 dark:border-green-700 shadow-sm"
                          />
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono text-center break-all max-w-[176px]">
                            {ticket.qrCode}
                          </p>
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">✅ Billet valide — à présenter à l&apos;entrée</p>
                          <div className="rounded-xl bg-zinc-50 dark:bg-zinc-700/50 p-3 space-y-1.5 text-xs">
                            <div className="flex gap-2">
                              <span className="text-zinc-400 w-24 shrink-0">Événement</span>
                              <span className="font-semibold text-zinc-900 dark:text-white">{ticket.eventTitle}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-zinc-400 w-24 shrink-0">Date</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{formatDate(ticket.eventDate)}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-zinc-400 w-24 shrink-0">Lieu</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{ticket.eventLocation}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-zinc-400 w-24 shrink-0">Titulaire</span>
                              <span className="font-semibold text-zinc-900 dark:text-white">{ticket.userName}</span>
                            </div>
                            {ticket.organizerName && (
                              <div className="flex gap-2">
                                <span className="text-zinc-400 w-24 shrink-0">Organisateur</span>
                                <span className="text-zinc-700 dark:text-zinc-300">{ticket.organizerName}</span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <span className="text-zinc-400 w-24 shrink-0">Prix</span>
                              <span className="text-zinc-700 dark:text-zinc-300">{ticket.price} €</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-zinc-400 w-24 shrink-0">Statut</span>
                              <span className={`font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[ticket.status]}`}>{STATUS_LABELS[ticket.status]}</span>
                            </div>
                            {ticket.paidAt && (
                              <div className="flex gap-2">
                                <span className="text-zinc-400 w-24 shrink-0">Payé le</span>
                                <span className="text-zinc-700 dark:text-zinc-300">{formatDate(ticket.paidAt)}</span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <span className="text-zinc-400 w-24 shrink-0">Réf. billet</span>
                              <span className="font-mono text-zinc-600 dark:text-zinc-400 break-all">{ticket.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
