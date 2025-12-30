import type {
  AdminContractDetailResponse,
  AdminContractsResponse,
  ContractsResponse,
  CreateContractRequest,
  GetAdminContractsRequest,
  GetContractsRequest,
  IContract,
  UpdateContractRequest,
} from "@/pages/admin/contracts/types";
import type {
  ConfirmedTenant,
  ExtendContractRequest,
  IContractDetailResponse,
  RequestOTPResponse,
  SignContractRequest,
  TerminationRequest,
} from "@/pages/landlord/contracts/types";
import type { ContractMediaResponse } from "@/types/contract.types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class ContractService {
  private readonly BASE_PATH = "/contracts";
  private readonly BASE_PATH_LANDLORD = "/landlord/contracts";
  private readonly BASE_PATH_TENANT = "/tenant/contracts";

  /**
   * Get confirmed tenants for contract creation
   * GET /api/landlord/contracts/confirmed-tenants
   */
  async getConfirmedTenants() {
    const response = await axiosInstance.get<ApiResponse<ConfirmedTenant[]>>(
      `${this.BASE_PATH_LANDLORD}/confirmed-tenants`
    );
    return response.data.data;
  }

  /**
   * Get all contracts with pagination
   */
  async getContractsForLandlord(params?: GetContractsRequest) {
    const response = await axiosInstance.get<
      ApiResponse<ContractsResponse | { data: ContractsResponse }>
    >(this.BASE_PATH_LANDLORD, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? "createdAt",
        direction: params?.direction ?? "DESC",
        ...(params?.status && { status: params.status }),
      },
    });
    // Handle nested response structure: data.data or data
    const responseData = response.data.data;
    // If responseData has a nested data property, use it; otherwise use responseData directly
    return (responseData as any)?.data || responseData;
  }

  /**
   * Get all contracts for tenant
   */
  async getContractsForTenant(params?: GetContractsRequest) {
    const response = await axiosInstance.get<
      ApiResponse<{
        content: any[];
        pagination: any;
      }>
    >(this.BASE_PATH_TENANT, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? "createdAt",
        direction: params?.direction ?? "DESC",
        ...(params?.status && { status: params.status }),
      },
    });
    return response.data.data;
  }
  /**
   * Create a new contract
   */
  async createContract(data: CreateContractRequest) {
    const response = await axiosInstance.post<IContract>(
      this.BASE_PATH_LANDLORD,
      data
    );
    return response.data;
  }

  /**
   * Update contract (only for DRAFT status)
   */
  async updateContract(contractId: number, data: UpdateContractRequest) {
    const response = await axiosInstance.patch<ApiResponse<IContract>>(
      `${this.BASE_PATH_LANDLORD}/${contractId}`,
      data
    );
    return response.data;
  }

  /**
   * Send contract
   */
  async sendContract(contractId: number) {
    const response = await axiosInstance.post<ApiResponse<IContract>>(
      `${this.BASE_PATH_LANDLORD}/${contractId}/send`
    );
    return response.data;
  }

  /**
   * Get contract detail
   */
  async getContractDetail(contractId: number) {
    const response = await axiosInstance.get<
      ApiResponse<IContractDetailResponse>
    >(`${this.BASE_PATH_LANDLORD}/${contractId}`);
    return response.data.data;
  }

  /**
   * Get contract detail for tenant
   */
  async getContractDetailForTenant(contractId: number) {
    const response = await axiosInstance.get<
      ApiResponse<IContractDetailResponse>
    >(`${this.BASE_PATH_TENANT}/${contractId}`);
    return response.data.data;
  }

  /**
   * Request OTP for contract signing
   */
  async requestContractOTP(contractId: number, partyId: number) {
    const response = await axiosInstance.post<ApiResponse<RequestOTPResponse>>(
      `${this.BASE_PATH}/${contractId}/parties/${partyId}/otp`
    );
    return response.data;
  }

  /**
   * Sign contract with OTP
   */
  async signContract(data: SignContractRequest) {
    const response = await axiosInstance.post<ApiResponse<IContract>>(
      `${data.role}/contracts/${data.contractId}/sign`,
      { otpCode: data.otp, method: "otp", partyId: data.partyId }
    );
    return response.data;
  }

  /**
   * Tenant - Extend Contract Request (Flow 5.3)
   * POST /api/tenant/contracts/{contract_id}/extend
   */
  async extendContractForTenant(
    contractId: number,
    data: ExtendContractRequest
  ) {
    // Ensure date is in YYYY-MM-DD format (no time component)
    const formattedData = {
      newEndDate: data.newEndDate.split("T")[0], // Remove time component if present
      note: data.note,
    };

    const response = await axiosInstance.post<ApiResponse<any>>(
      `${this.BASE_PATH_TENANT}/${contractId}/extend`,
      formattedData
    );
    return response.data;
  }

  /**
   * Delete contract
   */
  async deleteContract(contractId: number) {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH_LANDLORD}/${contractId}`
    );
    return response.data;
  }

  /**
   * Terminate contract
   */
  async terminateContract(
    contractId: number,
    data: { type: "normal_expire" | "early_terminate"; reason: string }
  ) {
    const response = await axiosInstance.post<ApiResponse<IContract>>(
      `${this.BASE_PATH}/${contractId}/terminate`,
      data
    );
    return response.data;
  }

  /**
   * Get termination request for contract
   */
  async getTerminationRequest(contractId: number) {
    const response = await axiosInstance.get<ApiResponse<TerminationRequest>>(
      `${this.BASE_PATH}/${contractId}/termination-request`
    );
    return response.data.data;
  }

  /**
   * Request OTP for termination consent
   */
  async requestTerminationOTP(
    contractId: number,
    terminationRequestId: number,
    data: { partyId: number }
  ) {
    const response = await axiosInstance.post<ApiResponse<RequestOTPResponse>>(
      `${this.BASE_PATH}/${contractId}/termination-request/${terminationRequestId}/otp`,
      data
    );
    return response.data;
  }

  /**
   * Submit termination consent with OTP
   */
  async signContractTermination(
    contractId: number,
    terminationRequestId: number,
    otp: string,
    partyId: number
  ) {
    const response = await axiosInstance.post<ApiResponse<IContract>>(
      `${this.BASE_PATH}/${contractId}/termination-request/${terminationRequestId}/sign`,
      { otpCode: otp, partyId }
    );
    return response.data;
  }

  /**
   * Landlord - Get Extension Requests
   * GET /api/landlord/contracts/{contract_id}/extension-requests?page=0&size=10&sort=createdAt&direction=DESC
   */
  async getExtensionRequests(
    contractId: number,
    params?: {
      page?: number;
      size?: number;
      sort?: string;
      direction?: "ASC" | "DESC";
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.size !== undefined) {
      queryParams.append("size", params.size.toString());
    }
    if (params?.sort) {
      queryParams.append("sort", params.sort);
    }
    if (params?.direction) {
      queryParams.append("direction", params.direction);
    }

    const response = await axiosInstance.get<
      ApiResponse<{
        content: Array<{
          id: number;
          contractId: number;
          currentEndDate: string;
          requestedEndDate: string;
          approvedEndDate?: string;
          status: "PENDING" | "APPROVED" | "DECLINED";
          note?: string;
          decisionNote?: string;
          createdAt: string;
          updatedAt: string;
        }>;
        pagination: {
          page: number;
          size: number;
          totalElements: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      }>
    >(
      `${
        this.BASE_PATH_LANDLORD
      }/${contractId}/extension-requests?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Landlord - Extension Decision (Flow 5.3)
   * PATCH /api/landlord/contracts/{contract_id}/extend-decision
   */
  async extendDecision(
    contractId: number,
    data: { action: "accept" | "decline"; note: string }
  ) {
    const response = await axiosInstance.patch<ApiResponse<IContract>>(
      `${this.BASE_PATH_LANDLORD}/${contractId}/extend-decision`,
      data
    );
    return response.data;
  }

  /**
   * Get Contract Version Detail (Landlord)
   * GET /api/landlord/contracts/{contract_id}/versions/{contract_version_id}
   */
  async getContractVersionDetailForLandlord(
    contractId: number,
    versionId: number
  ) {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.BASE_PATH_LANDLORD}/${contractId}/versions/${versionId}`
    );
    return response.data.data;
  }

  /**
   * Get Contract Version Detail (Tenant)
   * GET /api/tenant/contracts/{contract_id}/versions/{contract_version_id}
   */
  async getContractVersionDetailForTenant(
    contractId: number,
    versionId: number
  ) {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.BASE_PATH_TENANT}/${contractId}/versions/${versionId}`
    );
    return response.data.data;
  }

  /**
   * Get Contract Party Detail (Landlord)
   * GET /api/landlord/contracts/{contract_id}/parties/{contract_party_id}
   */
  async getContractPartyDetailForLandlord(contractId: number, partyId: number) {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.BASE_PATH_LANDLORD}/${contractId}/parties/${partyId}`
    );
    return response.data.data;
  }

  /**
   * Get Contract Party Detail (Tenant)
   * GET /api/tenant/contracts/{contract_id}/parties/{contract_party_id}
   */
  async getContractPartyDetailForTenant(contractId: number, partyId: number) {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `${this.BASE_PATH_TENANT}/${contractId}/parties/${partyId}`
    );
    return response.data.data;
  }

  /**
   * Add Contract Media
   * POST /api/contracts/{contract_id}/media?fileId={file_id}
   */
  async addContractMedia(contractId: number, fileId: number) {
    const response = await axiosInstance.post<
      ApiResponse<ContractMediaResponse>
    >(`${this.BASE_PATH}/${contractId}/media`, null, {
      params: { fileId },
    });
    return response.data;
  }

  /**
   * Get Contract Media
   * GET /api/contracts/{contract_id}/media
   */
  async getContractMedia(contractId: number) {
    const response = await axiosInstance.get<
      ApiResponse<ContractMediaResponse[]>
    >(`${this.BASE_PATH}/${contractId}/media`);
    return response.data;
  }

  /**
   * Remove Contract Media
   * DELETE /api/contracts/{contract_id}/media/{contract_media_id}
   */
  async removeContractMedia(contractId: number, mediaId: number) {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/${contractId}/media/${mediaId}`
    );
    return response.data;
  }

  /**
   * Add Contract Version Media
   * POST /api/contracts/versions/{contract_version_id}/media?fileId={file_id}
   */
  async addContractVersionMedia(versionId: number, fileId: number) {
    const response = await axiosInstance.post<
      ApiResponse<ContractMediaResponse>
    >(`${this.BASE_PATH}/versions/${versionId}/media`, null, {
      params: { fileId },
    });
    return response.data;
  }

  /**
   * Get Contract Version Media
   * GET /api/contracts/versions/{contract_version_id}/media
   */
  async getContractVersionMedia(versionId: number) {
    const response = await axiosInstance.get<
      ApiResponse<ContractMediaResponse[]>
    >(`${this.BASE_PATH}/versions/${versionId}/media`);
    return response.data;
  }

  /**
   * Remove Contract Version Media
   * DELETE /api/contracts/versions/{contract_version_id}/media/{contract_version_media_id}
   */
  async removeContractVersionMedia(versionId: number, mediaId: number) {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/versions/${versionId}/media/${mediaId}`
    );
    return response.data;
  }

  /**
   * Add Contract Party Media
   * POST /api/contracts/parties/{contract_party_id}/media?fileId={file_id}
   */
  async addContractPartyMedia(partyId: number, fileId: number) {
    const response = await axiosInstance.post<
      ApiResponse<ContractMediaResponse>
    >(`${this.BASE_PATH}/parties/${partyId}/media`, null, {
      params: { fileId },
    });
    return response.data;
  }

  /**
   * Get Contract Party Media
   * GET /api/contracts/parties/{contract_party_id}/media
   */
  async getContractPartyMedia(partyId: number) {
    const response = await axiosInstance.get<
      ApiResponse<ContractMediaResponse[]>
    >(`${this.BASE_PATH}/parties/${partyId}/media`);
    return response.data;
  }

  /**
   * Remove Contract Party Media
   * DELETE /api/contracts/parties/{contract_party_id}/media/{contract_party_media_id}
   */
  async removeContractPartyMedia(partyId: number, mediaId: number) {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/parties/${partyId}/media/${mediaId}`
    );
    return response.data;
  }

  /**
   * Add Contract Signature Media
   * POST /api/contracts/signatures/{contract_signature_id}/media?fileId={file_id}
   */
  async addContractSignatureMedia(signatureId: number, fileId: number) {
    const response = await axiosInstance.post<
      ApiResponse<ContractMediaResponse>
    >(`${this.BASE_PATH}/signatures/${signatureId}/media`, null, {
      params: { fileId },
    });
    return response.data;
  }

  /**
   * Get Contract Signature Media
   * GET /api/contracts/signatures/{contract_signature_id}/media
   */
  async getContractSignatureMedia(signatureId: number) {
    const response = await axiosInstance.get<
      ApiResponse<ContractMediaResponse[]>
    >(`${this.BASE_PATH}/signatures/${signatureId}/media`);
    return response.data;
  }

  /**
   * Remove Contract Signature Media
   * DELETE /api/contracts/signatures/{contract_signature_id}/media/{contract_signature_media_id}
   */
  async removeContractSignatureMedia(signatureId: number, mediaId: number) {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/signatures/${signatureId}/media/${mediaId}`
    );
    return response.data;
  }

  // ============================================
  // ADMIN APIs
  // ============================================

  /**
   * Get all contracts for admin with filters
   * GET /api/admin/contracts?status=&landlordId=&tenantId=&unitId=&page=0&size=10
   */
  async getAdminContracts(params?: GetAdminContractsRequest) {
    const response = await axiosInstance.get<AdminContractsResponse>(
      "/admin/contracts",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          ...(params?.status && { status: params.status }),
          ...(params?.landlordId && { landlordId: params.landlordId }),
          ...(params?.tenantId && { tenantId: params.tenantId }),
          ...(params?.unitId && { unitId: params.unitId }),
          ...(params?.sort && { sort: params.sort }),
          ...(params?.direction && { direction: params.direction }),
        },
      }
    );
    return response.data;
  }

  /**
   * Get contract detail for admin
   * GET /api/admin/contracts/{contract_id}
   */
  async getAdminContractDetail(contractId: number) {
    const response = await axiosInstance.get<AdminContractDetailResponse>(
      `/admin/contracts/${contractId}`
    );
    return response.data;
  }
}

export const contractService = new ContractService();
