"use client";

import { useState, useRef, useEffect } from "react";
import { NotificationResponse, NotificationType } from "@/types";

interface Props {
  notifications: NotificationResponse[];
  unreadCount: number;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  isOpen: boolean;
}

const TYPE_ICON: Record<NotificationType, string> = {
  PAYMENT_SUCCESS: "✅",
  RESERVATION_AUTO_CANCELLED: "❌",
  EVENT_REMINDER: "🔔",
  TICKET_CANCELLED: "🚫",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${Math.floor(hours / 24)}j`;
}

export default function NotificationBell({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  isOpen,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute z-50 bottom-full mb-2 w-80 rounded-2xl shadow-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden ${isOpen ? "left-0" : "-left-64"}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium"
              >
                Tout lire
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-700">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
                Aucune notification
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.read) onMarkRead(n.id); }}
                  className={`w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors ${!n.read ? "bg-indigo-50 dark:bg-indigo-900/10" : ""}`}
                >
                  <div className="flex gap-2 items-start">
                    <span className="text-base mt-0.5 shrink-0">{TYPE_ICON[n.type]}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-semibold truncate ${!n.read ? "text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-300"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 whitespace-normal">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
