import type {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "@/services/api/auth.service";
import { authService } from "@/services/api/auth.service";
import { localStorageService } from "@/services/storage/localStorage.service";
import type { User } from "@/store/types/store.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
  checkEmail: (email: string) =>
    [...authKeys.all, "check-email", email] as const,
};

/**
 * Hook để lấy thông tin profile user hiện tại
 */
export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const response = await authService.getProfile();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!localStorageService.getToken(), // Chỉ fetch khi có token
  });
};

/**
 * Hook để check email có tồn tại không
 */
export const useCheckEmailExists = (email: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: authKeys.checkEmail(email),
    queryFn: async () => {
      const response = await authService.checkEmailExists(email);
      return response.data.data;
    },
    enabled: enabled && !!email && email.includes("@"), // Chỉ fetch khi email hợp lệ
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook để login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      console.log({ response });
      const { accessToken, refreshToken } = response.data.data || {};

      if (accessToken) {
        localStorageService.setToken(accessToken);
      }
      if (refreshToken) {
        localStorageService.setItem("refreshToken", refreshToken);
      }

      // Invalidate profile query để fetch lại user info
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

/**
 * Hook để register
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken } = response.data.data || {};

      if (accessToken) {
        localStorageService.setToken(accessToken);
      }
      if (refreshToken) {
        localStorageService.setItem("refreshToken", refreshToken);
      }

      // Invalidate profile query
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

/**
 * Hook để logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear tokens
      localStorageService.removeToken();
      localStorageService.removeItem("refreshToken");
      localStorageService.removeUser();

      // Clear all queries
      queryClient.clear();
    },
    onError: () => {
      // Vẫn clear local data ngay cả khi API call failed
      localStorageService.removeToken();
      localStorageService.removeItem("refreshToken");
      localStorageService.removeUser();
      queryClient.clear();
    },
  });
};

/**
 * Hook để update profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User>) => authService.updateProfile(data),
    onSuccess: (response) => {
      const updatedUser = response.data.data;

      // Update cache
      queryClient.setQueryData(authKeys.profile(), updatedUser);

      // Update localStorage
      localStorageService.setUser(updatedUser);
    },
  });
};

/**
 * Hook để change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      authService.changePassword(data),
  });
};

/**
 * Hook để forgot password (gửi email reset)
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
  });
};

/**
 * Hook để reset password với token
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authService.resetPassword(data),
  });
};

/**
 * Hook để verify email
 */
export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      // Invalidate profile để cập nhật trạng thái verified
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
};

/**
 * Hook để resend verification email
 */
export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: () => authService.resendVerificationEmail(),
  });
};

/**
 * Hook để refresh token
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken: string) =>
      authService.refreshToken(refreshToken),
    onSuccess: (response) => {
      const { accessToken, refreshToken } = response.data.data || {};

      if (accessToken) {
        localStorageService.setToken(accessToken);
      }
      if (refreshToken) {
        localStorageService.setItem("refreshToken", refreshToken);
      }
    },
  });
};
