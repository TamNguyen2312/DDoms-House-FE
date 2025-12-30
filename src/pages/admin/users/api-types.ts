// Types for Admin Users Management API

export interface IAdminUser {
  id: number;
  email: string;
  phone: string;
  roles: string[];
  active: boolean;
  locked: boolean;
  twoFaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminUserDetail extends IAdminUser {
  tenantProfile: ITenantProfile | null;
  landlordProfile: ILandlordProfile | null;
}

export interface ITenantProfile {
  userId: number;
  fullName: string | null;
  dob: string | null;
  idNumber: string | null;
  verified: boolean;
}

export interface ILandlordProfile {
  userId: number;
  displayName: string | null;
  verified: boolean;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export interface GetAdminUsersRequest {
  role?: string; // Filter by role: "ADMIN", "LANDLORD", "TENANT"
  searchTerm?: string; // Search by email or phone
  page?: number;
  size?: number;
  sort?: string; // Field to sort by (e.g., "createdAt", "email")
  direction?: "ASC" | "DESC";
}

export interface AdminUsersPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface AdminUsersListData {
  success: boolean;
  message: string;
  status: string;
  content: IAdminUser[];
  pagination: AdminUsersPagination;
  contentSize: number;
}

export interface AdminUsersListResponse {
  success: boolean;
  message: string;
  status: string;
  data: AdminUsersListData;
}

export interface AdminUserDetailResponse {
  success: boolean;
  message: string;
  status: string;
  data: IAdminUserDetail;
}
