import { repairRequestService } from "@/services/api/repair-request.service";
import type {
  CancelRepairRequestRequest,
  CreateRepairRequestRequest,
  GetRepairRequestsRequest,
  UpdateRepairRequestStatusRequest,
} from "@/types/repair-request.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys
export const repairRequestKeys = {
  all: ["repair-requests"] as const,
  allForLandlord: () => [...repairRequestKeys.all, "for-landlord"] as const,
  allForLandlordParams: (params?: GetRepairRequestsRequest) =>
    [...repairRequestKeys.all, "for-landlord", params] as const,
  allForTenant: () => [...repairRequestKeys.all, "for-tenant"] as const,
  allForTenantParams: (params?: GetRepairRequestsRequest) =>
    [...repairRequestKeys.all, "for-tenant", params] as const,
  allForAdmin: () => [...repairRequestKeys.all, "for-admin"] as const,
  allForAdminParams: (params?: GetRepairRequestsRequest) =>
    [...repairRequestKeys.all, "for-admin", params] as const,
  detailForLandlord: (id: number) =>
    [...repairRequestKeys.all, "detail", "landlord", id] as const,
  detailForTenant: (id: number) =>
    [...repairRequestKeys.all, "detail", "tenant", id] as const,
  detailForAdmin: (id: number) =>
    [...repairRequestKeys.all, "detail", "admin", id] as const,
  statistics: () => [...repairRequestKeys.all, "statistics"] as const,
  statisticsForAdmin: () =>
    [...repairRequestKeys.all, "statistics", "admin"] as const,
};

// ============================================
// LANDLORD Queries
// ============================================

/**
 * Get repair requests for landlord with pagination and filters
 */
export const useGetRepairRequestsForLandlord = (
  params?: GetRepairRequestsRequest
) => {
  return useQuery({
    queryKey: repairRequestKeys.allForLandlordParams(params),
    queryFn: async () => {
      const res = await repairRequestService.getRepairRequestsForLandlord(
        params
      );
      return res;
    },
  });
};

/**
 * Get repair request detail for landlord
 */
export const useGetRepairRequestDetailForLandlord = (
  repairRequestId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: repairRequestKeys.detailForLandlord(repairRequestId),
    queryFn: async () => {
      const res = await repairRequestService.getRepairRequestDetailForLandlord(
        repairRequestId
      );
      return res;
    },
    enabled: enabled && repairRequestId > 0,
  });
};

// ============================================
// TENANT Queries
// ============================================

/**
 * Get repair requests for tenant with pagination and filters
 */
export const useGetRepairRequestsForTenant = (
  params?: GetRepairRequestsRequest
) => {
  return useQuery({
    queryKey: repairRequestKeys.allForTenantParams(params),
    queryFn: async () => {
      const res = await repairRequestService.getRepairRequestsForTenant(params);
      return res;
    },
  });
};

/**
 * Get repair request detail for tenant
 */
export const useGetRepairRequestDetailForTenant = (
  repairRequestId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: repairRequestKeys.detailForTenant(repairRequestId),
    queryFn: async () => {
      const res = await repairRequestService.getRepairRequestDetailForTenant(
        repairRequestId
      );
      return res;
    },
    enabled: enabled && repairRequestId > 0,
  });
};

/**
 * Get repair request statistics for tenant
 */
export const useGetRepairRequestStatistics = () => {
  return useQuery({
    queryKey: repairRequestKeys.statistics(),
    queryFn: async () => {
      const res = await repairRequestService.getRepairRequestStatistics();
      return res;
    },
  });
};

// ============================================
// ADMIN Queries
// ============================================

/**
 * Get repair requests for admin with pagination and filters
 */
export const useGetRepairRequestsForAdmin = (
  params?: GetRepairRequestsRequest
) => {
  return useQuery({
    queryKey: repairRequestKeys.allForAdminParams(params),
    queryFn: async () => {
      const res = await repairRequestService.getRepairRequestsForAdmin(params);
      return res;
    },
  });
};

/**
 * Get repair request detail for admin
 */
export const useGetRepairRequestDetailForAdmin = (
  repairRequestId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: repairRequestKeys.detailForAdmin(repairRequestId),
    queryFn: async () => {
      const res = await repairRequestService.getRepairRequestDetailForAdmin(
        repairRequestId
      );
      return res;
    },
    enabled: enabled && repairRequestId > 0,
  });
};

/**
 * Get repair request statistics for admin
 */
export const useGetRepairRequestStatisticsForAdmin = () => {
  return useQuery({
    queryKey: repairRequestKeys.statisticsForAdmin(),
    queryFn: async () => {
      const res =
        await repairRequestService.getRepairRequestStatisticsForAdmin();
      return res;
    },
  });
};

// ============================================
// Mutations
// ============================================

/**
 * Create repair request (Tenant only)
 */
export const useCreateRepairRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRepairRequestRequest) =>
      repairRequestService.createRepairRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.allForTenant(),
      });
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.statistics(),
      });
      toast.success("Tạo yêu cầu sửa chữa thành công");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Tạo yêu cầu sửa chữa thất bại";
      toast.error(message);
    },
  });
};

/**
 * Cancel repair request (Tenant only)
 */
export const useCancelRepairRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      repairRequestId,
      data,
    }: {
      repairRequestId: number;
      data: CancelRepairRequestRequest;
    }) => repairRequestService.cancelRepairRequest(repairRequestId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.allForTenant(),
      });
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.detailForTenant(variables.repairRequestId),
      });
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.allForLandlord(),
      });
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.detailForLandlord(
          variables.repairRequestId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.statistics(),
      });
      toast.success("Hủy yêu cầu sửa chữa thành công");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Hủy yêu cầu sửa chữa thất bại";
      toast.error(message);
    },
  });
};

/**
 * Update repair request status (Landlord only)
 * Valid transitions:
 * - PENDING → IN_PROGRESS
 * - PENDING → CANCEL
 * - IN_PROGRESS → DONE
 * - IN_PROGRESS → CANCEL
 */
export const useUpdateRepairRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      repairRequestId,
      data,
    }: {
      repairRequestId: number;
      data: UpdateRepairRequestStatusRequest;
    }) => repairRequestService.updateRepairRequestStatus(repairRequestId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.allForLandlord(),
      });
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.detailForLandlord(
          variables.repairRequestId
        ),
      });
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.allForTenant(),
      });
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.detailForTenant(variables.repairRequestId),
      });
      queryClient.invalidateQueries({
        queryKey: repairRequestKeys.statistics(),
      });

      const statusText: Record<string, string> = {
        IN_PROGRESS: "đang xử lý",
        DONE: "hoàn thành",
        CANCEL: "đã hủy",
      };
      const actionText = statusText[variables.data.status] || "cập nhật";
      toast.success(`Đã ${actionText} yêu cầu sửa chữa thành công`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Cập nhật trạng thái thất bại";
      toast.error(message);
    },
  });
};
