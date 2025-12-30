import type {
  AdminUserDetailResponse,
  AdminUsersListResponse,
  GetAdminUsersRequest,
} from "@/pages/admin/users/api-types";
import axiosInstance from "./axios.config";

class AdminUsersService {
  private readonly BASE_PATH = "/admin/users";

  /**
   * Get paginated list of users (Admin only)
   * GET /api/admin/users?role=&searchTerm=&page=0&size=20&sort=createdAt&direction=DESC
   */
  async getUsers(params?: GetAdminUsersRequest) {
    const response = await axiosInstance.get<AdminUsersListResponse>(
      this.BASE_PATH,
      {
        params: {
          ...(params?.role && { role: params.role }),
          ...(params?.searchTerm && { searchTerm: params.searchTerm }),
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
   * Get user detail by ID (Admin only)
   * GET /api/admin/users/{userId}/detail
   */
  async getUserDetail(userId: number) {
    const response = await axiosInstance.get<AdminUserDetailResponse>(
      `${this.BASE_PATH}/${userId}/detail`
    );
    return response.data;
  }
}

export const adminUsersService = new AdminUsersService();
