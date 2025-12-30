// Types for Admin Payments API
export interface IPayment {
  payment_id: string;
  invoiceId: string;
  tenant_id: string;
  provider: string;
  provider_txn_id: string;
  amount: number;
  status: string;
  created_at: string;
  succeeded_at: string | null;
  invoice: {
    cycle_month: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    due_at: string;
    items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
    }>;
  };
}

export interface GetPaymentsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  status?: string;
  provider?: string;
}

export interface PaymentsPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface PaymentsResponse {
  success: boolean;
  message: string;
  status: string;
  content: IPayment[];
  pagination: PaymentsPagination;
  contentSize: number;
}

// ============================================
// ADMIN API Types
// ============================================

export interface AdminPaymentUnit {
  unitId: number;
  unitCode: string;
  propertyId: number;
  propertyName: string;
  addressLine: string;
  ward: string;
  district: string | null;
  city: string;
}

export interface AdminPaymentUser {
  userId: number;
  displayName: string | null;
  email: string;
  phone: string;
}

export interface AdminPaymentItem {
  id: number;
  invoiceId: number | null;
  contractId: number;
  serviceInvoiceId: number | null;
  paymentType: "CONTRACT" | "SERVICE";
  provider: string;
  status: "INITIATED" | "SUCCEEDED" | "FAILED" | "CANCELLED";
  amount: number;
  currency: string;
  providerTxnId: string;
  checkoutUrl: string;
  createdAt: string;
  succeededAt: string | null;
  unit: AdminPaymentUnit;
  landlord: AdminPaymentUser;
  tenant: AdminPaymentUser;
}

export interface GetAdminPaymentsRequest {
  status?: string;
  provider?: string;
  tenantId?: number;
  invoiceId?: number;
  serviceInvoiceId?: number;
  paymentType?: string;
  page?: number;
  size?: number;
}

export interface AdminPaymentsResponse {
  success: boolean;
  message: string;
  status: string;
  content: AdminPaymentItem[];
  pagination: PaymentsPagination;
  contentSize: number;
}

export interface AdminPaymentDetailResponse {
  success: boolean;
  message: string;
  status: string;
  data: AdminPaymentItem;
}

