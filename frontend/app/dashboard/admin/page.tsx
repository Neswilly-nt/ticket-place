"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dashboardService } from "@/lib/services/dashboard";
import { DashboardResponse } from "@/types";
import { useAuth } from "@/context/AuthContext";

function StatCard({
  label,
  value,
  sub,
  color = "bg-white dark:bg-zinc-800",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      className={`${color} rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5`}
    >
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
      {sub && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{sub}</p>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { hasRole, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!hasRole("ADMIN")) { router.push("/events"); return; }

    dashboardService
      .getAdminDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, hasRole, router]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Dashboard Administrateur
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            Vue globale de la plateforme
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-zinc-800 p-5 h-24 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <>
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                Statistiques globales
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Utilisateurs" value={data.totalUsers} />
                <StatCard label="Événements" value={data.totalEvents} />
                <StatCard
                  label="Billets vendus"
                  value={data.totalTicketsSold}
                  sub={`${data.totalTicketsCancelled} annulés`}
                />
                <StatCard
                  label="Revenus totaux"
                  value={`${Number(data.totalRevenue).toLocaleString("fr-FR")} €`}
                />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                Événements par statut
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Brouillons" value={data.draftEvents} />
                <StatCard label="Publiés" value={data.publishedEvents} />
                <StatCard label="Terminés" value={data.completedEvents} />
                <StatCard label="Annulés" value={data.cancelledEvents} />
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                Actions rapides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/admin/subscriptions"
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white text-sm">
                      Gestion des abonnements
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                      Revenus, statuts et liste des organisateurs abonnés
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-400 ml-auto shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </div>
            </section>

            {data.topEvents.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
                  Top événements
                </h2>
                <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                        <th className="text-left px-5 py-3">Événement</th>
                        <th className="text-left px-5 py-3">Lieu</th>
                        <th className="text-right px-5 py-3">Billets vendus</th>
                        <th className="text-right px-5 py-3">Remplissage</th>
                        <th className="text-right px-5 py-3">Revenus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topEvents.map((ev, i) => (
                        <tr
                          key={ev.eventId}
                          className={`${
                            i < data.topEvents.length - 1
                              ? "border-b border-zinc-100 dark:border-zinc-700/50"
                              : ""
                          }`}
                        >
                          <td className="px-5 py-3 font-medium text-zinc-900 dark:text-white">
                            {ev.eventTitle}
                          </td>
                          <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                            {ev.location}
                          </td>
                          <td className="px-5 py-3 text-right text-zinc-700 dark:text-zinc-300">
                            {ev.ticketsSold} / {ev.totalSeats}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-zinc-900 dark:bg-white rounded-full"
                                  style={{ width: `${Math.min(ev.occupancyRate, 100)}%` }}
                                />
                              </div>
                              <span className="text-zinc-700 dark:text-zinc-300 w-10 text-right">
                                {ev.occupancyRate.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-medium text-zinc-900 dark:text-white">
                            {Number(ev.revenue).toLocaleString("fr-FR")} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
