import type { GetSubscriptionsRequest } from "@/pages/admin/subscriptions/types";
import { subscriptionManagementService } from "@/services/api/subscription-management.service";
import { useQuery } from "@tanstack/react-query";

// Query Keys
export const subscriptionManagementKeys = {
  all: ["subscription-management"] as const,
  list: (params?: GetSubscriptionsRequest) =>
    [...subscriptionManagementKeys.all, "list", params] as const,
  detail: (id: number) =>
    [...subscriptionManagementKeys.all, "detail", id] as const,
  stats: () => [...subscriptionManagementKeys.all, "stats"] as const,
};

// Queries
export const useSubscriptions = (params?: GetSubscriptionsRequest) => {
  return useQuery({
    queryKey: subscriptionManagementKeys.list(params),
    queryFn: async () => {
      const response = await subscriptionManagementService.getSubscriptions(
        params
      );
      return response;
    },
  });
};

export const useSubscriptionById = (subscriptionId: number) => {
  return useQuery({
    queryKey: subscriptionManagementKeys.detail(subscriptionId),
    queryFn: async () => {
      const response = await subscriptionManagementService.getSubscriptionById(
        subscriptionId
      );
      return response.data;
    },
    enabled: !!subscriptionId,
  });
};

export const useSubscriptionStats = () => {
  return useQuery({
    queryKey: subscriptionManagementKeys.stats(),
    queryFn: async () => {
      const response =
        await subscriptionManagementService.getSubscriptionStats();
      return response.data;
    },
  });
};
