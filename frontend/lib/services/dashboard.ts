import { api } from "@/lib/api";
import { DashboardResponse, EventStatsResponse } from "@/types";

export const dashboardService = {
  getAdminDashboard: () =>
    api.get<DashboardResponse>("/dashboard/admin"),

  getOrganizerDashboard: () =>
    api.get<EventStatsResponse[]>("/dashboard/organizer"),
};
