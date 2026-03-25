"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  const { isAuthenticated, user } = useAuth();
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    ticketsService
      .getMyTickets()
      .then((res) => setTickets(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handlePay = async (id: number) => {
    try {
      const res = await ticketsService.pay(id);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? res.data : t))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de paiement");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Annuler ce billet ?")) return;
    try {
      const res = await ticketsService.cancel(id);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? res.data : t))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur d'annulation");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/events" className="text-xl font-bold text-zinc-900 dark:text-white">
            🎟 Ticket Place
          </Link>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </header>

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
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-zinc-800 p-5 animate-pulse h-28"
              />
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
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-5"
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status]}`}
                      >
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
                      <button
                        onClick={() => handlePay(ticket.id)}
                        className="rounded-lg bg-green-600 hover:bg-green-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
                      >
                        Payer
                      </button>
                    )}
                    {(ticket.status === "RESERVED" || ticket.status === "PAID") && (
                      <button
                        onClick={() => handleCancel(ticket.id)}
                        className="rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                {ticket.qrCodeImage && ticket.status === "PAID" && (
                  <div className="mt-4 flex items-center gap-4">
                    <img
                      src={`data:image/png;base64,${ticket.qrCodeImage}`}
                      alt="QR Code"
                      className="w-20 h-20 rounded-lg border border-zinc-200 dark:border-zinc-600"
                    />
                    <div>
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Code QR d&apos;entrée
                      </p>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        {ticket.qrCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
