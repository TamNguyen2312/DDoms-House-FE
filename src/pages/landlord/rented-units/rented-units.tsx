import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useLandlordRentedUnits } from "@/hooks/useRentedUnits";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { RentedUnitDetailDialog } from "../../admin/rented-units/dialogs/rented-unit-detail-dialog";
import { ADPRowActions } from "../../admin/rented-units/table/adp-row-actions";
import { ADPView } from "../../admin/rented-units/table/adp-view";
import type {
  IContractStatus,
  IRentedUnit,
} from "../../admin/rented-units/types";

const LandlordRentedUnitsPage = () => {
  // Dialog state
  const [selectedUnit, setSelectedUnit] = useState<IRentedUnit | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(30);
  const [statusFilter, setStatusFilter] = useState<IContractStatus | "all">(
    "all"
  );

  // Fetch rented units
  const {
    data: rentedUnitsData,
    isLoading,
    error,
  } = useLandlordRentedUnits({
    page,
    size,
    sort: "startDate",
    direction: "DESC",
  });

  // Handle view unit detail
  const handleViewUnit = (unit: IRentedUnit) => {
    setSelectedUnit(unit);
    setIsDetailDialogOpen(true);
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: IContractStatus | "all") => {
    setStatusFilter(status);
    setPage(0);
  };

  // Filter data by status if needed
  const rentedUnits = rentedUnitsData?.content || [];
  const filteredUnits =
    statusFilter !== "all"
      ? rentedUnits.filter((unit) => unit.contractStatus === statusFilter)
      : rentedUnits;

  const pagination = rentedUnitsData?.pagination
    ? {
        currentPage: rentedUnitsData.pagination.currentPage,
        pageSize: rentedUnitsData.pagination.pageSize,
        totalPages: rentedUnitsData.pagination.totalPages,
        totalElements: rentedUnitsData.pagination.totalElements,
        hasNext: rentedUnitsData.pagination.hasNext,
        hasPrevious: rentedUnitsData.pagination.hasPrevious,
      }
    : undefined;

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Phòng đã cho thuê"
          subTitle="Theo dõi các phòng đã cho thuê của bạn"
        />
      </div>

      {isLoading ? (
        <LoadingCard
          Icon={Loader2}
          title="Đang tải danh sách phòng đã cho thuê..."
        />
      ) : error ? (
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ADPView
            data={filteredUnits}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onStatusFilterChange={handleStatusFilterChange}
            statusFilter={statusFilter}
            actions={(row) => (
              <ADPRowActions row={row} onView={handleViewUnit} />
            )}
          />
        </div>
      )}

      {/* Detail Dialog */}
      {selectedUnit && (
        <RentedUnitDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          unit={selectedUnit}
          showTenantInfo={true}
        />
      )}
    </div>
  );
};

export default LandlordRentedUnitsPage;
