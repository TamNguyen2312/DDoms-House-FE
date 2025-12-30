import type {
  ILandlordRef,
  IPropertyRef,
  ITenantRef,
} from "@/store/types/common";

export interface CreateContractRequest {
  unitId: number;
  // tenantId: string;
  tenantEmail: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
  templateCode: string;
  content: string;
  feeDetail?: string; // Chi tiết phí (ví dụ: "Phí quản lý: 500,000 VND/tháng\nPhí dịch vụ: 200,000 VND/tháng")
}

export interface UpdateContractRequest {
  startDate: string;
  endDate: string;
  depositAmount: number;
}

export interface GetContractsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  status?: string;
}

export interface ContractsPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface ContractsResponse {
  success: boolean;
  message: string;
  status:
    | "SENT"
    | "DRAFT"
    | "SIGNED"
    | "ACTIVE"
    | "TERMINATION_PENDING"
    | "CANCELLED"
    | "EXPIRED";
  content: Array<{
    id: number;
    createdAt: string;
    depositAmount: number;
    endDate: string;
    landlordId: number;
    startDate: string;
    status: "SENT" | "DRAFT";
    tenantId: number;
    unitId: number;
  }>;
  pagination: ContractsPagination;
  contentSize: number;
}

export interface IContractUnit {
  id: string;
  code: string;
  property: IPropertyRef;
}

// Legacy IContract for backward compatibility
export interface IContractLegacy {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  deposit_amount: number;
  monthly_rent: number;
  created_at: string;
  unit: IContractUnit;
  landlord: ILandlordRef;
  tenant: ITenantRef;
}

// IContract based on API response
export interface IContract {
  id: number;
  createdAt: string;
  depositAmount: number;
  endDate: string;
  landlordId: number;
  startDate: string;
  status:
    | "SENT"
    | "DRAFT"
    | "SIGNED"
    | "ACTIVE"
    | "TERMINATION_PENDING"
    | "CANCELLED"
    | "EXPIRED";
  tenantId: number;
  unitId: number;
}

// ============================================
// ADMIN API Types
// ============================================

export interface AdminContractUnit {
  unitId: number;
  unitCode: string;
  propertyId: number;
  propertyName: string;
  addressLine: string;
  ward: string;
  district: string | null;
  city: string;
}

export interface AdminContractUser {
  userId: number;
  displayName: string | null;
  email: string;
  phone: string;
}

export interface AdminContractItem {
  id: number;
  unit: AdminContractUnit;
  landlord: AdminContractUser;
  tenant: AdminContractUser;
  startDate: string;
  endDate: string;
  pendingEndDate: string | null;
  status: string;
  depositAmount: number;
  createdAt: string;
  feeDetail?: string; // Chi tiết phí (ví dụ: "1. Giá điện:\n\n4000đ/kWh\n\n2. Giá nước:\n\n15000đ/m3")
  media: any[];
}

export interface GetAdminContractsRequest {
  status?: string;
  landlordId?: number;
  tenantId?: number;
  unitId?: number;
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
}

export interface AdminContractsResponse {
  success: boolean;
  message: string;
  status: string;
  content: AdminContractItem[];
  pagination: ContractsPagination;
  contentSize: number;
}

export interface AdminContractVersion {
  id: number;
  versionNo: number;
  templateCode: string;
  content: string;
  createdAt: string | null;
  media: any[];
}

export interface AdminContractParty {
  id: number;
  userId: number;
  role: "LANDLORD" | "TENANT";
  email: string;
  phone: string;
  media: any[];
}

export interface AdminContractDetailResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    contract: AdminContractItem;
    versions: AdminContractVersion[];
    parties: AdminContractParty[];
    signatures: any[];
  };
}
