import { api } from "@/lib/api";
import { SubscriptionPlan, SubscriptionResponse, SubscriptionStatsResponse } from "@/types";

export const subscriptionService = {
  subscribe: (plan: SubscriptionPlan) =>
    api.post<SubscriptionResponse>("/subscriptions", { plan }),

  getMy: () => api.get<SubscriptionResponse>("/subscriptions/my"),

  cancel: () => api.patch<SubscriptionResponse>("/subscriptions/cancel"),

  getAll: () => api.get<SubscriptionResponse[]>("/subscriptions"),

  getStats: () => api.get<SubscriptionStatsResponse>("/subscriptions/stats"),
};
