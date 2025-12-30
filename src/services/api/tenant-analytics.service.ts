import axiosInstance, { type ApiResponse } from "./axios.config";

// Types for API responses - reuse from landlord where applicable
export interface PaymentAnalyticsResponse {
  totalCount: number;
  succeededCount: number;
  failedCount: number;
  pendingCount: number;
  totalAmount: number;
  succeededAmount: number;
  avgTicket: number;
  byType: Record<string, number>;
  byProvider: Record<string, number>;
  timeSeries: Array<{ date: string; count: number; amount: number }>;
}

export interface InvoiceAnalyticsResponse {
  totalCount: number;
  paidCount: number;
  overdueCount: number;
  cancelledCount: number;
  totalAmount: number;
  paidAmount: number;
  avgInvoiceValue: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  timeSeries: Array<{ date: string; count: number; amount: number }>;
}

export interface ContractAnalyticsResponse {
  total: number;
  active: number;
  signed: number;
  terminationPending: number;
  expired: number;
  cancelled: number;
  draft: number;
  byStatus: Record<string, number>;
  timeSeries: Array<{ date: string; count: number; amount: number }>;
}

// Query params interfaces
export interface PaymentAnalyticsParams {
  fromDate?: string;
  toDate?: string;
}

export interface InvoiceAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  invoiceType?: string;
  status?: string;
}

export interface ContractAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  status?: string;
  unitId?: string;
}

class TenantAnalyticsService {
  private readonly BASE_PATH = "/tenant/analytics";

  /**
   * Get payments analytics overview
   * GET /api/tenant/analytics/payments/overview
   */
  async getPaymentsOverview(params?: PaymentAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<PaymentAnalyticsResponse>
    >(`${this.BASE_PATH}/payments/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
      },
    });
    return response.data.data;
  }

  /**
   * Get invoices analytics overview
   * GET /api/tenant/analytics/invoices/overview
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
   * Get contracts analytics overview
   * GET /api/tenant/analytics/contracts/overview
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
}

export const tenantAnalyticsService = new TenantAnalyticsService();
