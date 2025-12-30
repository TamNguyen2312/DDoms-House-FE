// Types for Admin Properties Management API

export interface IAdminPropertyMedia {
  id: number;
  ownerType: string;
  ownerId: number;
  fileId: number;
  sortOrder: number;
  filePath: string;
  thumbnailUrl: string;
  mimeType: string;
  sizeBytes: number;
}

export interface IAdminProperty {
  id: number;
  landlordId: number;
  name: string;
  addressLine: string;
  ward: string;
  district: string | null;
  city: string;
  latitude: number;
  longitude: number;
  documentsVerified: boolean;
  createdAt: string;
  media: IAdminPropertyMedia[];
}

export interface GetAdminPropertiesRequest {
  page?: number;
  size?: number;
  sort?: string; // Field to sort by (e.g., "createdAt")
  direction?: "ASC" | "DESC";
}

export interface AdminPropertiesPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface AdminPropertiesListData {
  success: boolean;
  message: string;
  status: string;
  content: IAdminProperty[];
  pagination: AdminPropertiesPagination;
  contentSize: number;
}

export interface AdminPropertiesListResponse {
  success: boolean;
  message: string;
  status: string;
  data: AdminPropertiesListData;
}

export interface AdminPropertyDetailResponse {
  success: boolean;
  message: string;
  status: string;
  data: IAdminProperty;
}
