import { api } from "@/lib/api";
import { NotificationResponse } from "@/types";

export const notificationsService = {
  getAll: () => api.get<NotificationResponse[]>("/notifications"),

  countUnread: () => api.get<{ count: number }>("/notifications/unread-count"),

  markRead: (id: number) =>
    api.patch<void>(`/notifications/${id}/read`),

  markAllRead: () => api.patch<void>("/notifications/read-all"),
};
