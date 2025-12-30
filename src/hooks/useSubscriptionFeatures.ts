import type {
  CreateFeatureRequest,
  PaginationParams,
} from "@/pages/admin/pricing-plans/types";
import { subscriptionFeatureService } from "@/services/api/subscription-feature.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const subscriptionFeatureKeys = {
  all: ["subscription-features"] as const,
  list: () => [...subscriptionFeatureKeys.all, "list"] as const,
  pageable: (params?: PaginationParams) =>
    [...subscriptionFeatureKeys.all, "pageable", params] as const,
  detail: (code: string) =>
    [...subscriptionFeatureKeys.all, "detail", code] as const,
};

// Queries
export const useSubscriptionFeatures = () => {
  return useQuery({
    queryKey: subscriptionFeatureKeys.list(),
    queryFn: async () => {
      const response = await subscriptionFeatureService.getAllFeatures();
      return response;
    },
  });
};

export const useSubscriptionFeaturesPageable = (params?: PaginationParams) => {
  return useQuery({
    queryKey: subscriptionFeatureKeys.pageable(params),
    queryFn: async () => {
      const response = await subscriptionFeatureService.getFeaturesPageable(
        params
      );
      return response;
    },
  });
};

// Mutations
export const useCreateSubscriptionFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeatureRequest) =>
      subscriptionFeatureService.createFeature(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionFeatureKeys.all,
      });
    },
  });
};

export const useDeleteSubscriptionFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (featureCode: string) =>
      subscriptionFeatureService.deleteFeature(featureCode),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionFeatureKeys.all,
      });
    },
  });
};
