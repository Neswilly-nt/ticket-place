"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout, hasRole } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItem = (href: string, label: string, icon: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-150 ${
          active
            ? "bg-white text-indigo-700 shadow-md"
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
      >
        <span className={active ? "text-indigo-600" : "text-current"}>
          <Icon d={icon} />
        </span>
        {label}
      </Link>
    );
  };

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "?";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-linear-to-b from-black via-indigo-700 to-violet-800 flex flex-col z-50 shadow-2xl">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-base shadow-inner">
            T
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            TicketPlace
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        
        {navItem("/events", "Événements", ICONS.events)}
        {isAuthenticated && navItem("/tickets", "Mes billets", ICONS.tickets)}
        {isAuthenticated &&
          hasRole("ORGANIZER", "ADMIN") &&
          navItem("/events/new", "Créer un événement", ICONS.newEvent)}

        {isAuthenticated && (hasRole("ADMIN") || hasRole("ORGANIZER")) && (
          <p className="text-white/90 text-xs font-semibold uppercase  px-4 pt-5 mb-3">
            Dashboard
          </p>
        )}
        {isAuthenticated &&
          hasRole("ADMIN") &&
          navItem("/dashboard/admin", "Admin", ICONS.adminDash)}
        
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-white/10">
        {isAuthenticated ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-white/10">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-white/50 text-xs truncate">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <Icon d={ICONS.logout} />
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-2xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="w-full flex items-center justify-center px-4 py-2.5 rounded-2xl bg-white/20 text-sm font-semibold text-white hover:bg-white/30 transition-all"
            >
              S&apos;inscrire
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
