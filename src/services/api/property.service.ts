import axiosInstance, { type ApiResponse } from "../api/axios.config";

// -----------------------------
// Types
// -----------------------------

export interface IProperty {
  id: string;
  name: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  status: "available" | "rented" | "maintenance";
  approved: boolean;
  landlordId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  search?: string;
  city?: string;
  district?: string;
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  roomType?: string;
  utilities?: string[];
  status?: "available" | "rented" | "maintenance";
  approved?: boolean;
  landlordId?: string;
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreatePropertyRequest {
  name: string;
  addressLine: string;
  ward: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  status?: "available" | "rented" | "maintenance";
}

// -----------------------------
// Service
// -----------------------------
class PropertyService {
  private readonly BASE_PATH = "/landlord/properties";

  async getAll(filters?: PropertyFilters) {
    const res = await axiosInstance.get<
      ApiResponse<{
        content: IProperty[];
        pagination: {
          currentPage: number;
          pageSize: number;
          totalPages: number;
          totalElements: number;
          hasNext: boolean;
          hasPrevious: boolean;
          first: boolean;
          last: boolean;
        };
        contentSize: number;
      }>
    >(this.BASE_PATH, {
      params: {
        page: filters?.page ?? 0,
        size: filters?.size ?? 10,
        sort: filters?.sort ?? "createdAt",
        direction: filters?.direction ?? "DESC",
        ...(filters?.search && { search: filters.search }),
        ...(filters?.city && { city: filters.city }),
        ...(filters?.district && { district: filters.district }),
        ...(filters?.ward && { ward: filters.ward }),
      },
    });
    // Return the nested data.data which contains content and pagination
    return res.data.data;
  }

  async getById(id: string) {
    const res = await axiosInstance.get<ApiResponse<IProperty>>(
      `${this.BASE_PATH}/${id}`
    );
    return res.data;
  }

  async create(data: CreatePropertyRequest) {
    const res = await axiosInstance.post<ApiResponse<IProperty>>(
      this.BASE_PATH,
      data
    );
    return res.data;
  }

  async update(id: string, data: UpdatePropertyRequest) {
    const res = await axiosInstance.put<ApiResponse<IProperty>>(
      `${this.BASE_PATH}/${id}`,
      data
    );
    return res.data;
  }

  async delete(id: string) {
    const res = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/${id}`
    );
    return res.data;
  }

  /**
   * Add media to property
   * POST /api/landlord/properties/{property_id}/media?fileId={file_id}
   */
  async addMedia(propertyId: string, fileId: number) {
    const res = await axiosInstance.post<ApiResponse<any>>(
      `${this.BASE_PATH}/${propertyId}/media`,
      null,
      {
        params: { fileId },
      }
    );
    return res.data;
  }

  /**
   * List property media
   * GET /api/landlord/properties/{property_id}/media
   */
  async getMedia(propertyId: string) {
    const res = await axiosInstance.get<ApiResponse<any[]>>(
      `${this.BASE_PATH}/${propertyId}/media`
    );
    return res.data;
  }

  /**
   * Remove property media
   * DELETE /api/landlord/properties/{property_id}/media/{media_id}
   */
  async removeMedia(propertyId: string, mediaId: number) {
    const res = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/${propertyId}/media/${mediaId}`
    );
    return res.data;
  }

  /**
   * Get public property media
   * GET /api/public/properties/{property_id}/media
   */
  async getPublicMedia(propertyId: string) {
    const res = await axiosInstance.get<ApiResponse<any[]>>(
      `/public/properties/${propertyId}/media`
    );
    return res.data;
  }
}

export const propertyService = new PropertyService();
