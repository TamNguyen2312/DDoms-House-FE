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
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Loader } from "lucide-react";

const extendContractSchema = z.object({
  newEndDate: z.string().min(1, "Vui lòng chọn ngày kết thúc mới"),
  note: z.string().min(1, "Vui lòng nhập ghi chú"),
});

type ExtendContractFormValues = z.infer<typeof extendContractSchema>;

interface ExtendContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEndDate: string;
  onSubmit: (data: { newEndDate: string; note: string }) => void;
  isPending?: boolean;
}

export function ExtendContractDialog({
  open,
  onOpenChange,
  currentEndDate,
  onSubmit,
  isPending = false,
}: ExtendContractDialogProps) {
  const form = useForm<ExtendContractFormValues>({
    resolver: zodResolver(extendContractSchema),
    defaultValues: {
      newEndDate: "",
      note: "",
    },
  });

  const handleSubmit = (data: ExtendContractFormValues) => {
    onSubmit({
      newEndDate: data.newEndDate,
      note: data.note,
    });
  };

  const handleClose = () => {
    form.reset({
      newEndDate: "",
      note: "",
    });
    onOpenChange(false);
  };

  // Get minimum date (tomorrow from current end date)
  const minDate = new Date(currentEndDate);
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-orange-500" />
            Gia hạn hợp đồng
          </DialogTitle>
          <DialogDescription>
            Gia hạn hợp đồng với ngày kết thúc mới. Ngày kết thúc mới phải sau
            ngày kết thúc hiện tại (
            {new Date(currentEndDate).toLocaleDateString("vi-VN")}).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="newEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ngày kết thúc mới *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      min={minDateString}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Ví dụ: Muốn gia hạn thêm 12 tháng"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isPending ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Gia hạn"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
