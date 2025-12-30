// Types for Admin Listings API
export interface ListingMediaItem {
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

export interface Unit {
  id: number;
  propertyId: number;
  code: string;
  areaSqM: number;
  bedrooms: number;
  bathrooms: number;
  baseRent: number;
  status?: string;
}

export interface Landlord {
  id: number;
  displayName: string | null;
  email: string;
  phone: string;
  verified?: boolean | null;
  kycStatus?: string | null;
}

export interface IListing {
  id: number;
  unitId: number;
  landlordId: number;
  title: string;
  description: string;
  listedPrice: number;
  isPublic: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
  landlord?: Landlord;
  media?: ListingMediaItem[];
}

export interface GetListingsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  status?: string;
}

export interface ListingsPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface ListingsResponse {
  success: boolean;
  message: string;
  status: string;
  content: IListing[];
  pagination: ListingsPagination;
  contentSize: number;
}
