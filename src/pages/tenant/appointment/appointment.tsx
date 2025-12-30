import { AppointmentBadge } from "@/components/appointment/appoinment-badge";
import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import LoadingSpinner from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAppointmentsTenant,
  useDeleteAppointmentTenant,
} from "@/hooks/useAppointment";
import { useToast } from "@/hooks/useToast";
import type {
  GetAppointmentsRequest,
  IAppointment,
} from "@/pages/landlord/appointments/types";
import { formatDate } from "date-fns";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  X,
} from "lucide-react";
import { useState } from "react";
import { RespondRescheduleDialog } from "./dialogs/respond-reschedule-dialog";
import { ViewAppointmentDialog } from "./dialogs/view-appointment-dialog";

const Appointment = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<IAppointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false);
  const toast = useToast();

  // Delete mutation
  const { mutate: deleteAppointment, isPending: isDeleting } =
    useDeleteAppointmentTenant();

  // Build query params
  const queryParams: GetAppointmentsRequest = {
    page,
    size,
    sort: "createdAt",
    direction: "DESC",
    ...(statusFilter && { status: statusFilter }),
  };

  const {
    data: appointmentsData,
    isLoading,
    error,
  } = useAppointmentsTenant(queryParams);

  const appointments = appointmentsData?.content || [];
  const pagination = appointmentsData?.pagination;
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSizeChange = (newSize: string) => {
    setSize(Number(newSize));
    setPage(0);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status === "all" ? undefined : status);
    setPage(0);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteAppointment(deleteId, {
      onSuccess: () => {
        toast.success("Xóa cuộc hẹn thành công");
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Xóa cuộc hẹn thất bại";
        toast.error(errorMessage);
      },
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Có lỗi xảy ra khi tải danh sách lịch hẹn</p>
      </div>
    );
  }

  const appointmentStatuses = [
    { value: "all", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xác nhận" },
    { value: "RESCHEDULED", label: "Đã dời lịch" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "REJECTED", label: "Từ chối" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="mx-auto flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-bold text-gray-900 mb-2 text-xl">
            Lịch Hẹn Xem Phòng
          </h1>
          <p className="text-gray-600">
            Quản lý các cuộc hẹn xem phòng của bạn
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Lọc theo trạng thái:</span>
            <div className="flex flex-wrap gap-2">
              {appointmentStatuses.map((status) => (
                <Button
                  key={status.value}
                  variant={
                    (statusFilter === undefined && status.value === "all") ||
                    statusFilter === status.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleStatusFilterChange(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Appointments */}
        {appointments.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <p className="text-gray-500">Chưa có lịch hẹn nào</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              {appointments.map((apt: IAppointment) => (
                <Card
                  key={apt.id}
                  className="hover:shadow-xl transition-all duration-300 py-2"
                >
                  <CardContent className="p-4 flex flex-col space-y-2">
                    {/* Header: tên, mã, giá */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold">{apt.propertyName}</h3>
                          <AppointmentBadge status={apt.status} />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {`${apt.addressLine}, ${apt.ward}, ${apt.city}`}
                        </div>
                        <span className="text-sm font-medium text-primary">
                          Mã: {apt.unitCode}
                        </span>
                      </div>
                      {/* <div className="text-right space-y-0.5">
                    <div className="text-xl font-bold text-primary">
                      {formatVietnamMoney(7200000)}
                    </div>
                    <div className="text-sm text-gray-500"> / tháng</div>
                  </div> */}
                    </div>

                    {/* Thông tin phòng */}
                    {/* <div className="flex gap-6 mb-2">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    <span className="font-medium">3 phòng ngủ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5" />
                    <span className="font-medium">2 phòng tắm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Square className="w-5 h-5" />
                    <span className="font-medium">25m²</span>
                  </div>
                </div> */}

                    {/* Thông tin thời gian & chủ nhà & ghi chú */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Thời gian:</span>
                        <span className="text-blue-600 font-bold">
                          {formatDate(apt.startTime, "HH:mm:ss dd/MM/yyyy")}
                        </span>
                      </div>
                      {/* <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Chủ nhà:</span>
                    <span>Anh Minh - 0909 123 456</span>
                  </div>
                  {apt.note && (
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <p className="text-sm">
                        <span className="font-bold">Ghi chú:</span> {apt.note}
                      </p>
                    </div>
                  )} */}
                      {/* {apt.status == "REJECTED" && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <p className="text-sm">
                              <span className="font-bold">Lý do từ chối:</span>{" "}
                              Bận vào thời gian hẹn
                            </p>
                          </div>
                        </div>
                      )} */}
                    </div>

                    {/* RESCHEDULED State - Show landlord proposal */}
                    {apt.status === "RESCHEDULED" &&
                      apt.landlordRescheduleTime && (
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded mb-2">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-blue-900 mb-1">
                                Landlord đề xuất thời gian mới
                              </p>
                              <p className="text-sm text-blue-700">
                                Thời gian mới:{" "}
                                {formatDate(
                                  apt.landlordRescheduleTime,
                                  "HH:mm dd/MM/yyyy"
                                )}
                              </p>
                              {apt.rescheduleCount !== undefined && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Đàm phán: {apt.rescheduleCount} / 3
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Hành động */}
                    <div className="flex gap-2 mt-2">
                      {apt.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Chi tiết
                          </Button>
                          <Button
                            onClick={() => {
                              setDeleteId(apt.id);
                              setOpenConfirm(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-transparent text-black"
                          >
                            <X className="w-4 h-4 mr-1 text-red-600" /> Xóa
                          </Button>
                        </>
                      )}
                      {apt.status === "RESCHEDULED" && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsRespondDialogOpen(true);
                            }}
                          >
                            <Calendar className="w-4 h-4 mr-1" /> Phản hồi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Chi tiết
                          </Button>
                        </>
                      )}
                      {(apt.status === "CONFIRMED" ||
                        apt.status === "REJECTED") && (
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Chi tiết
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalElements > 6 && (
              <div className="mt-auto pt-2 border-t">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  {/* Page size selector */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Hiển thị:</span>
                    <Select
                      value={size.toString()}
                      onValueChange={handleSizeChange}
                    >
                      <SelectTrigger className="w-[70px] h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-gray-500">
                      / {pagination.totalElements} lịch hẹn
                    </span>
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!pagination.hasPrevious || page === 0}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum: number;
                          if (pagination.totalPages <= 5) {
                            pageNum = i;
                          } else if (page < 3) {
                            pageNum = i;
                          } else if (page > pagination.totalPages - 3) {
                            pageNum = pagination.totalPages - 5 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="h-8 min-w-[32px] px-2 text-sm"
                            >
                              {pageNum + 1}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={
                        !pagination.hasNext || page >= pagination.totalPages - 1
                      }
                      className="h-8 px-3"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Page info */}
                  <div className="text-sm text-gray-500">
                    Trang <span className="font-medium">{page + 1}</span> /{" "}
                    {pagination.totalPages}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />

      {/* View Appointment Dialog */}
      {selectedAppointment && (
        <>
          <ViewAppointmentDialog
            open={isViewDialogOpen}
            onOpenChange={(open) => {
              setIsViewDialogOpen(open);
              if (!open) setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
          />
          <RespondRescheduleDialog
            open={isRespondDialogOpen}
            onOpenChange={(open) => {
              setIsRespondDialogOpen(open);
              if (!open) setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
          />
        </>
      )}
    </div>
  );
};

export default Appointment;
