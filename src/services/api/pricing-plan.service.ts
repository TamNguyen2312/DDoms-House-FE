import type {
  GetPricingPlansRequest,
  IPricingPlan,
  IPricingPlanStatus,
  PaginatedPlansResponse,
  PaginationParams,
  PricingPlansResponse,
  UpsertPlanRequest,
} from "@/pages/admin/pricing-plans/types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class PricingPlanService {
  private readonly BASE_PATH = "/admin/subscriptions/plans";

  /**
   * Get all pricing plans with filters
   */
  async getPricingPlans(params?: GetPricingPlansRequest) {
    const response = await axiosInstance.get<PricingPlansResponse>(
      this.BASE_PATH,
      {
        params: {
          ...(params?.status && { status: params.status }),
        },
      }
    );

    return response.data?.data;
  }

  /**
   * Get pricing plan by ID
   */
  async getPricingPlanById(id: number) {
    const response = await axiosInstance.get<ApiResponse<IPricingPlan>>(
      `${this.BASE_PATH}/${id}`
    );
    return response.data;
  }

  /**
   * Get paginated pricing plans
   */
  async getPricingPlansPageable(
    params?: PaginationParams & { status?: IPricingPlanStatus }
  ) {
    const response = await axiosInstance.get<PaginatedPlansResponse>(
      `${this.BASE_PATH}/pageable`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort,
          direction: params?.direction ?? "ASC",
          ...(params?.search && { search: params.search }),
          ...(params?.status && { status: params.status }),
        },
      }
    );
    return response.data;
  }

  /**
   * Create a new pricing plan
   */
  async createPricingPlan(data: UpsertPlanRequest) {
    const response = await axiosInstance.post<ApiResponse<IPricingPlan>>(
      this.BASE_PATH,
      data
    );
    return response.data;
  }

  /**
   * Create or update a pricing plan (upsert)
   * Note: Backend only supports POST for create. Update is only available via setPlanStatus for status changes.
   */
  async upsertPricingPlan(data: UpsertPlanRequest) {
    return this.createPricingPlan(data);
  }

  /**
   * Set plan status
   * @param planCode - The code of the plan
   * @param status - The new status
   */
  async setPlanStatus(planCode: string, status: IPricingPlanStatus) {
    const response = await axiosInstance.patch<ApiResponse<IPricingPlan>>(
      `${this.BASE_PATH}/${planCode}/status`,
      null,
      {
        params: {
          status,
        },
      }
    );
    return response.data;
  }

  /**
   * Delete a pricing plan by code
   */
  async deletePricingPlan(planCode: string) {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/${planCode}`
    );
    return response.data;
  }
}

export const pricingPlanService = new PricingPlanService();
