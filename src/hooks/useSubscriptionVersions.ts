import type {
  CreateVersionRequest,
  PaginationParams,
  SetVersionFeaturesRequest,
} from "@/pages/admin/pricing-plans/types";
import { subscriptionVersionService } from "@/services/api/subscription-version.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const subscriptionVersionKeys = {
  all: ["subscription-versions"] as const,
  byPlan: (planCode: string) =>
    [...subscriptionVersionKeys.all, "plan", planCode] as const,
  pageable: (planCode: string, params?: PaginationParams) =>
    [
      ...subscriptionVersionKeys.all,
      "plan",
      planCode,
      "pageable",
      params,
    ] as const,
  detail: (id: number) =>
    [...subscriptionVersionKeys.all, "detail", id] as const,
};

// Queries
export const usePlanVersions = (planCode: string) => {
  return useQuery({
    queryKey: subscriptionVersionKeys.byPlan(planCode),
    queryFn: async () => {
      const response = await subscriptionVersionService.getPlanVersions(
        planCode
      );
      return response;
    },
    enabled: !!planCode,
  });
};

export const usePlanVersionsPageable = (
  planCode: string,
  params?: PaginationParams
) => {
  return useQuery({
    queryKey: subscriptionVersionKeys.pageable(planCode, params),
    queryFn: async () => {
      const response = await subscriptionVersionService.getPlanVersionsPageable(
        planCode,
        params
      );
      return response;
    },
    enabled: !!planCode,
  });
};

// Mutations
export const useCreateVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVersionRequest) =>
      subscriptionVersionService.createVersion(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionVersionKeys.byPlan(variables.planCode),
      });
    },
  });
};

export const useSetVersionFeatures = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      data,
    }: {
      versionId: number;
      data: SetVersionFeaturesRequest;
    }) => subscriptionVersionService.setVersionFeatures(versionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionVersionKeys.all,
      });
    },
  });
};

export const usePublishVersion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (versionId: number) =>
      subscriptionVersionService.publishVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionVersionKeys.all,
      });
    },
  });
};
