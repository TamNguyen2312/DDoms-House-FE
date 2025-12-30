import LoadingSpinner from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchListings } from "@/hooks/useListing";
import type {
  IGetListingResponse,
  SearchListingsRequest,
} from "@/services/api/listing.service";
import { formatVietnamMoney } from "@/utils/formatters";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MapPin,
  Square,
} from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SearchPage = () => {
  const { search } = useLocation();
  const navigate = useNavigate();

  // Convert query string → URLSearchParams
  const query = useMemo(() => {
    return new URLSearchParams(search);
  }, [search]);

  // Get current page from URL params, default to 1 (1-based for UI)
  // Ensure currentPage is always >= 1 to avoid negative apiPage
  const currentPage = Math.max(1, parseInt(query.get("page") || "1", 10));
  // Convert to 0-based for API (API uses 0-based pagination)
  const apiPage = currentPage - 1;
  const ITEMS_PER_PAGE = 15;

  // Convert URL params to SearchListingsRequest
  const searchParams: SearchListingsRequest = useMemo(() => {
    const params: SearchListingsRequest = {};

    // Get keyword from URL and pass directly to API
    const keyword = query.get("keyword");
    if (keyword) {
      params.keyword = keyword; // API uses "keyword" param
    }

    const city = query.get("city");
    if (city) {
      params.city = city;
    }

    const ward = query.get("ward");
    if (ward) {
      params.ward = ward;
    }

    const minPrice = query.get("minPrice");
    if (minPrice) params.minPrice = parseInt(minPrice, 10);

    const maxPrice = query.get("maxPrice");
    if (maxPrice) params.maxPrice = parseInt(maxPrice, 10);

    const bedrooms = query.get("bedrooms");
    if (bedrooms) params.bedrooms = parseInt(bedrooms, 10);

    const utilityCodes = query.get("utilityCodes");
    if (utilityCodes) {
      params.utilityCodes = utilityCodes.split(",");
    }

    // Get furnishingCategories from URL (multiple values with same key)
    const furnishingCategories = query.getAll("furnishingCategories");
    console.log({ furnishingCategories });
    if (furnishingCategories.length > 0) {
      params.furnishingCategories = furnishingCategories;
    }

    // Use 0-based page for API
    params.page = apiPage;
    params.size = ITEMS_PER_PAGE;

    const sort = query.get("sort");
    if (sort) params.sort = sort;

    const direction = query.get("direction");
    if (direction === "ASC" || direction === "DESC") {
      params.direction = direction;
    }

    return params;
  }, [query, apiPage]);

  const { data, isLoading, isError } = useSearchListings(searchParams);

  // Get listings and pagination from API response
  const listings: IGetListingResponse[] = useMemo(() => {
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    return [];
  }, [data]);

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const totalItems = pagination?.totalElements ?? 0;

  const handlePageChange = (newPage: number) => {
    // Ensure page is always >= 1
    const validPage = Math.max(1, newPage);
    const newQuery = new URLSearchParams(query);
    newQuery.set("page", validPage.toString());
    navigate(`/tim-kiem?${newQuery.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const showPages = 5;

    // Use 1-based pagination for UI
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
        disabled={currentPage >= totalPages}
        className="gap-1"
      >
        Sau
        <ChevronRight className="w-4 h-4" />
      </Button>
    );

    // Calculate display range
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

    return (
      <div className="mt-8 mb-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {prevButton}
          {pages}
          {nextButton}
        </div>
        <div className="text-center text-sm text-muted-foreground mt-3">
          Hiển thị {Math.min(startIndex + 1, totalItems)} - {endIndex} trong
          tổng số {totalItems} kết quả
        </div>
      </div>
    );
  };
  if (isLoading) {
    return (
      <div>
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4">
            <LoadingSpinner />
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4">
            <div className="w-full min-h-40 flex justify-center items-center">
              <span>Đã xảy ra lỗi khi tải dữ liệu</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4">
          <div className="pt-2">
            <h1 className="text-2xl font-bold mb-6">Kết quả tìm kiếm</h1>

            {listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {listings.map((listing, idx) => (
                    <Link key={idx} to={`/phong/${listing.listingId}`}>
                      <Card className="overflow-hidden rounded-xl border bg-card hover:shadow-md transition-all duration-200 pt-0">
                        <div className="relative">
                          <img
                            src={
                              listing.media && listing.media.length > 0
                                ? (() => {
                                    // Sort media by sortOrder and get the first one
                                    const sortedMedia = [...listing.media].sort(
                                      (a, b) => a.sortOrder - b.sortOrder
                                    );
                                    const firstMedia = sortedMedia[0];
                                    return (
                                      firstMedia.thumbnailUrl ||
                                      firstMedia.filePath
                                    );
                                  })()
                                : "/images/room/room-rental-modern.jpg"
                            }
                            alt={listing.title}
                            className="w-full h-44 object-cover rounded-t-xl"
                            onError={(e) => {
                              // Fallback to default image if media fails to load
                              const target = e.target as HTMLImageElement;
                              if (
                                target.src !==
                                "/images/room/room-rental-modern.jpg"
                              ) {
                                target.src =
                                  "/images/room/room-rental-modern.jpg";
                              }
                            }}
                          />
                        </div>

                        <CardContent className="p-4">
                          <h3 className="font-semibold text-base mb-1 line-clamp-2">
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
                                  {formatVietnamMoney(listing.listedPrice)}/
                                  tháng
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
                  ))}
                </div>
                {renderPagination()}
              </>
            ) : (
              <div className="w-full min-h-40 flex justify-center items-center">
                <span>Không có kết quả phù hợp</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
