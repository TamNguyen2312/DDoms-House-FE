import type {
  CreateFeatureRequest,
  FeaturesResponse,
  IFeature,
  PaginatedFeaturesResponse,
  PaginationParams,
} from "@/pages/admin/pricing-plans/types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class SubscriptionFeatureService {
  private readonly BASE_PATH = "/admin/subscriptions/features";

  /**
   * Create a new feature
   */
  async createFeature(data: CreateFeatureRequest) {
    const response = await axiosInstance.post<ApiResponse<IFeature>>(
      this.BASE_PATH,
      data
    );
    return response.data;
  }

  /**
   * Delete a feature by code
   */
  async deleteFeature(featureCode: string) {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/${featureCode}`
    );
    return response.data;
  }

  /**
   * Get all features
   */
  async getAllFeatures() {
    const response = await axiosInstance.get<FeaturesResponse>(this.BASE_PATH);
    return response.data?.data;
  }

  /**
   * Get paginated features
   */
  async getFeaturesPageable(params?: PaginationParams) {
    const response = await axiosInstance.get<PaginatedFeaturesResponse>(
      `${this.BASE_PATH}/pageable`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          sort: params?.sort ?? "code",
          direction: params?.direction ?? "ASC",
          ...(params?.search && { search: params.search }),
        },
      }
    );
    return response.data?.data;
  }
}

export const subscriptionFeatureService = new SubscriptionFeatureService();
