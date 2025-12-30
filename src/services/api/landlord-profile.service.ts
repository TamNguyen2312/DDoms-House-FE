import type {
  ILandlordProfile,
  ILandlordProfileResponse,
  IUpdateLandlordProfileRequest,
  IUpdateLandlordProfileResponse,
} from "@/pages/landlord/profile/types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class LandlordProfileService {
  private readonly BASE_PATH = "/landlord/profile";

  /**
   * Get landlord profile
   */
  async getLandlordProfile() {
    const response = await axiosInstance.get<ILandlordProfileResponse>(
      this.BASE_PATH
    );
    return response.data;
  }

  /**
   * Update landlord profile
   */
  async updateLandlordProfile(data: IUpdateLandlordProfileRequest) {
    const response = await axiosInstance.put<IUpdateLandlordProfileResponse>(
      this.BASE_PATH,
      data
    );
    return response.data;
  }
}

export const landlordProfileService = new LandlordProfileService();

