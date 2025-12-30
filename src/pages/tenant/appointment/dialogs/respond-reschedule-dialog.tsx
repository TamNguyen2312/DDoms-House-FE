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
import { useRespondReschedule } from "@/hooks/useAppointment";
import { useToast } from "@/hooks/useToast";
import type { IAppointment } from "@/pages/landlord/appointments/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Calendar, CheckCircle, Clock, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Schema for respond reschedule
const respondRescheduleSchema = z
  .object({
    accept: z.boolean(),
    counterProposedTime: z.string().optional(),
  })
  .refine(
    (data) => {
      // If accept is false, counterProposedTime is required
      if (!data.accept) {
        return (
          !!data.counterProposedTime && data.counterProposedTime.trim() !== ""
        );
      }
      return true;
    },
    {
      message: "Vui lòng chọn thời gian đề xuất mới",
      path: ["counterProposedTime"],
    }
  )
  .refine(
    (data) => {
      // If counterProposedTime is provided, validate it's in the future
      if (data.counterProposedTime) {
        const selectedDate = new Date(data.counterProposedTime);
        const now = new Date();
        return selectedDate > now;
      }
      return true;
    },
    {
      message: "Thời gian đề xuất phải sau thời điểm hiện tại",
      path: ["counterProposedTime"],
    }
  );

type RespondRescheduleFormValues = z.infer<typeof respondRescheduleSchema>;

interface RespondRescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: IAppointment;
}

export function RespondRescheduleDialog({
  open,
  onOpenChange,
  appointment,
}: RespondRescheduleDialogProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: respondReschedule } = useRespondReschedule();

  const form = useForm<RespondRescheduleFormValues>({
    resolver: zodResolver(respondRescheduleSchema),
    defaultValues: {
      accept: true,
      counterProposedTime: "",
    },
  });

  const acceptValue = form.watch("accept");

  const handleSubmit = (data: RespondRescheduleFormValues) => {
    setIsSubmitting(true);

    const requestData = {
      accept: data.accept,
      ...(data.accept === false && data.counterProposedTime
        ? {
            counterProposedTime: new Date(
              data.counterProposedTime
            ).toISOString(),
          }
        : {}),
    };

    respondReschedule(
      {
        appointmentId: appointment.id,
        data: requestData,
      },
      {
        onSuccess: () => {
          toast.success(
            data.accept
              ? "Đã chấp nhận đề xuất thời gian mới"
              : "Đã gửi đề xuất thời gian mới"
          );
          form.reset();
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại";
          toast.error(errorMessage);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  const handleClose = () => {
    form.reset({
      accept: true,
      counterProposedTime: "",
    });
    onOpenChange(false);
  };

  if (!appointment.landlordRescheduleTime) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            Phản hồi đề xuất đổi lịch
          </DialogTitle>
          <DialogDescription>
            Landlord đã đề xuất thời gian mới cho cuộc hẹn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current appointment info */}
          <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
            <h4 className="font-semibold text-sm mb-3">Thông tin cuộc hẹn</h4>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">
                  Thời gian ban đầu:
                </span>
                <p className="font-medium line-through text-muted-foreground">
                  {format(new Date(appointment.startTime), "dd/MM/yyyy HH:mm")}
                </p>
              </div>

              <div>
                <span className="text-muted-foreground">
                  Thời gian chủ nhà đề xuất:
                </span>
                <p className="font-medium text-primary text-lg">
                  {format(
                    new Date(appointment.landlordRescheduleTime),
                    "dd/MM/yyyy HH:mm"
                  )}
                </p>
              </div>

              {appointment.rescheduleCount !== undefined && (
                <div>
                  <span className="text-muted-foreground">
                    Số lần đàm phán:
                  </span>
                  <p className="font-medium">
                    {appointment.rescheduleCount} / 3
                  </p>
                </div>
              )}
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="accept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bạn muốn:</FormLabel>
                    <FormControl>
                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant={field.value === true ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => {
                            field.onChange(true);
                            form.setValue("counterProposedTime", "");
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Chấp nhận đề xuất
                        </Button>
                        <Button
                          type="button"
                          variant={
                            field.value === false ? "default" : "outline"
                          }
                          className="flex-1"
                          onClick={() => field.onChange(false)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Đề xuất lại
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!acceptValue && (
                <FormField
                  control={form.control}
                  name="counterProposedTime"
                  render={({ field }) => {
                    // Get minimum datetime (current date and time + 2 hours)
                    const now = new Date();
                    const minTime = new Date(
                      now.getTime() + 2 * 60 * 60 * 1000
                    ); // +2 hours
                    const year = minTime.getFullYear();
                    const month = String(minTime.getMonth() + 1).padStart(
                      2,
                      "0"
                    );
                    const day = String(minTime.getDate()).padStart(2, "0");
                    const hours = String(minTime.getHours()).padStart(2, "0");
                    const minutes = String(minTime.getMinutes()).padStart(
                      2,
                      "0"
                    );
                    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

                    return (
                      <FormItem>
                        <FormLabel>Thời gian đề xuất mới</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="datetime-local"
                              disabled={isSubmitting}
                              min={minDateTime}
                              {...field}
                            />
                            <p className="text-xs text-muted-foreground">
                              Thời gian phải cách hiện tại ít nhất 2 giờ và
                              trong khung 8:00-20:00
                            </p>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}

              {appointment.rescheduleCount !== undefined &&
                appointment.rescheduleCount >= 3 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                    <p>
                      <strong>Lưu ý:</strong> Đã đạt giới hạn 3 lần đàm phán.
                      Nếu không chấp nhận, bạn cần tạo lịch hẹn mới.
                    </p>
                  </div>
                )}

              <DialogFooter className="border-t border-dashed pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Đang xử lý...
                    </>
                  ) : acceptValue ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Chấp nhận
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Gửi đề xuất
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
