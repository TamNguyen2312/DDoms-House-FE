import axiosInstance, { type ApiResponse } from "./axios.config";

// Các kiểu dữ liệu cho Gói Subscription Công khai
export interface IPublicPlanFeature {
  code: string;
  name: string;
  valueType: string;
  value: string;
  unit: string | null;
  description: string;
}

export interface IPublicSubscriptionPlan {
  planId: number;
  code: string;
  name: string;
  description: string;
  durationMonths: number;
  listPrice: number;
  activeVersionId: number | null;
  features: IPublicPlanFeature[];
}

export interface GetPublicPlansRequest {
  status?: "ACTIVE" | "INACTIVE";
  includeFeatures?: boolean;
}

export interface PublicPlansResponse {
  success: boolean;
  message: string;
  status: string;
  data: IPublicSubscriptionPlan[];
}

export interface PaginatedPublicPlansResponse {
  success: boolean;
  message: string;
  status: string;
  content: IPublicSubscriptionPlan[];
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

export interface PublicPlanDetailResponse {
  success: boolean;
  message: string;
  status: string;
  data: IPublicSubscriptionPlan;
}

export interface GetPublicPlansPageableRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  search?: string;
}

class PublicSubscriptionService {
  private readonly BASE_PATH = "/subscriptions/plans";

  /**
   * Lấy tất cả các gói subscription công khai
   */
  async getPublicPlans(params?: GetPublicPlansRequest) {
    const response = await axiosInstance.get<PublicPlansResponse>(
      this.BASE_PATH,
      {
        params: {
          ...(params?.status && { status: params.status }),
          ...(params?.includeFeatures !== undefined && {
            includeFeatures: params.includeFeatures,
          }),
        },
      }
    );
    return response.data;
  }

  /**
   * Lấy các gói subscription công khai có phân trang
   */
  async getPublicPlansPageable(params?: GetPublicPlansPageableRequest) {
    const response = await axiosInstance.get<PaginatedPublicPlansResponse>(
      `${this.BASE_PATH}/pageable`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "listPrice",
          direction: params?.direction ?? "ASC",
          ...(params?.search && { search: params.search }),
        },
      }
    );
    return response.data;
  }

  /**
   * Lấy chi tiết gói subscription công khai theo mã
   */
  async getPublicPlanByCode(code: string) {
    const response = await axiosInstance.get<PublicPlanDetailResponse>(
      `${this.BASE_PATH}/${code}`
    );
    return response.data;
  }
}

export const publicSubscriptionService = new PublicSubscriptionService();

