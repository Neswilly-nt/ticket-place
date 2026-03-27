"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import collapsedIcon from "@/assets/images/Frame 4.png";
import expandedLogo from "@/assets/images/Frame 4 (1).png";
import NotificationBell from "@/components/NotificationBell";
import { useNotifications } from "@/hooks/useNotifications";

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
  subscription:
    "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  notifications:
    "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  shield:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  chevronLeft: "M15 18l-6-6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  close: "M6 18L18 6M6 6l12 12",
};

interface NavbarProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export default function Navbar({ isOpen, isMobileOpen, onToggle, onMobileClose }: NavbarProps) {
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
        title={!isOpen ? label : undefined}
        className={`flex items-center gap-3 py-3 rounded-2xl text-sm font-medium transition-all duration-150 overflow-hidden ${
          isOpen ? "px-4" : "px-0 justify-center"
        } ${
          active
            ? "bg-white text-indigo-700 shadow-md"
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
      >
        <span className={`shrink-0 ${active ? "text-indigo-600" : "text-current"}`}>
          <Icon d={icon} />
        </span>
        <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
          {label}
        </span>
      </Link>
    );
  };

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "?";

  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications(isAuthenticated);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-linear-to-b from-black via-indigo-700 to-violet-800 flex flex-col z-50 shadow-2xl transition-all duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isOpen ? "w-64" : "w-64 lg:w-18"}
      `}
    >
      {/* Header: logo + toggle */}
      <div className={`flex items-center border-b border-white/10 transition-all duration-300 ${isOpen ? "px-5 py-5 gap-3" : "px-0 py-5 justify-center"}`}>
        {/* Logo — expanded: click to collapse */}
        <button
          onClick={onToggle}
          className={`flex items-center min-w-0 cursor-pointer ${!isOpen ? "lg:hidden" : ""}`}
          aria-label="Réduire le menu"
        >
          <Image
            src={expandedLogo}
            alt="e-Ticket"
            height={106}
            className="h-10 w-auto object-contain"
          />
        </button>

        {/* Logo — collapsed: click to expand */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Agrandir le menu"
          >
            <Image
              src={collapsedIcon}
              alt="e-Ticket"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
          </button>
        )}

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden ml-auto shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          aria-label="Fermer"
        >
          <Icon d={ICONS.close} />
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-5 space-y-1 overflow-y-auto transition-all duration-300 ${isOpen ? "px-4" : "px-2"}`}>
        {navItem("/events", "Événements", ICONS.events)}
        {isAuthenticated && navItem("/tickets", "Mes billets", ICONS.tickets)}
        {isAuthenticated && (
          <Link
            href="/notifications"
            title={!isOpen ? "Notifications" : undefined}
            className={`relative flex items-center gap-3 py-3 rounded-2xl text-sm font-medium transition-all duration-150 overflow-hidden ${
              isOpen ? "px-4" : "px-0 justify-center"
            } ${
              pathname === "/notifications"
                ? "bg-white text-indigo-700 shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className={`relative shrink-0 ${pathname === "/notifications" ? "text-indigo-600" : "text-current"}`}>
              <Icon d={ICONS.notifications} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}>
              Notifications
            
            </span>
          </Link>
        )}
        {isAuthenticated &&
          hasRole("ORGANIZER", "ADMIN") &&
          navItem("/events/new", "Créer un événement", ICONS.newEvent)}

        {isAuthenticated && (hasRole("ADMIN") || hasRole("ORGANIZER")) && isOpen && (
          <p className="text-white/90 text-xs font-semibold uppercase px-4 pt-5 mb-3">
            Dashboard
          </p>
        )}
        {!isOpen && isAuthenticated && (hasRole("ADMIN") || hasRole("ORGANIZER")) && (
          <div className="border-t border-white/10 my-2" />
        )}
        {isAuthenticated &&
          hasRole("ADMIN") &&
          navItem("/dashboard/admin", "Admin", ICONS.adminDash)}
        {isAuthenticated &&
          hasRole("ADMIN") &&
          navItem("/dashboard/admin/subscriptions", "Abonnements", ICONS.subscription)}
        {isAuthenticated &&
          hasRole("ORGANIZER", "ADMIN") &&
          navItem("/dashboard/organizer", "Organisateur", ICONS.organizer)}
        {isAuthenticated &&
          hasRole("ORGANIZER", "ADMIN") &&
          navItem("/dashboard/organizer/subscription", "Abonnement", ICONS.subscription)}
      </nav>

      {/* User section */}
      <div className={`py-4 border-t border-white/10 transition-all duration-300 ${isOpen ? "px-4" : "px-2"}`}>
        {isAuthenticated ? (
          <div className="space-y-2">
            {isAuthenticated && (
              <div className={`flex ${isOpen ? "justify-start px-1" : "justify-center"} pb-1`}>
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkRead={markRead}
                  onMarkAllRead={markAllRead}
                  isOpen={isOpen}
                />
              </div>
            )}
            <div className={`flex items-center rounded-2xl bg-white/10 transition-all duration-300 ${isOpen ? "gap-3 px-3 py-2" : "justify-center px-0 py-2"}`}>
              <div
                title={!isOpen ? `${user?.firstName} ${user?.lastName}` : undefined}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0"
              >
                {initials}
              </div>
              {isOpen && (
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-white/50 text-xs truncate">{user?.role}</p>
                </div>
              )}
            </div>
            {navItem("/settings/security", "Sécurité du compte", ICONS.shield)}
            <button
              onClick={handleLogout}
              title={!isOpen ? "Déconnexion" : undefined}
              className={`w-full flex items-center py-2.5 rounded-2xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all ${isOpen ? "gap-3 px-4" : "justify-center px-0"}`}
            >
              <Icon d={ICONS.logout} />
              {isOpen && <span>Déconnexion</span>}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {isOpen ? (
              <>
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
              </>
            ) : (
              <Link
                href="/login"
                title="Connexion"
                className="flex justify-center py-2.5 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
