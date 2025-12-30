// Repair Request Status Types
export type IRepairRequestStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "DONE"
  | "CANCEL";

// Repair Request Interface
export interface IRepairRequest {
  id: number;
  unitId: number;
  propertyId: number;
  tenantId: number;
  landlordId: number;
  title: string;
  description: string;
  status: IRepairRequestStatus;
  occurredAt: string;
  cancelReason: string | null;
  cancelledBy: string | null;
  createdAt: string;
  updatedAt: string;
  // Flattened unit/property data (from API response)
  unitCode?: string;
  propertyName?: string;
  addressLine?: string;
  ward?: string;
  district?: string | null;
  city?: string;
  // Tenant info
  tenantFullName?: string | null;
  tenantEmail?: string;
  tenantPhone?: string;
  // Landlord info
  landlordFullName?: string | null;
  landlordEmail?: string;
  landlordPhone?: string;
  // Media files
  medias?: Array<{
    id: number | null;
    fileId: number;
    filePath?: string;
    url?: string;
    thumbnailUrl?: string;
    mimeType: string;
    sizeBytes?: number;
  }> | null;
}

// Request Types
export interface GetRepairRequestsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  status?: IRepairRequestStatus;
}

// Response Types
export interface RepairRequestsPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface RepairRequestsResponse {
  success: boolean;
  message: string;
  status: string;
  content: IRepairRequest[];
  pagination: RepairRequestsPagination;
  contentSize: number;
}

// Create Repair Request (Tenant)
export interface CreateRepairRequestRequest {
  unitId: number;
  title: string;
  description: string;
  occurredAt: string;
  fileIds?: number[];
}

// Cancel Repair Request (Tenant)
export interface CancelRepairRequestRequest {
  cancelReason: string;
}

// Update Repair Request Status (Landlord)
export interface UpdateRepairRequestStatusRequest {
  status: IRepairRequestStatus;
  cancelReason?: string;
}

// Statistics Response (Tenant & Admin)
export interface RepairRequestStatistics {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  doneRequests: number;
  cancelledRequests: number;
  averageResolutionTimeHours: number;
  mostCommonIssue?: string | null;
}
