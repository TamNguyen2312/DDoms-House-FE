// Types for Admin Pricing Plans API
export type IPricingPlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type IBillingCycle = "MONTHLY" | "YEARLY";

export interface IPricingPlan {
  id: number;
  code: string;
  name: string;
  description: string;
  durationMonths: number;
  listPrice: number;
  status: IPricingPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GetPricingPlansRequest {
  status?: IPricingPlanStatus;
}

export interface PricingPlansResponse {
  success: boolean;
  message: string;
  status: string;
  data: IPricingPlan[];
}

export interface CreatePricingPlanRequest {
  code: string;
  name: string;
  description: string;
  listPrice: number;
  salePrice: number;
  billingCycle: IBillingCycle;
  trialDays: number;
  status: IPricingPlanStatus;
  features: unknown | null;
  isPublic: boolean;
  durationMonths: number;
}

// Pagination request params
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  search?: string;
}

// Features API Types
export type IFeatureCategory =
  | "BRANDING"
  | "FEATURES"
  | "LIMITS"
  | "SUPPORT"
  | string;

export interface IFeature {
  id?: number;
  code: string;
  name: string;
  description: string;
  category: IFeatureCategory;
  unit: string | null;
  isBoolean: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeatureRequest {
  code: string;
  name: string;
  description: string;
  category: IFeatureCategory;
  unit: string | null;
  isBoolean: boolean;
}

export interface FeaturesResponse {
  success: boolean;
  message: string;
  status: string;
  data: IFeature[];
}

export interface PaginatedFeaturesResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    content: IFeature[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// Plans API Types (extended)
export interface UpsertPlanRequest {
  code: string;
  name: string;
  description: string;
  listPrice: number;
  salePrice: number;
  billingCycle: IBillingCycle;
  trialDays: number;
  status: IPricingPlanStatus;
  features: unknown | null;
  isPublic: boolean;
  durationMonths: number;
}

export interface PaginatedPlansResponse {
  success: boolean;
  message: string;
  status: string;
  content: IPricingPlan[];
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

// Versions API Types
export interface IVersion {
  id: number;
  planCode: string;
  version: string;
  changelog: string;
  status: "DRAFT" | "PUBLISHED";
  features: IVersionFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface IVersionFeature {
  featureCode: string;
  value: string;
}

export interface CreateVersionRequest {
  planCode: string;
  changelog: string;
}

export interface SetVersionFeaturesRequest {
  items: Array<{
    featureCode: string;
    value: string;
  }>;
}

export interface VersionsResponse {
  success: boolean;
  message: string;
  status: string;
  data: IVersion[];
}

export interface PaginatedVersionsResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    content: IVersion[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
