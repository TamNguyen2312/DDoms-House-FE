import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useAdminProperties } from "@/hooks/useAdminProperties";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { IAdminProperty } from "./api-types";
import { PropertyDetailDialog } from "./property-detail-dialog";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";

const PropertiesPage = () => {
  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);

  // Fetch properties - Always sort by createdAt DESC (newest first)
  const {
    data: propertiesResponse,
    isLoading,
    error,
  } = useAdminProperties({
    page,
    size,
    sort: "createdAt",
    direction: "DESC", // Mặc định sort mới nhất trước
  });

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Handle view property
  const handleViewProperty = (property: IAdminProperty) => {
    setSelectedPropertyId(property.id);
    setIsDetailDialogOpen(true);
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  const properties = propertiesResponse?.data?.content || [];
  const pagination = propertiesResponse?.data?.pagination
    ? {
        currentPage: propertiesResponse.data.pagination.currentPage,
        pageSize: propertiesResponse.data.pagination.pageSize,
        totalPages: propertiesResponse.data.pagination.totalPages,
        totalElements: propertiesResponse.data.pagination.totalElements,
        hasNext: propertiesResponse.data.pagination.hasNext,
        hasPrevious: propertiesResponse.data.pagination.hasPrevious,
      }
    : undefined;

  if (isLoading) {
    return (
      <LoadingCard
        Icon={Loader2}
        title="Đang tải danh sách địa điểm cho thuê..."
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">
            Có lỗi xảy ra khi tải danh sách địa điểm cho thuê
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "Lỗi không xác định"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Địa điểm cho thuê"
          subTitle="Quản lý tập trung các địa điểm cho thuê trong hệ thống"
          hidePrint={true}
          hideImport={true}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ADPView
          data={properties}
          actions={(row) => (
            <ADLRowActions row={row} onView={handleViewProperty} />
          )}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      </div>

      {/* Property Detail Dialog */}
      <PropertyDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={(open) => {
          setIsDetailDialogOpen(open);
          if (!open) {
            setSelectedPropertyId(null);
          }
        }}
        propertyId={selectedPropertyId}
      />
    </div>
  );
};

export default PropertiesPage;
