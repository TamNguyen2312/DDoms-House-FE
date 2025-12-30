import axiosInstance, { type ApiResponse } from "./axios.config";

export interface AddFavoriteRequest {
  unitId: number;
}

export interface Favorite {
  id: number;
  tenantId: number;
  unitId: number;
  createdAt: string;
  updatedAt: string;
}

class FavoritesService {
  private readonly BASE_PATH = "/tenant/favorites";

  /**
   * Add a unit to favorites
   * POST /api/tenant/favorites
   * Idempotent: if already exists, no error is returned
   */
  async addFavorite(data: AddFavoriteRequest) {
    const response = await axiosInstance.post<ApiResponse<Favorite>>(
      this.BASE_PATH,
      data
    );
    return response.data;
  }

  /**
   * Remove a unit from favorites
   * DELETE /api/tenant/favorites/{unitId}
   */
  async removeFavorite(unitId: number) {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/${unitId}`
    );
    return response.data;
  }

  /**
   * Get all favorites for current tenant
   * GET /api/tenant/favorites
   */
  async getFavorites() {
    const response = await axiosInstance.get<ApiResponse<Favorite[]>>(
      this.BASE_PATH
    );
    return response.data;
  }

  /**
   * Check if a unit is in favorites
   * GET /api/tenant/favorites/{unitId}
   */
  async isFavorite(unitId: number) {
    const response = await axiosInstance.get<ApiResponse<Favorite>>(
      `${this.BASE_PATH}/${unitId}`
    );
    return response.data;
  }
}

export const favoritesService = new FavoritesService();



