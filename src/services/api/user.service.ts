// src/services/api/user.service.ts
// import { User } from "@/store/types/store.types";
// import axios, { ApiResponse, PaginatedResponse } from "./axios.config";

import type { User } from "@/store/types/store.types";
import type { ApiResponse, PaginatedResponse } from "./axios.config";
import axiosInstance from "./axios.config";

export interface UserFilters {
  search?: string;
  role?: "admin" | "landlord" | "tenant";
  status?: "active" | "inactive" | "banned";
  verified?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  address?: string;
}

export interface UpdateUserStatusRequest {
  status: "active" | "inactive" | "banned";
  reason?: string;
}

class UserService {
  private readonly BASE_PATH = "/users";
  private readonly BASE_AUTH_PATH = "/auth";

  /**
   * Get all users with filters (Admin only)
   */
  async getAll(filters?: UserFilters) {
    return axiosInstance.get<ApiResponse<PaginatedResponse<User>>>(
      this.BASE_PATH,
      {
        params: filters,
      }
    );
  }

  /**
   * Get me
   */
  async getMe() {
    return axiosInstance.get<ApiResponse<User>>(`${this.BASE_AUTH_PATH}/me`);
  }

  /**
   * Get user by ID
   */
  async getById(id: string) {
    return axiosInstance.get<ApiResponse<User>>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserRequest) {
    return axiosInstance.put<ApiResponse<User>>(
      `${this.BASE_PATH}/${id}`,
      data
    );
  }

  /**
   * Delete user (Admin only)
   */
  async delete(id: string) {
    return axiosInstance.delete<ApiResponse<void>>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Get landlords
   */
  async getLandlords(filters?: UserFilters) {
    return axiosInstance.get<ApiResponse<PaginatedResponse<User>>>(
      `${this.BASE_PATH}/landlords`,
      { params: filters }
    );
  }

  /**
   * Get tenants
   */
  async getTenants(filters?: UserFilters) {
    return axiosInstance.get<ApiResponse<PaginatedResponse<User>>>(
      `${this.BASE_PATH}/tenants`,
      { params: filters }
    );
  }

  /**
   * Get my tenants (for landlord)
   */
  async getMyTenants(filters?: UserFilters) {
    return axiosInstance.get<ApiResponse<PaginatedResponse<User>>>(
      `${this.BASE_PATH}/my-tenants`,
      { params: filters }
    );
  }

  /**
   * Update user status (Admin only)
   */
  async updateStatus(id: string, data: UpdateUserStatusRequest) {
    return axiosInstance.patch<ApiResponse<User>>(
      `${this.BASE_PATH}/${id}/status`,
      data
    );
  }

  /**
   * Ban user (Admin only)
   */
  async ban(id: string, reason: string) {
    return axiosInstance.post<ApiResponse<User>>(
      `${this.BASE_PATH}/${id}/ban`,
      {
        reason,
      }
    );
  }

  /**
   * Unban user (Admin only)
   */
  async unban(id: string) {
    return axiosInstance.post<ApiResponse<User>>(
      `${this.BASE_PATH}/${id}/unban`
    );
  }

  /**
   * Verify user (Admin only)
   */
  async verify(id: string) {
    return axiosInstance.post<ApiResponse<User>>(
      `${this.BASE_PATH}/${id}/verify`
    );
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);

    return axiosInstance.post<ApiResponse<{ avatar: string }>>(
      `${this.BASE_PATH}/upload-avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  /**
   * Get user statistics (Admin only)
   */
  async getStatistics() {
    return axiosInstance.get<
      ApiResponse<{
        total: number;
        landlords: number;
        tenants: number;
        admins: number;
        active: number;
        inactive: number;
        banned: number;
        verified: number;
      }>
    >(`${this.BASE_PATH}/statistics`);
  }

  /**
   * Search users
   */
  async search(query: string, filters?: UserFilters) {
    return axiosInstance.get<ApiResponse<PaginatedResponse<User>>>(
      `${this.BASE_PATH}/search`,
      {
        params: { q: query, ...filters },
      }
    );
  }
}

export const userService = new UserService();
