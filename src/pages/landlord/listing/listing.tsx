import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useMyListings } from "@/hooks/useListing";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ViewListingDialog } from "./dialogs/view-listing-dialog";
import { ADLRowActions } from "./table/adl-row-actions";
import type { ListingData } from "./table/adl-view";
import { ADLView } from "./table/adl-view";

const ADListing = () => {
  const param = useParams();
  const navigate = useNavigate();

  // Query params state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(30);
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");

  // Build query params
  const queryParams = {
    page,
    size,
    sort: "createdAt",
    direction: "DESC" as "ASC" | "DESC",
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  // Fetch listings from API
  const { data: listingsData, isLoading, refetch } = useMyListings(queryParams);

  // Extract content and pagination from response
  const listings: ListingData[] = (listingsData?.content ||
    []) as unknown as ListingData[];
  const pagination = listingsData?.pagination
    ? {
        currentPage: listingsData.pagination.currentPage,
        pageSize: listingsData.pagination.pageSize,
        totalPages: listingsData.pagination.totalPages,
        totalElements: listingsData.pagination.totalElements,
        hasNext: listingsData.pagination.hasNext,
        hasPrevious: listingsData.pagination.hasPrevious,
      }
    : undefined;

  useEffect(() => {
    refetch();
  }, [param, refetch]);

  const handleCreate = () => {
    navigate("./tao-moi");
  };

  // Dialog state
  const [selectedListingId, setSelectedListingId] = useState<number | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleViewDetail = (listingId: number | string) => {
    setSelectedListingId(Number(listingId));
    setIsDetailDialogOpen(true);
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string | "all") => {
    setStatusFilter(status);
    setPage(0); // Reset to first page when filter changes
  };
  if (isLoading)
    return (
      <div>
        <LoadingCard />
      </div>
    );
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Quản lý bài đăng"
          subTitle="Quản lý tập trung các bài đăng"
          onCreate={handleCreate}
          // onExport={handleExport}
          hidePrint={true}
          hideImport={true}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ADLView
          data={listings}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onView={handleViewDetail}
          // onRowClick={handleViewListing}
          actions={(row) => (
            <ADLRowActions
              row={row as unknown as Parameters<typeof ADLRowActions>[0]["row"]}
              onView={handleViewDetail}
              // onUpdate={handleUpdateListing}
              // onDelete={handleDeleteListing}
            />
          )}
        />
      </div>

      {/* Detail Dialog */}
      {selectedListingId && (
        <ViewListingDialog
          open={isDetailDialogOpen}
          onOpenChange={(open) => {
            setIsDetailDialogOpen(open);
            if (!open) setSelectedListingId(null);
          }}
          listingId={selectedListingId}
        />
      )}
    </div>
  );
};

export default ADListing;
