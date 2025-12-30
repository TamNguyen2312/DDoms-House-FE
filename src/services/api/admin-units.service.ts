import type {
    AdminUnitDetailResponse,
    AdminUnitsListResponse,
    GetAdminUnitsRequest,
} from "@/pages/admin/units/api-types";
import axiosInstance from "./axios.config";

// Types for unit invoices
export interface AdminUnitInvoice {
  id: number;
  contractId: number;
  unitId: number;
  amount: number;
  dueDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Add other invoice fields as needed
}

export interface AdminUnitInvoicesResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    content: AdminUnitInvoice[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalPages: number;
      totalElements: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

class AdminUnitsService {
  private readonly BASE_PATH = "/admin/units";

  /**
   * Get paginated list of units (Admin only)
   * GET /api/admin/units?page=0&size=20&direction=DESC
   */
  async getUnits(params?: GetAdminUnitsRequest) {
    const response = await axiosInstance.get<AdminUnitsListResponse>(
      this.BASE_PATH,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          ...(params?.sort && { sort: params.sort }),
          direction: params?.direction ?? "DESC",
        },
      }
    );
    return response.data;
  }

  /**
   * Get unit detail by ID (Admin only)
   * GET /api/admin/units/{unitId}/detail
   */
  async getUnitDetail(unitId: number) {
    const response = await axiosInstance.get<AdminUnitDetailResponse>(
      `${this.BASE_PATH}/${unitId}/detail`
    );
    return response.data;
  }

  /**
   * Get invoices by unit ID (Admin only)
   * GET /api/admin/units/{unitId}/invoices
   */
  async getUnitInvoices(unitId: number, params?: { page?: number; size?: number }) {
    const response = await axiosInstance.get<AdminUnitInvoicesResponse>(
      `${this.BASE_PATH}/${unitId}/invoices`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 100,
        },
      }
    );
    return response.data;
  }
}

export const adminUnitsService = new AdminUnitsService();
