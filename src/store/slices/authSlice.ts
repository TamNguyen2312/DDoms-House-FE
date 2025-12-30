import { authService } from "@/services/api/auth.service";
import { userService } from "@/services/api/user.service";
import { localStorageService } from "@/services/storage/localStorage.service";
import type { StateCreator } from "zustand";
import type {
  AuthActions,
  AuthState,
  RegisterData,
} from "../types/store.types";

export interface AuthSlice extends AuthState, AuthActions {}

// Khởi tạo state từ localStorage
const getInitialState = (): AuthState => {
  try {
    const token = localStorageService.getToken();
    const user = localStorageService.getUser();

    return {
      user: user,
      accessToken: token,
      isAuthenticated: !!(token && user),
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("❌ Error getting initial state:", error);
    return {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }
};

const initialState: AuthState = getInitialState();

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  ...initialState,

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.login({ username, password });
      // Lấy accessToken từ response.data.data (theo cấu trúc API)
      const loginData = response.data?.data || {};
      const { accessToken, refreshToken, roles } = loginData;

      if (!accessToken) {
        console.error("❌ No accessToken in response:", loginData);
        throw new Error("Không nhận được access token từ server");
      }

      // Lưu refreshToken nếu có
      if (refreshToken && roles && roles?.length > 0) {
        localStorageService.setItem("accessToken", accessToken);
        localStorageService.setItem("refreshToken", refreshToken);
        localStorageService.setItem("roles", roles[0]);
      }

      // Fetch user info
      const userQr = await userService.getMe();

      const user = userQr.data?.data;

      if (!user) {
        console.error("❌ No user data in response:", userQr);
        throw new Error("Không nhận được thông tin user từ server");
      }

      // Lưu vào localStorage TRƯỚC khi set vào Zustand
      localStorageService.setToken(accessToken as string);
      localStorageService.setUser(user);

      // Set vào Zustand
      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      console.error("❌ Login error:", error);
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : error instanceof Error
          ? error.message
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin";

      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.register(data);
      const { accessToken, refreshToken } = response.data.data || {};

      if (!accessToken) {
        throw new Error("Không nhận được access token từ server");
      }
      if (refreshToken) {
        localStorageService.setItem("refreshToken", refreshToken);
      }

      // Fetch user info
      const userQr = await userService.getMe();
      const user = userQr.data.data;

      if (!user) {
        throw new Error("Không nhận được thông tin user từ server");
      }

      localStorageService.setToken(accessToken as string);
      localStorageService.setUser(user);

      set({
        user,
        accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      const currentState = get();
    } catch (error: unknown) {
      console.error("❌ Register error:", error);
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : error instanceof Error
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại";

      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorageService.removeToken();
    localStorageService.removeUser();
    localStorageService.removeItem("refreshToken");

    // Clear sessionStorage flags for promotion dialog
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("landlord_just_logged_in");
      sessionStorage.removeItem("landlord_first_visit_shown");
    }

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      error: null,
    });
  },

  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.updateProfile(data);
      const updatedUser = response.data.data;

      localStorageService.setUser(updatedUser);

      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Cập nhật thất bại";

      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  setToken: (accessToken) => {
    set({ accessToken, isAuthenticated: !!accessToken });
  },

  // Action để khởi tạo auth từ localStorage
  initializeAuth: (user, accessToken) => {
    set({
      user,
      accessToken,
      isAuthenticated: !!(user && accessToken),
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
});
