import type { IUserProfile, IUserProfileResponse } from "@/pages/admin/users/types";
import axiosInstance from "./axios.config";

class UserProfileService {
  private readonly BASE_PATH = "/users";

  /**
   * Get user profile by ID
   */
  async getUserProfileById(userId: number) {
    const response = await axiosInstance.get<IUserProfileResponse>(
      `${this.BASE_PATH}/${userId}`
    );
    return response.data;
  }
}

export const userProfileService = new UserProfileService();

