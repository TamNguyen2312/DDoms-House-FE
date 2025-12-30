import type {
  AdminPaymentDetailResponse,
  AdminPaymentsResponse,
  GetAdminPaymentsRequest,
} from "@/pages/admin/payments/types";
import type {
  CancelPaymentResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentDetail,
  SimulateWebhookRequest,
  SimulateWebhookResponse,
  SyncPaymentResponse,
} from "@/types/payment.types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class PaymentService {
  private readonly BASE_PATH = "/payments";

  /**
   * Create payment link with provider (PAYOS)
   * POST /api/payments
   * Không yêu cầu auth mặc định
   */
  async createPayment(data: CreatePaymentRequest) {
    const response = await axiosInstance.post<
      ApiResponse<CreatePaymentResponse>
    >(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Get payment status
   * GET /api/payments/{payment_id}
   */
  async getPaymentStatus(paymentId: string) {
    const response = await axiosInstance.get<ApiResponse<PaymentDetail>>(
      `${this.BASE_PATH}/${paymentId}`
    );
    return response.data;
  }

  /**
   * Sync payment status from provider
   * POST /api/payments/{payment_id}/sync
   * Gọi house-keeping để đồng bộ trạng thái từ provider
   */
  async syncPaymentStatus(paymentId: string) {
    const response = await axiosInstance.post<ApiResponse<SyncPaymentResponse>>(
      `${this.BASE_PATH}/${paymentId}/sync`
    );
    return response.data;
  }

  /**
   * Cancel payment on provider (if still pending)
   * POST /api/payments/{payment_id}/cancel
   */
  async cancelPayment(paymentId: string) {
    const response = await axiosInstance.post<
      ApiResponse<CancelPaymentResponse>
    >(`${this.BASE_PATH}/${paymentId}/cancel`);
    return response.data;
  }

  /**
   * Simulate webhook (dev/test)
   * POST /api/payments/webhook/simulate
   * Dùng để mô phỏng webhook thay vì cần chữ ký thật
   */
  async simulateWebhook(data: SimulateWebhookRequest) {
    const response = await axiosInstance.post<
      ApiResponse<SimulateWebhookResponse>
    >(`${this.BASE_PATH}/webhook/simulate`, data);
    return response.data;
  }

  /**
   * Webhook endpoint for provider to call DDOMS system
   * POST /api/payments/webhook/{provider}
   * Note: This is typically called by the payment provider, not by the frontend
   * The signature header should be set correctly according to each provider's standard
   */
  async webhook(provider: string, payload: unknown, signature?: string) {
    const headers = signature ? { "X-Signature": signature } : {};
    const response = await axiosInstance.post<ApiResponse<unknown>>(
      `${this.BASE_PATH}/webhook/${provider}`,
      payload,
      { headers }
    );
    return response.data;
  }

  // ============================================
  // ADMIN APIs
  // ============================================

  /**
   * Get all payments for admin with filters
   * GET /api/admin/payments?status=&provider=&tenantId=&invoiceId=&page=0&size=20&paymentType=ALL&serviceInvoiceId=
   */
  async getAdminPayments(params?: GetAdminPaymentsRequest) {
    const response = await axiosInstance.get<AdminPaymentsResponse>(
      "/admin/payments",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          paymentType: params?.paymentType ?? "ALL",
          ...(params?.status && { status: params.status }),
          ...(params?.provider && { provider: params.provider }),
          ...(params?.tenantId && { tenantId: params.tenantId }),
          ...(params?.invoiceId && { invoiceId: params.invoiceId }),
          ...(params?.serviceInvoiceId && { serviceInvoiceId: params.serviceInvoiceId }),
        },
      }
    );
    return response.data;
  }

  /**
   * Get payment detail for admin
   * GET /api/admin/payments/{payment_id}?paymentType=ALL
   */
  async getAdminPaymentDetail(paymentId: number, paymentType: string = "ALL") {
    const response = await axiosInstance.get<AdminPaymentDetailResponse>(
      `/admin/payments/${paymentId}`,
      {
        params: {
          paymentType,
        },
      }
    );
    return response.data;
  }
}

export const paymentService = new PaymentService();



