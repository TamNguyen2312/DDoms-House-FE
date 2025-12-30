import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import {
  useGetRepairRequestsForAdmin,
  useGetRepairRequestDetailForAdmin,
} from "@/hooks/useRepairRequest";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { RepairRequestDetailDialog } from "./dialogs/repair-request-detail-dialog";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import type { IRepairRequest, IRepairRequestStatus } from "@/types/repair-request.types";

const RepairRequestsPage = () => {
  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [statusFilter, setStatusFilter] = useState<
    IRepairRequestStatus | "all"
  >("all");

  // Fetch repair requests from API
  const {
    data: repairRequestsResponse,
    isLoading,
    error,
  } = useGetRepairRequestsForAdmin({
    page,
    size,
    sort: "createdAt",
    direction: "DESC",
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const repairRequests: IRepairRequest[] =
    repairRequestsResponse?.content || [];
  const pagination = repairRequestsResponse?.pagination
    ? {
        currentPage: repairRequestsResponse.pagination.currentPage,
        pageSize: repairRequestsResponse.pagination.pageSize,
        totalPages: repairRequestsResponse.pagination.totalPages,
        totalElements: repairRequestsResponse.pagination.totalElements,
        hasNext: repairRequestsResponse.pagination.hasNext,
        hasPrevious: repairRequestsResponse.pagination.hasPrevious,
      }
    : undefined;

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: IRepairRequestStatus | "all") => {
    setStatusFilter(status);
    setPage(0); // Reset to first page when changing filter
  };

  // Dialog state
  const [selectedRepairRequestId, setSelectedRepairRequestId] = useState<
    number | null
  >(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Handle view repair request
  const handleViewRepairRequest = (repairRequestId: number) => {
    setSelectedRepairRequestId(repairRequestId);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <SitePageTitle
        title="Quản lý yêu cầu sửa chữa"
        subTitle="Quản lý tập trung các yêu cầu sửa chữa"
        hideCreate={true}
        hidePrint={true}
        hideImport={true}
      />

      {isLoading ? (
        <LoadingCard
          Icon={Loader2}
          title="Đang tải danh sách yêu cầu sửa chữa..."
        />
      ) : error ? (
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="flex-1 min-h-0 mt-4">
          <ADPView
            data={repairRequests}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            actions={(row) => (
              <ADLRowActions
                row={row}
                onView={handleViewRepairRequest}
              />
            )}
          />
        </div>
      )}

      {/* Dialog xem chi tiết */}
      <RepairRequestDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        repairRequestId={selectedRepairRequestId}
      />
    </div>
  );
};

export default RepairRequestsPage;

