"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ticketsService } from "@/lib/services/tickets";
import { TicketResponse } from "@/types";
import { useAuth } from "@/context/AuthContext";
import Lottie from "lottie-react";
import successAnimation from "@/assets/animations/lottieflow-ecommerce-14-16-000000-easey.json";
import successAnimation2 from "@/assets/animations/lottieflow-success-09-000000-easey.json";

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
      className="w-5 h-5 shrink-0"
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
  user:
    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  calendar:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full  bg-green-600 mb-4 animate-bounce-once">
            <Lottie animationData={successAnimation2} loop autoplay className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Paiement confirmé !</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Votre billet a été payé avec succès.
          </p>
        </div>

        {/* Ticket card */}
        <div className="rounded-2xl  dark:bg-white overflow-hidden shadow-sm">

          {/* Top stripe */}
          <div className="h-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-black dark:bg-green-500 dark:text-black mb-2">
                  Payé
                </span>
                <h2 className="text-base font-bold text-black dark:text-black leading-snug">
                  {ticket.eventTitle}
                </h2>
              </div>
              <p className="text-xl font-bold text-black dark:text-black shrink-0">
                {ticket.price === 0 ? "Gratuit" : `${ticket.price} €`}
              </p>
            </div>
              
            <div className="space-y-2 text-sm text-zinc-600 dark:text-black pb-4 border-b border-dashed border-zinc-200 dark:border-zinc-600">
              <div className="flex items-center gap-2">
                <Icon d={ICONS.calendar} />
                <span>{formatDate(ticket.eventDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lottie animationData={successAnimation} loop autoplay className="w-6 h-6" />
                <span>{ticket.eventLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon d={ICONS.user} />
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
                <p className="text-xs font-semibold text-zinc-500 dark:text-black uppercase tracking-wide mb-3">
                  QR Code — Présentez à l&apos;entrée
                </p>
                <img
                  src={`data:image/png;base64,${ticket.qrCodeImage}`}
                  alt="QR Code billet"
                  className="w-44 h-44 rounded-xl border-2 border-indigo-200 dark:border-green-500 shadow-sm"
                />
                <p className="mt-3 font-mono text-xs bg-zinc-100 dark:bg-zinc-700 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-300 break-all text-center max-w-full">
                  {ticket.qrCode}
                </p>
              </div>
            )}
          </div>

          {/* Ticket notches */}
          <div className="flex items-center px-4 -mt-1">
            <div className="w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200  -ml-7 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-zinc-200 dark:border-black mx-2" />
            <div className="w-5 h-5 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200  -mr-7 shrink-0" />
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
