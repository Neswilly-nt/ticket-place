"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { subscriptionService } from "@/lib/services/subscription";
import {
  SubscriptionResponse,
  SubscriptionStatsResponse,
  SubscriptionStatus,
  SubscriptionPlan,
} from "@/types";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Actif",
  EXPIRED: "Expiré",
  CANCELLED: "Annulé",
};

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  EXPIRED: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  CANCELLED:
    "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400",
};

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  MONTHLY: "Mensuel",
  YEARLY: "Annuel",
};

function fmt(n: number) {
  return Number(n).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "bg-indigo-600 border-indigo-500 text-white"
          : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
      }`}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide mb-1 ${
          accent ? "text-indigo-200" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-2xl font-bold ${
          accent ? "text-white" : "text-zinc-900 dark:text-white"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-xs mt-1 ${
            accent ? "text-indigo-200" : "text-zinc-400 dark:text-zinc-500"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

type FilterStatus = "ALL" | SubscriptionStatus;
type FilterPlan = "ALL" | SubscriptionPlan;

export default function AdminSubscriptionsPage() {
  const router = useRouter();
  const { hasRole, isAuthenticated, initialized } = useAuth();
  const [stats, setStats] = useState<SubscriptionStatsResponse | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterPlan, setFilterPlan] = useState<FilterPlan>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!hasRole("ADMIN")) { router.push("/events"); return; }
    fetchAll();
  }, [initialized, isAuthenticated, hasRole, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, listRes] = await Promise.all([
        subscriptionService.getStats(),
        subscriptionService.getAll(),
      ]);
      setStats(statsRes.data);
      setSubscriptions(listRes.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = subscriptions.filter((s) => {
    const matchStatus = filterStatus === "ALL" || s.status === filterStatus;
    const matchPlan = filterPlan === "ALL" || s.plan === filterPlan;
    const matchSearch =
      search === "" ||
      s.organizerName.toLowerCase().includes(search.toLowerCase()) ||
      s.organizerEmail.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPlan && matchSearch;
  });

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin w-8 h-8 border-4 border-zinc-300 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  const totalPct =
    stats && stats.totalSubscriptions > 0
      ? Math.round((stats.activeSubscriptions / stats.totalSubscriptions) * 100)
      : 0;
  const monthlyPct =
    stats && stats.totalRevenue > 0
      ? Math.round((Number(stats.monthlyRevenue) / Number(stats.totalRevenue)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Gestion des abonnements
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Revenus et abonnements organisateurs
            </p>
          </div>
          <Link
            href="/dashboard/admin"
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            ← Retour au dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Revenue KPIs */}
            <section className="mb-8">
              <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                Revenus des abonnements
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Revenu total"
                  value={fmt(stats.totalRevenue)}
                  sub={`${stats.totalSubscriptions} abonnement(s) au total`}
                  accent
                />
                <StatCard
                  label="Revenus actifs"
                  value={fmt(stats.activeRevenue)}
                  sub={`${stats.activeSubscriptions} abonnement(s) actif(s)`}
                />
                <StatCard
                  label="Revenus Mensuel"
                  value={fmt(stats.monthlyRevenue)}
                  sub={`${stats.monthlyCount} souscription(s)`}
                />
                <StatCard
                  label="Revenus Annuel"
                  value={fmt(stats.yearlyRevenue)}
                  sub={`${stats.yearlyCount} souscription(s)`}
                />
              </div>
            </section>

            {/* Status breakdown + plan breakdown */}
            <section className="mb-8 grid sm:grid-cols-2 gap-4">
              {/* Status breakdown */}
              <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5">
                <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
                  Statuts
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-700 dark:text-zinc-300">Actifs</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {stats.activeSubscriptions}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${totalPct}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div>
                      <p className="font-bold text-green-600 dark:text-green-400 text-base">
                        {stats.activeSubscriptions}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400">Actifs</p>
                    </div>
                    <div>
                      <p className="font-bold text-red-500 text-base">
                        {stats.expiredSubscriptions}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400">Expirés</p>
                    </div>
                    <div>
                      <p className="font-bold text-zinc-500 text-base">
                        {stats.cancelledSubscriptions}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400">Annulés</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan breakdown */}
              <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5">
                <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-4">
                  Répartition par plan
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-700 dark:text-zinc-300">Mensuel</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {stats.monthlyCount} ({monthlyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${monthlyPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-zinc-700 dark:text-zinc-300">Annuel</span>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {stats.yearlyCount} ({100 - monthlyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{ width: `${100 - monthlyPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Subscriptions table */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Tous les abonnements ({filtered.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <input
                type="text"
                placeholder="Rechercher un organisateur…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-400 w-52"
              />
              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm px-3 py-1.5 outline-none"
              >
                <option value="ALL">Tous les statuts</option>
                <option value="ACTIVE">Actif</option>
                <option value="EXPIRED">Expiré</option>
                <option value="CANCELLED">Annulé</option>
              </select>
              {/* Plan filter */}
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as FilterPlan)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm px-3 py-1.5 outline-none"
              >
                <option value="ALL">Tous les plans</option>
                <option value="MONTHLY">Mensuel</option>
                <option value="YEARLY">Annuel</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 px-6 py-12 text-center">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Aucun abonnement trouvé.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">#</th>
                    <th className="text-left px-5 py-3">Organisateur</th>
                    <th className="text-left px-5 py-3">Plan</th>
                    <th className="text-left px-5 py-3">Statut</th>
                    <th className="text-right px-5 py-3">Montant</th>
                    <th className="text-left px-5 py-3">Début</th>
                    <th className="text-left px-5 py-3">Expiration</th>
                    <th className="text-right px-5 py-3">J. restants</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                    >
                      <td className="px-5 py-3 text-zinc-400 dark:text-zinc-500 font-mono text-xs">
                        #{s.id}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {s.organizerName}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                          {s.organizerEmail}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            s.plan === "YEARLY"
                              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                          }`}
                        >
                          {PLAN_LABELS[s.plan]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[s.status]}`}
                        >
                          {STATUS_LABELS[s.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-zinc-900 dark:text-white">
                        {fmt(s.price)}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {fmtDate(s.startDate)}
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                        {fmtDate(s.endDate)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {s.active ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {s.daysRemaining}j
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
