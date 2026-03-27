"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { TicketResponse } from "@/types";
import Link from "next/link";

export default function TicketVerifyPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string) ?? "";
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError("");
    api.get<TicketResponse>(`/tickets/public/${code}`)
      .then((res) => setTicket(res.data))
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Impossible de charger le billet");
      })
      .finally(() => setLoading(false));
  }, [code]);

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      RESERVED: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", label: "RÉSERVÉ" },
      PAID: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", label: "PAYÉ" },
      USED: { bg: "bg-zinc-100 dark:bg-zinc-700", text: "text-zinc-500 dark:text-zinc-400", label: "UTILISÉ" },
      CANCELLED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", label: "ANNULÉ" },
    };
    const s = map[status] ?? map.RESERVED;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
            Billet introuvable
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            {error || "Ce QR Code ne correspond à aucun billet."}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center justify-center w-full rounded-xl bg-zinc-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Explorer les événements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 px-4 py-8 sm:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Détails du billet
          </h1>
          <Link
            href="/events"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            ← Retour aux événements
          </Link>
        </div>

        <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {/* Header image */}
          {ticket.eventImageUrl && (
            <div className="h-48 bg-zinc-200 dark:bg-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticket.eventImageUrl}
                alt={ticket.eventTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-6">
            {/* Event title + status */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                  {ticket.eventTitle}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Organisé par {ticket.organizerName}
                </p>
              </div>
              {statusBadge(ticket.status)}
            </div>

            {/* Event details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">Lieu</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{ticket.eventLocation}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">Date</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {new Date(ticket.eventDate).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">Titulaire</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{ticket.userName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">Prix</p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {ticket.price.toLocaleString("fr-FR", { style: "currency", currency: "XOF" })}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket reference */}
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 p-4">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Référence du billet</p>
              <p className="font-mono text-sm font-bold text-zinc-900 dark:text-white break-all">{ticket.qrCode}</p>
            </div>

            {/* Timestamps */}
            <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              {ticket.reservedAt && (
                <p>Réservé le {new Date(ticket.reservedAt).toLocaleString("fr-FR")}</p>
              )}
              {ticket.paidAt && (
                <p>Payé le {new Date(ticket.paidAt).toLocaleString("fr-FR")}</p>
              )}
              {ticket.usedAt && (
                <p>Utilisé le {new Date(ticket.usedAt).toLocaleString("fr-FR")}</p>
              )}
              {ticket.cancelledAt && (
                <p>Annulé le {new Date(ticket.cancelledAt).toLocaleString("fr-FR")}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
