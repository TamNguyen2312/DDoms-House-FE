import type {
  CreatePricingPlanRequest,
  GetPricingPlansRequest,
  IPricingPlanStatus,
  PaginationParams,
  UpsertPlanRequest,
} from "@/pages/admin/pricing-plans/types";
import { pricingPlanService } from "@/services/api/pricing-plan.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const pricingPlanKeys = {
  all: ["pricing-plans"] as const,
  list: (params?: GetPricingPlansRequest) =>
    [...pricingPlanKeys.all, "list", params] as const,
  pageable: (params?: PaginationParams & { status?: IPricingPlanStatus }) =>
    [...pricingPlanKeys.all, "pageable", params] as const,
  detail: (id: number) => [...pricingPlanKeys.all, "detail", id] as const,
};

// Queries
export const usePricingPlans = (params?: GetPricingPlansRequest) => {
  return useQuery({
    queryKey: pricingPlanKeys.list(params),
    queryFn: async () => {
      const response = await pricingPlanService.getPricingPlans(params);
      return response;
    },
  });
};

export const usePricingPlansPageable = (
  params?: PaginationParams & { status?: IPricingPlanStatus }
) => {
  return useQuery({
    queryKey: pricingPlanKeys.pageable(params),
    queryFn: async () => {
      const response = await pricingPlanService.getPricingPlansPageable(params);
      return response;
    },
  });
};

export const usePricingPlanById = (id: number) => {
  return useQuery({
    queryKey: pricingPlanKeys.detail(id),
    queryFn: async () => {
      const response = await pricingPlanService.getPricingPlanById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

// Mutations
export const useCreatePricingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePricingPlanRequest) =>
      pricingPlanService.createPricingPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pricingPlanKeys.all,
      });
    },
  });
};

export const useUpsertPricingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertPlanRequest) =>
      pricingPlanService.upsertPricingPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pricingPlanKeys.all,
      });
    },
  });
};

export const useSetPlanStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planCode,
      status,
    }: {
      planCode: string;
      status: IPricingPlanStatus;
    }) => pricingPlanService.setPlanStatus(planCode, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pricingPlanKeys.all,
      });
    },
  });
};

export const useDeletePricingPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planCode: string) =>
      pricingPlanService.deletePricingPlan(planCode),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pricingPlanKeys.all,
      });
    },
  });
};
