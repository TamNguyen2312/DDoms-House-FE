import { adminInvoiceStatisticsService } from "@/services/api/admin-invoice-statistics.service";
import type {
    MonthlyStatisticsData,
    MonthlyStatisticsRequest,
} from "@/types/admin-invoice-statistics.types";
import { useQuery } from "@tanstack/react-query";

/**
 * Query keys for admin invoice statistics
 */
export const adminInvoiceStatisticsKeys = {
  all: ["admin-invoice-statistics"] as const,
  monthly: () => [...adminInvoiceStatisticsKeys.all, "monthly"] as const,
  monthlyParams: (params: MonthlyStatisticsRequest) =>
    [...adminInvoiceStatisticsKeys.all, "monthly", params] as const,
};

/**
 * Hook to get monthly invoice statistics for admin
 * 
 * @param params - Request parameters containing month in YYYY-MM format
 * @param enabled - Whether the query should be enabled (default: true)
 * @returns Query result with monthly statistics data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGetAdminMonthlyStatistics({
 *   month: "2025-12"
 * });
 * ```
 */
export const useGetAdminMonthlyStatistics = (
  params: MonthlyStatisticsRequest,
  enabled = true
) => {
  return useQuery<MonthlyStatisticsData>({
    queryKey: adminInvoiceStatisticsKeys.monthlyParams(params),
    queryFn: async () => {
      const response = await adminInvoiceStatisticsService.getMonthlyStatistics(params);
      return response.data;
    },
    enabled: enabled && !!params.month,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};