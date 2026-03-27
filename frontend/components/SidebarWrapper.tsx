"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import ThemeToggle from "./ThemeToggle";

const SIDEBAR_ROUTES = ["/events", "/tickets", "/dashboard", "/notifications", "/settings"];

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = SIDEBAR_ROUTES.some((r) => pathname.startsWith(r));

  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!showSidebar) return <>{children}<ThemeToggle /></>;

  return (
    <div className="flex min-h-screen">
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Navbar
        isOpen={isOpen}
        isMobileOpen={isMobileOpen}
        onToggle={() => setIsOpen((v) => !v)}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Mobile hamburger — only when drawer is closed */}
      {!isMobileOpen && (
        <button
          className="fixed top-4 left-4 z-30 lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md text-zinc-700 dark:text-zinc-200"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Ouvrir le menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      <div
        className={`flex-1 min-w-0 transition-all duration-300 ${
          isOpen ? "lg:ml-64" : "lg:ml-18"
        }`}
      >
        {children}
      </div>

      <ThemeToggle />
    </div>
  );
}
