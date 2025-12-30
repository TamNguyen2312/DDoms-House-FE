import type {
  ILandlordProfile,
  IUpdateLandlordProfileRequest,
} from "@/pages/landlord/profile/types";
import { landlordProfileService } from "@/services/api/landlord-profile.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const landlordProfileKeys = {
  all: ["landlord-profile"] as const,
  detail: () => [...landlordProfileKeys.all, "detail"] as const,
};

export const useLandlordProfile = () => {
  return useQuery<ILandlordProfile>({
    queryKey: landlordProfileKeys.detail(),
    queryFn: async () => {
      const response = await landlordProfileService.getLandlordProfile();
      return response.data;
    },
  });
};

export const useUpdateLandlordProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IUpdateLandlordProfileRequest) =>
      landlordProfileService.updateLandlordProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: landlordProfileKeys.all });
    },
  });
};

