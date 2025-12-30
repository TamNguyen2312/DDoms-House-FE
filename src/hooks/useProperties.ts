import {
  propertyService,
  type CreatePropertyRequest,
  type PropertyFilters,
  type UpdatePropertyRequest,
} from "@/services/api/property.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// -----------------------------
// Query Keys
// -----------------------------
export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (filters?: PropertyFilters) =>
    [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
};

// -----------------------------
// Queries
// -----------------------------

/**
 * Hook để lấy danh sách properties với filters
 * @param filters - Các filter cho properties
 * @param options - Các options cho useQuery
 */
export const useProperties = (
  filters?: PropertyFilters,
  options?: {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: propertyKeys.list(filters),
    queryFn: () => propertyService.getAll(filters),
    ...options,
    // Return the full response object including content and pagination
    select: (data) => data,
  });
};

/**
 * Hook để lấy chi tiết một property theo ID
 * @param id - ID của property
 * @param options - Các options cho useQuery
 */
export const useProperty = (
  id: string,
  options?: {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => propertyService.getById(id),
    enabled: !!id && options?.enabled !== false,
    ...options,
  });
};

// -----------------------------
// Mutations
// -----------------------------

/**
 * Hook để tạo property mới
 */
export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePropertyRequest) => propertyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: propertyKeys.all,
      });
    },
    onError: () => {},
  });
};

/**
 * Hook để cập nhật property
 */
export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyRequest }) =>
      propertyService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: propertyKeys.all,
      });
      toast.success(response.message || "Cập nhật bất động sản thành công!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Cập nhật bất động sản thất bại!";
      toast.error(message);
    },
  });
};

/**
 * Hook để xóa property
 */
export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertyService.delete(id),
    onSuccess: (response) => {
      // Invalidate danh sách properties
      queryClient.invalidateQueries({
        queryKey: propertyKeys.all,
      });
      toast.success(response.message || "Xóa bất động sản thành công!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Xóa bất động sản thất bại!";
      toast.error(message);
    },
  });
};

// -----------------------------
// Usage Examples
// -----------------------------

/*
// Lấy danh sách properties
const { data, isLoading, error } = useProperties({
  city: "TP. Hồ Chí Minh",
  district: "Quận 1",
  status: "available",
  page: 1,
  limit: 10,
});

// Lấy chi tiết property
const { data: property } = useProperty("property-id");

// Tạo property mới
const createMutation = useCreateProperty();
const handleCreate = () => {
  createMutation.mutate({
    name: "Chung cư ABC",
    addressLine: "123 Đường XYZ",
    ward: "Phường 1",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    latitude: 10.7769,
    longitude: 106.7009,
  });
};

// Cập nhật property
const updateMutation = useUpdateProperty();
const handleUpdate = () => {
  updateMutation.mutate({
    id: "property-id",
    data: {
      name: "Chung cư XYZ Updated",
      status: "rented",
    },
  });
};

// Xóa property
const deleteMutation = useDeleteProperty();
const handleDelete = () => {
  deleteMutation.mutate("property-id");
};
*/
