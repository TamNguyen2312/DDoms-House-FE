import type { GetAdminPaymentsRequest } from "@/pages/admin/payments/types";
import { paymentService } from "@/services/api/payment.service";
import type {
  CreatePaymentRequest,
  PaymentDetail,
  SimulateWebhookRequest,
} from "@/types/payment.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";

/**
 * Hook for creating payment link
 * POST /api/payments
 */
export const useCreatePayment = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) =>
      paymentService.createPayment(data),
    onSuccess: (response, variables) => {
      if (response.data.paymentUrl) {
        // Redirect to payment URL
        window.location.href = response.data.paymentUrl;
      } else if (response.data.paymentId) {
        // If we have paymentId, redirect to result page
        const returnUrl =
          variables.returnUrl ||
          `${window.location.origin}/tenant/payments/result/success`;
        window.location.href = `${returnUrl}?payment_id=${response.data.paymentId}`;
      } else {
        toast.success("Tạo link thanh toán thành công");
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi tạo thanh toán"
      );
    },
  });
};

/**
 * Hook for getting payment status
 * GET /api/payments/{payment_id}
 */
export const useGetPaymentStatus = (paymentId: string, enabled = true) => {
  return useQuery<PaymentDetail>({
    queryKey: ["payment", paymentId],
    queryFn: () =>
      paymentService.getPaymentStatus(paymentId).then((res) => res.data),
    enabled: enabled && !!paymentId,
    refetchInterval: (query) => {
      // Auto-refetch every 5 seconds if payment is still pending
      const data = query.state.data;
      if (data?.status === "PENDING" || data?.status === "PROCESSING") {
        return 5000;
      }
      return false;
    },
  });
};

/**
 * Hook for syncing payment status from provider
 * POST /api/payments/{payment_id}/sync
 */
export const useSyncPaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) =>
      paymentService.syncPaymentStatus(paymentId),
    onSuccess: (_response, paymentId) => {
      // Invalidate payment query to refresh status
      queryClient.invalidateQueries({
        queryKey: ["payment", paymentId],
      });

      // Also invalidate all payment-related queries to refresh invoice/contract status
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contracts"],
      });

      // Không hiển thị toast - sync là background operation
    },
    onError: (_error: any) => {
      // Không hiển thị toast error - sync là background operation
    },
  });
};

/**
 * Hook for canceling payment
 * POST /api/payments/{payment_id}/cancel
 */
export const useCancelPayment = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => paymentService.cancelPayment(paymentId),
    onSuccess: (_, paymentId) => {
      // Invalidate payment query to refresh status
      queryClient.invalidateQueries({
        queryKey: ["payment", paymentId],
      });
      toast.success("Hủy thanh toán thành công");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi hủy thanh toán"
      );
    },
  });
};

/**
 * Hook for simulating webhook (dev/test)
 * POST /api/payments/webhook/simulate
 */
export const useSimulateWebhook = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SimulateWebhookRequest) =>
      paymentService.simulateWebhook(data),
    onSuccess: (_response, variables) => {
      // Extract paymentId from payload if available
      const providerOrderId = variables.payload.providerOrderId;
      if (providerOrderId) {
        // Invalidate all payment queries to refresh
        queryClient.invalidateQueries({ queryKey: ["payment"] });
      }
      toast.success("Mô phỏng webhook thành công");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi mô phỏng webhook"
      );
    },
  });
};

// ============================================
// ADMIN API Hooks
// ============================================

export const paymentKeys = {
  all: ["payments"] as const,
  allForAdmin: () => [...paymentKeys.all, "admin"] as const,
  allForAdminParams: (params?: GetAdminPaymentsRequest) =>
    [...paymentKeys.all, "admin", params] as const,
  adminDetail: (id: number) =>
    [...paymentKeys.all, "admin", "detail", id] as const,
};

export const useGetAdminPayments = (params?: GetAdminPaymentsRequest) => {
  return useQuery({
    queryKey: paymentKeys.allForAdminParams(params),
    queryFn: async () => {
      const res = await paymentService.getAdminPayments(params);
      return res;
    },
  });
};

export const useGetAdminPaymentDetail = (
  paymentId: number,
  paymentType: string = "ALL",
  enabled = true
) => {
  return useQuery({
    queryKey: [...paymentKeys.adminDetail(paymentId), paymentType],
    queryFn: async () => {
      const res = await paymentService.getAdminPaymentDetail(
        paymentId,
        paymentType
      );
      return res;
    },
    enabled: enabled && paymentId > 0,
  });
};
