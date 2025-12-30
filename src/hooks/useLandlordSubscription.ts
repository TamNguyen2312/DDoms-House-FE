import type {
  CheckoutSubscriptionRequest,
  GetLandlordSubscriptionHistoryRequest,
  ILandlordCurrentSubscription,
  LandlordSubscriptionHistoryResponse,
  PurchaseSubscriptionRequest,
  SwitchSubscriptionRequest,
} from "@/pages/landlord/subscriptions/types";
import { landlordSubscriptionService } from "@/services/api/landlord-subscription.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const landlordSubscriptionKeys = {
  all: ["landlord-subscriptions"] as const,
  current: () => [...landlordSubscriptionKeys.all, "current"] as const,
  history: (params?: GetLandlordSubscriptionHistoryRequest) =>
    [...landlordSubscriptionKeys.all, "history", params] as const,
};

export const useLandlordCurrentSubscription = () => {
  return useQuery<ILandlordCurrentSubscription>({
    queryKey: landlordSubscriptionKeys.current(),
    queryFn: async () => {
      const response =
        await landlordSubscriptionService.getCurrentSubscription();
      return response.data;
    },
  });
};

export const useLandlordSubscriptionHistory = (
  params?: GetLandlordSubscriptionHistoryRequest
) => {
  return useQuery<LandlordSubscriptionHistoryResponse>({
    queryKey: landlordSubscriptionKeys.history(params),
    queryFn: async () => {
      const response = await landlordSubscriptionService.getSubscriptionHistory(
        params
      );
      return {
        content: response.content,
        pagination: response.pagination,
        contentSize: response.contentSize,
      };
    },
  });
};

/**
 * Purchase or upgrade subscription
 */
export const usePurchaseSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseSubscriptionRequest) =>
      landlordSubscriptionService.purchaseSubscription(data),
    onSuccess: () => {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({
        queryKey: landlordSubscriptionKeys.all,
      });
    },
  });
};

/**
 * Switch subscription plan
 */
export const useSwitchSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SwitchSubscriptionRequest) =>
      landlordSubscriptionService.switchSubscription(data),
    onSuccess: () => {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({
        queryKey: landlordSubscriptionKeys.all,
      });
    },
  });
};

/**
 * Checkout subscription (purchase new subscription)
 */
export const useCheckoutSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutSubscriptionRequest) =>
      landlordSubscriptionService.checkoutSubscription(data),
    onSuccess: () => {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({
        queryKey: landlordSubscriptionKeys.all,
      });
    },
  });
};

/**
 * Sync subscription payment status from provider
 */
export const useSyncSubscriptionPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: number) =>
      landlordSubscriptionService.syncSubscriptionPayment(paymentId),
    onSuccess: () => {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({
        queryKey: landlordSubscriptionKeys.all,
      });
    },
  });
};
