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
import { Textarea } from "@/components/ui/textarea";
import { UpdateRepairRequestStatusSchema } from "@/schemas";
import type { UpdateRepairRequestStatus } from "@/schemas/repair-request.schema";
import type {
  IRepairRequest,
  IRepairRequestStatus,
} from "@/types/repair-request.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wrench } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface UpdateRepairRequestStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repairRequest: IRepairRequest;
  onUpdateStatus: (status: IRepairRequestStatus, cancelReason?: string) => void;
  isPending?: boolean;
}

export function UpdateRepairRequestStatusDialog({
  open,
  onOpenChange,
  repairRequest,
  onUpdateStatus,
  isPending = false,
}: UpdateRepairRequestStatusDialogProps) {
  const form = useForm<UpdateRepairRequestStatus>({
    resolver: zodResolver(UpdateRepairRequestStatusSchema),
    defaultValues: {
      status: undefined as IRepairRequestStatus | undefined,
      cancelReason: "",
    },
  });

  const selectedStatus = form.watch("status");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        status: undefined as IRepairRequestStatus | undefined,
        cancelReason: "",
      });
    }
  }, [open, form]);

  // Get available status transitions based on current status
  const getAvailableStatuses = (): IRepairRequestStatus[] => {
    if (repairRequest.status === "PENDING") {
      return ["IN_PROGRESS", "DONE", "CANCEL"];
    }
    if (repairRequest.status === "IN_PROGRESS") {
      return ["DONE", "CANCEL"];
    }
    return [];
  };

  const availableStatuses = getAvailableStatuses();

  const handleSubmit = (data: UpdateRepairRequestStatus) => {
    onUpdateStatus(data.status, data.cancelReason);
  };

  const handleClose = () => {
    form.reset({
      status: undefined as IRepairRequestStatus | undefined,
      cancelReason: "",
    });
    onOpenChange(false);
  };

  const statusLabels: Record<IRepairRequestStatus, string> = {
    PENDING: "Chờ xử lý",
    IN_PROGRESS: "Đang xử lý",
    DONE: "Hoàn thành",
    CANCEL: "Hủy",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="size-5 text-primary" />
            Cập nhật trạng thái
          </DialogTitle>
          <DialogDescription>
            Cập nhật trạng thái yêu cầu sửa chữa: {repairRequest.title}
          </DialogDescription>
        </DialogHeader>

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
                  <FormLabel>Trạng thái mới *</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value as IRepairRequestStatus)
                    }
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Trạng thái hiện tại:{" "}
                    <span className="font-medium">
                      {statusLabels[repairRequest.status]}
                    </span>
                  </p>
                </FormItem>
              )}
            />

            {selectedStatus === "CANCEL" && (
              <FormField
                control={form.control}
                name="cancelReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do hủy *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="VD: Không thể sửa chữa vào thời điểm này..."
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
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Cập nhật"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
