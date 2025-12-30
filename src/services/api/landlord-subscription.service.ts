import type {
  CheckoutSubscriptionRequest,
  CheckoutSubscriptionResponse,
  GetLandlordSubscriptionHistoryRequest,
  ILandlordCurrentSubscriptionResponse,
  LandlordSubscriptionHistoryApiResponse,
  PurchaseSubscriptionRequest,
  PurchaseSubscriptionResponse,
  SwitchSubscriptionRequest,
  SwitchSubscriptionResponse,
  SyncSubscriptionPaymentResponse,
} from "@/pages/landlord/subscriptions/types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class LandlordSubscriptionService {
  private readonly BASE_PATH = "/landlord/subscriptions";

  /**
   * Lấy subscription hiện tại
   */
  async getCurrentSubscription() {
    const response =
      await axiosInstance.get<ILandlordCurrentSubscriptionResponse>(
        `${this.BASE_PATH}/current`
      );
    return response.data;
  }

  /**
   * Lấy lịch sử subscription
   */
  async getSubscriptionHistory(params?: GetLandlordSubscriptionHistoryRequest) {
    const response =
      await axiosInstance.get<LandlordSubscriptionHistoryApiResponse>(
        `${this.BASE_PATH}/history`,
        { params }
      );
    return response.data;
  }

  /**
   * Mua hoặc nâng cấp subscription
   * Lưu ý: Endpoint này có thể cần được tạo ở backend
   * Hiện tại, chúng ta tạo một placeholder có thể cập nhật khi API có sẵn
   */
  async purchaseSubscription(data: PurchaseSubscriptionRequest) {
    // TODO: Cập nhật endpoint này khi backend API có sẵn
    // Các endpoint có thể:
    // - POST /api/landlord/subscriptions/purchase
    // - POST /api/landlord/subscriptions/upgrade
    // - POST /api/payments/subscription (với planCode trong metadata)

    const response = await axiosInstance.post<
      ApiResponse<PurchaseSubscriptionResponse>
    >(`${this.BASE_PATH}/purchase`, data);
    return response.data;
  }

  /**
   * Chuyển đổi gói subscription
   * POST /api/landlord/subscriptions/switch
   */
  async switchSubscription(data: SwitchSubscriptionRequest) {
    const response = await axiosInstance.post<
      ApiResponse<SwitchSubscriptionResponse>
    >(`${this.BASE_PATH}/switch`, data);
    return response.data;
  }

  /**
   * Checkout subscription (mua subscription mới)
   * POST /api/landlord/subscriptions/checkout
   */
  async checkoutSubscription(data: CheckoutSubscriptionRequest) {
    const response = await axiosInstance.post<
      ApiResponse<CheckoutSubscriptionResponse>
    >(`${this.BASE_PATH}/checkout`, data);
    return response.data;
  }

  /**
   * Đồng bộ trạng thái thanh toán subscription từ nhà cung cấp
   * POST /api/landlord/subscriptions/payments/{paymentId}/sync
   */
  async syncSubscriptionPayment(paymentId: number) {
    const response = await axiosInstance.post<
      ApiResponse<SyncSubscriptionPaymentResponse>
    >(`${this.BASE_PATH}/payments/${paymentId}/sync`);
    return response.data;
  }
}

export const landlordSubscriptionService = new LandlordSubscriptionService();
