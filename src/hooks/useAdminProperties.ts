import type { GetAdminPropertiesRequest } from "@/pages/admin/properties/api-types";
import { adminPropertiesService } from "@/services/api/admin-properties.service";
import { useQuery } from "@tanstack/react-query";

// Query Keys
export const adminPropertiesKeys = {
  all: ["admin-properties"] as const,
  list: (params?: GetAdminPropertiesRequest) =>
    [...adminPropertiesKeys.all, "list", params] as const,
  detail: (propertyId: number) =>
    [...adminPropertiesKeys.all, "detail", propertyId] as const,
};

// Queries
export const useAdminProperties = (params?: GetAdminPropertiesRequest) => {
  return useQuery({
    queryKey: adminPropertiesKeys.list(params),
    queryFn: async () => {
      const response = await adminPropertiesService.getProperties(params);
      return response;
    },
  });
};

export const useAdminPropertyDetail = (
  propertyId: number | null,
  enabled = true
) => {
  return useQuery({
    queryKey: adminPropertiesKeys.detail(propertyId ?? 0),
    queryFn: async () => {
      if (!propertyId) throw new Error("Property ID is required");
      const response = await adminPropertiesService.getPropertyDetail(
        propertyId
      );
      return response.data;
    },
    enabled: enabled && !!propertyId,
  });
};
