import SitePageTitle from "@/components/site/site-page-title";
import {
  useDeleteRentalRequest,
  useGetRentalRequestsForLandlord,
  useUpdateRentalRequestStatus,
} from "@/hooks/useRentalRequest";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { CreateContractFromRentalDialog } from "./dialogs/create-contract-from-rental-dialog";
import { DeleteRentalRequestDialog } from "./dialogs/delete-rental-request-dialog";
import { UpdateStatusDialog } from "./dialogs/update-status-dialog";
import { ViewRentalRequestDialog } from "./dialogs/view-rental-request-dialog";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import type {
  GetRentalRequestsRequest,
  IRentalRequest,
  IRentalRequestStatus,
} from "./types";

const LDRental = () => {
  const toast = useToast();

  // Query params state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(30);
  const [statusFilter, setStatusFilter] = useState<
    IRentalRequestStatus | "all"
  >("all");

  // Dialog states
  const [selectedRentalRequest, setSelectedRentalRequest] =
    useState<IRentalRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateContractDialogOpen, setIsCreateContractDialogOpen] =
    useState(false);

  // Build query params
  const queryParams: GetRentalRequestsRequest = {
    page,
    size,
    sort: "createdAt",
    direction: "DESC",
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  // Fetch rental requests from API
  const {
    data: rentalRequestsData,
    isLoading,
    error,
  } = useGetRentalRequestsForLandlord(queryParams);

  // Extract content and pagination from response
  const rentalRequests = rentalRequestsData?.content || [];
  const pagination = rentalRequestsData?.pagination
    ? {
        currentPage: rentalRequestsData.pagination.currentPage,
        pageSize: rentalRequestsData.pagination.pageSize,
        totalPages: rentalRequestsData.pagination.totalPages,
        totalElements: rentalRequestsData.pagination.totalElements,
        hasNext: rentalRequestsData.pagination.hasNext,
        hasPrevious: rentalRequestsData.pagination.hasPrevious,
      }
    : undefined;

  // Update status mutation
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateRentalRequestStatus();

  // Delete mutation
  const { mutate: deleteRentalRequest, isPending: isDeleting } =
    useDeleteRentalRequest();

  // Handlers để mở dialog
  const handleOpenViewDialog = (rentalRequest: IRentalRequest) => {
    setSelectedRentalRequest(rentalRequest);
    setIsViewDialogOpen(true);
  };

  const handleOpenStatusDialog = (rentalRequest: IRentalRequest) => {
    setSelectedRentalRequest(rentalRequest);
    setIsStatusDialogOpen(true);
  };

  const handleOpenDeleteDialog = (rentalRequest: IRentalRequest) => {
    setSelectedRentalRequest(rentalRequest);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenCreateContractDialog = (rentalRequest: IRentalRequest) => {
    setSelectedRentalRequest(rentalRequest);
    setIsCreateContractDialogOpen(true);
  };

  // Hàm xử lý cập nhật status
  const handleUpdateStatus = (action: "accept" | "decline") => {
    if (!selectedRentalRequest) return;

    updateStatus(
      {
        rentalRequestId: selectedRentalRequest.id,
        data: { action },
      },
      {
        onSuccess: () => {
          setIsStatusDialogOpen(false);
          setSelectedRentalRequest(null);
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

  // Hàm xử lý xóa
  const handleDelete = () => {
    if (!selectedRentalRequest) return;

    deleteRentalRequest(selectedRentalRequest.id, {
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        setSelectedRentalRequest(null);
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Xóa yêu cầu thuê thất bại";
        toast.error(errorMessage);
      },
    });
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: IRentalRequestStatus | "all") => {
    setStatusFilter(status);
    setPage(0); // Reset to first page when changing filter
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-red-500">
          Có lỗi xảy ra khi tải danh sách yêu cầu thuê
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Yêu cầu thuê"
          subTitle="Quản lý các yêu cầu thuê từ người thuê"
          hideCreate={true}
          hidePrint={true}
          hideImport={true}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p>Đang tải danh sách yêu cầu thuê...</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ADPView
            data={rentalRequests}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            actions={(row) => (
              <ADLRowActions
                row={row}
                onView={() => handleOpenViewDialog(row)}
                onUpdateStatus={() => handleOpenStatusDialog(row)}
                onDelete={() => handleOpenDeleteDialog(row)}
                onCreateContract={() => handleOpenCreateContractDialog(row)}
              />
            )}
          />
        </div>
      )}

      {/* View Dialog */}
      {selectedRentalRequest && (
        <ViewRentalRequestDialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) {
              setSelectedRentalRequest(null);
            }
          }}
          rentalRequest={selectedRentalRequest}
        />
      )}

      {/* Update Status Dialog */}
      {selectedRentalRequest && (
        <UpdateStatusDialog
          open={isStatusDialogOpen}
          onOpenChange={(open) => {
            setIsStatusDialogOpen(open);
            if (!open) {
              setSelectedRentalRequest(null);
            }
          }}
          rentalRequest={selectedRentalRequest}
          onAccept={() => handleUpdateStatus("accept")}
          onDecline={() => handleUpdateStatus("decline")}
          isPending={isUpdatingStatus}
        />
      )}

      {/* Delete Dialog */}
      {selectedRentalRequest && (
        <DeleteRentalRequestDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) {
              setSelectedRentalRequest(null);
            }
          }}
          rentalRequest={selectedRentalRequest}
          onConfirm={handleDelete}
          isPending={isDeleting}
        />
      )}

      {/* Create Contract Dialog */}
      {selectedRentalRequest && (
        <CreateContractFromRentalDialog
          open={isCreateContractDialogOpen}
          onOpenChange={(open) => {
            setIsCreateContractDialogOpen(open);
            if (!open) {
              setSelectedRentalRequest(null);
            }
          }}
          rentalRequest={selectedRentalRequest}
        />
      )}
    </div>
  );
};

export default LDRental;
