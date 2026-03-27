"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { NotificationResponse } from "@/types";
import { notificationsService } from "@/lib/services/notifications";

export function useNotifications(isAuthenticated: boolean) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef<{ deactivate: () => void } | null>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    setUnreadCount(unread);
  }, [unread]);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationsService.getAll();
      setNotifications(res.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadNotifications();
  }, [isAuthenticated, loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    let cancelled = false;

    Promise.all([
      import("@stomp/stompjs"),
      import("sockjs-client"),
    ]).then(([{ Client }, { default: SockJS }]) => {
      if (cancelled) return;

      const client = new Client({
        webSocketFactory: () => new SockJS("http://localhost:8080/ws") as WebSocket,
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe("/user/queue/notifications", (msg) => {
            try {
              const notification: NotificationResponse = JSON.parse(msg.body);
              setNotifications((prev) => [notification, ...prev]);
            } catch {
              // ignore malformed message
            }
          });
        },
        onStompError: () => {},
      });

      client.activate();
      clientRef.current = client;
    });

    return () => {
      cancelled = true;
      clientRef.current?.deactivate();
      clientRef.current = null;
    };
  }, [isAuthenticated]);

  const markRead = useCallback(async (id: number) => {
    try {
      await notificationsService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silent
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  }, []);

  return { notifications, unreadCount, markRead, markAllRead };
}
