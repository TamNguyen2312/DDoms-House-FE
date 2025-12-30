import type {
  ITenantProfile,
  IUpdateTenantProfileRequest,
} from "@/pages/tenant/profile/types";
import { tenantProfileService } from "@/services/api/tenant-profile.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const tenantProfileKeys = {
  all: ["tenant-profile"] as const,
  detail: () => [...tenantProfileKeys.all, "detail"] as const,
};

export const useTenantProfile = (enabled: boolean = true) => {
  return useQuery<ITenantProfile>({
    queryKey: tenantProfileKeys.detail(),
    queryFn: async () => {
      const response = await tenantProfileService.getTenantProfile();
      // Handle nested structure: response.data.data or response.data
      return response.data || response;
    },
    enabled,
  });
};

export const useUpdateTenantProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IUpdateTenantProfileRequest) =>
      tenantProfileService.updateTenantProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantProfileKeys.all });
    },
  });
};
