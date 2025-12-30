import SitePageTitle from "@/components/site/site-page-title";
import {
  useAppointments,
  useDeleteAppointment,
  useUpdateAppointmentStatus,
} from "@/hooks/useAppointment";
import { useToast } from "@/hooks/useToast";
import type { IAppointmentStatus } from "@/pages/landlord/appointments/types";
import { AxiosError } from "axios";
import { useState } from "react";
import { DeleteAppointmentDialog } from "./dialogs/delete-appointment-dialog";
import { UpdateStatusDialog } from "./dialogs/update-status-dialog";
import { ViewAppointmentDialog } from "./dialogs/view-appointment-dialog";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import type { IAppointment } from "./types";

const ADAppointment = () => {
  const toast = useToast();

  // Query params state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(30);
  const [statusFilter, setStatusFilter] = useState<IAppointmentStatus | "all">(
    "all"
  );

  // Dialog states
  const [selectedAppointment, setSelectedAppointment] =
    useState<IAppointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Build query params
  const queryParams = {
    page,
    size,
    sort: "createdAt",
    direction: "DESC" as "ASC" | "DESC",
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  // Fetch appointments from API
  const {
    data: appointmentsData,
    isLoading,
    error,
  } = useAppointments(queryParams);

  // Extract content and pagination from response
  const appointments = appointmentsData?.content || [];
  const pagination = appointmentsData?.pagination
    ? {
        currentPage: appointmentsData.pagination.currentPage,
        pageSize: appointmentsData.pagination.pageSize,
        totalPages: appointmentsData.pagination.totalPages,
        totalElements: appointmentsData.pagination.totalElements,
        hasNext: appointmentsData.pagination.hasNext,
        hasPrevious: appointmentsData.pagination.hasPrevious,
      }
    : undefined;

  // Update status mutation
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateAppointmentStatus();

  // Delete mutation
  const { mutate: deleteAppointment, isPending: isDeleting } =
    useDeleteAppointment();

  // Handlers để mở dialog
  const handleOpenViewDialog = (appointment: IAppointment) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  const handleOpenStatusDialog = (appointment: IAppointment) => {
    setSelectedAppointment(appointment);
    setIsStatusDialogOpen(true);
  };

  const handleOpenDeleteDialog = (appointment: IAppointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  // Hàm xử lý cập nhật status
  const handleUpdateStatus = (data: {
    status: IAppointmentStatus;
    startTime?: string;
  }) => {
    if (!selectedAppointment) return;

    updateStatus(
      {
        appointmentId: selectedAppointment.id,
        data,
      },
      {
        onSuccess: () => {
          toast.success("Cập nhật trạng thái thành công");
          // Nếu đang mở dialog cập nhật riêng, đóng nó
          if (isStatusDialogOpen) {
            setIsStatusDialogOpen(false);
            setSelectedAppointment(null);
          }
          // Nếu đang mở dialog xem, chỉ cần refresh data (dialog vẫn mở)
          // Query sẽ tự động refetch khi mutation thành công
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

  // Hàm xử lý xóa appointment
  const handleDeleteAppointment = () => {
    if (!selectedAppointment) return;

    deleteAppointment(selectedAppointment.id, {
      onSuccess: () => {
        toast.success("Xóa cuộc hẹn thành công");
        setIsDeleteDialogOpen(false);
        setSelectedAppointment(null);
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Xóa cuộc hẹn thất bại";
        toast.error(errorMessage);
      },
    });
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: IAppointmentStatus | "all") => {
    setStatusFilter(status);
    setPage(0); // Reset to first page when filter changes
  };

  // Show loading or error states if needed
  if (error) {
    console.log("🚀 ~ ADAppointment ~ error:", error);
    if (error instanceof AxiosError && error.response?.status === 403) {
      toast.error("Bạn không có quyền truy cập trang này");
    } else {
      toast.error("Có lỗi xảy ra khi tải danh sách lịch hẹn");
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Mục cuộc hẹn"
          subTitle="Quản lý tập trung các cuộc hẹn"
          hideCreate={true}
          hidePrint={true}
          hideImport={true}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p>Đang tải danh sách lịch hẹn...</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ADPView
            data={appointments}
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
              />
            )}
          />
        </div>
      )}

      {/* Dialogs - render một lần */}
      {selectedAppointment && (
        <>
          <ViewAppointmentDialog
            open={isViewDialogOpen}
            onOpenChange={(open) => {
              setIsViewDialogOpen(open);
              if (!open) setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            onUpdateStatus={handleUpdateStatus}
            isUpdatingStatus={isUpdatingStatus}
          />

          <UpdateStatusDialog
            open={isStatusDialogOpen}
            onOpenChange={(open) => {
              setIsStatusDialogOpen(open);
              if (!open) setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            onSubmit={handleUpdateStatus}
            isPending={isUpdatingStatus}
          />

          <DeleteAppointmentDialog
            open={isDeleteDialogOpen}
            onOpenChange={(open) => {
              setIsDeleteDialogOpen(open);
              if (!open) setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            onConfirm={handleDeleteAppointment}
            isPending={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default ADAppointment;
