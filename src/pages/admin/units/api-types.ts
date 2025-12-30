// Types for Admin Units Management API

export interface IAdminUnitMedia {
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

export interface IAdminUnitFurnishing {
  id: number;
  name: string;
  description?: string;
}

export interface IAdminUnit {
  id: number;
  propertyId: number;
  code: string;
  areaSqM: number;
  bedrooms: number;
  bathrooms: number;
  baseRent: number;
  status: string | null;
  media: IAdminUnitMedia[];
  furnishings: IAdminUnitFurnishing[];
}

export interface GetAdminUnitsRequest {
  page?: number;
  size?: number;
  sort?: string; // Field to sort by (e.g., "createdAt")
  direction?: "ASC" | "DESC";
}

export interface AdminUnitsPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface AdminUnitsListData {
  success: boolean;
  message: string;
  status: string;
  content: IAdminUnit[];
  pagination: AdminUnitsPagination;
  contentSize: number;
}

export interface AdminUnitsListResponse {
  success: boolean;
  message: string;
  status: string;
  data: AdminUnitsListData;
}

export interface AdminUnitDetailResponse {
  success: boolean;
  message: string;
  status: string;
  data: IAdminUnit;
}
