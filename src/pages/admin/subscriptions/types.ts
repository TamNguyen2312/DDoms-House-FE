// Types for Admin Subscription Management API

export type ISubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "SUSPENDED"
  | "EXPIRED"
  | "PENDING";

export interface ISubscription {
  subscriptionId: number;
  landlordId: number;
  landlordEmail: string;
  planId: number;
  planCode: string;
  planName: string;
  listPrice: number;
  status: ISubscriptionStatus;
  startedAt: string;
  expiresAt: string | null;
  isActive: boolean;
  daysRemaining: number | null;
  createdAt: string;
}

export interface ISubscriptionDetail extends ISubscription {
  autoRenew: boolean;
  cancelledAt: string | null;
  cancelReason: string | null;
  updatedAt: string;
  planDescription: string;
  durationMonths: number;
  planVersionId: number;
  versionNo: number;
  landlordPhone: string;
  isExpired: boolean;
}

export interface GetSubscriptionsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  search?: string;
  status?: ISubscriptionStatus;
  planId?: number;
}

export interface SubscriptionsResponse {
  success: boolean;
  message: string;
  status: string;
  content: ISubscription[];
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

export interface SubscriptionDetailResponse {
  success: boolean;
  message: string;
  status: string;
  data: ISubscriptionDetail;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  byStatus: {
    CANCELLED: number;
    ACTIVE: number;
    SUSPENDED: number;
    EXPIRED: number;
    PENDING: number;
  };
  byPlan: Record<string, number>;
  expiringSoon: number;
  expired: number;
  estimatedRevenue: number;
}

export interface SubscriptionStatsResponse {
  success: boolean;
  message: string;
  status: string;
  data: SubscriptionStats;
}
