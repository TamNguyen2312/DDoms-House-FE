import type {
  GetSubscriptionsRequest,
  SubscriptionDetailResponse,
  SubscriptionStatsResponse,
  SubscriptionsResponse,
} from "@/pages/admin/subscriptions/types";
import axiosInstance from "./axios.config";

class SubscriptionManagementService {
  private readonly BASE_PATH = "/admin/subscriptions/management";

  /**
   * Get paginated subscriptions list
   */
  async getSubscriptions(params?: GetSubscriptionsRequest) {
    const response = await axiosInstance.get<SubscriptionsResponse>(
      this.BASE_PATH,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          sort: params?.sort ?? "startedAt",
          direction: params?.direction ?? "DESC",
          ...(params?.search && { search: params.search }),
          ...(params?.status && { status: params.status }),
          ...(params?.planId && { planId: params.planId }),
        },
      }
    );
    return response.data;
  }

  /**
   * Get subscription detail by ID
   */
  async getSubscriptionById(subscriptionId: number) {
    const response = await axiosInstance.get<SubscriptionDetailResponse>(
      `${this.BASE_PATH}/${subscriptionId}`
    );
    return response.data;
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats() {
    const response = await axiosInstance.get<SubscriptionStatsResponse>(
      `${this.BASE_PATH}/stats`
    );
    return response.data;
  }
}

export const subscriptionManagementService =
  new SubscriptionManagementService();
