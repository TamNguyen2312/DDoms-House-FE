import type {
    AdminInvoicesResponse,
    GetAdminInvoicesRequest,
} from "@/types/admin-invoices.types";
import axiosInstance from "./axios.config";

class AdminInvoicesService {
  private readonly BASE_PATH = "/admin/invoices";

  /**
   * Get paginated list of invoices (Admin only)
   * GET /api/admin/invoices?month=2025-03&status=PAID&invoiceType=ALL&page=0&size=20
   */
  async getInvoices(params?: GetAdminInvoicesRequest) {
    const response = await axiosInstance.get<AdminInvoicesResponse>(
      this.BASE_PATH,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          ...(params?.month && { month: params.month }),
          ...(params?.status && params.status !== "ALL" && { status: params.status }),
          ...(params?.invoiceType && params.invoiceType !== "ALL" && { invoiceType: params.invoiceType }),
        },
      }
    );
    return response.data;
  }
}

export const adminInvoicesService = new AdminInvoicesService();