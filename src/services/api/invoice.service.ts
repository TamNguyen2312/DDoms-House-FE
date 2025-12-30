import type {
  CreateInvoiceFromContractRequest,
  InitiateInvoicePaymentRequest,
  Invoice,
  PaymentResponse,
  ServiceInvoicesResponse,
} from "@/types/invoice.types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class InvoiceService {
  private readonly BASE_PATH_LANDLORD = "/landlord/contracts";
  private readonly BASE_PATH_TENANT = "/tenant/contracts";

  /**
   * Create invoice from contract (Landlord)
   * POST /api/landlord/contracts/{contract_id}/invoices
   */
  async createInvoiceFromContract(
    contractId: number,
    data: CreateInvoiceFromContractRequest
  ) {
    const response = await axiosInstance.post<ApiResponse<Invoice>>(
      `${this.BASE_PATH_LANDLORD}/${contractId}/invoices`,
      data
    );
    return response.data;
  }

  /**
   * Send invoice OTP payment (Tenant) - HÓA ĐƠN THƯỜNG
   * POST /api/tenant/contracts/{contract_id}/invoices/{invoice_id}/otp
   * Gửi OTP thanh toán tới email tenant trước khi khởi tạo payment.
   * Hóa đơn phải ISSUED và chưa PAID
   *
   * Lưu ý: Đây là API cho HÓA ĐƠN THƯỜNG (regular invoice)
   * Để gửi OTP cho hóa đơn dịch vụ, dùng sendTenantServiceInvoiceOTP()
   */
  async sendInvoiceOTP(contractId: number, invoiceId: number) {
    // Validate invoiceId before making request
    if (!invoiceId || isNaN(invoiceId) || invoiceId <= 0) {
      throw new Error(`Invalid invoiceId: ${invoiceId}`);
    }

    if (!contractId || isNaN(contractId) || contractId <= 0) {
      throw new Error(`Invalid contractId: ${contractId}`);
    }

    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      `${this.BASE_PATH_TENANT}/${contractId}/invoices/${invoiceId}/otp`
    );
    return response.data;
  }

  /**
   * Initiate invoice payment (Tenant)
   * POST /api/tenant/contracts/{contract_id}/invoices/{invoice_id}/payments
   */
  async initiateInvoicePayment(
    contractId: number,
    invoiceId: number,
    data: InitiateInvoicePaymentRequest
  ) {
    const response = await axiosInstance.post<ApiResponse<PaymentResponse>>(
      `${this.BASE_PATH_TENANT}/${contractId}/invoices/${invoiceId}/payments`,
      data
    );
    return response.data;
  }

  /**
   * Get invoices by contract (Landlord)
   * GET /api/landlord/contracts/{contract_id}/invoices
   */
  async getInvoicesByContract(contractId: number) {
    const response = await axiosInstance.get<ApiResponse<Invoice[]>>(
      `${this.BASE_PATH_LANDLORD}/${contractId}/invoices`
    );
    return response.data;
  }

  /**
   * Get invoices by contract (Tenant)
   * GET /api/tenant/contracts/{contract_id}/invoices
   */
  async getInvoicesByContractForTenant(contractId: number) {
    const response = await axiosInstance.get<ApiResponse<Invoice[]>>(
      `${this.BASE_PATH_TENANT}/${contractId}/invoices`
    );
    return response.data;
  }

  /**
   * Get invoice detail by ID (Landlord)
   * GET /api/landlord/contracts/{contract_id}/invoices/{invoice_id}
   */
  async getInvoiceDetail(contractId: number, invoiceId: number) {
    const response = await axiosInstance.get<ApiResponse<Invoice>>(
      `${this.BASE_PATH_LANDLORD}/${contractId}/invoices/${invoiceId}`
    );
    return response.data;
  }

  /**
   * Get invoice detail by ID (Tenant)
   * GET /api/tenant/contracts/{contract_id}/invoices/{invoice_id}
   */
  async getInvoiceDetailForTenant(contractId: number, invoiceId: number) {
    const response = await axiosInstance.get<ApiResponse<Invoice>>(
      `${this.BASE_PATH_TENANT}/${contractId}/invoices/${invoiceId}`
    );
    return response.data;
  }

  /**
   * Get all service invoices for landlord
   * GET /api/landlord/service-invoices
   */
  async getServiceInvoices() {
    const response = await axiosInstance.get<ServiceInvoicesResponse>(
      "/landlord/service-invoices"
    );
    return response.data;
  }

  /**
   * Create service invoice for landlord
   * POST /api/landlord/service-invoices
   */
  async createServiceInvoice(data: {
    contractId: number;
    cycleMonth: string;
    dueAt: string;
    taxAmount: number;
    items: Array<{
      itemType: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    const response = await axiosInstance.post<ApiResponse<Invoice>>(
      "/landlord/service-invoices",
      data
    );
    return response.data;
  }

  /**
   * Get service invoices by contract (Landlord)
   * GET /api/landlord/service-invoices/contracts/{contract_id}
   */
  async getServiceInvoicesByContract(contractId: number) {
    const response = await axiosInstance.get<ApiResponse<Invoice[]>>(
      `/landlord/service-invoices/contracts/${contractId}`
    );
    return response.data;
  }

  /**
   * Get service invoice detail (Landlord)
   * GET /api/landlord/service-invoices/{service_invoice_id}
   */
  async getServiceInvoiceDetail(serviceInvoiceId: number) {
    const response = await axiosInstance.get<ApiResponse<Invoice>>(
      `/landlord/service-invoices/${serviceInvoiceId}`
    );
    return response.data;
  }

  /**
   * Get all service invoices (Tenant) with pagination - HÓA ĐƠN DỊCH VỤ
   * GET /api/tenant/service-invoices?page=0&size=10&sort=createdAt&direction=DESC
   *
   * Response Structure:
   * {
   *   "success": true,
   *   "message": "Success",
   *   "status": "OK",
   *   "content": Invoice[],
   *   "pagination": {
   *     "currentPage": 0,
   *     "pageSize": 10,
   *     "totalPages": 1,
   *     "totalElements": 1,
   *     "hasNext": false,
   *     "hasPrevious": false,
   *     "first": true,
   *     "last": true
   *   },
   *   "contentSize": 1
   * }
   */
  async getTenantServiceInvoices(params?: {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "ASC" | "DESC";
  }) {
    const response = await axiosInstance.get<ServiceInvoicesResponse>(
      "/tenant/service-invoices",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "createdAt",
          direction: params?.direction ?? "DESC",
        },
      }
    );
    return response.data;
  }

  /**
   * Get service invoices by contract (Tenant) with pagination
   * GET /api/tenant/service-invoices/contracts/{contract_id}?page=0&size=10&sort=createdAt&direction=DESC
   */
  async getTenantServiceInvoicesByContract(
    contractId: number,
    params?: {
      page?: number;
      size?: number;
      sort?: string;
      direction?: "ASC" | "DESC";
    }
  ) {
    const response = await axiosInstance.get<
      ApiResponse<ServiceInvoicesResponse>
    >(`/tenant/service-invoices/contracts/${contractId}`, {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        sort: params?.sort ?? "createdAt",
        direction: params?.direction ?? "DESC",
      },
    });
    return response.data;
  }

  /**
   * Get service invoice detail (Tenant)
   * GET /api/tenant/service-invoices/{service_invoice_id}
   */
  async getTenantServiceInvoiceDetail(serviceInvoiceId: number) {
    const response = await axiosInstance.get<ApiResponse<Invoice>>(
      `/tenant/service-invoices/${serviceInvoiceId}`
    );
    return response.data;
  }

  /**
   * Send service invoice OTP (Tenant) - HÓA ĐƠN DỊCH VỤ
   * POST /api/tenant/service-invoices/{service_invoice_id}/otp
   * Gửi OTP thanh toán tới email tenant trước khi khởi tạo payment cho hóa đơn dịch vụ.
   *
   * Lưu ý: Đây là API cho HÓA ĐƠN DỊCH VỤ (service invoice)
   * Khác với hóa đơn thường, không cần contractId, chỉ cần serviceInvoiceId
   * Để gửi OTP cho hóa đơn thường, dùng sendInvoiceOTP()
   */
  async sendTenantServiceInvoiceOTP(serviceInvoiceId: number) {
    const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
      `/tenant/service-invoices/${serviceInvoiceId}/otp`
    );
    return response.data;
  }

  /**
   * Initiate service invoice payment (Tenant) - HÓA ĐƠN DỊCH VỤ
   * POST /api/tenant/service-invoices/{service_invoice_id}/payments
   *
   * Request Body:
   * {
   *   "provider": "PAYOS" | "VNPAY" | "MOMO",
   *   "otpCode": "509474",
   *   "returnUrl": "https://...",
   *   "cancelUrl": "https://...",
   *   "metadata": {
   *     "buyerName": "Tenant Test",
   *     "buyerEmail": "tamnhmse180660@fpt.edu.vn",
   *     "buyerPhone": "0901234567"
   *   }
   * }
   *
   * Response: PaymentResponse với paymentId và paymentUrl
   */
  async initiateTenantServiceInvoicePayment(
    serviceInvoiceId: number,
    data: InitiateInvoicePaymentRequest
  ) {
    const response = await axiosInstance.post<ApiResponse<PaymentResponse>>(
      `/tenant/service-invoices/${serviceInvoiceId}/payments`,
      data
    );
    return response.data;
  }

  /**
   * Get service payment status (Tenant)
   * GET /api/tenant/service-payments/{service_payment_id}
   */
  async getTenantServicePaymentStatus(servicePaymentId: string) {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/tenant/service-payments/${servicePaymentId}`
    );
    return response.data;
  }

  /**
   * Sync service payment status (Tenant) - HÓA ĐƠN DỊCH VỤ
   * POST /api/tenant/service-payments/{service_payment_id}/sync
   * Đồng bộ trạng thái thanh toán hóa đơn dịch vụ từ provider (PayOS/VNPay/MoMo)
   *
   * Lưu ý: Đây là API riêng cho HÓA ĐƠN DỊCH VỤ (service invoice payment)
   * Khác với thanh toán hóa đơn thường dùng /api/payments/{payment_id}/sync
   */
  async syncTenantServicePaymentStatus(servicePaymentId: string) {
    const response = await axiosInstance.post<ApiResponse<any>>(
      `/tenant/service-payments/${servicePaymentId}/sync`
    );
    return response.data;
  }

  /**
   * Cancel service payment (Tenant)
   * POST /api/tenant/service-payments/{service_payment_id}/cancel
   */
  async cancelTenantServicePayment(servicePaymentId: string) {
    const response = await axiosInstance.post<ApiResponse<any>>(
      `/tenant/service-payments/${servicePaymentId}/cancel`
    );
    return response.data;
  }
}

export const invoiceService = new InvoiceService();
