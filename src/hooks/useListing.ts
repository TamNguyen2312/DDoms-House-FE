import type { GetListingsRequest } from "@/pages/admin/listings/types";
import {
  listingService,
  type ListingRequest,
  type ListingUpdateRequest,
  type ListingWithMediaRequest,
  type SearchListingsRequest,
} from "@/services/api/listing.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const listingKeys = {
  all: ["listings"] as const,
  list: (params?: GetListingsRequest) =>
    [...listingKeys.all, "listings", params] as const,
  adminDetail: (id: number) =>
    [...listingKeys.all, "admin", "detail", id] as const,
};

// Queries Admin
export const useListings = (params?: GetListingsRequest) => {
  return useQuery({
    queryKey: listingKeys.list(params),
    queryFn: () => listingService.getListings(params),
  });
};
// Queries Landlord
export const useMyListings = (params?: GetListingsRequest) => {
  return useQuery({
    queryKey: listingKeys.list(params),
    queryFn: async () => {
      const response = await listingService.getMyListings(params);
      // response is ListingsResponse with content and pagination
      return response;
    },
  });
};
export function useListingPublic(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: ["listing-public", params],
    queryFn: () => listingService.getListingPublic(params),
  });
}
//
export function useSearchListings(params?: SearchListingsRequest) {
  return useQuery({
    queryKey: ["search-listings", params],
    queryFn: () => listingService.searchListings(params),
  });
}
//
export const useListingDetail = (id: string) => {
  return useQuery({
    queryKey: ["listing-detail", id],
    queryFn: () => listingService.getListingDetail(id),
    enabled: !!id, // chỉ chạy khi có id
  });
};

/**
 * Get landlord listing detail
 * GET /api/landlord/listings/{listingId}
 */
export const useLandlordListingDetail = (listingId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["landlord-listing-detail", listingId],
    queryFn: async () => {
      const response = await listingService.getLandlordListingDetail(listingId);
      return response.data;
    },
    enabled: enabled && !!listingId,
  });
};

/**
 * Get admin listing detail
 * GET /api/admin/listings/{listing_id}
 */
export const useAdminListingDetail = (
  listingId: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: listingKeys.adminDetail(listingId),
    queryFn: async () => {
      const response = await listingService.getAdminListingDetail(listingId);
      return response.data;
    },
    enabled: enabled && !!listingId,
  });
};
//
export const useListingMedia = (listingId: string) => {
  return useQuery({
    queryKey: ["listing-media", listingId],
    queryFn: () => listingService.getListingMedia(listingId),
    enabled: !!listingId, // chỉ chạy khi có listingId
  });
};

// Hook for landlord listing media
export const useLandlordListingMedia = (listingId: string, enabled = true) => {
  return useQuery({
    queryKey: ["landlord-listing-media", listingId],
    queryFn: async () => {
      const response = await listingService.getLandlordListingMedia(listingId);
      return response.data || [];
    },
    enabled: enabled && !!listingId,
  });
};
//
export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ unitId, data }: { unitId: string; data: ListingRequest }) =>
      listingService.create(unitId, data),

    onSuccess: () => {
      // invalidate list listings của phòng đó
      queryClient.invalidateQueries({
        queryKey: listingKeys.all,
      });
    },

    onError: (error) => {
      console.error("Create listing error:", error);
    },
  });
};
export const useCreateListingWithMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      unitId,
      data,
    }: {
      unitId: string;
      data: ListingWithMediaRequest;
    }) => listingService.createWithMedia(unitId, data),

    onSuccess: () => {
      // invalidate list listings của phòng đó
      queryClient.invalidateQueries({
        queryKey: listingKeys.all,
      });
    },

    onError: (error) => {
      console.error("Create listing with media error:", error);
    },
  });
};
export const useUpdateStatusListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ListingUpdateRequest }) =>
      listingService.updateStatus(id, data),

    onSuccess: () => {
      // invalidate list listings của phòng đó
      queryClient.invalidateQueries({
        queryKey: listingKeys.all,
      });
    },

    onError: (error) => {
      console.error("Create listing error:", error);
    },
  });
};
