import type { User } from "@/store/types/store.types";
// import axios from "axios";
import type { ApiResponse } from "./axios.config";
import axiosInstance from "./axios.config";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  phone: string;
  roleCode: "LANDLORD" | "TENANT";
}

export interface LoginResponse {
  // user: User;
  accessToken?: string;
  refreshToken?: string;
  roles?: string[];
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  accessToken: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class AuthService {
  private readonly BASE_PATH = "/auth";

  /**
   * Login user
   */
  async login(data: LoginRequest) {
    const dataQr = await axiosInstance.post<ApiResponse<LoginResponse>>(
      `${this.BASE_PATH}/login`,
      data
    );
    return dataQr;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest) {
    return axiosInstance.post<ApiResponse<LoginResponse>>(
      `${this.BASE_PATH}/register`,
      data
    );
  }

  /**
   * Logout user
   */
  async logout() {
    // return axiosInstance.post<ApiResponse<void>>(`${this.BASE_PATH}/logout`);
    return true;
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return axiosInstance.get<ApiResponse<User>>(`${this.BASE_PATH}/profile`);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>) {
    return axiosInstance.put<ApiResponse<User>>(
      `${this.BASE_PATH}/profile`,
      data
    );
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest) {
    return axiosInstance.post<ApiResponse<void>>(
      `${this.BASE_PATH}/change-password`,
      data
    );
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest) {
    return axiosInstance.post<ApiResponse<void>>(
      `${this.BASE_PATH}/forgot-password`,
      data
    );
  }

  /**
   * Reset password with accessToken
   */
  async resetPassword(data: ResetPasswordRequest) {
    return axiosInstance.post<ApiResponse<void>>(
      `${this.BASE_PATH}/reset-password`,
      data
    );
  }

  /**
   * Verify email
   */
  async verifyEmail(accessToken: string) {
    return axiosInstance.post<ApiResponse<void>>(
      `${this.BASE_PATH}/verify-email`,
      {
        accessToken,
      }
    );
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail() {
    return axiosInstance.post<ApiResponse<void>>(
      `${this.BASE_PATH}/resend-verification`
    );
  }

  /**
   * Refresh access accessToken
   */
  async refreshToken(refreshToken: string) {
    return axiosInstance.post<
      ApiResponse<{ accessToken: string; refreshToken: string }>
    >(`${this.BASE_PATH}/refresh`, { refreshToken });
  }

  /**
   * Check if email exists
   */
  async checkEmailExists(email: string) {
    return axiosInstance.get<ApiResponse<{ exists: boolean }>>(
      `${this.BASE_PATH}/check-email`,
      { params: { email } }
    );
  }
}

export const authService = new AuthService();
