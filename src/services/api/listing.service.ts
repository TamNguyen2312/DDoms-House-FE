import type {
  GetListingsRequest,
  ListingsResponse,
} from "@/pages/admin/listings/types";
import qs from "qs";
import axiosInstance, { type ApiResponse } from "./axios.config";
// class ListingService {
//   private readonly BASE_PATH = "/admin/listings";
export interface ICreateListingResponse {
  id: number;
  unitId: number;
  landlordId: number;
  title: string;
  description: string;
  listedPrice: number;
  isPublic: false;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface IGetListingResponse {
  id: number;
  listingId?: number; // For backward compatibility
  landlord: {
    id: number;
    displayName: string | null;
    email: string;
    phone: string;
    verified: boolean | null;
    kycStatus: string | null;
  };
  property: {
    id: number;
    name: string;
    addressLine: string;
    ward: string;
    district: string | null;
    city: string;
    latitude: number;
    longitude: number;
    documentsVerified: boolean;
    createdAt: string;
  };
  unit: {
    id: number;
    propertyId: number;
    code: string;
    areaSqM: number;
    bedrooms: number;
    bathrooms: number;
    baseRent: number;
    status: string | null;
    ward?: string;
    furnishings?: Array<{
      id: number;
      unitId: number;
      name: string;
      furnishingCategory: string;
      quantity: number;
      itemCondition: string;
      note?: string;
    }>;
  };
  title: string;
  description: string;
  listedPrice: number;
  propertyName?: string; // Optional for backward compatibility
  addressLine?: string; // Optional for backward compatibility
  ward?: string; // Optional for backward compatibility
  district?: string | null; // Optional for backward compatibility
  city?: string; // Optional for backward compatibility
  areaSqM?: number; // Optional for backward compatibility
  bedrooms?: number; // Optional for backward compatibility
  bathrooms?: number; // Optional for backward compatibility
  isPublic?: boolean;
  status?: string;
  expiredAt?: string;
  updatedAt?: string;
  createdAt: string;
  media: ListingMediaItem[];
}

export interface IAdminListingDetailResponse {
  id: number;
  landlord: {
    id: number;
    displayName: string | null;
    email: string;
    phone: string;
    verified: boolean | null;
    kycStatus: string | null;
  };
  property: {
    id: number;
    name: string;
    addressLine: string;
    ward: string;
    district: string | null;
    city: string;
    latitude: number;
    longitude: number;
    documentsVerified: boolean;
    createdAt: string;
  };
  unit: {
    id: number;
    propertyId: number;
    code: string;
    areaSqM: number;
    bedrooms: number;
    bathrooms: number;
    baseRent: number;
    status: string;
  };
  title: string;
  description: string;
  listedPrice: number;
  isPublic: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  media: ListingMediaItem[];
}

export interface ListingPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface ListingPublicResponse {
  success: boolean;
  message: string;
  status: string;
  content: IGetListingResponse[];
  pagination: ListingPagination;
  contentSize: number;
}
export interface ListingRequest {
  title: string;
  description: string;
  listedPrice: number;
}
export interface ListingWithMediaRequest {
  title: string;
  description: string;
  listedPrice: number;
  fileIds: number[];
}

export interface ListingMediaItem {
  id: number;
  ownerType: string;
  ownerId: number;
  fileId: number;
  sortOrder: number;
  filePath: string;
  thumbnailUrl: string;
  mimeType: string;
  sizeBytes: number;
}
export interface ListingUpdateResponse {
  id: number;
  unitId: number;
  landlordId: number;
  title: string;
  description: string;
  listedPrice: number;
  isPublic: true;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface ListingUpdateRequest {
  id: number;
  unitId: number;
  landlordId: number;
  title: string;
  description: string;
  listedPrice: number;
  isPublic: true;
  status: string;
  createdAt: string;
  updatedAt: string;
}
export interface SearchListingsRequest {
  city?: string;
  ward?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  utilityCodes?: string | string[];
  keyword?: string; // Search keyword for title, description, address, etc.
  page?: number;
  size?: number;
  sort?: string;
  furnishingCategories?: string[];
  direction?: "ASC" | "DESC";
}
class ListingService {
  private readonly BASE_PATH_UNIT = "/landlord/units";
  private readonly BASE_PATH = "/listings";
  private readonly BASE_PATH_LISTING = "/admin/listings";
  private readonly BASE_PATH_LANDLORD_LISTING = "/landlord/listings";
  /**
   * Get all listings with filters and pagination (Admin only)
   */
  async getListings(params?: GetListingsRequest) {
    // API returns ListingsResponse directly (not wrapped in ApiResponse)
    const res = await axiosInstance.get<ApiResponse<ListingsResponse>>(
      `${this.BASE_PATH_LISTING}`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "createdAt",
          direction: params?.direction ?? "DESC",
          ...(params?.status && { status: params.status }),
        },
      }
    );
    return res.data;
  }
  /**
   * Get all listings with filters and pagination (Landlord only)
   */
  async getMyListings(params?: GetListingsRequest) {
    // API returns nested structure: ApiResponse<ListingsResponse>
    const response = await axiosInstance.get<ApiResponse<ListingsResponse>>(
      `${this.BASE_PATH_LANDLORD_LISTING}`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "createdAt",
          direction: params?.direction ?? "DESC",
          ...(params?.status && { status: params.status }),
        },
      }
    );
    // Return the nested data.data which contains content and pagination
    return response.data.data;
  }
  async create(id: string, data: ListingRequest) {
    const res = await axiosInstance.post<ApiResponse<ICreateListingResponse>>(
      `${this.BASE_PATH_UNIT}/${id}/listings`,
      data
    );
    return res;
  }
  async createWithMedia(id: string, data: ListingWithMediaRequest) {
    const apiUrl = `${this.BASE_PATH_UNIT}/${id}/listings-with-media`;

    const res = await axiosInstance.post<ApiResponse<ICreateListingResponse>>(
      apiUrl,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return res;
  }
  //getPublic
  async getListingPublic(params?: { page?: number; size?: number }) {
    const res = await axiosInstance.get<ListingPublicResponse>(
      `${this.BASE_PATH}`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 15,
          sort: "createdAt",
          direction: "DESC",
        },
      }
    );
    return res.data;
  }
  async searchListings(params?: SearchListingsRequest) {
    const res = await axiosInstance.get<ListingPublicResponse>(
      `${this.BASE_PATH}`,
      {
        params: {
          ...(params?.city && { city: params.city }),
          ...(params?.ward && { ward: params.ward }),
          ...(params?.minPrice && { minPrice: params.minPrice }),
          ...(params?.maxPrice && { maxPrice: params.maxPrice }),
          ...(params?.bedrooms && { bedrooms: params.bedrooms }),
          ...(params?.furnishingCategories && {
            furnishingCategories: params.furnishingCategories, // <-- mảng
          }),
          ...(params?.utilityCodes && {
            utilityCodes: Array.isArray(params.utilityCodes)
              ? params.utilityCodes
              : [params.utilityCodes],
          }),
          ...(params?.keyword && { keyword: params.keyword }),
          page: params?.page ?? 0,
          size: params?.size ?? 15,
          sort: params?.sort ?? "createdAt",
          direction: params?.direction ?? "DESC",
        },
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: "repeat" }),
      }
    );

    return res.data;
  }
  //getPublic
  async getListingDetail(id: string) {
    const res = await axiosInstance.get<ApiResponse<IGetListingResponse>>(
      `${this.BASE_PATH}/${id}`
    );
    return res.data;
  }

  /**
   * Get listing detail for landlord
   * GET /api/landlord/listings/{listingId}
   */
  async getLandlordListingDetail(listingId: string) {
    const res = await axiosInstance.get<
      ApiResponse<IAdminListingDetailResponse>
    >(`${this.BASE_PATH_LANDLORD_LISTING}/${listingId}`);
    return res.data;
  }
  //getListingMedia
  async getListingMedia(listingId: string) {
    const res = await axiosInstance.get<ApiResponse<ListingMediaItem[]>>(
      `${this.BASE_PATH}/${listingId}/media`
    );
    return res.data;
  }

  /**
   * Add media to listing (Landlord)
   * POST /api/landlord/listings/{listing_id}/media?fileId={file_id}
   */
  async addListingMedia(listingId: string, fileId: number) {
    const res = await axiosInstance.post<ApiResponse<any>>(
      `${this.BASE_PATH_LANDLORD_LISTING}/${listingId}/media`,
      null,
      {
        params: { fileId },
      }
    );
    return res.data;
  }

  /**
   * List listing media (Landlord)
   * GET /api/landlord/listings/{listing_id}/media
   */
  async getLandlordListingMedia(listingId: string) {
    const res = await axiosInstance.get<ApiResponse<ListingMediaItem[]>>(
      `${this.BASE_PATH_LANDLORD_LISTING}/${listingId}/media`
    );
    return res.data;
  }

  /**
   * Remove listing media (Landlord)
   * DELETE /api/landlord/listings/{listing_id}/media/{media_id}
   */
  async removeListingMedia(listingId: string, mediaId: number) {
    const res = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH_LANDLORD_LISTING}/${listingId}/media/${mediaId}`
    );
    return res.data;
  }

  /**
   * Get public listing media
   * GET /api/public/listings/{listing_id}/media
   */
  async getPublicListingMedia(listingId: string) {
    const res = await axiosInstance.get<ApiResponse<ListingMediaItem[]>>(
      `/public/listings/${listingId}/media`
    );
    return res.data;
  }

  //update status (admin)
  async updateStatus(id: number, data: ListingUpdateRequest) {
    const res = await axiosInstance.post<ApiResponse<ListingUpdateResponse>>(
      `${this.BASE_PATH_LISTING}/${id}/moderate`,
      data
    );
    return res;
  }

  /**
   * Get listing detail for admin
   * GET /api/admin/listings/{listing_id}
   */
  async getAdminListingDetail(listingId: number) {
    const response = await axiosInstance.get<
      ApiResponse<IAdminListingDetailResponse>
    >(`${this.BASE_PATH_LISTING}/${listingId}`);
    return response.data;
  }
}

export const listingService = new ListingService();
