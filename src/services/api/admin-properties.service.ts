import type {
  AdminPropertiesListResponse,
  AdminPropertyDetailResponse,
  GetAdminPropertiesRequest,
} from "@/pages/admin/properties/api-types";
import axiosInstance from "./axios.config";

class AdminPropertiesService {
  private readonly BASE_PATH = "/admin/properties";

  /**
   * Get paginated list of properties (Admin only)
   * GET /api/admin/properties?page=0&size=20&sort=createdAt&direction=DESC
   */
  async getProperties(params?: GetAdminPropertiesRequest) {
    const response = await axiosInstance.get<AdminPropertiesListResponse>(
      this.BASE_PATH,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          sort: params?.sort ?? "createdAt",
          direction: params?.direction ?? "DESC",
        },
      }
    );
    return response.data;
  }

  /**
   * Get property detail by ID (Admin only)
   * GET /api/admin/properties/{propertyId}
   */
  async getPropertyDetail(propertyId: number) {
    const response = await axiosInstance.get<AdminPropertyDetailResponse>(
      `${this.BASE_PATH}/${propertyId}`
    );
    return response.data;
  }
}

export const adminPropertiesService = new AdminPropertiesService();
