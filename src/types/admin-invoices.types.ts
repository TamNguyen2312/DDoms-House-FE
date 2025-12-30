// Types for Admin Invoices API

export interface AdminInvoiceItem {
  id: number;
  itemType: "RENT" | "DEPOSIT" | "RENEWAL_DEPOSIT";
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface AdminInvoicePayment {
  paymentId: number;
  provider: string;
  providerTxnId: string;
  amount: number;
  status: "SUCCEEDED" | "FAILED" | "INITIATED" | "CANCELLED";
  createdAt: string;
  succeededAt?: string;
}

export interface AdminInvoiceTenant {
  userId: number;
  fullName: string | null;
  phone: string;
  email: string;
  idNumber: string | null;
}

export interface AdminInvoiceLandlord {
  userId: number;
  displayName: string | null;
  phone: string;
  email: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
}

export interface AdminInvoiceUnit {
  id: number;
  code: string;
  propertyId: number;
  propertyName: string;
  propertyAddress: string;
  baseRent: number;
}

export interface AdminInvoice {
  id: number;
  invoiceType: "CONTRACT" | "SERVICE";
  contractId: number;
  cycleMonth: string;
  status: "ISSUED" | "PAID" | "OVERDUE" | "CANCELLED";
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  issuedAt: string;
  dueAt: string;
  isPrerequisite: boolean;
  createdAt: string;
  tenant: AdminInvoiceTenant;
  landlord: AdminInvoiceLandlord;
  unit: AdminInvoiceUnit;
  items: AdminInvoiceItem[];
  payment: AdminInvoicePayment | null;
}

export interface AdminInvoicesPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface AdminInvoicesData {
  success: boolean;
  message: string;
  status: string;
  content: AdminInvoice[];
  pagination: AdminInvoicesPagination;
  contentSize: number;
}

export interface AdminInvoicesResponse {
  success: boolean;
  message: string;
  status: string;
  data: AdminInvoicesData;
}

export interface GetAdminInvoicesRequest {
  month?: string; // Format: YYYY-MM
  status?: "ISSUED" | "PAID" | "OVERDUE" | "CANCELLED" | "ALL";
  invoiceType?: "CONTRACT" | "SERVICE" | "ALL";
  page?: number;
  size?: number;
}