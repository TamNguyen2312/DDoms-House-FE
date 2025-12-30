import type { GetAdminUnitsRequest } from "@/pages/admin/units/api-types";
import { adminUnitsService } from "@/services/api/admin-units.service";
import { useQuery } from "@tanstack/react-query";

// Query Keys
export const adminUnitsKeys = {
  all: ["admin-units"] as const,
  list: (params?: GetAdminUnitsRequest) =>
    [...adminUnitsKeys.all, "list", params] as const,
  detail: (unitId: number) =>
    [...adminUnitsKeys.all, "detail", unitId] as const,
};

// Queries
export const useAdminUnits = (params?: GetAdminUnitsRequest) => {
  return useQuery({
    queryKey: adminUnitsKeys.list(params),
    queryFn: async () => {
      const response = await adminUnitsService.getUnits(params);
      return response;
    },
  });
};

export const useAdminUnitDetail = (unitId: number | null, enabled = true) => {
  return useQuery({
    queryKey: adminUnitsKeys.detail(unitId ?? 0),
    queryFn: async () => {
      if (!unitId) throw new Error("Unit ID is required");
      const response = await adminUnitsService.getUnitDetail(unitId);
      return response.data;
    },
    enabled: enabled && !!unitId,
  });
};
