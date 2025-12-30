import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  FileText,
  MapPin,
} from "lucide-react";
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
        // If status is RESCHEDULED, startTime is required
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
        // If status is REJECTED, rejectionReason is required
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
        // If status is RESCHEDULED and startTime is provided, validate it's from today onwards
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
        // If status is RESCHEDULED and startTime is provided, validate working hours (8:00-18:00)
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
        // If status is RESCHEDULED and startTime is provided, validate it's different from original
        if (data.status === "RESCHEDULED" && data.startTime) {
          const selectedDate = new Date(data.startTime);
          const originalDate = new Date(originalStartTime);
          // Compare dates to the minute (ignore seconds and milliseconds)
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

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: IAppointment;
  onSubmit: (data: { status: IAppointmentStatus; startTime?: string }) => void;
  isPending?: boolean;
}

export function UpdateStatusDialog({
  open,
  onOpenChange,
  appointment,
  onSubmit,
  isPending = false,
}: UpdateStatusDialogProps) {
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

  const handleSubmit = (data: UpdateStatusFormValues) => {
    const updateData: {
      status: IAppointmentStatus;
      startTime?: string;
      rejectionReason?: string;
    } = {
      status: data.status,
    };

    // Only include startTime if status is RESCHEDULED
    if (data.status === "RESCHEDULED" && data.startTime) {
      // Convert date and time to ISO string
      const dateTime = new Date(data.startTime);
      updateData.startTime = dateTime.toISOString();
    }

    // Only include rejectionReason if status is REJECTED
    if (data.status === "REJECTED" && data.rejectionReason) {
      updateData.rejectionReason = data.rejectionReason;
    }

    onSubmit(updateData);
  };

  const handleClose = () => {
    form.reset({
      status: appointment.status,
      startTime: "",
      rejectionReason: "",
    });
    onOpenChange(false);
  };

  // Check if can reschedule (turn-based validation)
  const canReschedule =
    appointment.status === "PENDING" ||
    (appointment.status === "RESCHEDULED" &&
      appointment.lastRescheduleBy === "TENANT");

  // Check reschedule limit
  const reachedLimit =
    appointment.rescheduleCount !== undefined &&
    appointment.rescheduleCount >= 3;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="size-5 text-primary" />
            Cập nhật trạng thái
          </DialogTitle>
          <DialogDescription>
            Cập nhật trạng thái cho cuộc hẹn tại{" "}
            <span className="font-semibold">{appointment.propertyName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Thông tin cuộc hẹn */}
        <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
          <h4 className="font-semibold text-sm mb-3">Thông tin cuộc hẹn</h4>

          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-muted-foreground">Địa chỉ:</span>
                <p className="font-medium">
                  {appointment.propertyName} - {appointment.unitCode}
                </p>
                <p className="text-xs text-muted-foreground">
                  {appointment.addressLine}, {appointment.ward},{" "}
                  {appointment.district}, {appointment.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-muted-foreground">Thời gian:</span>
                <p className="font-medium">
                  {format(new Date(appointment.startTime), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
            </div>

            {appointment.note && (
              <div className="flex items-start gap-2">
                <FileText className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex-1">
                  <span className="text-muted-foreground">Ghi chú:</span>
                  <p className="font-medium">{appointment.note}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <CheckCircle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-muted-foreground">
                  Trạng thái hiện tại:
                </span>
                <p className="font-medium">
                  {appointment.status === "PENDING" && "Chờ xác nhận"}
                  {appointment.status === "CONFIRMED" && "Đã xác nhận"}
                  {appointment.status === "REJECTED" && "Đã từ chối"}
                  {appointment.status === "RESCHEDULED" && "Đã dời lịch"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Turn-based validation warning */}
        {appointment.status === "RESCHEDULED" &&
          appointment.lastRescheduleBy === "LANDLORD" && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                <strong>Lưu ý:</strong> Bạn đã đề xuất thời gian mới. Vui lòng
                chờ tenant phản hồi trước khi đổi đề xuất.
              </AlertDescription>
            </Alert>
          )}

        {/* Reschedule limit warning */}
        {reachedLimit && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-900 text-sm">
              <strong>Đã đạt giới hạn:</strong> Đã đạt 3 lần đàm phán. Không thể
              reschedule thêm.
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
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-100">
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
                  // Get minimum datetime
                  const now = new Date();
                  const today = new Date(now);
                  today.setHours(0, 0, 0, 0);

                  // Calculate min datetime based on current time
                  let minDateTime: Date;
                  if (now.getHours() < 8) {
                    // Before 8:00 AM, allow from today 8:00 AM
                    minDateTime = new Date(today);
                    minDateTime.setHours(8, 0, 0, 0);
                  } else if (now.getHours() >= 18) {
                    // After 18:00, allow from tomorrow 8:00 AM
                    minDateTime = new Date(today);
                    minDateTime.setDate(minDateTime.getDate() + 1);
                    minDateTime.setHours(8, 0, 0, 0);
                  } else {
                    // Between 8:00-18:00, allow from current time
                    minDateTime = now;
                  }

                  const year = minDateTime.getFullYear();
                  const month = String(minDateTime.getMonth() + 1).padStart(
                    2,
                    "0"
                  );
                  const day = String(minDateTime.getDate()).padStart(2, "0");
                  const hours = String(minDateTime.getHours()).padStart(2, "0");
                  const minutes = String(minDateTime.getMinutes()).padStart(
                    2,
                    "0"
                  );
                  const minDateTimeStr = `${year}-${month}-${day}T${hours}:${minutes}`;

                  // Note: max attribute for datetime-local doesn't work well with dynamic dates
                  // We'll rely on schema validation for the 18:00 limit

                  return (
                    <FormItem>
                      <FormLabel>Thời gian mới</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="datetime-local"
                            disabled={
                              isPending || !canReschedule || reachedLimit
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
                          disabled={isPending}
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

            <DialogFooter className="border-t border-dashed pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Đang xử lý..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
