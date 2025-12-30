import type { IUserProfile } from "@/pages/admin/users/types";
import { userProfileService } from "@/services/api/user-profile.service";
import { useQuery } from "@tanstack/react-query";

export const userProfileKeys = {
  all: ["user-profile"] as const,
  detail: (userId: number) => [...userProfileKeys.all, "detail", userId] as const,
};

export const useUserProfileById = (userId: number, enabled: boolean = true) => {
  return useQuery<IUserProfile>({
    queryKey: userProfileKeys.detail(userId),
    queryFn: async () => {
      const response = await userProfileService.getUserProfileById(userId);
      return response.data;
    },
    enabled: !!userId && enabled,
  });
};

