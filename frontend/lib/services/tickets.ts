import { api } from "@/lib/api";
import { TicketRequest, TicketResponse } from "@/types";

export const ticketsService = {
  reserve: (data: TicketRequest) =>
    api.post<TicketResponse[]>("/tickets", data),

  pay: (id: number) => api.patch<TicketResponse>(`/tickets/${id}/pay`),

  cancel: (id: number) => api.patch<TicketResponse>(`/tickets/${id}/cancel`),

  getMyTickets: () => api.get<TicketResponse[]>("/tickets/my"),

  verify: (qrCode: string) =>
    api.get<TicketResponse>(`/tickets/verify/${qrCode}`),

  getByEvent: (eventId: number) =>
    api.get<TicketResponse[]>(`/tickets/event/${eventId}`),

  getEventStats: (eventId: number) =>
    api.get<Record<string, number>>(`/tickets/event/${eventId}/stats`),
};
