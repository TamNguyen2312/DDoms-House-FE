import type {
  CancelRepairRequestRequest,
  CreateRepairRequestRequest,
  GetRepairRequestsRequest,
  IRepairRequest,
  RepairRequestStatistics,
  RepairRequestsResponse,
  UpdateRepairRequestStatusRequest,
} from "@/types/repair-request.types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class RepairRequestService {
  private readonly BASE_PATH_LANDLORD = "/landlord/repair-requests";
  private readonly BASE_PATH_TENANT = "/tenant/repair-requests";
  private readonly BASE_PATH_ADMIN = "/admin/repair-requests";

  // ============================================
  // TENANT APIs
  // ============================================

  /**
   * Create repair request (Tenant only)
   */
  async createRepairRequest(data: CreateRepairRequestRequest) {
    const response = await axiosInstance.post<ApiResponse<IRepairRequest>>(
      this.BASE_PATH_TENANT,
      data
    );
    return response.data?.data;
  }

  /**
   * Get all repair requests for tenant with filters and pagination
   */
  async getRepairRequestsForTenant(params?: GetRepairRequestsRequest) {
    const response = await axiosInstance.get<
      ApiResponse<RepairRequestsResponse>
    >(`${this.BASE_PATH_TENANT}`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? "createdAt",
        direction: params?.direction ?? "DESC",
        ...(params?.status && { status: params.status }),
      },
    });
    return response.data?.data;
  }

  /**
   * Get repair request detail for tenant
   */
  async getRepairRequestDetailForTenant(repairRequestId: number) {
    const response = await axiosInstance.get<ApiResponse<IRepairRequest>>(
      `${this.BASE_PATH_TENANT}/${repairRequestId}`
    );
    return response.data?.data;
  }

  /**
   * Cancel repair request (Tenant only)
   */
  async cancelRepairRequest(
    repairRequestId: number,
    data: CancelRepairRequestRequest
  ) {
    const response = await axiosInstance.patch<ApiResponse<IRepairRequest>>(
      `${this.BASE_PATH_TENANT}/${repairRequestId}/cancel`,
      data
    );
    return response.data?.data;
  }

  /**
   * Get repair request statistics for tenant
   */
  async getRepairRequestStatistics() {
    const response = await axiosInstance.get<
      ApiResponse<RepairRequestStatistics>
    >(`${this.BASE_PATH_TENANT}/statistics`);
    return response.data?.data;
  }

  // ============================================
  // LANDLORD APIs
  // ============================================

  /**
   * Get all repair requests for landlord with filters and pagination
   */
  async getRepairRequestsForLandlord(params?: GetRepairRequestsRequest) {
    const response = await axiosInstance.get<
      ApiResponse<RepairRequestsResponse>
    >(`${this.BASE_PATH_LANDLORD}`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? "createdAt",
        direction: params?.direction ?? "DESC",
        ...(params?.status && { status: params.status }),
      },
    });
    return response.data?.data;
  }

  /**
   * Get repair request detail for landlord
   */
  async getRepairRequestDetailForLandlord(repairRequestId: number) {
    const response = await axiosInstance.get<ApiResponse<IRepairRequest>>(
      `${this.BASE_PATH_LANDLORD}/${repairRequestId}`
    );
    return response.data?.data;
  }

  /**
   * Update repair request status (Landlord only)
   * Valid transitions:
   * - PENDING → IN_PROGRESS
   * - PENDING → CANCEL
   * - IN_PROGRESS → DONE
   * - IN_PROGRESS → CANCEL
   */
  async updateRepairRequestStatus(
    repairRequestId: number,
    data: UpdateRepairRequestStatusRequest
  ) {
    const response = await axiosInstance.patch<ApiResponse<IRepairRequest>>(
      `${this.BASE_PATH_LANDLORD}/${repairRequestId}/status`,
      data
    );
    return response.data?.data;
  }

  // ============================================
  // ADMIN APIs
  // ============================================

  /**
   * Get all repair requests for admin with filters and pagination
   */
  async getRepairRequestsForAdmin(params?: GetRepairRequestsRequest) {
    const response = await axiosInstance.get<
      ApiResponse<RepairRequestsResponse>
    >(`${this.BASE_PATH_ADMIN}`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 20,
        sort: params?.sort ?? "createdAt",
        direction: params?.direction ?? "DESC",
        ...(params?.status && { status: params.status }),
      },
    });
    return response.data?.data;
  }

  /**
   * Get repair request detail for admin
   */
  async getRepairRequestDetailForAdmin(repairRequestId: number) {
    const response = await axiosInstance.get<ApiResponse<IRepairRequest>>(
      `${this.BASE_PATH_ADMIN}/${repairRequestId}`
    );
    return response.data?.data;
  }

  /**
   * Get repair request statistics for admin
   */
  async getRepairRequestStatisticsForAdmin() {
    const response = await axiosInstance.get<
      ApiResponse<RepairRequestStatistics>
    >(`${this.BASE_PATH_ADMIN}/statistics`);
    return response.data?.data;
  }
}

export const repairRequestService = new RepairRequestService();
