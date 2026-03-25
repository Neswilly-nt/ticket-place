"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ticketsService } from "@/lib/services/tickets";
import { TicketResponse, TicketStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

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
                        <span>📅 {formatDate(ticket.eventDate)}</span>
                        <span>📍 {ticket.eventLocation}</span>
                        <span>💰 {ticket.price} €</span>
                        <span>Réservé le {formatDate(ticket.reservedAt)}</span>
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
                          {qrExpanded ? "Masquer QR" : "📲 Voir QR"}
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
                    <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-700 flex flex-col sm:flex-row items-center gap-5">
                      <img
                        src={`data:image/png;base64,${ticket.qrCodeImage}`}
                        alt="QR Code billet"
                        className="w-40 h-40 rounded-xl border-2 border-green-200 dark:border-green-700 shadow-sm"
                      />
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">
                          ✅ Billet valide — présentez ce QR à l&apos;entrée
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                          Code de référence :
                        </p>
                        <p className="font-mono text-sm bg-zinc-100 dark:bg-zinc-700 px-3 py-1.5 rounded-lg text-zinc-800 dark:text-zinc-200 break-all">
                          {ticket.qrCode}
                        </p>
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
