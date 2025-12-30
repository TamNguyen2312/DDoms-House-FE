import { adminInvoicesService } from "@/services/api/admin-invoices.service";
import type { GetAdminInvoicesRequest } from "@/types/admin-invoices.types";
import { useQuery } from "@tanstack/react-query";

// Query keys factory
export const adminInvoicesKeys = {
  all: ["admin-invoices"] as const,
  lists: () => [...adminInvoicesKeys.all, "list"] as const,
  list: (params?: GetAdminInvoicesRequest) => 
    [...adminInvoicesKeys.lists(), params] as const,
};

/**
 * Hook to fetch admin invoices with filters
 * GET /api/admin/invoices?month=2025-03&status=PAID&invoiceType=ALL&page=0&size=20
 */
export function useGetAdminInvoices(
  params?: GetAdminInvoicesRequest,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  }
) {
  return useQuery({
    queryKey: adminInvoicesKeys.list(params),
    queryFn: () => adminInvoicesService.getInvoices(params),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
  });
}