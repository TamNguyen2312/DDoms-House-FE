import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useListingPublic, useSearchListings } from "@/hooks/useListing";
import type { IGetListingResponse } from "@/services/api/listing.service";
import { formatVietnamMoney } from "@/utils/formatters";
import {
  getBestImageUrl,
  getFallbackImageUrl,
  handleImageError,
} from "@/utils/image-handler";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MapPin,
  Square,
} from "lucide-react";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LoadingSpinner from "../common/loading-spinner";
import ProvinceSelection from "../layout/province-selection";

const ITEMS_PER_PAGE = 15;

export default function ListingsSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Get current page from URL params, default to 1 (1-based for UI)
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  // Convert to 0-based for API (API uses 0-based pagination)
  const apiPage = currentPage - 1;

  // Get city from URL params
  const cityParam = searchParams.get("city");

  // Use searchListings if city is selected, otherwise use listingPublic
  const searchParamsForAPI = useMemo(() => {
    if (cityParam) {
      return {
        city: cityParam,
        page: apiPage,
        size: ITEMS_PER_PAGE,
      };
    }
    return undefined;
  }, [cityParam, apiPage]);

  const publicParams = useMemo(() => {
    if (!cityParam) {
      return {
        page: apiPage,
        size: ITEMS_PER_PAGE,
      };
    }
    return undefined;
  }, [cityParam, apiPage]);

  // Use appropriate hook based on whether city filter is applied
  const { data: publicData, isLoading: isLoadingPublic } = useListingPublic(
    publicParams
  );
  const { data: searchData, isLoading: isLoadingSearch } = useSearchListings(
    searchParamsForAPI
  );

  // Use data from the appropriate hook
  const data = cityParam ? searchData : publicData;
  const isLoading = cityParam ? isLoadingSearch : isLoadingPublic;

  // Get listings from API response
  const dataListings = data?.content || [];
  const pagination = data?.pagination;

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = (totalPages: number, totalItems: number) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5; // Number of page buttons to show

    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // Previous button
    const prevButton = (
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Trước
      </Button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="dots-start" className="px-2">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots-end" className="px-2">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    const nextButton = (
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="gap-1"
      >
        Sau
        <ChevronRight className="w-4 h-4" />
      </Button>
    );

    return (
      <div className="mt-8 mb-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {prevButton}
          {pages}
          {nextButton}
        </div>
        <div className="text-center text-sm text-muted-foreground mt-3">
          Hiển thị{" "}
          {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalItems)} -{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} trong tổng số{" "}
          {totalItems} kết quả
        </div>
      </div>
    );
  };

  const renderListings = (filtered: IGetListingResponse[]) => {
    // Use pagination from API if available, otherwise calculate from filtered data
    const totalPages =
      pagination?.totalPages ?? Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const totalItems = pagination?.totalElements ?? filtered.length;

    if (isLoading)
      return (
        <div>
          <LoadingSpinner />
        </div>
      );

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length > 0 &&
            filtered.map((listing, idx) => {
              // Get the first valid image URL from media
              const getImageUrl = () => {
                if (!listing.media || listing.media.length === 0) {
                  return getFallbackImageUrl();
                }

                // Sort media by sortOrder
                const sortedMedia = [...listing.media].sort(
                  (a, b) => a.sortOrder - b.sortOrder
                );

                // Find first media with valid URL
                for (const media of sortedMedia) {
                  const url = getBestImageUrl(
                    media.thumbnailUrl,
                    media.filePath,
                    undefined,
                    true // isImage
                  );

                  if (url) {
                    return url;
                  }
                }

                // Fallback to default if no valid URL found
                return getFallbackImageUrl();
              };

              const imageUrl = getImageUrl();
              // Get fallback URL (filePath if thumbnailUrl was used)
              const getFallbackUrl = () => {
                if (!listing.media || listing.media.length === 0) return null;
                const sortedMedia = [...listing.media].sort(
                  (a, b) => a.sortOrder - b.sortOrder
                );
                const firstMedia = sortedMedia[0];
                // If we're using thumbnailUrl, fallback to filePath
                if (
                  firstMedia.thumbnailUrl &&
                  imageUrl === firstMedia.thumbnailUrl
                ) {
                  return firstMedia.filePath || null;
                }
                return null;
              };
              const fallbackUrl = getFallbackUrl();

              return (
                <Link
                  key={idx}
                  to={`/phong/${listing.listingId || listing.id}`}
                >
                  <Card className="overflow-hidden rounded-xl border bg-card hover:shadow-md transition-all duration-200 pt-0">
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt={listing.title}
                        className="w-full h-44 object-cover rounded-t-xl"
                        loading="lazy"
                        onError={(e) => {
                          handleImageError(e, fallbackUrl);
                        }}
                      />
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-base mb-1 line-clamp-1">
                        {listing.title}
                      </h3>

                      <div className="text-sm space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">
                            {`${listing.addressLine}, ${listing.ward}, ${listing.city}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="font-bold text-primary">
                              {formatVietnamMoney(listing.listedPrice)}/ tháng
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Square className="w-4 h-4" />
                            <span>{listing.areaSqM}m²</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>

        {filtered.length <= 0 && (
          <div className="w-full min-h-40 flex justify-center items-center">
            <span>Không có kết quả phù hợp</span>
          </div>
        )}

        {/* Pagination */}
        {renderPagination(totalPages, totalItems)}
      </>
    );
  };

  return (
    <div className="pt-2">
      {/* Lọc tỉnh */}
      <ProvinceSelection />

      {/* Hiển thị listings */}
      {renderListings(dataListings)}
    </div>
  );
}
