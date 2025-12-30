import { AppointmentBadge } from "@/components/appointment/appoinment-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUserProfileById } from "@/hooks/useUserProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle,
  Code,
  Eye,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { IAppointment, IAppointmentStatus } from "../types";

// Function to create dynamic schema with original startTime
const createUpdateStatusSchema = (
  originalStartTime: string,
  appointmentStatus: string,
  lastRescheduleBy?: string
) =>
  z
    .object({
      status: z.enum(["PENDING", "CONFIRMED", "REJECTED", "RESCHEDULED"]),
      startTime: z.string().optional(),
      rejectionReason: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.status === "RESCHEDULED") {
          return !!data.startTime && data.startTime.trim() !== "";
        }
        return true;
      },
      {
        message: "Vui lòng chọn thời gian mới khi dời lịch",
        path: ["startTime"],
      }
    )
    .refine(
      (data) => {
        if (data.status === "REJECTED") {
          return !!data.rejectionReason && data.rejectionReason.trim() !== "";
        }
        return true;
      },
      {
        message: "Vui lòng nhập lý do từ chối",
        path: ["rejectionReason"],
      }
    )
    .refine(
      (data) => {
        if (data.status === "RESCHEDULED" && data.startTime) {
          const selectedDate = new Date(data.startTime);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selectedDateOnly = new Date(selectedDate);
          selectedDateOnly.setHours(0, 0, 0, 0);
          return selectedDateOnly >= today;
        }
        return true;
      },
      {
        message: "Thời gian mới phải từ ngày hiện tại trở đi",
        path: ["startTime"],
      }
    )
    .refine(
      (data) => {
        if (data.status === "RESCHEDULED" && data.startTime) {
          const selectedDate = new Date(data.startTime);
          const hour = selectedDate.getHours();
          return hour >= 8 && hour < 18;
        }
        return true;
      },
      {
        message: "Thời gian phải trong khung giờ 8:00-18:00",
        path: ["startTime"],
      }
    )
    .refine(
      (data) => {
        if (data.status === "RESCHEDULED" && data.startTime) {
          const selectedDate = new Date(data.startTime);
          const originalDate = new Date(originalStartTime);
          const selectedMinutes = Math.floor(selectedDate.getTime() / 60000);
          const originalMinutes = Math.floor(originalDate.getTime() / 60000);
          return selectedMinutes !== originalMinutes;
        }
        return true;
      },
      {
        message: "Thời gian mới phải khác với thời gian ban đầu",
        path: ["startTime"],
      }
    );

type UpdateStatusFormValues = z.infer<
  ReturnType<typeof createUpdateStatusSchema>
> & {
  rejectionReason?: string;
};

interface ViewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: IAppointment;
  onUpdateStatus?: (data: {
    status: IAppointmentStatus;
    startTime?: string;
  }) => void;
  isUpdatingStatus?: boolean;
}

export function ViewAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onUpdateStatus,
  isUpdatingStatus = false,
}: ViewAppointmentDialogProps) {
  // Fetch tenant information only when dialog is open
  const {
    data: tenantInfo,
    isLoading: isLoadingTenant,
    error: tenantError,
  } = useUserProfileById(appointment.tenantId, open);

  // Create schema with original startTime and appointment info
  const updateStatusSchema = createUpdateStatusSchema(
    appointment.startTime,
    appointment.status,
    appointment.lastRescheduleBy
  );

  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: appointment.status,
      startTime: "",
      rejectionReason: "",
    },
  });

  const selectedStatus = form.watch("status");
  const startTime = form.watch("startTime");
  const rejectionReason = form.watch("rejectionReason");

  // Reset form when appointment changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        status: appointment.status,
        startTime: "",
        rejectionReason: "",
      });
    }
  }, [open, appointment.id, appointment.status, form]);

  // Check if form has changes
  const hasChanges = () => {
    const currentStatus = form.getValues("status");
    const currentStartTime = form.getValues("startTime");
    const currentRejectionReason = form.getValues("rejectionReason");

    // Check if status changed
    if (currentStatus !== appointment.status) {
      return true;
    }

    // Check if reschedule time is provided (only if status is RESCHEDULED)
    if (currentStatus === "RESCHEDULED" && currentStartTime && currentStartTime.trim() !== "") {
      return true;
    }

    // Check if rejection reason is provided (only if status is REJECTED)
    if (currentStatus === "REJECTED" && currentRejectionReason && currentRejectionReason.trim() !== "") {
      return true;
    }

    return false;
  };

  const handleSubmit = (data: UpdateStatusFormValues) => {
    if (!onUpdateStatus) return;

    const updateData: {
      status: IAppointmentStatus;
      startTime?: string;
      rejectionReason?: string;
    } = {
      status: data.status,
    };

    if (data.status === "RESCHEDULED" && data.startTime) {
      const dateTime = new Date(data.startTime);
      updateData.startTime = dateTime.toISOString();
    }

    if (data.status === "REJECTED" && data.rejectionReason) {
      updateData.rejectionReason = data.rejectionReason;
    }

    onUpdateStatus(updateData);
    // Form will be reset automatically when appointment data updates via query refetch
  };

  // Check if can reschedule
  const canReschedule =
    appointment.status === "PENDING" ||
    (appointment.status === "RESCHEDULED" &&
      appointment.lastRescheduleBy === "TENANT");

  // Check reschedule limit
  const reachedLimit =
    appointment.rescheduleCount !== undefined &&
    appointment.rescheduleCount >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Chi tiết cuộc hẹn
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về cuộc hẹn</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tenant Information Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="size-4 text-primary" />
              <span className="text-sm font-semibold">
                Thông tin người đặt lịch
              </span>
            </div>
            <Separator />
            {isLoadingTenant ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-4 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  Đang tải thông tin...
                </span>
              </div>
            ) : tenantError ? (
              <p className="text-sm text-destructive">
                Không thể tải thông tin người đặt lịch
              </p>
            ) : tenantInfo ? (
              <div className="space-y-2 pl-6">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm text-muted-foreground">
                    {tenantInfo.email}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Số điện thoại:</span>
                  <span className="text-sm text-muted-foreground">
                    {tenantInfo.phone || "Chưa cập nhật"}
                  </span>
                </div>
                {tenantInfo.tenantProfile && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Họ tên:</span>
                      <span className="text-sm text-muted-foreground">
                        {tenantInfo.tenantProfile.fullName || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <Separator />

          {/* Appointment Information Section */}
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
              <p className="text-sm text-muted-foreground ml-6">
                {appointment.note}
              </p>
            </div>
          )}

          {/* Landlord Reschedule Time */}
          {appointment.landlordRescheduleTime && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  Thời gian đề xuất mới:
                </span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {format(
                  new Date(appointment.landlordRescheduleTime),
                  "dd/MM/yyyy HH:mm"
                )}
              </p>
            </div>
          )}

          {/* Negotiation Info */}
          {(appointment.rescheduleCount !== undefined ||
            appointment.lastRescheduleBy) && (
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <div className="space-y-1 text-sm">
                {appointment.rescheduleCount !== undefined && (
                  <p>
                    <span className="font-semibold">Số lần đàm phán:</span>{" "}
                    {appointment.rescheduleCount} / 3
                  </p>
                )}
                {appointment.lastRescheduleBy && (
                  <p>
                    <span className="font-semibold">Đề xuất cuối bởi:</span>{" "}
                    {appointment.lastRescheduleBy === "LANDLORD"
                      ? "Bạn (Chủ nhà)"
                      : "Người thuê"}
                  </p>
                )}
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

        {/* Update Status Section */}
        {onUpdateStatus && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-primary" />
                <span className="text-sm font-semibold">Cập nhật trạng thái</span>
              </div>

              {/* Turn-based validation warning */}
              {appointment.status === "RESCHEDULED" &&
                appointment.lastRescheduleBy === "LANDLORD" && (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-900 text-sm">
                      <strong>Lưu ý:</strong> Bạn đã đề xuất thời gian mới. Vui
                      lòng chờ tenant phản hồi trước khi đổi đề xuất.
                    </AlertDescription>
                  </Alert>
                )}

              {/* Reschedule limit warning */}
              {reachedLimit && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-900 text-sm">
                    <strong>Đã đạt giới hạn:</strong> Đã đạt 3 lần đàm phán.
                    Không thể reschedule thêm.
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trạng thái</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isUpdatingStatus}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem disabled value="PENDING">
                              Chờ xác nhận
                            </SelectItem>
                            <SelectItem value="CONFIRMED">Xác nhận</SelectItem>
                            <SelectItem value="REJECTED">Từ chối</SelectItem>
                            <SelectItem
                              value="RESCHEDULED"
                              disabled={!canReschedule || reachedLimit}
                            >
                              Dời lịch
                              {!canReschedule && " (Đang chờ tenant phản hồi)"}
                              {reachedLimit && " (Đã đạt giới hạn)"}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedStatus === "RESCHEDULED" && (
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => {
                        const now = new Date();
                        const today = new Date(now);
                        today.setHours(0, 0, 0, 0);

                        let minDateTime: Date;
                        if (now.getHours() < 8) {
                          minDateTime = new Date(today);
                          minDateTime.setHours(8, 0, 0, 0);
                        } else if (now.getHours() >= 18) {
                          minDateTime = new Date(today);
                          minDateTime.setDate(minDateTime.getDate() + 1);
                          minDateTime.setHours(8, 0, 0, 0);
                        } else {
                          minDateTime = now;
                        }

                        const year = minDateTime.getFullYear();
                        const month = String(minDateTime.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(minDateTime.getDate()).padStart(2, "0");
                        const hours = String(minDateTime.getHours()).padStart(
                          2,
                          "0"
                        );
                        const minutes = String(minDateTime.getMinutes()).padStart(
                          2,
                          "0"
                        );
                        const minDateTimeStr = `${year}-${month}-${day}T${hours}:${minutes}`;

                        return (
                          <FormItem>
                            <FormLabel>Thời gian mới</FormLabel>
                            <FormControl>
                              <div className="space-y-2">
                                <Input
                                  type="datetime-local"
                                  disabled={
                                    isUpdatingStatus || !canReschedule || reachedLimit
                                  }
                                  min={minDateTimeStr}
                                  {...field}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Thời gian phải từ ngày hiện tại trở đi và trong
                                  khung 8:00-18:00
                                </p>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  )}

                  {selectedStatus === "REJECTED" && (
                    <FormField
                      control={form.control}
                      name="rejectionReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lý do từ chối *</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                type="text"
                                placeholder="Nhập lý do từ chối..."
                                disabled={isUpdatingStatus}
                                {...field}
                              />
                              <p className="text-xs text-muted-foreground">
                                Lý do này sẽ được gửi cho tenant
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </form>
              </Form>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          {onUpdateStatus && hasChanges() && (
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? "Đang xử lý..." : "Cập nhật"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
