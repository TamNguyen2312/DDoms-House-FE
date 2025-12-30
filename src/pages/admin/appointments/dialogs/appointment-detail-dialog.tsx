import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetAdminAppointmentDetail } from "@/hooks/useAppointment";
import { formatVietnamDateTime } from "@/utils/formatters";
import {
    Building2,
    Calendar,
    Clock,
    FileText,
    Home,
    Loader2,
    Mail,
    MapPin,
    Phone,
    User,
} from "lucide-react";

interface AppointmentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: number | null;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: { label: "Chờ xác nhận", variant: "outline" },
  CONFIRMED: { label: "Đã xác nhận", variant: "default" },
  REJECTED: { label: "Đã từ chối", variant: "destructive" },
  RESCHEDULED: { label: "Đã dời lịch", variant: "secondary" },
};

export function AppointmentDetailDialog({
  open,
  onOpenChange,
  appointmentId,
}: AppointmentDetailDialogProps) {
  const { data: response, isLoading, isError } = useGetAdminAppointmentDetail(
    appointmentId ?? 0,
    open && !!appointmentId
  );

  const appointment = response?.data;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Calendar className="size-5 sm:size-6" />
            <span className="break-words">Chi tiết cuộc hẹn</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Thông tin chi tiết về cuộc hẹn xem phòng
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">
              Đang tải thông tin...
            </span>
          </div>
        ) : isError || !appointment ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-destructive">
              Không thể tải thông tin cuộc hẹn
            </span>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Thông tin cơ bản cuộc hẹn */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Calendar className="size-4 sm:size-5" />
                Thông tin cuộc hẹn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Mã cuộc hẹn
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    #{appointment.id}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </label>
                  <div>
                    <Badge variant={statusLabels[appointment.status]?.variant || "outline"}>
                      {statusLabels[appointment.status]?.label || appointment.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="size-3 sm:size-4" />
                    Thời gian hẹn
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {formatVietnamDateTime(appointment.startTime)}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {formatVietnamDateTime(appointment.createdAt)}
                  </div>
                </div>
              </div>
              {appointment.note && (
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="size-3 sm:size-4" />
                    Ghi chú
                  </label>
                  <div className="font-medium text-sm sm:text-base p-3 bg-muted rounded-lg">
                    {appointment.note}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Thông tin phòng */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Home className="size-4 sm:size-5" />
                Thông tin phòng
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Mã phòng
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {appointment.unit.unitCode}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Building2 className="size-3 sm:size-4" />
                    Tên dự án
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {appointment.unit.propertyName}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="size-3 sm:size-4" />
                    Địa chỉ
                  </label>
                  <div className="font-medium text-sm sm:text-base break-words">
                    {appointment.unit.addressLine}, {appointment.unit.ward}
                    {appointment.unit.district ? `, ${appointment.unit.district}` : ""}, {appointment.unit.city}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin chủ nhà */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <User className="size-4 sm:size-5" />
                Thông tin chủ nhà
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="size-3 sm:size-4" />
                    Email
                  </label>
                  <div className="font-medium text-sm sm:text-base break-all">
                    {appointment.landlord.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="size-3 sm:size-4" />
                    Số điện thoại
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {appointment.landlord.phone || "-"}
                  </div>
                </div>
                {appointment.landlord.displayName && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Tên hiển thị
                    </label>
                    <div className="font-medium text-sm sm:text-base">
                      {appointment.landlord.displayName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Thông tin người thuê */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <User className="size-4 sm:size-5" />
                Thông tin người thuê
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="size-3 sm:size-4" />
                    Email
                  </label>
                  <div className="font-medium text-sm sm:text-base break-all">
                    {appointment.tenant.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="size-3 sm:size-4" />
                    Số điện thoại
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {appointment.tenant.phone || "-"}
                  </div>
                </div>
                {appointment.tenant.displayName && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Tên hiển thị
                    </label>
                    <div className="font-medium text-sm sm:text-base">
                      {appointment.tenant.displayName}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}