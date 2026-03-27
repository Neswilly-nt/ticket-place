"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { subscriptionService } from "@/lib/services/subscription";
import { SubscriptionPlan, SubscriptionResponse } from "@/types";

const PLANS: { plan: SubscriptionPlan; label: string; price: string; duration: string; features: string[] }[] = [
  {
    plan: "MONTHLY",
    label: "Mensuel",
    price: "29,99 €",
    duration: "/ mois",
    features: [
      "Publication illimitée d'événements",
      "Tableau de bord statistiques",
      "Gestion des billets",
      "Support par email",
    ],
  },
  {
    plan: "YEARLY",
    label: "Annuel",
    price: "249,99 €",
    duration: "/ an",
    features: [
      "Tout ce qui est inclus dans le mensuel",
      "Économie de 110 € par rapport au mensuel",
      "Support prioritaire",
      "Accès anticipé aux nouvelles fonctionnalités",
    ],
  },
];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Actif",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  EXPIRED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400",
};

const PLAN_LABELS: Record<string, string> = {
  MONTHLY: "Mensuel",
  YEARLY: "Annuel",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { hasRole, isAuthenticated, initialized } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<SubscriptionPlan | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!hasRole("ORGANIZER", "ADMIN")) { router.push("/events"); return; }
    fetchSubscription();
  }, [initialized, isAuthenticated, hasRole, router]);

  const fetchSubscription = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await subscriptionService.getMy();
      setSubscription(res.data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setSubscribing(plan);
    setError("");
    setSuccess("");
    try {
      const res = await subscriptionService.subscribe(plan);
      setSubscription(res.data);
      setSuccess("Abonnement souscrit avec succès ! Vous pouvez maintenant publier vos événements.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de la souscription");
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Annuler votre abonnement ? Vous ne pourrez plus publier d'événements.")) return;
    setCancelling(true);
    setError("");
    setSuccess("");
    try {
      const res = await subscriptionService.cancel();
      setSubscription(res.data);
      setSuccess("Abonnement annulé.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  };

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-300 border-t-zinc-900 rounded-full" />
      </div>
    );
  }

  const isActive = subscription?.active === true;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Abonnement
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Souscrivez un abonnement pour publier vos événements sur la plateforme
            </p>
          </div>
          <Link
            href="/dashboard/organizer"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            ← Retour au dashboard
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Current subscription card */}
        {subscription && (
          <div className={`mb-8 rounded-2xl border p-6 ${
            isActive
              ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
              : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
          }`}>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-bold text-zinc-900 dark:text-white">
                    Abonnement {PLAN_LABELS[subscription.plan]}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[subscription.status]}`}>
                    {STATUS_LABELS[subscription.status]}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  <p>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Prix payé :</span>{" "}
                    {Number(subscription.price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Début :</span>{" "}
                    {formatDate(subscription.startDate)}
                  </p>
                  <p>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Expiration :</span>{" "}
                    {formatDate(subscription.endDate)}
                  </p>
                  {isActive && (
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      ✅ {subscription.daysRemaining} jours restants
                    </p>
                  )}
                </div>
              </div>
              {isActive && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="rounded-xl border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60 px-4 py-2 text-sm font-medium transition-colors"
                >
                  {cancelling ? "Annulation…" : "Résilier l'abonnement"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* No active subscription warning */}
        {!isActive && (
          <div className="mb-8 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-5 py-4 flex items-start gap-3">
            <span className="text-amber-500 text-xl shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Abonnement requis pour publier
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                Sans abonnement actif, vous pouvez créer des événements mais pas les publier.
                Choisissez un plan ci-dessous pour commencer.
              </p>
            </div>
          </div>
        )}

        {/* Plans */}
        {!isActive && (
          <div className="grid sm:grid-cols-2 gap-6">
            {PLANS.map(({ plan, label, price, duration, features }) => (
              <div
                key={plan}
                className={`rounded-2xl border p-6 bg-white dark:bg-zinc-800 flex flex-col ${
                  plan === "YEARLY"
                    ? "border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/30"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {plan === "YEARLY" && (
                  <span className="self-start mb-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1">
                    Meilleure valeur
                  </span>
                )}
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                  {label}
                </h2>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {price}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm mb-1">
                    {duration}
                  </span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <span className="text-green-500 shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={!!subscribing}
                  className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 ${
                    plan === "YEARLY"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
                  }`}
                >
                  {subscribing === plan ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Traitement…
                    </>
                  ) : (
                    `Souscrire — ${price}`
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
