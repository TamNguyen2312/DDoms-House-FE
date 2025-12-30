import SitePageTitle from "@/components/site/site-page-title";
import { useListings } from "@/hooks/useListing";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ViewListingDialog } from "./dialogs/view-listing-dialog";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import type { IListing } from "./types";

const ListingsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Query params state
  const [queryParams, setQueryParams] = useState({
    page: 0,
    size: 50,
    sort: "createdAt",
    direction: "DESC" as "ASC" | "DESC",
  });

  // Fetch listings from API
  const { data: listingsResponse, isLoading, error } = useListings(queryParams);

  // Extract listings from response
  // listingsResponse is ListingsResponse, which has content array
  const listings: IListing[] = listingsResponse?.content ?? [];
  const pagination = listingsResponse?.pagination;

  // Dialog state
  const [selectedListingId, setSelectedListingId] = useState<number | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize: number) => {
    setQueryParams((prev) => ({
      ...prev,
      page,
      size: pageSize,
    }));
  };

  // Hàm xử lý xem listing
  const handleViewListing = (listingId: number) => {
    setSelectedListingId(listingId);
    setIsViewDialogOpen(true);
  };
  // Show loading or error states if needed
  if (error) {
    console.log("🚀 ~ ListingsPage ~ error:", error);
    if (error.status === 403) {
      return toast.error("Bạn không có quyền truy cập trang này");
    }
    toast.error("Có lỗi xảy ra khi tải danh sách bài đăng");
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Mục bài đăng"
          subTitle="Quản lý tập trung các bài đăng"
          hidePrint={true}
          hideImport={true}
          hideCreate={true}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p>Đang tải danh sách bài đăng...</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ADPView
            data={listings}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onView={handleViewListing}
            actions={(row) => (
              <ADLRowActions
                row={row}
                onView={handleViewListing}
                // onUpdate={handleUpdateListing}
                // onDelete={handleDeleteListing}
              />
            )}
          />
        </div>
      )}

      {/* View Listing Dialog */}
      {selectedListingId && (
        <ViewListingDialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) setSelectedListingId(null);
          }}
          listingId={selectedListingId}
        />
      )}
    </div>
  );
};

export default ListingsPage;
