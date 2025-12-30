import type {
    MonthlyStatisticsRequest,
    MonthlyStatisticsResponse,
} from "@/types/admin-invoice-statistics.types";
import axiosInstance from "./axios.config";

/**
 * Admin Invoice Statistics Service
 * Handles API calls for admin invoice statistics and monthly reports
 */
class AdminInvoiceStatisticsService {
  private readonly BASE_PATH = "/admin/invoices";

  /**
   * Get monthly invoice statistics for admin
   * GET /api/admin/invoices/monthly-statistics?month=2025-12
   * 
   * @param params - Request parameters containing month in YYYY-MM format
   * @returns Promise<MonthlyStatisticsResponse>
   */
  async getMonthlyStatistics(params: MonthlyStatisticsRequest) {
    const response = await axiosInstance.get<MonthlyStatisticsResponse>(
      `${this.BASE_PATH}/monthly-statistics`,
      {
        params: {
          month: params.month,
        },
      }
    );
    return response.data;
  }
}

export const adminInvoiceStatisticsService = new AdminInvoiceStatisticsService();