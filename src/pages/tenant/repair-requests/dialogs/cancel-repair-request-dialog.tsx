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
import { Textarea } from "@/components/ui/textarea";
import { CancelRepairRequestSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import type { CancelRepairRequest } from "@/schemas/repair-request.schema";
import type { IRepairRequest } from "@/types/repair-request.types";

interface CancelRepairRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repairRequest: IRepairRequest;
  onConfirm: (cancelReason: string) => void;
  isPending?: boolean;
}

export function CancelRepairRequestDialog({
  open,
  onOpenChange,
  repairRequest,
  onConfirm,
  isPending = false,
}: CancelRepairRequestDialogProps) {
  const form = useForm<CancelRepairRequest>({
    resolver: zodResolver(CancelRepairRequestSchema),
    defaultValues: {
      cancelReason: "",
    },
  });

  const handleSubmit = (data: CancelRepairRequest) => {
    onConfirm(data.cancelReason);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="size-5 text-red-600" />
            Hủy yêu cầu sửa chữa
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn hủy yêu cầu sửa chữa này? Vui lòng nhập lý do
            hủy.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">
                {repairRequest.title}
              </p>
            </div>

            <FormField
              control={form.control}
              name="cancelReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do hủy *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="VD: Đã tự sửa được, không cần landlord hỗ trợ nữa..."
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
                Không hủy
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <X className="mr-2 size-4" />
                    Xác nhận hủy
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

