import type {
  CreateContractRequest,
  GetAdminContractsRequest,
  GetContractsRequest,
  UpdateContractRequest,
} from "@/pages/admin/contracts/types";
import type {
  ExtendContractRequest,
  SignContractRequest,
  TerminateContractRequest,
} from "@/pages/landlord/contracts/types";
import { contractService } from "@/services/api/contract.service";
import type {
  ContractMediaItem,
  ContractMediaResponse,
} from "@/types/contract.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys
export const contractKeys = {
  all: ["contracts"] as const,
  allForLandlord: () => [...contractKeys.all, "for-landlord"] as const,
  allForLandlordParams: (params?: GetContractsRequest) =>
    [...contractKeys.all, "for-landlord", params] as const,
  allForTenant: () => [...contractKeys.all, "for-tenant"] as const,
  allForTenantParams: (params?: GetContractsRequest) =>
    [...contractKeys.all, "for-tenant", params] as const,
  detail: (id: number) => [...contractKeys.all, "detail", id] as const,
  terminationRequest: (id: number) =>
    [...contractKeys.all, "termination-request", id] as const,
  extensionRequests: (
    contractId: number,
    params?: {
      page?: number;
      size?: number;
      sort?: string;
      direction?: "ASC" | "DESC";
    }
  ) => [...contractKeys.all, "extension-requests", contractId, params] as const,
  // Contract Media Query Keys
  contractMedia: (contractId: number) =>
    [...contractKeys.all, "media", contractId] as const,
  contractVersionMedia: (versionId: number) =>
    [...contractKeys.all, "version-media", versionId] as const,
  contractPartyMedia: (partyId: number) =>
    [...contractKeys.all, "party-media", partyId] as const,
  contractSignatureMedia: (signatureId: number) =>
    [...contractKeys.all, "signature-media", signatureId] as const,
  confirmedTenants: ["confirmed-tenants"] as const,
  // Admin Query Keys
  allForAdmin: () => [...contractKeys.all, "admin"] as const,
  allForAdminParams: (params?: GetAdminContractsRequest) =>
    [...contractKeys.all, "admin", params] as const,
  adminDetail: (id: number) =>
    [...contractKeys.all, "admin", "detail", id] as const,
};

// Queries
export const useGetContractsForLandlord = (params?: GetContractsRequest) => {
  return useQuery({
    queryKey: contractKeys.allForLandlordParams(params),
    queryFn: async () => {
      const res = await contractService.getContractsForLandlord(params);
      return res;
    },
  });
};

export const useGetConfirmedTenants = () => {
  return useQuery({
    queryKey: contractKeys.confirmedTenants,
    queryFn: async () => {
      const res = await contractService.getConfirmedTenants();
      return res || [];
    },
  });
};

export const useGetContractsForTenant = (params?: GetContractsRequest) => {
  return useQuery({
    queryKey: contractKeys.allForTenantParams(params),
    queryFn: async () => {
      const res = await contractService.getContractsForTenant(params);
      return res;
    },
  });
};

// Mutations
export const useCreateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContractRequest) =>
      contractService.createContract(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForLandlord(),
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Tạo hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: number;
      data: UpdateContractRequest;
    }) => contractService.updateContract(contractId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForLandlord(),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.contractId),
      });
      toast.success("Cập nhật hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Cập nhật hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useSendContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: number) =>
      contractService.sendContract(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForLandlord(),
      });
    },
  });
};

export const useGetContractDetail = (contractId: number) => {
  return useQuery({
    queryKey: contractKeys.detail(contractId),
    queryFn: async () => {
      const res = await contractService.getContractDetail(contractId);
      return res;
    },
    enabled: !!contractId,
  });
};

export const useGetContractDetailForTenant = (contractId: number) => {
  return useQuery({
    queryKey: [...contractKeys.detail(contractId), "tenant"],
    queryFn: async () => {
      const res = await contractService.getContractDetailForTenant(contractId);
      return res;
    },
    enabled: !!contractId,
  });
};

export const useRequestContractOTP = () => {
  return useMutation({
    mutationFn: ({
      contractId,
      partyId,
    }: {
      contractId: number;
      partyId: number;
    }) => contractService.requestContractOTP(contractId, partyId),
  });
};

export const useSignContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignContractRequest) =>
      contractService.signContract(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.contractId),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForLandlord(),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForTenant,
      });
    },
  });
};

/**
 * Tenant - Extend Contract Request (Flow 5.3)
 * POST /api/tenant/contracts/{contract_id}/extend
 */
export const useExtendContractForTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: number;
      data: ExtendContractRequest;
    }) => contractService.extendContractForTenant(contractId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.contractId),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForTenant,
      });
      toast.success("Gửi yêu cầu gia hạn hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Gửi yêu cầu gia hạn hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

/**
 * Landlord - Get Extension Requests
 * GET /api/landlord/contracts/{contract_id}/extension-requests
 */
export const useGetExtensionRequests = (
  contractId: number,
  params?: {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "ASC" | "DESC";
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: contractKeys.extensionRequests(contractId, params),
    queryFn: () => contractService.getExtensionRequests(contractId, params),
    enabled: enabled && !!contractId,
  });
};

/**
 * Landlord - Extension Decision (Flow 5.3)
 * PATCH /api/landlord/contracts/{contract_id}/extend-decision
 */
export const useExtendDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: number;
      data: { action: "accept" | "decline"; note: string };
    }) => contractService.extendDecision(contractId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.contractId),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForLandlord(),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.extensionRequests(variables.contractId),
      });
      const actionText =
        variables.data.action === "accept" ? "chấp nhận" : "từ chối";
      toast.success(
        `${
          actionText.charAt(0).toUpperCase() + actionText.slice(1)
        } yêu cầu gia hạn hợp đồng thành công`
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Xử lý yêu cầu gia hạn hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: number) =>
      contractService.deleteContract(contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForLandlord(),
      });
      toast.success("Xóa hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Xóa hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useTerminateContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: number;
      data: TerminateContractRequest;
    }) => contractService.terminateContract(contractId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.contractId),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForLandlord(),
      });
    },
  });
};

export const useGetTerminationRequest = (contractId: number) => {
  return useQuery({
    queryKey: contractKeys.terminationRequest(contractId),
    queryFn: async () => {
      const res = await contractService.getTerminationRequest(contractId);
      return res;
    },
    enabled: !!contractId,
  });
};

export const useRequestTerminationOTP = () => {
  return useMutation({
    mutationFn: ({
      contractId,
      terminationRequestId,
      data,
    }: {
      contractId: number;
      terminationRequestId: number;
      data: { partyId: number };
    }) =>
      contractService.requestTerminationOTP(
        contractId,
        terminationRequestId,
        data
      ),
  });
};

export const useSubmitTerminationConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      terminationRequestId,
      otp,
      partyId,
    }: {
      contractId: number;
      terminationRequestId: number;
      otp: string;
      partyId: number;
    }) =>
      contractService.signContractTermination(
        contractId,
        terminationRequestId,
        otp,
        partyId
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.contractId),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.terminationRequest(variables.contractId),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.allForLandlord(),
      });
      toast.success("Xác nhận hủy hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Xác nhận hủy hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

// ============================================
// Contract Media Management Hooks
// ============================================

// Contract Media Hooks
export const useAddContractMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      fileId,
    }: {
      contractId: number;
      fileId: number;
    }) => contractService.addContractMedia(contractId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.contractMedia(variables.contractId),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.contractId),
      });
      toast.success("Thêm media hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Thêm media hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useGetContractMedia = (contractId: number, enabled = true) => {
  return useQuery({
    queryKey: contractKeys.contractMedia(contractId),
    queryFn: async () => {
      const res = await contractService.getContractMedia(contractId);
      const items = (res.data as ContractMediaResponse[]) || [];
      // Map API response to ContractMediaItem with computed properties
      return items.map((item) => ({
        ...item,
        fileUrl: item.filePath,
        fileName: item.filePath.split("/").pop() || `file-${item.fileId}`,
        fileSize: item.sizeBytes,
      })) as ContractMediaItem[];
    },
    enabled: enabled && contractId > 0,
  });
};

export const useRemoveContractMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      mediaId,
    }: {
      contractId: number;
      mediaId: number;
    }) => contractService.removeContractMedia(contractId, mediaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.contractMedia(variables.contractId),
      });
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(variables.contractId),
      });
      toast.success("Xóa media hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Xóa media hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

// Contract Version Media Hooks
export const useAddContractVersionMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      fileId,
    }: {
      versionId: number;
      fileId: number;
    }) => contractService.addContractVersionMedia(versionId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.contractVersionMedia(variables.versionId),
      });
      toast.success("Thêm media phiên bản hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Thêm media phiên bản hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useGetContractVersionMedia = (
  versionId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: contractKeys.contractVersionMedia(versionId),
    queryFn: async () => {
      const res = await contractService.getContractVersionMedia(versionId);
      const items = (res.data as ContractMediaResponse[]) || [];
      // Map API response to ContractMediaItem with computed properties
      return items.map((item) => ({
        ...item,
        fileUrl: item.filePath,
        fileName: item.filePath.split("/").pop() || `file-${item.fileId}`,
        fileSize: item.sizeBytes,
      })) as ContractMediaItem[];
    },
    enabled: enabled && versionId > 0,
  });
};

export const useRemoveContractVersionMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      mediaId,
    }: {
      versionId: number;
      mediaId: number;
    }) => contractService.removeContractVersionMedia(versionId, mediaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.contractVersionMedia(variables.versionId),
      });
      toast.success("Xóa media phiên bản hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Xóa media phiên bản hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

// Contract Party Media Hooks
export const useAddContractPartyMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ partyId, fileId }: { partyId: number; fileId: number }) =>
      contractService.addContractPartyMedia(partyId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.contractPartyMedia(variables.partyId),
      });
      toast.success("Thêm media bên tham gia hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Thêm media bên tham gia hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useGetContractPartyMedia = (partyId: number, enabled = true) => {
  return useQuery({
    queryKey: contractKeys.contractPartyMedia(partyId),
    queryFn: async () => {
      const res = await contractService.getContractPartyMedia(partyId);
      const items = (res.data as ContractMediaResponse[]) || [];
      // Map API response to ContractMediaItem with computed properties
      return items.map((item) => ({
        ...item,
        fileUrl: item.filePath,
        fileName: item.filePath.split("/").pop() || `file-${item.fileId}`,
        fileSize: item.sizeBytes,
      })) as ContractMediaItem[];
    },
    enabled: enabled && partyId > 0,
  });
};

export const useRemoveContractPartyMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ partyId, mediaId }: { partyId: number; mediaId: number }) =>
      contractService.removeContractPartyMedia(partyId, mediaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.contractPartyMedia(variables.partyId),
      });
      toast.success("Xóa media bên tham gia hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Xóa media bên tham gia hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

// Contract Signature Media Hooks
export const useAddContractSignatureMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      signatureId,
      fileId,
    }: {
      signatureId: number;
      fileId: number;
    }) => contractService.addContractSignatureMedia(signatureId, fileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.contractSignatureMedia(variables.signatureId),
      });
      toast.success("Thêm media chữ ký hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Thêm media chữ ký hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

export const useGetContractSignatureMedia = (
  signatureId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: contractKeys.contractSignatureMedia(signatureId),
    queryFn: async () => {
      const res = await contractService.getContractSignatureMedia(signatureId);
      return (res.data as ContractMediaItem[]) || [];
    },
    enabled: enabled && signatureId > 0,
  });
};

export const useRemoveContractSignatureMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      signatureId,
      mediaId,
    }: {
      signatureId: number;
      mediaId: number;
    }) => contractService.removeContractSignatureMedia(signatureId, mediaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.contractSignatureMedia(variables.signatureId),
      });
      toast.success("Xóa media chữ ký hợp đồng thành công");
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Xóa media chữ ký hợp đồng thất bại";
      toast.error(errorMessage);
    },
  });
};

// ============================================
// ADMIN API Hooks
// ============================================

export const useGetAdminContracts = (params?: GetAdminContractsRequest) => {
  return useQuery({
    queryKey: contractKeys.allForAdminParams(params),
    queryFn: async () => {
      const res = await contractService.getAdminContracts(params);
      return res;
    },
  });
};

export const useGetAdminContractDetail = (
  contractId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: contractKeys.adminDetail(contractId),
    queryFn: async () => {
      const res = await contractService.getAdminContractDetail(contractId);
      return res;
    },
    enabled: enabled && contractId > 0,
  });
};
