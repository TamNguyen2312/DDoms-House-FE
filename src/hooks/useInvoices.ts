import { invoiceService } from "@/services/api/invoice.service";
import type {
  CreateInvoiceFromContractRequest,
  InitiateInvoicePaymentRequest,
} from "@/types/invoice.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";

/**
 * Hook for creating invoice from contract (Landlord)
 */
export const useCreateInvoiceFromContract = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: number;
      data: CreateInvoiceFromContractRequest;
    }) => invoiceService.createInvoiceFromContract(contractId, data),
    onSuccess: (_, variables) => {
      // Invalidate invoices query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["invoices", "contract", variables.contractId],
      });
      toast.success("Tạo thanh toán thành công");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi Tạo thanh toán"
      );
    },
  });
};

/**
 * Hook for sending invoice OTP payment (Tenant)
 * Lưu ý: Hóa đơn phải tồn tại, thuộc hợp đồng và tenant, có status ISSUED và chưa PAID
 */
export const useSendInvoiceOTP = () => {
  const toast = useToast();
  return useMutation({
    mutationFn: ({
      contractId,
      invoiceId,
    }: {
      contractId: number;
      invoiceId: number;
    }) => invoiceService.sendInvoiceOTP(contractId, invoiceId),
    onSuccess: () => {
      toast.success("OTP đã được gửi tới email của bạn");
    },
    onError: (error: any) => {
      const errorData = error?.response?.data;
      const errorCode = errorData?.code;
      const errorMessage = errorData?.message || "Có lỗi xảy ra khi gửi OTP thanh toán";
      
      // Xử lý các lỗi cụ thể
      if (errorCode === "INVOICE_NOT_FOUND") {
        toast.error("Không tìm thấy hóa đơn. Vui lòng kiểm tra lại thông tin hóa đơn và hợp đồng.");
      } else if (errorCode === "INVOICE_NOT_ISSUED") {
        toast.error("Hóa đơn chưa được phát hành hoặc không ở trạng thái phù hợp để thanh toán.");
      } else if (errorCode === "INVOICE_ALREADY_PAID") {
        toast.error("Hóa đơn này đã được thanh toán.");
      } else {
        toast.error(errorMessage);
      }
      
      console.error("sendInvoiceOTP error:", {
        error,
        errorCode,
        errorMessage,
        errorData,
      });
    },
  });
};

/**
 * Hook for initiating invoice payment (Tenant)
 */
export const useInitiateInvoicePayment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      invoiceId,
      data,
    }: {
      contractId: number;
      invoiceId: number;
      data: InitiateInvoicePaymentRequest;
    }) => invoiceService.initiateInvoicePayment(contractId, invoiceId, data),
    onSuccess: (response) => {
      // Invalidate invoices query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["invoices"] });

      // Note: Sync được gọi trong component sau khi initiate payment thành công
      // để tránh circular dependency và đảm bảo sync được gọi ngay cả khi có lỗi

      // Don't automatically redirect - let component handle it
      // Component can handle paymentUrl or paymentId as needed
      if (!response.data.paymentUrl && !response.data.transactionId) {
        toast.success("Khởi tạo thanh toán thành công");
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi khởi tạo thanh toán"
      );
    },
  });
};

/**
 * Hook for getting invoices by contract (Landlord)
 */
export const useGetInvoicesByContract = (
  contractId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["invoices", "contract", contractId, "landlord"],
    queryFn: () => invoiceService.getInvoicesByContract(contractId),
    enabled: enabled && contractId > 0,
    select: (response) => {
      // Handle different possible response structures
      // API returns: { success, message, status, data: { content: [...], pagination: {...} } }
      // Service returns response.data, so in select: response = { success, message, status, data: { content: [...], pagination: {...} } }
      let invoices: any[] = [];

      if (Array.isArray(response?.data?.content)) {
        invoices = response.data.content;
      } else if (Array.isArray(response?.content)) {
        invoices = response.content;
      } else if (Array.isArray(response?.data)) {
        invoices = response.data;
      } else if (Array.isArray(response?.data?.data?.content)) {
        invoices = response.data.data.content;
      } else if (Array.isArray(response)) {
        invoices = response;
      }

      // Ensure all invoices have a valid id field
      // Some APIs might return invoiceId instead of id
      return invoices.map((invoice) => {
        // If invoice doesn't have id, try invoiceId
        if (!invoice.id && invoice.invoiceId) {
          return { ...invoice, id: invoice.invoiceId };
        }
        // Ensure id is a number if it's a string
        if (typeof invoice.id === "string") {
          const numId = parseInt(invoice.id, 10);
          if (!isNaN(numId)) {
            return { ...invoice, id: numId };
          }
        }
        return invoice;
      });
    },
  });
};

/**
 * Hook for getting invoices by contract (Tenant)
 */
export const useGetInvoicesByContractForTenant = (
  contractId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["invoices", "contract", contractId, "tenant"],
    queryFn: () => invoiceService.getInvoicesByContractForTenant(contractId),
    enabled: enabled && contractId > 0,
    select: (response) => {
      // Handle different possible response structures
      // API returns: { success, message, status, data: { content: [...], pagination: {...} } }
      // Service returns response.data, so in select: response = { success, message, status, data: { content: [...], pagination: {...} } }
      let invoices: any[] = [];

      if (Array.isArray(response?.data?.content)) {
        invoices = response.data.content;
      } else if (Array.isArray(response?.content)) {
        invoices = response.content;
      } else if (Array.isArray(response?.data)) {
        invoices = response.data;
      } else if (Array.isArray(response?.data?.data?.content)) {
        invoices = response.data.data.content;
      } else if (Array.isArray(response)) {
        invoices = response;
      }

      // Normalize invoice IDs: Ensure all invoices have a valid id field
      // Some APIs might return invoiceId instead of id, or string instead of number
      return invoices.map((invoice) => {
        // If invoice doesn't have id, try invoiceId
        if (!invoice.id && invoice.invoiceId) {
          return { ...invoice, id: invoice.invoiceId };
      }
        // Ensure id is a number if it's a string
        if (typeof invoice.id === "string") {
          const numId = parseInt(invoice.id, 10);
          if (!isNaN(numId)) {
            return { ...invoice, id: numId };
          }
        }
        return invoice;
      });
    },
  });
};

/**
 * Hook for getting invoice detail by ID (Landlord)
 */
export const useGetInvoiceDetail = (
  contractId: number,
  invoiceId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: [
      "invoices",
      "contract",
      contractId,
      "invoice",
      invoiceId,
      "landlord",
    ],
    queryFn: () => invoiceService.getInvoiceDetail(contractId, invoiceId),
    enabled: enabled && contractId > 0 && invoiceId > 0,
    select: (response) => response.data,
  });
};

/**
 * Hook for getting invoice detail by ID (Tenant)
 */
export const useGetInvoiceDetailForTenant = (
  contractId: number,
  invoiceId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: [
      "invoices",
      "contract",
      contractId,
      "invoice",
      invoiceId,
      "tenant",
    ],
    queryFn: () =>
      invoiceService.getInvoiceDetailForTenant(contractId, invoiceId),
    enabled: enabled && contractId > 0 && invoiceId > 0,
    select: (response) => response.data,
  });
};

/**
 * Hook for getting all service invoices for landlord
 * GET /api/landlord/service-invoices
 */
export const useGetServiceInvoices = () => {
  return useQuery({
    queryKey: ["invoices", "service", "landlord"],
    queryFn: () => invoiceService.getServiceInvoices(),
    select: (response) => response.content || [],
  });
};

/**
 * Hook for getting service invoice detail (Landlord)
 * GET /api/landlord/service-invoices/{service_invoice_id}
 */
export const useGetServiceInvoiceDetail = (
  serviceInvoiceId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["invoices", "service", "detail", serviceInvoiceId, "landlord"],
    queryFn: () => invoiceService.getServiceInvoiceDetail(serviceInvoiceId),
    enabled: enabled && serviceInvoiceId > 0,
    select: (response) => response.data,
  });
};

/**
 * Hook for creating service invoice (Landlord)
 */
export const useCreateServiceInvoice = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
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
    }) => invoiceService.createServiceInvoice(data),
    onSuccess: (_, variables) => {
      // Invalidate invoices query for the contract to refresh the list
      // Since getInvoicesByContract returns both CONTRACT and SERVICE invoices
      queryClient.invalidateQueries({
        queryKey: ["invoices", "contract", variables.contractId, "landlord"],
      });
      // Also invalidate all service invoices query as fallback
      queryClient.invalidateQueries({
        queryKey: ["invoices", "service", "landlord"],
      });
      toast.success("Tạo hóa đơn dịch vụ thành công");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi tạo hóa đơn dịch vụ"
      );
    },
  });
};

// ============================================
// TENANT SERVICE INVOICES Hooks
// ============================================

/**
 * Hook for getting all service invoices for tenant with pagination - HÓA ĐƠN DỊCH VỤ
 * GET /api/tenant/service-invoices?page=0&size=10&sort=createdAt&direction=DESC
 * 
 * Response Structure:
 * {
 *   success: boolean,
 *   message: string,
 *   status: string,
 *   content: Invoice[],
 *   pagination: ServiceInvoicesPagination,
 *   contentSize: number
 * }
 */
export const useGetTenantServiceInvoices = (
  params?: {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "ASC" | "DESC";
  },
  enabled = true
) => {
  return useQuery({
    queryKey: ["invoices", "service", "tenant", params],
    queryFn: () => invoiceService.getTenantServiceInvoices(params),
    enabled,
    select: (response) => {
      // Response từ service đã là ServiceInvoicesResponse (response.data từ axios)
      // Handle paginated response structure
      if (response?.content && Array.isArray(response.content)) {
        return {
          content: response.content,
          pagination: response.pagination,
          contentSize: response.contentSize,
        };
      }
      // Fallback for non-paginated response
      if (Array.isArray(response?.data?.content)) {
        return {
          content: response.data.content,
          pagination: response.data.pagination,
          contentSize: response.data.contentSize,
        };
      }
      if (Array.isArray(response?.data)) {
        return {
          content: response.data,
          pagination: null,
          contentSize: response.data.length,
        };
      }
      if (Array.isArray(response)) {
        return {
          content: response,
          pagination: null,
          contentSize: response.length,
        };
      }
      return {
        content: [],
        pagination: null,
        contentSize: 0,
      };
    },
  });
};

/**
 * Hook for getting service invoices by contract (Tenant) with pagination
 * GET /api/tenant/service-invoices/contracts/{contract_id}?page=0&size=10&sort=createdAt&direction=DESC
 */
export const useGetTenantServiceInvoicesByContract = (
  contractId: number,
  params?: {
    page?: number;
    size?: number;
    sort?: string;
    direction?: "ASC" | "DESC";
  },
  enabled = true
) => {
  return useQuery({
    queryKey: ["invoices", "service", "contract", contractId, "tenant", params],
    queryFn: () =>
      invoiceService.getTenantServiceInvoicesByContract(contractId, params),
    enabled: enabled && contractId > 0,
    select: (response) => {
      // Handle paginated response structure
      if (response?.data?.content && Array.isArray(response.data.content)) {
        return {
          content: response.data.content,
          pagination: response.data.pagination,
          contentSize: response.data.contentSize,
        };
      }
      // Fallback for non-paginated response
      if (Array.isArray(response?.data)) {
        return {
          content: response.data,
          pagination: null,
          contentSize: response.data.length,
        };
      }
      if (Array.isArray(response?.data?.content)) {
        return {
          content: response.data.content,
          pagination: response.data.pagination,
          contentSize: response.data.contentSize,
        };
      }
      if (Array.isArray(response?.content)) {
        return {
          content: response.content,
          pagination: response.pagination,
          contentSize: response.contentSize,
        };
      }
      if (Array.isArray(response)) {
        return {
          content: response,
          pagination: null,
          contentSize: response.length,
        };
      }
      return {
        content: [],
        pagination: null,
        contentSize: 0,
      };
    },
  });
};

/**
 * Hook for getting service invoice detail (Tenant)
 * GET /api/tenant/service-invoices/{service_invoice_id}
 */
export const useGetTenantServiceInvoiceDetail = (
  serviceInvoiceId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["invoices", "service", "detail", serviceInvoiceId, "tenant"],
    queryFn: () =>
      invoiceService.getTenantServiceInvoiceDetail(serviceInvoiceId),
    enabled: enabled && serviceInvoiceId > 0,
    select: (response) => response.data,
  });
};

/**
 * Hook for sending service invoice OTP (Tenant)
 * POST /api/tenant/service-invoices/{service_invoice_id}/otp
 */
export const useSendTenantServiceInvoiceOTP = () => {
  const toast = useToast();
  return useMutation({
    mutationFn: (serviceInvoiceId: number) =>
      invoiceService.sendTenantServiceInvoiceOTP(serviceInvoiceId),
    onSuccess: () => {
      toast.success("OTP đã được gửi tới email của bạn");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi gửi OTP thanh toán"
      );
    },
  });
};

/**
 * Hook for initiating service invoice payment (Tenant) - HÓA ĐƠN DỊCH VỤ
 * POST /api/tenant/service-invoices/{service_invoice_id}/payments
 * 
 * Request Body: InitiateInvoicePaymentRequest
 * {
 *   provider: "PAYOS" | "VNPAY" | "MOMO",
 *   otpCode: string (6 số),
 *   returnUrl: string,
 *   cancelUrl: string,
 *   metadata: {
 *     buyerName: string,
 *     buyerEmail: string,
 *     buyerPhone: string
 *   }
 * }
 * 
 * Response: PaymentResponse với paymentId và paymentUrl
 */
export const useInitiateTenantServiceInvoicePayment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceInvoiceId,
      data,
    }: {
      serviceInvoiceId: number;
      data: InitiateInvoicePaymentRequest;
    }) =>
      invoiceService.initiateTenantServiceInvoicePayment(
        serviceInvoiceId,
        data
      ),
    onSuccess: (response) => {
      // Invalidate service invoices query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["invoices", "service"] });

      // Gọi API đồng bộ ngay sau khi khởi tạo thanh toán (nếu có paymentId)
      // Note: Sync được gọi trong component để tránh circular dependency
      // Component sẽ tự động gọi sync sau khi initiate payment thành công

      // Don't automatically redirect - let component handle it
      if (!response.data.paymentUrl && !response.data.transactionId) {
        toast.success("Khởi tạo thanh toán thành công");
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi khởi tạo thanh toán"
      );
    },
  });
};

/**
 * Hook for syncing tenant service payment status - HÓA ĐƠN DỊCH VỤ
 * POST /api/tenant/service-payments/{service_payment_id}/sync
 * Đồng bộ trạng thái thanh toán hóa đơn dịch vụ từ provider
 * 
 * Lưu ý: Đây là API riêng cho service payment
 * Khác với useSyncPaymentStatus() dùng cho hóa đơn thường
 */
export const useSyncTenantServicePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (servicePaymentId: string | number) => {
      const paymentIdString = String(servicePaymentId);
      return invoiceService.syncTenantServicePaymentStatus(paymentIdString);
    },
    onSuccess: (_response, servicePaymentId) => {
      // Invalidate service invoices query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["invoices", "service"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contracts"],
      });
      // Không hiển thị toast - sync là background operation
    },
    onError: (_error: any) => {
      // Không hiển thị toast error - sync là background operation
    },
  });
};
