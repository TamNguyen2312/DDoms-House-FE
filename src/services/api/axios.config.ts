// src/services/api/axios.config.ts
import { localStorageService } from "@/services/storage/localStorage.service";
import type { ErrorResponse } from "@/types/api.types";
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";

// API Base URL
// Production backend: https://api-ddoms.fptzone.site
// For local development, set VITE_API_BASE_URL=http://localhost:8085/api
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api-ddoms.fptzone.site/api";

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

async function refreshTokenRequest() {
  const refreshToken = localStorageService.getItem("refreshToken");

  // ✅ Kiểm tra có refreshToken không
  if (!refreshToken) {
    console.error("❌ No refresh token found in localStorage");
    throw new Error("No refresh token available");
  }

  return axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });
}

// Request interceptor - Add token to headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorageService.getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type for FormData
    if (config.data instanceof FormData) {
      // Remove Content-Type to let browser set it automatically with boundary
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log error in development
    if (import.meta.env.DEV) {
      console.error("❌ Error:", {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: originalRequest?.url,
      });
    }

    // ✅ KHÔNG refresh token cho các endpoint auth (login/register)
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // ✅ Kiểm tra có refreshToken không trước khi thử refresh
      const refreshToken = localStorageService.getItem("refreshToken");
      if (!refreshToken) {
        localStorageService.removeToken();
        localStorageService.removeUser();
        // Có thể redirect về trang login ở đây
        return Promise.reject(error);
      }

      // Nếu đang refresh → chờ token mới rồi retry
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers["Authorization"] = "Bearer " + newToken;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await refreshTokenRequest();
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorageService.setToken(accessToken);
        localStorageService.setItem("refreshToken", newRefreshToken);

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;

        isRefreshing = false;
        onTokenRefreshed(accessToken);

        // retry request cũ
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        console.error("❌ Refresh token failed:", refreshError);

        // Clear token để logout
        localStorageService.removeToken();
        localStorageService.removeUser();
        localStorageService.removeItem("refreshToken");

        // Có thể redirect về trang login
        // window.location.href = "/auth/login";

        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      // ✅ Kiểm tra có refreshToken không
      const refreshToken = localStorageService.getItem("refreshToken");
      if (!refreshToken) {
        return Promise.reject(error);
      }

      // Nếu đang refresh → chờ token mới rồi retry
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers["Authorization"] = "Bearer " + newToken;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await refreshTokenRequest();
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorageService.setToken(accessToken);
        localStorageService.setItem("refreshToken", newRefreshToken);

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;

        isRefreshing = false;
        onTokenRefreshed(accessToken);

        // retry request cũ
        originalRequest.headers["Authorization"] = "Bearer " + accessToken;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        // Clear token để logout
        localStorageService.removeToken();
        localStorageService.removeUser();
        localStorageService.removeItem("refreshToken");

        return Promise.reject(refreshError);
      }
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      toast.error("Không tìm thấy tài nguyên yêu cầu.");
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error("Lỗi máy chủ. Vui lòng thử lại sau.");
    }

    // Handle Network Error
    if (error.message === "Network Error") {
      toast.error(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
      );
    }

    // Handle Timeout
    if (error.code === "ECONNABORTED") {
      toast.error("Yêu cầu quá lâu. Vui lòng thử lại.");
    }

    return Promise.reject(error);
  }
);

// Export configured axios instance
export default axiosInstance;

// Export types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}
