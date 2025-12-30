import { AppointmentBadge } from "@/components/appointment/appoinment-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IAppointment } from "@/pages/landlord/appointments/types";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  Code,
  Eye,
  MapPin,
  MessageSquare,
} from "lucide-react";

interface ViewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: IAppointment | null;
}

export function ViewAppointmentDialog({
  open,
  onOpenChange,
  appointment,
}: ViewAppointmentDialogProps) {
  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Chi tiết cuộc hẹn
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về cuộc hẹn</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Trạng thái:</span>
            <AppointmentBadge status={appointment.status} />
          </div>

          {/* Property Name */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Tên bất động sản:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {appointment.propertyName}
            </p>
          </div>

          {/* Unit Code */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Code className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Mã phòng:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {appointment.unitCode}
            </p>
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Địa chỉ:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {appointment.addressLine}, {appointment.ward},{" "}
              {appointment.district}, {appointment.city}
            </p>
          </div>

          {/* Start Time */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Thời gian hẹn:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {format(new Date(appointment.startTime), "dd/MM/yyyy HH:mm")}
            </p>
          </div>

          {/* Note */}
          {appointment.note && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Ghi chú:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6 whitespace-pre-wrap">
                {appointment.note}
              </p>
            </div>
          )}

          {/* Landlord Reschedule Proposal */}
          {appointment.status === "RESCHEDULED" &&
            appointment.landlordRescheduleTime && (
              <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-blue-900 mb-1">
                      Landlord đề xuất thời gian mới:
                    </p>
                    <p className="text-sm text-blue-700">
                      {format(
                        new Date(appointment.landlordRescheduleTime),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </p>
                    {appointment.rescheduleCount !== undefined && (
                      <p className="text-xs text-blue-600 mt-1">
                        Số lần đàm phán: {appointment.rescheduleCount} / 3
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Rejection Reason */}
          {appointment.status === "REJECTED" && appointment.rejectionReason && (
            <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm">
                  <span className="font-bold">Lý do từ chối:</span>{" "}
                  {appointment.rejectionReason}
                </p>
              </div>
            </div>
          )}

          {/* Created At */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Ngày tạo:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {format(new Date(appointment.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
