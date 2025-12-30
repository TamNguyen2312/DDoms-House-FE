import type {
  ITenantProfile,
  ITenantProfileResponse,
  IUpdateTenantProfileRequest,
  IUpdateTenantProfileResponse,
} from "@/pages/tenant/profile/types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class TenantProfileService {
  private readonly BASE_PATH = "/tenant/profile";

  /**
   * Get tenant profile
   */
  async getTenantProfile() {
    const response = await axiosInstance.get<ITenantProfileResponse>(
      this.BASE_PATH
    );
    return response.data;
  }

  /**
   * Update tenant profile
   */
  async updateTenantProfile(data: IUpdateTenantProfileRequest) {
    const response = await axiosInstance.put<IUpdateTenantProfileResponse>(
      this.BASE_PATH,
      data
    );
    return response.data;
  }
}

export const tenantProfileService = new TenantProfileService();

