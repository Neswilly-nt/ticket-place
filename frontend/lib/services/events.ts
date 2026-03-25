import { api } from "@/lib/api";
import { EventCategory, EventRequest, EventResponse, EventStatus } from "@/types";

export const eventsService = {
  getAll: () => api.get<EventResponse[]>("/events"),

  getById: (id: number) => api.get<EventResponse>(`/events/${id}`),

  search: (keyword: string) =>
    api.get<EventResponse[]>(`/events/search?keyword=${encodeURIComponent(keyword)}`),

  getByCategory: (category: EventCategory) =>
    api.get<EventResponse[]>(`/events/category/${category}`),

  getByStatus: (status: EventStatus) =>
    api.get<EventResponse[]>(`/events/status/${status}`),

  filter: (params: { status?: EventStatus; category?: EventCategory }) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.category) query.set("category", params.category);
    return api.get<EventResponse[]>(`/events/filter?${query.toString()}`);
  },

  create: (data: EventRequest) => api.post<EventResponse>("/events", data),

  update: (id: number, data: EventRequest) =>
    api.put<EventResponse>(`/events/${id}`, data),

  publish: (id: number) => api.patch<EventResponse>(`/events/${id}/publish`),

  cancel: (id: number) => api.patch<EventResponse>(`/events/${id}/cancel`),

  delete: (id: number) => api.delete<void>(`/events/${id}`),
};
