import axiosInstance, { type ApiResponse } from "../api/axios.config";

// -----------------------------
// Types
// -----------------------------

export interface IUnit {
  code: string;
  areaSqM: number;
  bedrooms: number;
  bathrooms: number;
  baseRent: number;
  id?: number;
  propertyId?: number;
  status?: string;
}

export interface CreateUnitRequest {
  code: string;
  areaSqM: number;
  bedrooms: number;
  bathrooms: number;
  baseRent: number;
}

export interface GetUnitsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
}

// Furnishings Types
export type FurnishingCategory =
  | "BED"
  | "MATTRESS"
  | "WARDROBE"
  | "VANITY_TABLE"
  | "TABLE"
  | "CHAIR"
  | "DESK"
  | "SOFA"
  | "BOOKSHELF"
  | "FRIDGE"
  | "AIR_CON"
  | "FAN"
  | "TV"
  | "WIFI"
  | "STOVE"
  | "WATER_HEATER"
  | "WASHING_MACHINE"
  | "OTHER";

export type ItemCondition = "GOOD" | "FAIR" | "POOR" | "NEW" | "OLD";

export interface IFurnishing {
  id: number;
  unitId: number;
  name: string;
  category: FurnishingCategory;
  quantity: number;
  itemCondition: ItemCondition;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFurnishingRequest {
  name: string;
  category: FurnishingCategory;
  quantity: number;
  itemCondition: ItemCondition;
  note?: string;
}

export interface UpdateFurnishingRequest {
  name: string;
  category: FurnishingCategory;
  quantity: number;
  itemCondition: ItemCondition;
  note?: string;
}

export interface BatchFurnishingRequest {
  items: CreateFurnishingRequest[];
}

// Unit Invoices Types
export interface UnitInvoice {
  invoiceId: number;
  type: "CONTRACT" | "SERVICE";
  unitId: number;
  contractId: number;
  cycleMonth: string;
  status: "DRAFT" | "ISSUED" | "PAID" | "OVERDUE" | "CANCELLED";
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  issuedAt: string;
  dueAt: string;
  createdAt: string | null;
  isPrerequisite: boolean;
}

export interface UnitInvoicesResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    success: boolean;
    message: string;
    status: string;
    content: UnitInvoice[];
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
  };
}

// Unit Contracts Types
export interface UnitContract {
  contractId: number;
  unitId: number;
  landlord: {
    userId: number;
    displayName: string;
    email: string;
    phone: string;
  };
  tenant: {
    userId: number;
    displayName: string;
    email: string;
    phone: string;
  };
  startDate: string;
  endDate: string;
  pendingEndDate: string | null;
  status: string;
  depositAmount: number;
  createdAt: string;
}

export interface UnitContractsResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    success: boolean;
    message: string;
    status: string;
    content: UnitContract[];
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
  };
}

export interface GetUnitInvoicesRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  search?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  type?: string;
}

export interface GetUnitContractsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  status?: string;
}

// -----------------------------
// Service
// -----------------------------
class UnitService {
  private readonly BASE_PATH = "/landlord/properties";
  private readonly BASE_PATH_UNIT = "/landlord/units";

  async getByProperty(id: string, params?: GetUnitsRequest) {
    const res = await axiosInstance.get<
      ApiResponse<{
        content: IUnit[];
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
    >(`${this.BASE_PATH}/${id}/units`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        ...(params?.sort && { sort: params.sort }),
        ...(params?.direction && { direction: params.direction }),
      },
    });
    // Return the nested data.data which contains content and pagination
    return res.data.data;
  }
  async getUnit(id: string) {
    const res = await axiosInstance.get<ApiResponse<IUnit>>(
      `${this.BASE_PATH_UNIT}/${id}`
    );
    return res.data.data;
  }

  async getUnitsByProperty(id: string) {
    const res = await axiosInstance.get<ApiResponse<IUnit>>(
      `${this.BASE_PATH}/${id}/units`
    );
    return res.data.data;
  }

  async create(propertyId: string, data: CreateUnitRequest) {
    const res = await axiosInstance.post<ApiResponse<IUnit>>(
      this.BASE_PATH + "/" + propertyId + "/units",
      data
    );
    return res.data;
  }

  /**
   * Add media to unit
   * POST /api/landlord/units/{unit_id}/media?fileId={file_id}
   */
  async addMedia(unitId: string, fileId: number) {
    const res = await axiosInstance.post<ApiResponse<any>>(
      `${this.BASE_PATH_UNIT}/${unitId}/media`,
      null,
      {
        params: { fileId },
      }
    );
    return res.data;
  }

  /**
   * List unit media
   * GET /api/landlord/units/{unit_id}/media
   */
  async getMedia(unitId: string) {
    const res = await axiosInstance.get<ApiResponse<any[]>>(
      `${this.BASE_PATH_UNIT}/${unitId}/media`
    );
    return res.data;
  }

  /**
   * Remove unit media
   * DELETE /api/landlord/units/{unit_id}/media/{media_id}
   */
  async removeMedia(unitId: string, mediaId: number) {
    const res = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH_UNIT}/${unitId}/media/${mediaId}`
    );
    return res.data;
  }

  /**
   * Get public unit media
   * GET /api/public/units/{unit_id}/media
   */
  async getPublicMedia(unitId: string) {
    const res = await axiosInstance.get<ApiResponse<any[]>>(
      `/public/units/${unitId}/media`
    );
    return res.data;
  }

  // -----------------------------
  // Furnishings Methods
  // -----------------------------

  /**
   * List unit furnishings
   * GET /api/landlord/units/{unit_id}/furnishings
   */
  async getFurnishings(unitId: string) {
    const res = await axiosInstance.get<ApiResponse<IFurnishing[]>>(
      `${this.BASE_PATH_UNIT}/${unitId}/furnishings`
    );
    return res.data.data;
  }

  /**
   * Add furnishing to unit
   * POST /api/landlord/units/{unit_id}/furnishings
   */
  async createFurnishing(unitId: string, data: CreateFurnishingRequest) {
    const res = await axiosInstance.post<ApiResponse<IFurnishing>>(
      `${this.BASE_PATH_UNIT}/${unitId}/furnishings`,
      data
    );
    return res.data;
  }

  /**
   * Update furnishing
   * PUT /api/landlord/units/{unit_id}/furnishings/{furnishing_id}
   */
  async updateFurnishing(
    unitId: string,
    furnishingId: number,
    data: UpdateFurnishingRequest
  ) {
    const res = await axiosInstance.put<ApiResponse<IFurnishing>>(
      `${this.BASE_PATH_UNIT}/${unitId}/furnishings/${furnishingId}`,
      data
    );
    return res.data;
  }

  /**
   * Delete furnishing
   * DELETE /api/landlord/units/{unit_id}/furnishings/{furnishing_id}
   */
  async deleteFurnishing(unitId: string, furnishingId: number) {
    const res = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH_UNIT}/${unitId}/furnishings/${furnishingId}`
    );
    return res.data;
  }

  /**
   * Batch update furnishings (replace all)
   * POST /api/landlord/units/{unit_id}/furnishings/batch
   */
  async batchUpdateFurnishings(unitId: string, data: BatchFurnishingRequest) {
    const res = await axiosInstance.post<ApiResponse<IFurnishing[]>>(
      `${this.BASE_PATH_UNIT}/${unitId}/furnishings/batch`,
      data
    );
    return res.data;
  }

  /**
   * Get invoices by unit (Landlord)
   * GET /api/landlord/units/{unit_id}/invoices
   */
  async getUnitInvoices(unitId: number, params?: GetUnitInvoicesRequest) {
    const response = await axiosInstance.get<UnitInvoicesResponse>(
      `${this.BASE_PATH_UNIT}/${unitId}/invoices`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "issuedAt",
          direction: params?.direction ?? "DESC",
          ...(params?.search && { search: params.search }),
          ...(params?.fromDate && { fromDate: params.fromDate }),
          ...(params?.toDate && { toDate: params.toDate }),
          ...(params?.status && { status: params.status }),
          ...(params?.type && { type: params.type }),
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get contracts by unit (Landlord)
   * GET /api/landlord/units/{unit_id}/contracts
   */
  async getUnitContracts(unitId: number, params?: GetUnitContractsRequest) {
    const response = await axiosInstance.get<UnitContractsResponse>(
      `${this.BASE_PATH_UNIT}/${unitId}/contracts`,
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
    return response.data.data;
  }

  /**
   * Get tenant unit invoices
   * GET /api/tenant/units/{unit_id}/invoices
   */
  async getTenantUnitInvoices(unitId: number, params?: GetUnitInvoicesRequest) {
    const response = await axiosInstance.get<UnitInvoicesResponse>(
      `/tenant/units/${unitId}/invoices`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "issuedAt",
          direction: params?.direction ?? "DESC",
          ...(params?.search && { search: params.search }),
          ...(params?.fromDate && { fromDate: params.fromDate }),
          ...(params?.toDate && { toDate: params.toDate }),
          ...(params?.status && { status: params.status }),
          ...(params?.type && { type: params.type }),
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get tenant unit contracts
   * GET /api/tenant/units/{unit_id}/contracts
   */
  async getTenantUnitContracts(
    unitId: number,
    params?: GetUnitContractsRequest
  ) {
    const response = await axiosInstance.get<UnitContractsResponse>(
      `/tenant/units/${unitId}/contracts`,
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
    return response.data.data;
  }
}

export const unitService = new UnitService();
