import type { GetAdminUsersRequest } from "@/pages/admin/users/api-types";
import { adminUsersService } from "@/services/api/admin-users.service";
import { useQuery } from "@tanstack/react-query";

// Query Keys
export const adminUsersKeys = {
  all: ["admin-users"] as const,
  list: (params?: GetAdminUsersRequest) =>
    [...adminUsersKeys.all, "list", params] as const,
  detail: (userId: number) =>
    [...adminUsersKeys.all, "detail", userId] as const,
};

// Queries
export const useAdminUsers = (params?: GetAdminUsersRequest) => {
  return useQuery({
    queryKey: adminUsersKeys.list(params),
    queryFn: async () => {
      const response = await adminUsersService.getUsers(params);
      return response;
    },
  });
};

export const useAdminUserDetail = (userId: number | null, enabled = true) => {
  return useQuery({
    queryKey: adminUsersKeys.detail(userId ?? 0),
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await adminUsersService.getUserDetail(userId);
      return response.data;
    },
    enabled: enabled && !!userId,
  });
};
