/**
 * Payment Types
 */

export type PaymentProvider = "PAYOS" | "VNPAY" | "MOMO";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED";

/**
 * Create Payment Request
 * POST /api/payments
 */
export interface CreatePaymentRequest {
  invoiceId: number;
  tenantId: number;
  amount: number;
  currency?: string; // Default: "VND"
  provider: PaymentProvider;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: {
    contractId?: string | number;
    [key: string]: unknown;
  };
}

/**
 * Create Payment Response
 */
export interface CreatePaymentResponse {
  paymentId: string;
  paymentUrl: string;
  qrCode?: string;
  expiresAt?: string;
}

/**
 * Payment Detail Response
 * GET /api/payments/{payment_id}
 */
export interface PaymentDetail {
  id: string;
  provider: PaymentProvider;
  providerOrderId: string;
  status: PaymentStatus;
  amount: number;
  orderId: string;
  orderDescription?: string;
  returnUrl?: string;
  cancelUrl?: string;
  paymentUrl?: string;
  qrCode?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  paidAt?: string;
}

/**
 * Sync Payment Request
 * POST /api/payments/{payment_id}/sync
 */
// No request body needed

/**
 * Sync Payment Response
 */
export interface SyncPaymentResponse {
  status: PaymentStatus;
  message?: string;
}

/**
 * Cancel Payment Request
 * POST /api/payments/{payment_id}/cancel
 */
// No request body needed

/**
 * Cancel Payment Response
 */
export interface CancelPaymentResponse {
  success: boolean;
  message?: string;
}

/**
 * Webhook Payload (from Provider)
 */
export interface PaymentWebhookPayload {
  providerOrderId: string;
  status: "SUCCESS" | "FAILED" | "CANCELLED" | "PENDING";
  amount: number;
  [key: string]: unknown;
}

/**
 * Simulate Webhook Request
 * POST /api/payments/webhook/simulate
 */
export interface SimulateWebhookRequest {
  provider: PaymentProvider;
  signature: string;
  payload: PaymentWebhookPayload;
}

/**
 * Simulate Webhook Response
 */
export interface SimulateWebhookResponse {
  success: boolean;
  message?: string;
}
