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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAppointmentsTenant } from "@/hooks/useAppointment";
import { useUserProfileById } from "@/hooks/useUserProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Calendar,
  CalendarClock,
  Handshake,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createRentalRequestSchema = z.object({
  unitId: z.number().min(1, "Vui lòng chọn phòng"),
  message: z
    .string()
    .min(1, "Vui lòng nhập tin nhắn")
    .max(500, "Tin nhắn tối đa 500 ký tự"),
});

export type CreateRentalRequestFormValues = z.infer<
  typeof createRentalRequestSchema
>;

interface CreateRentalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { unitId: number; message: string }) => void;
  isPending?: boolean;
}

export function CreateRentalRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}: CreateRentalRequestDialogProps) {
  // Fetch confirmed appointments to get available units
  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    useAppointmentsTenant({
      status: "CONFIRMED",
      page: 0,
      size: 100, // Get enough to show all confirmed appointments
    });

  // Handle nested response structure from API
  // API returns: { data: { data: { content: [], pagination: {} } } }
  // Service returns: response.data?.data which is { content: [], pagination: {} }
  const appointments = appointmentsData?.content || [];

  // Get unique units from appointments
  const uniqueUnits = useMemo(() => {
    const unitMap = new Map<number, (typeof appointments)[0]>();
    appointments.forEach((apt) => {
      if (!unitMap.has(apt.unitId)) {
        unitMap.set(apt.unitId, apt);
      }
    });
    return Array.from(unitMap.values());
  }, [appointments]);

  const form = useForm<CreateRentalRequestFormValues>({
    resolver: zodResolver(createRentalRequestSchema),
    defaultValues: {
      unitId: 0,
      message: "",
    },
  });

  // Watch selected unitId
  const selectedUnitId = form.watch("unitId");

  // Find selected appointment to get landlordId
  const selectedAppointment = useMemo(() => {
    if (!selectedUnitId) return null;
    return appointments.find((apt) => apt.unitId === selectedUnitId);
  }, [selectedUnitId, appointments]);

  // Fetch landlord information when unit is selected
  const {
    data: landlordInfo,
    isLoading: isLoadingLandlord,
    error: landlordError,
  } = useUserProfileById(
    selectedAppointment?.landlordId || 0,
    !!selectedAppointment?.landlordId && open
  );

  const handleSubmit = (data: CreateRentalRequestFormValues) => {
    onSubmit({
      unitId: data.unitId,
      message: data.message,
    });
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Handshake className="size-5 text-primary" />
            Tạo yêu cầu thuê
          </DialogTitle>
          <DialogDescription>
            Chọn phòng từ các cuộc hẹn đã được xác nhận và gửi yêu cầu thuê đến
            chủ nhà
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn phòng *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                    disabled={isLoadingAppointments || uniqueUnits.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn phòng từ các cuộc hẹn đã xác nhận" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingAppointments ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="size-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">
                            Đang tải danh sách phòng...
                          </span>
                        </div>
                      ) : uniqueUnits.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          Không có phòng nào từ các cuộc hẹn đã xác nhận
                        </div>
                      ) : (
                        uniqueUnits.map((apt) => (
                          <SelectItem
                            key={apt.unitId}
                            value={String(apt.unitId)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {apt.unitCode} - {apt.propertyName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {apt.addressLine}, {apt.ward}
                                {apt.district && `, ${apt.district}`},{" "}
                                {apt.city}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  {!isLoadingAppointments && uniqueUnits.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Bạn cần có ít nhất một cuộc hẹn đã được xác nhận để tạo
                      yêu cầu thuê
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Appointment and Landlord Information - Show when unit is selected */}
            {selectedUnitId && selectedAppointment && (
              <>
                <Separator />
                <div className="space-y-4">
                  {/* Appointment Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="size-4 text-primary" />
                      <span className="text-sm font-semibold">
                        Thông tin cuộc hẹn
                      </span>
                    </div>
                    <div className="space-y-2 pl-6 p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Thời gian hẹn:
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {format(
                            new Date(selectedAppointment.startTime),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </span>
                      </div>
                      {selectedAppointment.note && (
                        <div className="flex items-start gap-2">
                          <MessageSquare className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">
                              Ghi chú:{" "}
                            </span>
                            <span className="text-sm text-muted-foreground mt-1">
                              {selectedAppointment.note}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Landlord Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-primary" />
                      <span className="text-sm font-semibold">
                        Thông tin chủ nhà
                      </span>
                    </div>
                    {isLoadingLandlord ? (
                      <div className="flex items-center justify-center py-4 pl-6">
                        <Loader2 className="size-4 animate-spin text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">
                          Đang tải thông tin chủ nhà...
                        </span>
                      </div>
                    ) : landlordError ? (
                      <p className="text-sm text-destructive pl-6">
                        Không thể tải thông tin chủ nhà
                      </p>
                    ) : landlordInfo ? (
                      <div className="space-y-2 pl-6 p-3 bg-muted/50 rounded-lg">
                        {landlordInfo.landlordProfile?.displayName && (
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Họ tên:</span>
                            <span className="text-sm text-muted-foreground">
                              {landlordInfo.landlordProfile.displayName}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Email:</span>
                          <span className="text-sm text-muted-foreground">
                            {landlordInfo.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Số điện thoại:
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {landlordInfo.phone || "Chưa cập nhật"}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tin nhắn *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ví dụ: Tôi muốn thuê từ tháng sau..."
                      className="min-h-[100px]"
                      maxLength={500}
                    />
                  </FormControl>
                  <div className="flex justify-between">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/500
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending || uniqueUnits.length === 0}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Handshake className="mr-2 size-4" />
                    Gửi yêu cầu
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
