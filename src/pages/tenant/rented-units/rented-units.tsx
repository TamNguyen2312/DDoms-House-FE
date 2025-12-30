import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useTenantRentedUnits } from "@/hooks/useRentedUnits";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADPRowActions } from "../../admin/rented-units/table/adp-row-actions";
import { ADPView } from "../../admin/rented-units/table/adp-view";
import type {
  IContractStatus,
  IRentedUnit,
} from "../../admin/rented-units/types";
import { CreateRepairRequestDialog } from "../repair-requests/dialogs/create-repair-request-dialog";
import { useCreateRepairRequest } from "@/hooks/useRepairRequest";

const TenantRentedUnitsPage = () => {
  const navigate = useNavigate();

  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<IContractStatus | "all">(
    "all"
  );

  // Repair request dialog state
  const [isCreateRepairRequestDialogOpen, setIsCreateRepairRequestDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<IRentedUnit | null>(null);

  // Create repair request mutation
  const { mutate: createRepairRequest, isPending: isCreating } =
    useCreateRepairRequest();

  // Fetch rented units
  const {
    data: rentedUnitsData,
    isLoading,
    error,
  } = useTenantRentedUnits({
    page,
    size,
    sort: "startDate",
    direction: "DESC",
  });

  // Handle view unit detail
  const handleViewUnit = (unit: IRentedUnit) => {
    navigate(`/tenant/phong-da-thue/${unit.unitId}`);
  };

  // Handle create repair request
  const handleCreateRepairRequest = (unit: IRentedUnit) => {
    setSelectedUnit(unit);
    setIsCreateRepairRequestDialogOpen(true);
  };

  // Handle submit repair request
  const handleSubmitRepairRequest = (data: {
    unitId: number;
    title: string;
    description: string;
    occurredAt: string;
    fileIds?: number[];
  }) => {
    createRepairRequest(data, {
      onSuccess: () => {
        setIsCreateRepairRequestDialogOpen(false);
        setSelectedUnit(null);
      },
    });
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
    <div className="flex flex-col h-full overflow-x-hidden">
      <div className="mb-2 shrink-0">
        <SitePageTitle
          title="Phòng đã thuê"
          subTitle="Theo dõi các phòng bạn đã thuê"
        />
      </div>

      {/* Rented Units Table */}
      <div className="flex-1 flex flex-col min-h-0 overflow-x-hidden">
        {isLoading ? (
          <LoadingCard
            Icon={Loader2}
            title="Đang tải danh sách phòng đã thuê..."
          />
        ) : error ? (
          <div className="rounded-lg border border-destructive p-4 text-destructive">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
          </div>
        ) : (
          <ADPView
            data={filteredUnits}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onStatusFilterChange={handleStatusFilterChange}
            statusFilter={statusFilter}
            actions={(row) => (
              <ADPRowActions
                row={row}
                onView={handleViewUnit}
                onCreateRepairRequest={handleCreateRepairRequest}
              />
            )}
          />
        )}
      </div>

      {/* Create Repair Request Dialog */}
      {selectedUnit && (
        <CreateRepairRequestDialog
          open={isCreateRepairRequestDialogOpen}
          onOpenChange={(open) => {
            setIsCreateRepairRequestDialogOpen(open);
            if (!open) {
              setSelectedUnit(null);
            }
          }}
          defaultUnitId={selectedUnit.unitId}
          onSubmit={handleSubmitRepairRequest}
          isPending={isCreating}
        />
      )}
    </div>
  );
};

export default TenantRentedUnitsPage;
