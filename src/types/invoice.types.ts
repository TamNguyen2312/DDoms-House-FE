// Invoice Item Types
export type InvoiceItemType =
  | "RENT"
  | "DEPOSIT"
  | "ELECTRICITY"
  | "WATER"
  | "OTHER";

export interface InvoiceItem {
  id?: number;
  itemType: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number; // Calculated: quantity * unitPrice
}

// Create Invoice Request (Landlord)
export interface CreateInvoiceFromContractRequest {
  cycleMonth: string; // Format: "2025-01-01"
  dueAt: string; // Format: "2025-01-10T00:00:00Z"
  taxAmount: number;
  items: InvoiceItem[];
}

// Send Invoice OTP Request (Tenant)
// No request body needed, just POST to the endpoint

// Initiate Invoice Payment Request (Tenant)
export type PaymentProvider = "PAYOS" | "VNPAY" | "MOMO";

export interface PaymentMetadata {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}

export interface InitiateInvoicePaymentRequest {
  provider: PaymentProvider;
  otpCode: string;
  returnUrl: string;
  cancelUrl: string;
  metadata: PaymentMetadata;
}

// Invoice Response Types
export interface Invoice {
  id: number | string;
  contractId: number | string;
  tenantId?: number;
  landlordId?: number;
  unitId?: number;
  type?: "CONTRACT" | "SERVICE"; // Type of invoice: CONTRACT (regular) or SERVICE
  cycleMonth: string;
  status: "DRAFT" | "ISSUED" | "PAID" | "OVERDUE" | "CANCELLED";
  subtotal?: number; // Sum of all items amounts
  taxAmount: number;
  totalAmount: number;
  issuedAt?: string;
  dueAt: string;
  paidAt?: string;
  items: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Payment Response
export interface PaymentResponse {
  paymentId?: number; // Tham số để gọi API đồng bộ: POST /api/payments/{paymentId}/sync (hoặc /api/tenant/service-payments/{paymentId}/sync cho service)
  paymentUrl?: string; // Link thanh toán PayOS (để mở trong iframe/redirect)
  transactionId?: string;
  amount?: number;
  provider?: string;
  status: string;
  message?: string;
}

// Service Invoices Pagination
export interface ServiceInvoicesPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

// Service Invoices Response (Paginated)
export interface ServiceInvoicesResponse {
  success: boolean;
  message: string;
  status: string;
  content: Invoice[];
  pagination: ServiceInvoicesPagination;
  contentSize: number;
}
