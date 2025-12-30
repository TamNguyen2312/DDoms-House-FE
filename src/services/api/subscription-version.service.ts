import type {
  CreateVersionRequest,
  IVersion,
  PaginatedVersionsResponse,
  PaginationParams,
  SetVersionFeaturesRequest,
  VersionsResponse,
} from "@/pages/admin/pricing-plans/types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class SubscriptionVersionService {
  private readonly BASE_PATH = "/admin/subscriptions/versions";

  /**
   * Create a new version
   */
  async createVersion(data: CreateVersionRequest) {
    const response = await axiosInstance.post<ApiResponse<IVersion>>(
      this.BASE_PATH,
      data
    );
    return response.data;
  }

  /**
   * Set version features
   */
  async setVersionFeatures(versionId: number, data: SetVersionFeaturesRequest) {
    const response = await axiosInstance.put<ApiResponse<IVersion>>(
      `${this.BASE_PATH}/${versionId}/features`,
      data
    );
    return response.data;
  }

  /**
   * Publish a version
   */
  async publishVersion(versionId: number) {
    const response = await axiosInstance.post<ApiResponse<IVersion>>(
      `${this.BASE_PATH}/${versionId}/publish`
    );
    return response.data;
  }

  /**
   * Get all versions for a plan
   */
  async getPlanVersions(planCode: string) {
    const response = await axiosInstance.get<VersionsResponse>(
      `/admin/subscriptions/plans/${planCode}/versions`
    );
    return response.data?.data;
  }

  /**
   * Get paginated versions for a plan
   */
  async getPlanVersionsPageable(planCode: string, params?: PaginationParams) {
    const response = await axiosInstance.get<PaginatedVersionsResponse>(
      `/admin/subscriptions/plans/${planCode}/versions/pageable`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          ...(params?.sort && { sort: params.sort }),
          ...(params?.direction && { direction: params.direction }),
          ...(params?.search && { search: params.search }),
        },
      }
    );
    return response.data?.data;
  }
}

export const subscriptionVersionService = new SubscriptionVersionService();
