import {
  publicSubscriptionService,
  type GetPublicPlansPageableRequest,
  type GetPublicPlansRequest,
} from "@/services/api/public-subscription.service";
import { useQuery } from "@tanstack/react-query";

// Khóa truy vấn
export const publicSubscriptionKeys = {
  all: ["public-subscriptions"] as const,
  plans: (params?: GetPublicPlansRequest) =>
    [...publicSubscriptionKeys.all, "plans", params] as const,
  plansPageable: (params?: GetPublicPlansPageableRequest) =>
    [...publicSubscriptionKeys.all, "plans-pageable", params] as const,
  planDetail: (code: string) =>
    [...publicSubscriptionKeys.all, "plan-detail", code] as const,
};

/**
 * Lấy tất cả các gói subscription công khai
 */
export const usePublicPlans = (params?: GetPublicPlansRequest) => {
  return useQuery({
    queryKey: publicSubscriptionKeys.plans(params),
    queryFn: () => publicSubscriptionService.getPublicPlans(params),
  });
};

/**
 * Lấy các gói subscription công khai có phân trang
 */
export const usePublicPlansPageable = (
  params?: GetPublicPlansPageableRequest
) => {
  return useQuery({
    queryKey: publicSubscriptionKeys.plansPageable(params),
    queryFn: () => publicSubscriptionService.getPublicPlansPageable(params),
  });
};

/**
 * Lấy chi tiết gói subscription công khai theo mã
 */
export const usePublicPlanByCode = (code: string) => {
  return useQuery({
    queryKey: publicSubscriptionKeys.planDetail(code),
    queryFn: () => publicSubscriptionService.getPublicPlanByCode(code),
    enabled: !!code,
  });
};

