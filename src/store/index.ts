// src/store/index.ts
import { localStorageService } from "@/services/storage/localStorage.service";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { createAuthSlice, type AuthSlice } from "./slices/authSlice";

// Combined store type
export type StoreState = AuthSlice;

// Create the main store
export const useStore = create<StoreState>()(
  devtools(
    (...args) => {
      const slice = createAuthSlice(...args);
      return slice;
    },
    {
      name: "PhongTroStore",
      enabled: import.meta.env.DEV,
    }
  )
);

// Selectors for better performance - Sử dụng useShallow để tránh re-render vô hạn
export const useAuth = () => {
  return useStore(
    useShallow((state) => ({
      user: state.user,
      accessToken: state.accessToken,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      register: state.register,
      logout: state.logout,
      updateProfile: state.updateProfile,
      setUser: state.setUser,
      setToken: state.setToken,
      initializeAuth: state.initializeAuth,
      clearError: state.clearError,
    }))
  );
};

// Individual selectors for better performance
export const useAuthUser = () => useStore((state) => state.user);
export const useAuthToken = () => useStore((state) => state.accessToken);
export const useIsAuthenticated = () =>
  useStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useStore((state) => state.isLoading);
export const useAuthError = () => useStore((state) => state.error);
export const useAuthActions = () => {
  return useStore(
    useShallow((state) => ({
      login: state.login,
      register: state.register,
      logout: state.logout,
      updateProfile: state.updateProfile,
      setUser: state.setUser,
      setToken: state.setToken,
      initializeAuth: state.initializeAuth,
      clearError: state.clearError,
    }))
  );
};

// Initialize store on app load
export const initializeStore = () => {
  try {
    const token = localStorageService.getToken();
    const user = localStorageService.getUser();

    if (token && user) {
      const state = useStore.getState();
      state.initializeAuth(user, token);

      // Verify state đã được set
      const updatedState = useStore.getState();

      // Double check - nếu vẫn không có, thử set lại
      if (!updatedState.user || !updatedState.accessToken) {
        useStore.setState({
          user,
          accessToken: token,
          isAuthenticated: true,
        });
      }
    } else {
      const state = useStore.getState();
      if (state.user || state.accessToken) {
        state.logout();
      }
    }
  } catch (error) {
    console.error("❌ Error initializing store:", error);
    useStore.getState().logout();
  }
};
