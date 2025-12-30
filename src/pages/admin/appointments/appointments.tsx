import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useGetAdminAppointments } from "@/hooks/useAppointment";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { AppointmentDetailDialog } from "./dialogs/appointment-detail-dialog";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import type { AdminAppointmentItem } from "./types";

const AppointmentsPage = () => {

  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [statusFilter] = useState<string | "">("");
  const [landlordIdFilter] = useState<number | undefined>(undefined);
  const [tenantIdFilter] = useState<number | undefined>(undefined);
  const [unitIdFilter] = useState<number | undefined>(undefined);

  // Fetch appointments from API
  const {
    data: appointmentsResponse,
    isLoading,
    error,
  } = useGetAdminAppointments({
    page,
    size,
    status: statusFilter || undefined,
    landlordId: landlordIdFilter,
    tenantId: tenantIdFilter,
    unitId: unitIdFilter,
    sort: "createdAt",
    direction: "DESC",
  });

  const appointments: AdminAppointmentItem[] =
    appointmentsResponse?.content || [];
  const pagination = appointmentsResponse?.pagination
    ? {
        currentPage: appointmentsResponse.pagination.currentPage,
        pageSize: appointmentsResponse.pagination.pageSize,
        totalPages: appointmentsResponse.pagination.totalPages,
        totalElements: appointmentsResponse.pagination.totalElements,
        hasNext: appointmentsResponse.pagination.hasNext,
        hasPrevious: appointmentsResponse.pagination.hasPrevious,
      }
    : undefined;

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Dialog state
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Hàm xử lý xem appointment
  const handleViewAppointment = (appointmentId: number) => {
    setSelectedAppointmentId(appointmentId);
    setIsDetailDialogOpen(true);
  };



  return (
    <div className="h-full flex flex-col min-h-0">
      <SitePageTitle
        title="Quản lý cuộc hẹn"
        subTitle="Quản lý tập trung các cuộc hẹn xem phòng"
        hideCreate={true}
        hidePrint={true}
        hideImport={true}
      />

      {isLoading ? (
        <LoadingCard Icon={Loader2} title="Đang tải danh sách lịch hẹn..." />
      ) : error ? (
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="flex-1 min-h-0 mt-4">
          <ADPView
            data={appointments}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            actions={(row) => (
              <ADLRowActions
                row={row}
                onView={handleViewAppointment}
                // onUpdate={handleUpdateAppointment}
                // onDelete={handleDeleteAppointment}
              />
            )}
          />
        </div>
      )}

      {/* Dialog xem chi tiết */}
      <AppointmentDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        appointmentId={selectedAppointmentId}
      />
    </div>
  );
};

export default AppointmentsPage;
