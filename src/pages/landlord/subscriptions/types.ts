// Các kiểu dữ liệu cho Landlord Subscription API

export type ILandlordSubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "SUSPENDED"
  | "EXPIRED"
  | "PENDING";

export interface ILandlordCurrentSubscription {
  subscriptionId: number;
  status: ILandlordSubscriptionStatus;
  autoRenew: boolean;
  startedAt: string;
  expiresAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  planId: number;
  planCode: string;
  planName: string;
  planDescription: string;
  durationMonths: number;
  listPrice: number;
  planVersionId: number;
  versionNo: number;
  landlordId: number;
  landlordEmail: string;
  landlordPhone: string;
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
}

export interface ILandlordCurrentSubscriptionResponse {
  success: boolean;
  message: string;
  status: string;
  data: ILandlordCurrentSubscription;
}

export interface ILandlordSubscriptionHistory {
  subscriptionId: number;
  landlordId: number;
  landlordEmail: string;
  planId: number;
  planCode: string;
  planName: string;
  listPrice: number;
  status: ILandlordSubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  daysRemaining: number | null;
  createdAt: string;
}

export interface GetLandlordSubscriptionHistoryRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
}

export interface LandlordSubscriptionHistoryResponse {
  content: ILandlordSubscriptionHistory[];
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

export interface LandlordSubscriptionHistoryApiResponse {
  success: boolean;
  message: string;
  status: string;
  content: ILandlordSubscriptionHistory[];
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

export interface PurchaseSubscriptionRequest {
  planCode: string;
}

export interface PurchaseSubscriptionResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    subscriptionId: number;
    paymentId?: string;
    paymentUrl?: string;
  };
}

export interface SwitchSubscriptionRequest {
  planCode: string;
  autoRenew: boolean;
  provider: "PAYOS" | "VNPAY" | "MOMO";
}

export interface SwitchSubscriptionResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    subscriptionId: number;
    paymentId?: string;
    paymentUrl?: string;
  };
}

export interface CheckoutSubscriptionRequest {
  planCode: string;
  autoRenew: boolean;
  provider: "PAYOS" | "VNPAY" | "MOMO";
}

export interface CheckoutSubscriptionResponse {
  success: boolean;
  message: string;
  status: string;
  data: {
    subscriptionId: number;
    subInvoiceId: number;
    paymentId: number;
    paymentUrl: string;
    providerTxnId: string;
    provider: "PAYOS" | "VNPAY" | "MOMO";
    amount: number;
  };
}

export interface SyncSubscriptionPaymentResponse {
  status: string;
  message: string;
  data: {
    paymentId: number;
    status: string;
    subscriptionId: number;
    amount: number;
  };
}
