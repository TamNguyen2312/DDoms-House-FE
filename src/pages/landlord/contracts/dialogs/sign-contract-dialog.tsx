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
import { FileSignature, Loader } from "lucide-react";

const signContractSchema = z.object({
  otp: z
    .string()
    .length(6, "Mã OTP phải có 6 số")
    .regex(/^\d+$/, "Mã OTP chỉ được chứa số"),
});

type SignContractFormValues = z.infer<typeof signContractSchema>;

interface SignContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (otp: string) => void;
  isPending?: boolean;
}

export function SignContractDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
}: SignContractDialogProps) {
  const form = useForm<SignContractFormValues>({
    resolver: zodResolver(signContractSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSubmit = (data: SignContractFormValues) => {
    onSubmit(data.otp);
  };

  const handleClose = () => {
    form.reset({
      otp: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="size-5 text-green-500" />
            Ký hợp đồng
          </DialogTitle>
          <DialogDescription>
            Nhập mã OTP 6 số đã được gửi đến email của bạn để ký hợp đồng.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã OTP</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      className="text-center text-2xl tracking-widest font-mono"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        field.onChange(value);
                      }}
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
                  "Xác nhận ký"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
