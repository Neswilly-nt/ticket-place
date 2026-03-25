"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ticketsService } from "@/lib/services/tickets";
import { TicketResponse } from "@/types";
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

export default function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    ticketsService
      .getMyTickets()
      .then((res) => {
        const found = res.data.find((t) => t.id === Number(id));
        if (found) setTicket(found);
      })
      .finally(() => setLoading(false));
  }, [initialized, isAuthenticated, id, router]);

  useEffect(() => {
    if (ticket) {
      const timer = setTimeout(() => setShowQr(true), 400);
      return () => clearTimeout(timer);
    }
  }, [ticket]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-300 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">Billet introuvable.</p>
        <Link href="/tickets" className="text-sm underline text-indigo-600">
          Retour aux billets
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">

        {/* Success badge */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 animate-bounce-once">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-green-600 dark:text-green-400">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Paiement confirmé !</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Votre billet a été payé avec succès.
          </p>
        </div>

        {/* Ticket card */}
        <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-green-200 dark:border-green-700 overflow-hidden shadow-sm">

          {/* Top stripe */}
          <div className="h-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 mb-2">
                  ✅ Payé
                </span>
                <h2 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                  {ticket.eventTitle}
                </h2>
              </div>
              <p className="text-xl font-bold text-zinc-900 dark:text-white shrink-0">
                {ticket.price === 0 ? "Gratuit" : `${ticket.price} €`}
              </p>
            </div>

            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-600">
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <span>{formatDate(ticket.eventDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">📍</span>
                <span>{ticket.eventLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">👤</span>
                <span>{ticket.userName}</span>
              </div>
            </div>

            {/* QR Code section */}
            {ticket.qrCodeImage && (
              <div
                className={`pt-5 flex flex-col items-center transition-all duration-500 ${
                  showQr ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                  QR Code — Présentez à l&apos;entrée
                </p>
                <img
                  src={`data:image/png;base64,${ticket.qrCodeImage}`}
                  alt="QR Code billet"
                  className="w-44 h-44 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 shadow-sm"
                />
                <p className="mt-3 font-mono text-xs bg-zinc-100 dark:bg-zinc-700 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 break-all text-center max-w-full">
                  {ticket.qrCode}
                </p>
              </div>
            )}
          </div>

          {/* Ticket notches */}
          <div className="flex items-center px-4 -mt-1">
            <div className="w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 -ml-7 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-zinc-200 dark:border-zinc-600 mx-2" />
            <div className="w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 -mr-7 shrink-0" />
          </div>
          <div className="h-4" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Link
            href="/tickets"
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-600 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-center"
          >
            Mes billets
          </Link>
          <Link
            href="/events"
            className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 text-sm font-semibold text-white transition-colors text-center"
          >
            Voir les événements
          </Link>
        </div>
      </div>
    </div>
  );
}
