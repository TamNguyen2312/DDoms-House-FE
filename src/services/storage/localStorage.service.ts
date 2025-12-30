// src/services/storage/localStorage.service.ts
// import { User } from "@/store/types/store.types";

import type { User } from "@/store/types/store.types";

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const FAVORITES_KEY = "favorites";
const THEME_KEY = "theme";

class LocalStorageService {
  // Token methods
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Error setting token:", error);
    }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }

  // User methods
  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  setUser(user: User): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Error setting user:", error);
    }
  }

  removeUser(): void {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Error removing user:", error);
    }
  }

  // Favorites methods
  getFavorites(): string[] {
    try {
      const favoritesStr = localStorage.getItem(FAVORITES_KEY);
      if (!favoritesStr) return [];
      return JSON.parse(favoritesStr);
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  }

  setFavorites(favorites: string[]): void {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error setting favorites:", error);
    }
  }

  addFavorite(propertyId: string): void {
    try {
      const favorites = this.getFavorites();
      if (!favorites.includes(propertyId)) {
        favorites.push(propertyId);
        this.setFavorites(favorites);
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  }

  removeFavorite(propertyId: string): void {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter((id) => id !== propertyId);
      this.setFavorites(filtered);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  }

  isFavorite(propertyId: string): boolean {
    try {
      const favorites = this.getFavorites();
      return favorites.includes(propertyId);
    } catch (error) {
      console.error("Error checking favorite:", error);
      return false;
    }
  }

  // Theme methods
  getTheme(): "light" | "dark" | null {
    try {
      return localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    } catch (error) {
      console.error("Error getting theme:", error);
      return null;
    }
  }

  setTheme(theme: "light" | "dark"): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  }

  // Clear all data
  clearAll(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(FAVORITES_KEY);
      // Keep theme
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }

  // Generic methods
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  }
}

export const localStorageService = new LocalStorageService();
