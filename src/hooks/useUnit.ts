import {
  unitService,
  type BatchFurnishingRequest,
  type CreateFurnishingRequest,
  type CreateUnitRequest,
  type GetUnitContractsRequest,
  type GetUnitInvoicesRequest,
  type GetUnitsRequest,
  type UpdateFurnishingRequest,
} from "@/services/api/unit.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // or your toast library

// -----------------------------
// Query Keys
// -----------------------------
export const unitKeys = {
  all: ["units"] as const,
  byProperty: (propertyId: string, params?: GetUnitsRequest) =>
    ["units", propertyId, params] as const,
  byIdUnit: (unitId: string) => ["units", unitId] as const,
  furnishings: (unitId: string) => ["units", unitId, "furnishings"] as const,
  invoices: (unitId: number, params?: GetUnitInvoicesRequest) =>
    ["units", unitId, "invoices", params] as const,
  contracts: (unitId: number, params?: GetUnitContractsRequest) =>
    ["units", unitId, "contracts", params] as const,
  tenantInvoices: (unitId: number, params?: GetUnitInvoicesRequest) =>
    ["units", "tenant", unitId, "invoices", params] as const,
  tenantContracts: (unitId: number, params?: GetUnitContractsRequest) =>
    ["units", "tenant", unitId, "contracts", params] as const,
};

// -----------------------------
// Hooks
// -----------------------------

/**
 * Hook to fetch units by property ID
 */
export function useUnits(propertyId: string, params?: GetUnitsRequest) {
  return useQuery({
    queryKey: unitKeys.byProperty(propertyId, params),
    queryFn: () => unitService.getByProperty(propertyId, params),
    enabled: !!propertyId,
    // Return the full response object including content and pagination
    select: (data) => data,
  });
}
/**
 * Hook to fetch unit by ID
 */
export function useUnit(id: string) {
  return useQuery({
    queryKey: unitKeys.byIdUnit(id),
    queryFn: () => unitService.getUnit(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch units by property ID
 */
export function useUnitsByProperty(propertyId: string) {
  return useQuery({
    queryKey: unitKeys.byProperty(propertyId),
    queryFn: () => unitService.getUnitsByProperty(propertyId),
    enabled: !!propertyId,
  });
}
/**
 * Hook to create a new unit
 */
export function useCreateUnit(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUnitRequest) =>
      unitService.create(propertyId, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: unitKeys.all,
      });
      toast.success("Thêm phòng mới thành công!");
    },
    onError: (error: unknown) => {
      console.error("Error creating unit:", error);
      toast.error(error?.response?.data?.message || "Lỗi khi thêm phòng!");
    },
  });
}

// -----------------------------
// Furnishings Hooks
// -----------------------------

/**
 * Hook to fetch furnishings by unit ID
 */
export function useFurnishings(unitId: string) {
  return useQuery({
    queryKey: unitKeys.furnishings(unitId),
    queryFn: () => unitService.getFurnishings(unitId),
    enabled: !!unitId,
  });
}

/**
 * Hook to create a new furnishing
 */
export function useCreateFurnishing(unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFurnishingRequest) =>
      unitService.createFurnishing(unitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.furnishings(unitId),
      });
      toast.success("Thêm vật dụng thành công!");
    },
    onError: (error: unknown) => {
      console.error("Error creating furnishing:", error);
      toast.error(
        (error as any)?.response?.data?.message || "Lỗi khi thêm vật dụng!"
      );
    },
  });
}

/**
 * Hook to update a furnishing
 */
export function useUpdateFurnishing(unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      furnishingId,
      data,
    }: {
      furnishingId: number;
      data: UpdateFurnishingRequest;
    }) => unitService.updateFurnishing(unitId, furnishingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.furnishings(unitId),
      });
      toast.success("Cập nhật vật dụng thành công!");
    },
    onError: (error: unknown) => {
      console.error("Error updating furnishing:", error);
      toast.error(
        (error as any)?.response?.data?.message || "Lỗi khi cập nhật vật dụng!"
      );
    },
  });
}

/**
 * Hook to delete a furnishing
 */
export function useDeleteFurnishing(unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (furnishingId: number) =>
      unitService.deleteFurnishing(unitId, furnishingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.furnishings(unitId),
      });
      toast.success("Xóa vật dụng thành công!");
    },
    onError: (error: unknown) => {
      console.error("Error deleting furnishing:", error);
      toast.error(
        (error as any)?.response?.data?.message || "Lỗi khi xóa vật dụng!"
      );
    },
  });
}

/**
 * Hook to batch update furnishings (replace all)
 */
export function useBatchUpdateFurnishings(unitId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BatchFurnishingRequest) =>
      unitService.batchUpdateFurnishings(unitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: unitKeys.furnishings(unitId),
      });
      toast.success("Cập nhật danh sách vật dụng thành công!");
    },
    onError: (error: unknown) => {
      console.error("Error batch updating furnishings:", error);
      toast.error(
        (error as any)?.response?.data?.message ||
          "Lỗi khi cập nhật danh sách vật dụng!"
      );
    },
  });
}

// -----------------------------
// Unit Invoices Hooks
// -----------------------------

/**
 * Hook to fetch invoices by unit ID (Landlord)
 * GET /api/landlord/units/{unit_id}/invoices
 */
export function useUnitInvoices(
  unitId: number,
  params?: GetUnitInvoicesRequest,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: unitKeys.invoices(unitId, params),
    queryFn: () => unitService.getUnitInvoices(unitId, params),
    enabled: enabled && !!unitId,
  });
}

// -----------------------------
// Unit Contracts Hooks
// -----------------------------

/**
 * Hook to fetch contracts by unit ID (Landlord)
 * GET /api/landlord/units/{unit_id}/contracts
 */
export function useUnitContracts(
  unitId: number,
  params?: GetUnitContractsRequest,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: unitKeys.contracts(unitId, params),
    queryFn: () => unitService.getUnitContracts(unitId, params),
    enabled: enabled && !!unitId,
  });
}

// -----------------------------
// Tenant Unit Invoices & Contracts Hooks
// -----------------------------

/**
 * Hook to fetch tenant unit invoices
 */
export function useTenantUnitInvoices(
  unitId: number,
  params?: GetUnitInvoicesRequest,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: unitKeys.tenantInvoices(unitId, params),
    queryFn: () => unitService.getTenantUnitInvoices(unitId, params),
    enabled: enabled && !!unitId,
  });
}

/**
 * Hook to fetch tenant unit contracts
 */
export function useTenantUnitContracts(
  unitId: number,
  params?: GetUnitContractsRequest,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: unitKeys.tenantContracts(unitId, params),
    queryFn: () => unitService.getTenantUnitContracts(unitId, params),
    enabled: enabled && !!unitId,
  });
}
