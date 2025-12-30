// Types for Rented Units API

export type IUnitStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "MAINTENANCE"
  | "UNAVAILABLE";
export type IContractStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";

export interface IRentedUnit {
  unitId: number;
  unitCode: string;
  areaSqM: number;
  bedrooms: number;
  bathrooms: number;
  baseRent: number;
  unitStatus: IUnitStatus;
  propertyId: number;
  propertyName: string;
  propertyAddress: string;
  ward: string;
  district: string | null;
  city: string;
  contractId: number;
  startDate: string;
  endDate: string;
  contractStatus: IContractStatus;
  depositAmount: number;
  landlordId: number;
  landlordEmail: string;
  landlordPhone: string;
  tenantId: number;
  tenantEmail: string;
  tenantPhone: string;
}

export interface GetRentedUnitsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
}

export interface RentedUnitsResponse {
  success: boolean;
  message: string;
  status: string;
  content: IRentedUnit[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
    first: boolean;
    last: boolean;
  };
  contentSize: number;
}

export interface RentedUnitsApiResponse {
  success: boolean;
  message: string;
  status: string;
  data: RentedUnitsResponse;
}
