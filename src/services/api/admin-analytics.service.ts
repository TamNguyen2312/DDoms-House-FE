import axiosInstance, { type ApiResponse } from "./axios.config";

// Types for API responses
export interface SubscriptionAnalyticsResponse {
  totalSubscriptions: number;
  activeCount: number;
  newCount: number;
  autoRenewOn: number;
  expiringSoon: number;
  churned: number;
  revenue: number;
  byStatus: Record<string, number>;
  byPlan: Record<string, number>;
  timeSeries: Array<{ date: string; count: number; amount: number }>;
}

export interface PropertyAnalyticsResponse {
  totalProperties: number;
  totalUnits: number;
  availableUnits: number;
  occupiedUnits: number;
  maintenanceUnits: number;
  listingsPending: number;
  listingsApproved: number;
  listingsRejected: number;
  listingsWithdrawn: number;
  propertiesCreatedInRange: number;
  moveInOut: { moveOut: number; moveIn: number };
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
export interface SubscriptionAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  planCode?: string;
  landlordId?: string;
  status?: string;
}

export interface PropertyAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  landlordId?: string;
  city?: string;
  district?: string;
  unitStatus?: string;
}

export interface InvoiceAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  invoiceType?: string;
  status?: string;
  landlordId?: string;
  tenantId?: string;
  contractId?: string;
  subscriptionId?: string;
}

export interface PaymentAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  paymentType?: string;
  provider?: string;
  status?: string;
  landlordId?: string;
  tenantId?: string;
  invoiceId?: string;
  serviceInvoiceId?: string;
  subInvoiceId?: string;
}

export interface ContractAnalyticsParams {
  fromDate?: string;
  toDate?: string;
  status?: string;
  landlordId?: string;
  tenantId?: string;
  unitId?: string;
}

class AdminAnalyticsService {
  private readonly BASE_PATH = "/admin/analytics";

  /**
   * Get subscriptions analytics overview
   * GET /api/admin/analytics/subscriptions/overview
   */
  async getSubscriptionsOverview(params?: SubscriptionAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<SubscriptionAnalyticsResponse>
    >(`${this.BASE_PATH}/subscriptions/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
        ...(params?.planCode && { planCode: params.planCode }),
        ...(params?.landlordId && { landlordId: params.landlordId }),
        ...(params?.status && { status: params.status }),
      },
    });
    return response.data.data;
  }

  /**
   * Get properties and units analytics overview
   * GET /api/admin/analytics/properties-units/overview
   */
  async getPropertiesUnitsOverview(params?: PropertyAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<PropertyAnalyticsResponse>
    >(`${this.BASE_PATH}/properties-units/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
        ...(params?.landlordId && { landlordId: params.landlordId }),
        ...(params?.city && { city: params.city }),
        ...(params?.district && { district: params.district }),
        ...(params?.unitStatus && { unitStatus: params.unitStatus }),
      },
    });
    return response.data.data;
  }

  /**
   * Get invoices analytics overview
   * GET /api/admin/analytics/invoices/overview
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
        ...(params?.landlordId && { landlordId: params.landlordId }),
        ...(params?.tenantId && { tenantId: params.tenantId }),
        ...(params?.contractId && { contractId: params.contractId }),
        ...(params?.subscriptionId && {
          subscriptionId: params.subscriptionId,
        }),
      },
    });
    return response.data.data;
  }

  /**
   * Get payments analytics overview
   * GET /api/admin/analytics/payments/overview
   */
  async getPaymentsOverview(params?: PaymentAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<PaymentAnalyticsResponse>
    >(`${this.BASE_PATH}/payments/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
        ...(params?.paymentType && { paymentType: params.paymentType }),
        ...(params?.provider && { provider: params.provider }),
        ...(params?.status && { status: params.status }),
        ...(params?.landlordId && { landlordId: params.landlordId }),
        ...(params?.tenantId && { tenantId: params.tenantId }),
        ...(params?.invoiceId && { invoiceId: params.invoiceId }),
        ...(params?.serviceInvoiceId && {
          serviceInvoiceId: params.serviceInvoiceId,
        }),
        ...(params?.subInvoiceId && { subInvoiceId: params.subInvoiceId }),
      },
    });
    return response.data.data;
  }

  /**
   * Get contracts analytics overview
   * GET /api/admin/analytics/contracts/overview
   */
  async getContractsOverview(params?: ContractAnalyticsParams) {
    const response = await axiosInstance.get<
      ApiResponse<ContractAnalyticsResponse>
    >(`${this.BASE_PATH}/contracts/overview`, {
      params: {
        ...(params?.fromDate && { fromDate: params.fromDate }),
        ...(params?.toDate && { toDate: params.toDate }),
        ...(params?.status && { status: params.status }),
        ...(params?.landlordId && { landlordId: params.landlordId }),
        ...(params?.tenantId && { tenantId: params.tenantId }),
        ...(params?.unitId && { unitId: params.unitId }),
      },
    });
    return response.data.data;
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
