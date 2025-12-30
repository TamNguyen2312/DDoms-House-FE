import axiosInstance, { type ApiResponse } from "./axios.config";

// Types for API responses
export interface SubscriptionAnalyticsResponse {
  totalSubscriptions: number;
  activeCount: number;
  revenue: number;
  byStatus: Record<string, number>;
}

export interface ContractAnalyticsResponse {
  total: number;
  active: number;
  expired: number;
  signed: number;
  draft: number;
  byStatus: Record<string, number>;
  timeSeries: Array<{ date: string; count: number; amount: number }>;
}

export interface PaymentAnalyticsResponse {
  totalCount: number;
  succeededCount: number;
  pendingCount: number;
  failedCount: number;
  totalAmount: number;
  succeededAmount: number;
  avgTicket: number;
  byType: Record<string, number>;
  byProvider: Record<string, number>;
}

export interface InvoiceAnalyticsResponse {
  totalCount: number;
  totalAmount: number;
  paidAmount: number;
  avgInvoiceValue: number;
  byType: Record<string, number>;
  timeSeries: Array<{ date: string; count: number; amount: number }>;
}

export interface PropertyAnalyticsResponse {
  totalProperties: number;
  totalUnits: number;
}

// Query params interfaces
export interface SubscriptionAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  planCode?: string;
  status?: string;
}

export interface ContractAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  status?: string;
  unitId?: string;
}

export interface PaymentAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  status?: string;
  unitId?: string;
}

export interface InvoiceAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  invoiceType?: string;
  status?: string;
}

export interface PropertyAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  city?: string;
  district?: string;
  unitStatus?: string;
}

class LandlordAnalyticsService {
  private readonly BASE_PATH = "/landlord/analytics";

  /**
   * Get subscription analytics overview
   * GET /api/landlord/analytics/subscriptions/overview
   */
  async getSubscriptionsOverview(params?: SubscriptionAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<SubscriptionAnalyticsResponse>
    >(`${this.BASE_PATH}/subscriptions/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
        ...(params?.planCode && { planCode: params.planCode }),
        ...(params?.status && { status: params.status }),
      },
    });
    return response.data.data;
  }

  /**
   * Get contracts analytics overview
   * GET /api/landlord/analytics/contracts/overview
   */
  async getContractsOverview(params?: ContractAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<ContractAnalyticsResponse>
    >(`${this.BASE_PATH}/contracts/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
        ...(params?.status && { status: params.status }),
        ...(params?.unitId && { unitId: params.unitId }),
      },
    });
    return response.data.data;
  }

  /**
   * Get payments analytics overview
   * GET /api/landlord/analytics/payments/overview
   */
  async getPaymentsOverview(params?: PaymentAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<PaymentAnalyticsResponse>
    >(`${this.BASE_PATH}/payments/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
        ...(params?.status && { status: params.status }),
        ...(params?.unitId && { unitId: params.unitId }),
      },
    });
    return response.data.data;
  }

  /**
   * Get invoices analytics overview
   * GET /api/landlord/analytics/invoices/overview
   */
  async getInvoicesOverview(params?: InvoiceAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<InvoiceAnalyticsResponse>
    >(`${this.BASE_PATH}/invoices/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
        ...(params?.invoiceType && { invoiceType: params.invoiceType }),
        ...(params?.status && { status: params.status }),
      },
    });
    return response.data.data;
  }

  /**
   * Get properties and units analytics overview
   * GET /api/landlord/analytics/properties-units/overview
   */
  async getPropertiesUnitsOverview(params?: PropertyAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<PropertyAnalyticsResponse>
    >(`${this.BASE_PATH}/properties-units/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
        ...(params?.city && { city: params.city }),
        ...(params?.district && { district: params.district }),
        ...(params?.unitStatus && { unitStatus: params.unitStatus }),
      },
    });
    return response.data.data;
  }
}

export const landlordAnalyticsService = new LandlordAnalyticsService();
