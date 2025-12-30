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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader, XCircle } from "lucide-react";

const extendDecisionSchema = z.object({
  action: z.enum(["accept", "decline"], {
    required_error: "Vui lòng chọn hành động",
  }),
  note: z.string().min(1, "Vui lòng nhập ghi chú"),
});

type ExtendDecisionFormValues = z.infer<typeof extendDecisionSchema>;

interface ExtendDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestedEndDate?: string;
  currentEndDate: string;
  onSubmit: (data: { action: "accept" | "decline"; note: string }) => void;
  isPending?: boolean;
}

export function ExtendDecisionDialog({
  open,
  onOpenChange,
  requestedEndDate,
  currentEndDate,
  onSubmit,
  isPending = false,
}: ExtendDecisionDialogProps) {
  const form = useForm<ExtendDecisionFormValues>({
    resolver: zodResolver(extendDecisionSchema),
    defaultValues: {
      action: "accept",
      note: "",
    },
  });

  const handleSubmit = (data: ExtendDecisionFormValues) => {
    onSubmit({
      action: data.action,
      note: data.note,
    });
  };

  const handleClose = () => {
    form.reset({
      action: "accept",
      note: "",
    });
    onOpenChange(false);
  };

  const selectedAction = form.watch("action");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedAction === "accept" ? (
              <CheckCircle className="size-5 text-green-500" />
            ) : (
              <XCircle className="size-5 text-red-500" />
            )}
            Duyệt yêu cầu gia hạn hợp đồng
          </DialogTitle>
          <DialogDescription>
            {requestedEndDate && (
              <div className="space-y-1 mt-2">
                <p>
                  Ngày kết thúc hiện tại:{" "}
                  <span className="font-semibold">
                    {new Date(currentEndDate).toLocaleDateString("vi-VN")}
                  </span>
                </p>
                <p>
                  Ngày kết thúc yêu cầu:{" "}
                  <span className="font-semibold">
                    {new Date(requestedEndDate).toLocaleDateString("vi-VN")}
                  </span>
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Quyết định *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                      disabled={isPending}
                    >
                      <div className="flex items-center space-x-2 space-y-0 rounded-md border p-4 hover:bg-accent">
                        <RadioGroupItem value="accept" id="accept" />
                        <label
                          htmlFor="accept"
                          className="flex-1 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-green-500" />
                            Chấp nhận gia hạn
                          </div>
                          <p className="text-sm font-normal text-muted-foreground mt-1">
                            Đồng ý gia hạn hợp đồng đến ngày kết thúc mới
                          </p>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 space-y-0 rounded-md border p-4 hover:bg-accent">
                        <RadioGroupItem value="decline" id="decline" />
                        <label
                          htmlFor="decline"
                          className="flex-1 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          <div className="flex items-center gap-2">
                            <XCircle className="size-4 text-red-500" />
                            Từ chối gia hạn
                          </div>
                          <p className="text-sm font-normal text-muted-foreground mt-1">
                            Không đồng ý với yêu cầu gia hạn
                          </p>
                        </label>
                      </div>
                    </RadioGroup>
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
                      placeholder={
                        selectedAction === "accept"
                          ? "Ví dụ: Đồng ý gia hạn thêm 12 tháng"
                          : "Ví dụ: Chưa thể gia hạn vì unit đã có kế hoạch khác"
                      }
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
              <Button
                type="submit"
                disabled={isPending}
                variant={selectedAction === "accept" ? "default" : "destructive"}
              >
                {isPending ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : selectedAction === "accept" ? (
                  "Chấp nhận"
                ) : (
                  "Từ chối"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


