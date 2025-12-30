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
import { FileSignature, Loader, Trash2 } from "lucide-react";

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "Mã OTP phải có 6 số")
    .regex(/^\d+$/, "Mã OTP chỉ được chứa số"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

interface OtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (otp: string) => void;
  isPending?: boolean;
  title: string;
  description: string;
  submitText: string;
  icon?: "sign" | "terminate";
}

export function OtpDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  title,
  description,
  submitText,
  icon = "sign",
}: OtpDialogProps) {
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSubmit = (data: OtpFormValues) => {
    onSubmit(data.otp);
  };

  const handleClose = () => {
    form.reset({
      otp: "",
    });
    onOpenChange(false);
  };

  const IconComponent = icon === "terminate" ? Trash2 : FileSignature;
  const iconColor = icon === "terminate" ? "text-red-500" : "text-green-500";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconComponent className={`size-5 ${iconColor}`} />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
                  submitText
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
