// Rental Request Status Types
export type IRentalRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DECLINED"
  | "EXPIRED";

// Rental Request Interface
export interface IRentalRequest {
  id: number;
  unitId: number;
  propertyId?: number;
  tenantId: number;
  landlordId: number;
  message: string;
  status: IRentalRequestStatus;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string | null;
  // Flattened unit/property data (from API response)
  unitCode?: string;
  propertyName?: string;
  addressLine?: string;
  ward?: string;
  district?: string | null;
  city?: string;
  // Optional embedded data (if API returns nested structure)
  unit?: {
    unitId: number;
    unitCode: string;
    propertyId: number;
    propertyName: string;
    addressLine: string;
    ward: string;
    district: string | null;
    city: string;
  };
  tenant?: {
    userId: number;
    displayName: string | null;
    email: string;
    phone: string;
  };
  landlord?: {
    userId: number;
    displayName: string | null;
    email: string;
    phone: string;
  };
}

// Request Types
export interface GetRentalRequestsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  status?: IRentalRequestStatus;
}

// Response Types
export interface RentalRequestsPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface RentalRequestsResponse {
  success: boolean;
  message: string;
  status: string;
  content: IRentalRequest[];
  pagination: RentalRequestsPagination;
  contentSize: number;
}

// Create Rental Request
export interface CreatetRentalRequestsRequest {
  unitId: number;
  message: string;
}

// Update Rental Request Status (Landlord only)
export interface UpdateRentalRequestStatusRequest {
  action: "accept" | "decline";
}
