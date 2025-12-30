import SitePageTitle from "@/components/site/site-page-title";
import {
  useGetRepairRequestsForLandlord,
  useUpdateRepairRequestStatus,
} from "@/hooks/useRepairRequest";
import { useToast } from "@/hooks/useToast";
import type {
  GetRepairRequestsRequest,
  IRepairRequest,
  IRepairRequestStatus,
} from "@/types/repair-request.types";
import { useState } from "react";
import { UpdateRepairRequestStatusDialog } from "./dialogs/update-status-dialog";
import { ViewRepairRequestDialog } from "./dialogs/view-repair-request-dialog";
import { ADLRowActions } from "./table/adl-row-actions";
import { ADLView } from "./table/adl-view";

const LDRepairRequests = () => {
  const toast = useToast();

  // Query params state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(30);
  const [statusFilter, setStatusFilter] = useState<
    IRepairRequestStatus | "all"
  >("all");

  // Dialog states
  const [selectedRepairRequest, setSelectedRepairRequest] =
    useState<IRepairRequest | null>(null);
  const [selectedRepairRequestId, setSelectedRepairRequestId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  // Build query params
  const queryParams: GetRepairRequestsRequest = {
    page,
    size,
    sort: "createdAt",
    direction: "DESC",
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  // Fetch repair requests from API
  const {
    data: repairRequestsData,
    isLoading,
    error,
  } = useGetRepairRequestsForLandlord(queryParams);

  // Extract content and pagination from response
  const repairRequests = repairRequestsData?.content || [];
  const pagination = repairRequestsData?.pagination
    ? {
        currentPage: repairRequestsData.pagination.currentPage,
        pageSize: repairRequestsData.pagination.pageSize,
        totalPages: repairRequestsData.pagination.totalPages,
        totalElements: repairRequestsData.pagination.totalElements,
        hasNext: repairRequestsData.pagination.hasNext,
        hasPrevious: repairRequestsData.pagination.hasPrevious,
      }
    : undefined;

  // Update status mutation
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateRepairRequestStatus();

  // Handlers để mở dialog
  const handleOpenViewDialog = (repairRequest: IRepairRequest) => {
    setSelectedRepairRequestId(repairRequest.id);
    setIsViewDialogOpen(true);
  };

  const handleOpenStatusDialog = (repairRequest: IRepairRequest) => {
    setSelectedRepairRequest(repairRequest);
    setIsStatusDialogOpen(true);
  };

  // Hàm xử lý cập nhật status
  const handleUpdateStatus = (
    status: IRepairRequestStatus,
    cancelReason?: string
  ) => {
    if (!selectedRepairRequest) return;

    updateStatus(
      {
        repairRequestId: selectedRepairRequest.id,
        data: {
          status,
          ...(cancelReason && { cancelReason }),
        },
      },
      {
        onSuccess: () => {
          setIsStatusDialogOpen(false);
          setSelectedRepairRequest(null);
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Cập nhật trạng thái thất bại";
          toast.error(errorMessage);
        },
      }
    );
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: IRepairRequestStatus | "all") => {
    setStatusFilter(status);
    setPage(0); // Reset to first page when changing filter
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-red-500">
          Có lỗi xảy ra khi tải danh sách yêu cầu sửa chữa
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Yêu cầu sửa chữa"
          subTitle="Quản lý các yêu cầu sửa chữa từ người thuê"
          hideCreate={true}
          hidePrint={true}
          hideImport={true}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p>Đang tải danh sách yêu cầu sửa chữa...</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ADLView
            data={repairRequests}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            actions={(row) => (
              <ADLRowActions
                row={row}
                onView={() => handleOpenViewDialog(row)}
                onUpdateStatus={() => handleOpenStatusDialog(row)}
              />
            )}
          />
        </div>
      )}

      {/* View Dialog */}
      <ViewRepairRequestDialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setSelectedRepairRequestId(null);
          }
        }}
        repairRequestId={selectedRepairRequestId}
      />

      {/* Update Status Dialog */}
      {selectedRepairRequest && (
        <UpdateRepairRequestStatusDialog
          open={isStatusDialogOpen}
          onOpenChange={(open) => {
            setIsStatusDialogOpen(open);
            if (!open) {
              setSelectedRepairRequest(null);
            }
          }}
          repairRequest={selectedRepairRequest}
          onUpdateStatus={handleUpdateStatus}
          isPending={isUpdatingStatus}
        />
      )}
    </div>
  );
};

export default LDRepairRequests;
