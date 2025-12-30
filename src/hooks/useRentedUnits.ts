import type {
  GetRentedUnitsRequest,
  RentedUnitsResponse,
} from "@/pages/admin/rented-units/types";
import { rentedUnitsService } from "@/services/api/rented-units.service";
import { useQuery } from "@tanstack/react-query";

export const rentedUnitsKeys = {
  all: ["rented-units"] as const,
  admin: (params?: GetRentedUnitsRequest) =>
    [...rentedUnitsKeys.all, "admin", params] as const,
  landlord: (params?: GetRentedUnitsRequest) =>
    [...rentedUnitsKeys.all, "landlord", params] as const,
  tenant: (params?: GetRentedUnitsRequest) =>
    [...rentedUnitsKeys.all, "tenant", params] as const,
};

/**
 * Hook to get rented units for admin
 */
export const useAdminRentedUnits = (params?: GetRentedUnitsRequest) => {
  return useQuery<RentedUnitsResponse>({
    queryKey: rentedUnitsKeys.admin(params),
    queryFn: async () => {
      return await rentedUnitsService.getAdminRentedUnits(params);
    },
  });
};

/**
 * Hook to get rented units for landlord
 */
export const useLandlordRentedUnits = (params?: GetRentedUnitsRequest) => {
  return useQuery<RentedUnitsResponse>({
    queryKey: rentedUnitsKeys.landlord(params),
    queryFn: async () => {
      return await rentedUnitsService.getLandlordRentedUnits(params);
    },
  });
};

/**
 * Hook to get rented units for tenant
 */
export const useTenantRentedUnits = (params?: GetRentedUnitsRequest) => {
  return useQuery<RentedUnitsResponse>({
    queryKey: rentedUnitsKeys.tenant(params),
    queryFn: async () => {
      return await rentedUnitsService.getTenantRentedUnits(params);
    },
  });
};
