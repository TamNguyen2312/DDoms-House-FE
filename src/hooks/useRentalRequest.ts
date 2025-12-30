import type {
  CreatetRentalRequestsRequest,
  GetRentalRequestsRequest,
  UpdateRentalRequestStatusRequest,
} from "@/pages/landlord/rental/types";
import { rentalRequestService } from "@/services/api/rental-request.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys
export const rentalRequestKeys = {
  all: ["rental-requests"] as const,
  allForLandlord: () => [...rentalRequestKeys.all, "for-landlord"] as const,
  allForLandlordParams: (params?: GetRentalRequestsRequest) =>
    [...rentalRequestKeys.all, "for-landlord", params] as const,
  allForTenant: () => [...rentalRequestKeys.all, "for-tenant"] as const,
  allForTenantParams: (params?: GetRentalRequestsRequest) =>
    [...rentalRequestKeys.all, "for-tenant", params] as const,
  detailForLandlord: (id: number) =>
    [...rentalRequestKeys.all, "detail", "landlord", id] as const,
  detailForTenant: (id: number) =>
    [...rentalRequestKeys.all, "detail", "tenant", id] as const,
};

// ============================================
// LANDLORD Queries
// ============================================

/**
 * Get rental requests for landlord with pagination and filters
 */
export const useGetRentalRequestsForLandlord = (
  params?: GetRentalRequestsRequest
) => {
  return useQuery({
    queryKey: rentalRequestKeys.allForLandlordParams(params),
    queryFn: async () => {
      const res = await rentalRequestService.getRentalRequestsForLandlord(
        params
      );
      return res;
    },
  });
};

/**
 * Get rental request detail for landlord
 */
export const useGetRentalRequestDetailForLandlord = (
  rentalRequestId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: rentalRequestKeys.detailForLandlord(rentalRequestId),
    queryFn: async () => {
      const res = await rentalRequestService.getRentalRequestDetailForLandlord(
        rentalRequestId
      );
      return res;
    },
    enabled: enabled && rentalRequestId > 0,
  });
};

// ============================================
// TENANT Queries
// ============================================

/**
 * Get rental requests for tenant with pagination and filters
 */
export const useGetRentalRequestsForTenant = (
  params?: GetRentalRequestsRequest
) => {
  return useQuery({
    queryKey: rentalRequestKeys.allForTenantParams(params),
    queryFn: async () => {
      const res = await rentalRequestService.getRentalRequestsTenant(params);
      return res;
    },
  });
};

/**
 * Get rental request detail for tenant
 */
export const useGetRentalRequestDetailForTenant = (
  rentalRequestId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: rentalRequestKeys.detailForTenant(rentalRequestId),
    queryFn: async () => {
      const res = await rentalRequestService.getRentalRequestDetailForTenant(
        rentalRequestId
      );
      return res;
    },
    enabled: enabled && rentalRequestId > 0,
  });
};

// ============================================
// Mutations
// ============================================

/**
 * Create rental request (Tenant only)
 */
export const useCreateRentalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatetRentalRequestsRequest) =>
      rentalRequestService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rentalRequestKeys.allForTenant(),
      });
      toast.success("Gửi yêu cầu thuê thành công");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Gửi yêu cầu thuê thất bại";
      toast.error(message);
    },
  });
};

/**
 * Update rental request status (Landlord only - accept/decline)
 */
export const useUpdateRentalRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      rentalRequestId,
      data,
    }: {
      rentalRequestId: number;
      data: UpdateRentalRequestStatusRequest;
    }) => rentalRequestService.updateStatus(rentalRequestId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: rentalRequestKeys.allForLandlord(),
      });
      queryClient.invalidateQueries({
        queryKey: rentalRequestKeys.detailForLandlord(
          variables.rentalRequestId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: rentalRequestKeys.allForTenant(),
      });
      queryClient.invalidateQueries({
        queryKey: rentalRequestKeys.detailForTenant(variables.rentalRequestId),
      });
      const actionText =
        variables.data.action === "accept" ? "chấp nhận" : "từ chối";
      toast.success(`Đã ${actionText} yêu cầu thuê thành công`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Cập nhật trạng thái thất bại";
      toast.error(message);
    },
  });
};

/**
 * Delete rental request (Landlord only)
 */
export const useDeleteRentalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rentalRequestId: number) =>
      rentalRequestService.delete(rentalRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rentalRequestKeys.allForLandlord(),
      });
      toast.success("Xóa yêu cầu thuê thành công");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Xóa yêu cầu thuê thất bại";
      toast.error(message);
    },
  });
};

/**
 * Delete rental request (Tenant only)
 */
export const useDeleteRentalRequestForTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rentalRequestId: number) =>
      rentalRequestService.deleteForTenant(rentalRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rentalRequestKeys.allForTenant(),
      });
      toast.success("Xóa yêu cầu thuê thành công");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Xóa yêu cầu thuê thất bại";
      toast.error(message);
    },
  });
};
