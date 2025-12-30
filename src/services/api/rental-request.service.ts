import type {
  CreatetRentalRequestsRequest,
  GetRentalRequestsRequest,
  IRentalRequest,
  RentalRequestsResponse,
  UpdateRentalRequestStatusRequest,
} from "@/pages/landlord/rental/types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class RentalRequestService {
  private readonly BASE_PATH_LANDLORD = "/landlord/rental-requests";
  private readonly BASE_PATH_TENANT = "/tenant/rental-requests";

  /**
   * Get all rental requests with filters and pagination LANDLORD
   */
  async getRentalRequestsForLandlord(params?: GetRentalRequestsRequest) {
    const response = await axiosInstance.get<
      ApiResponse<RentalRequestsResponse>
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
   * Get all rental requests with filters and pagination TENANT
   */
  async getRentalRequestsTenant(params?: GetRentalRequestsRequest) {
    const response = await axiosInstance.get<
      ApiResponse<RentalRequestsResponse>
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
   * Get rental request detail for LANDLORD
   */
  async getRentalRequestDetailForLandlord(rentalRequestId: number) {
    const response = await axiosInstance.get<ApiResponse<IRentalRequest>>(
      `${this.BASE_PATH_LANDLORD}/${rentalRequestId}`
    );
    return response.data?.data;
  }

  /**
   * Get rental request detail for TENANT
   */
  async getRentalRequestDetailForTenant(rentalRequestId: number) {
    const response = await axiosInstance.get<ApiResponse<IRentalRequest>>(
      `${this.BASE_PATH_TENANT}/${rentalRequestId}`
    );
    return response.data?.data;
  }

  /**
   * create rental request
   */
  async create(data: CreatetRentalRequestsRequest) {
    const res = await axiosInstance.post(`${this.BASE_PATH_TENANT}`, data);
    return res;
  }

  /**
   * Update rental request status
   */
  async updateStatus(
    rentalRequestId: number,
    data: UpdateRentalRequestStatusRequest
  ) {
    return axiosInstance.patch<ApiResponse<IRentalRequest>>(
      `${this.BASE_PATH_LANDLORD}/${rentalRequestId}`,
      data
    );
  }

  /**
   * Delete rental request for LANDLORD
   */
  async delete(rentalRequestId: number) {
    return axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH_LANDLORD}/${rentalRequestId}`
    );
  }

  /**
   * Delete rental request for TENANT
   */
  async deleteForTenant(rentalRequestId: number) {
    return axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH_TENANT}/${rentalRequestId}`
    );
  }
}

export const rentalRequestService = new RentalRequestService();
