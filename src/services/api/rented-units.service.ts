import type {
  GetRentedUnitsRequest,
  RentedUnitsApiResponse,
} from "@/pages/admin/rented-units/types";
import axiosInstance from "./axios.config";

class RentedUnitsService {
  /**
   * Get rented units for admin
   */
  async getAdminRentedUnits(params?: GetRentedUnitsRequest) {
    const response = await axiosInstance.get<RentedUnitsApiResponse>(
      "/admin/units/rented",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          sort: params?.sort ?? "startDate",
          direction: params?.direction ?? "DESC",
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get rented units for landlord
   */
  async getLandlordRentedUnits(params?: GetRentedUnitsRequest) {
    const response = await axiosInstance.get<RentedUnitsApiResponse>(
      "/landlord/units/rented",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "startDate",
          direction: params?.direction ?? "DESC",
        },
      }
    );
    return response.data.data;
  }

  /**
   * Get rented units for tenant
   */
  async getTenantRentedUnits(params?: GetRentedUnitsRequest) {
    const response = await axiosInstance.get<RentedUnitsApiResponse>(
      "/tenant/units/rented",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "startDate",
          direction: params?.direction ?? "DESC",
        },
      }
    );
    return response.data.data;
  }
}

export const rentedUnitsService = new RentedUnitsService();
