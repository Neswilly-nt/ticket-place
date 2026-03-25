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

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-shadow";

const LABEL_CLASS = "block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();
  const [ticket, setTicket] = useState<TicketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState<"card" | "paypal">("card");

  const [card, setCard] = useState({
    firstName: "",
    lastName: "",
    number: "",
    expiry: "",
    cvv: "",
    country: "",
    postal: "",
  });

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tickets/${id}/pay`);
      return;
    }
    ticketsService
      .getMyTickets()
      .then((res) => {
        const found = res.data.find((t) => t.id === Number(id));
        if (!found) {
          setError("Billet introuvable.");
        } else if (found.status !== "RESERVED") {
          setError(`Ce billet est déjà "${found.status}" et ne peut pas être payé.`);
        } else {
          setTicket(found);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [initialized, isAuthenticated, id, router]);

  const setField = (field: keyof typeof card) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setCard((prev) => ({ ...prev, [field]: e.target.value }));

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    if (method === "card") {
      if (!card.firstName || !card.lastName || !card.number || !card.expiry || !card.cvv) {
        setError("Veuillez remplir tous les champs de la carte.");
        return;
      }
    }
    setError("");
    setPaying(true);
    try {
      await ticketsService.pay(ticket.id);
      router.push(`/tickets/${ticket.id}/pay/success`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors du paiement");
    } finally {
      setPaying(false);
    }
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-300 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-900 px-4">
        <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-8 max-w-md w-full text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-zinc-700 dark:text-zinc-300 mb-6">{error}</p>
          <Link
            href="/tickets"
            className="rounded-lg bg-zinc-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Retour aux billets
          </Link>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const total = ticket.price;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-6"
        >
          ← Retour aux billets
        </Link>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
          Paiement du billet
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ── LEFT PANEL ── */}
            <div className="lg:col-span-3 space-y-4">

              {/* Method selector */}
              <div className="rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6">
                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
                  Méthode de paiement
                </h2>

                {/* Credit Card option */}
                <label
                  className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer mb-3 transition-colors ${
                    method === "card"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value="card"
                    checked={method === "card"}
                    onChange={() => setMethod("card")}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">Carte bancaire</span>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-blue-600 text-white">VISA</span>
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white">MC</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Paiement sécurisé — Visa, Mastercard, American Express
                    </p>
                  </div>
                </label>

                {/* Card fields */}
                {method === "card" && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL_CLASS}>Prénom</label>
                        <input
                          type="text"
                          placeholder="Jean"
                          value={card.firstName}
                          onChange={setField("firstName")}
                          className={INPUT_CLASS}
                          required
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Nom</label>
                        <input
                          type="text"
                          placeholder="Dupont"
                          value={card.lastName}
                          onChange={setField("lastName")}
                          className={INPUT_CLASS}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={LABEL_CLASS}>Numéro de carte</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={card.number}
                          onChange={(e) =>
                            setCard((prev) => ({
                              ...prev,
                              number: formatCardNumber(e.target.value),
                            }))
                          }
                          maxLength={19}
                          className={INPUT_CLASS + " pr-16"}
                          required
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                          <CardIcon />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL_CLASS}>Date d&apos;expiration</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={card.expiry}
                          onChange={(e) =>
                            setCard((prev) => ({
                              ...prev,
                              expiry: formatExpiry(e.target.value),
                            }))
                          }
                          maxLength={5}
                          className={INPUT_CLASS}
                          required
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>CVV</label>
                        <input
                          type="text"
                          placeholder="000"
                          value={card.cvv}
                          onChange={setField("cvv")}
                          maxLength={4}
                          className={INPUT_CLASS}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={LABEL_CLASS}>Pays</label>
                        <select
                          value={card.country}
                          onChange={setField("country")}
                          className={INPUT_CLASS}
                        >
                          <option value="">Choisissez un pays</option>
                          <option value="FR">France</option>
                          <option value="BE">Belgique</option>
                          <option value="CH">Suisse</option>
                          <option value="LU">Luxembourg</option>
                          <option value="CA">Canada</option>
                          <option value="DZ">Algérie</option>
                          <option value="MA">Maroc</option>
                          <option value="TN">Tunisie</option>
                        </select>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>Code postal</label>
                        <input
                          type="text"
                          placeholder="75001"
                          value={card.postal}
                          onChange={setField("postal")}
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal option */}
                <label
                  className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                    method === "paypal"
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value="paypal"
                    checked={method === "paypal"}
                    onChange={() => setMethod("paypal")}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">PayPal</span>
                      <span className="text-[#003087] dark:text-[#009cde] font-extrabold text-sm tracking-tight">
                        Pay<span className="text-[#009cde]">Pal</span>
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Paiement en ligne sécurisé — aucun compte PayPal nécessaire
                    </p>
                  </div>
                </label>
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 px-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Paiement 100% sécurisé — vos données sont chiffrées
              </div>
            </div>

            {/* ── RIGHT PANEL – Booking Summary ── */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-indigo-600 text-white overflow-hidden sticky top-6">
                <div className="px-6 pt-6 pb-4 border-b border-indigo-500">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-sm font-semibold uppercase tracking-wide opacity-80">
                      Récapitulatif
                    </h2>
                  </div>
                  <p className="text-lg font-bold leading-snug mt-2">{ticket.eventTitle}</p>
                </div>

                <div className="px-6 py-4 space-y-2.5 border-b border-indigo-500 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-70">Date</span>
                    <span className="font-medium text-right max-w-[60%]">{formatDate(ticket.eventDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Lieu</span>
                    <span className="font-medium text-right max-w-[60%]">{ticket.eventLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Prix unitaire</span>
                    <span className="font-medium">{ticket.price === 0 ? "Gratuit" : `${ticket.price} €`}</span>
                  </div>
                </div>

                <div className="px-6 py-4 space-y-2 text-sm border-b border-indigo-500">
                  <div className="flex justify-between">
                    <span className="opacity-70">Sous-total</span>
                    <span>{ticket.price} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Réduction</span>
                    <span>0,00 €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Taxes & frais</span>
                    <span>0,00 €</span>
                  </div>
                </div>

                <div className="px-6 py-4 flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>{total === 0 ? "Gratuit" : `${total} €`}</span>
                </div>

                {error && (
                  <div className="px-6 pb-4">
                    <p className="text-xs text-red-200 bg-red-500/30 rounded-lg px-3 py-2">{error}</p>
                  </div>
                )}

                {/* Make Payment button */}
                <div className="px-6 pb-6">
                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 px-6 py-3.5 text-sm font-bold text-zinc-900 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    {paying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                        Traitement…
                      </>
                    ) : (
                      <>
                        🔒 Confirmer le paiement
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
