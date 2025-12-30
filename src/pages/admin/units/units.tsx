import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useAdminUnits } from "@/hooks/useAdminUnits";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { IAdminUnit } from "./api-types";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import { UnitDetailDialog } from "./unit-detail-dialog";

const UnitsPage = () => {
  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);

  // Fetch units
  const {
    data: unitsResponse,
    isLoading,
    error,
  } = useAdminUnits({
    page,
    size,
    direction: "DESC",
  });

  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Handle view unit
  const handleViewUnit = (unit: IAdminUnit) => {
    setSelectedUnitId(unit.id);
    setIsDetailDialogOpen(true);
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  const units = unitsResponse?.data?.content || [];
  const pagination = unitsResponse?.data?.pagination
    ? {
        currentPage: unitsResponse.data.pagination.currentPage,
        pageSize: unitsResponse.data.pagination.pageSize,
        totalPages: unitsResponse.data.pagination.totalPages,
        totalElements: unitsResponse.data.pagination.totalElements,
        hasNext: unitsResponse.data.pagination.hasNext,
        hasPrevious: unitsResponse.data.pagination.hasPrevious,
      }
    : undefined;

  if (isLoading) {
    return <LoadingCard Icon={Loader2} title="Đang tải danh sách phòng..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">
            Có lỗi xảy ra khi tải danh sách phòng
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
      <SitePageTitle
        title="Phòng cho thuê"
        subTitle="Quản lý tập trung các phòng cho thuê trong hệ thống"
        hidePrint={true}
        hideImport={true}
      />

      <div className="flex-1 min-h-0 mt-2 sm:mt-4">
        <ADPView
          data={units}
          actions={(row) => <ADLRowActions row={row} onView={handleViewUnit} />}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      </div>

      {/* Unit Detail Dialog */}
      <UnitDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={(open) => {
          setIsDetailDialogOpen(open);
          if (!open) {
            setSelectedUnitId(null);
          }
        }}
        unitId={selectedUnitId}
      />
    </div>
  );
};

export default UnitsPage;
