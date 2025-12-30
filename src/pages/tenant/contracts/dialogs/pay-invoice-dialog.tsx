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
import { useTenantProfile } from "@/hooks/useTenantProfile";
import { useAuth } from "@/store";
import type { Invoice, PaymentProvider } from "@/types/invoice.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Loader, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const payInvoiceSchema = z.object({
  provider: z.enum(["PAYOS", "VNPAY", "MOMO"]),
  otpCode: z
    .string()
    .length(6, "Mã OTP phải có 6 số")
    .regex(/^\d+$/, "Mã OTP chỉ được chứa số"),
  buyerName: z.string().min(1, "Vui lòng nhập tên người mua"),
  buyerEmail: z.string().email("Email không hợp lệ"),
  buyerPhone: z.string().min(10, "Số điện thoại không hợp lệ"),
});

type PayInvoiceFormValues = z.infer<typeof payInvoiceSchema>;

interface PayInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onSendOTP: () => void;
  onPay: (data: PayInvoiceFormValues) => void;
  isSendingOTP?: boolean;
  isPaying?: boolean;
}

export function PayInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onSendOTP,
  onPay,
  isSendingOTP = false,
  isPaying = false,
}: PayInvoiceDialogProps) {
  const [otpSent, setOtpSent] = useState(false);
  const { user } = useAuth();
  const { data: tenantProfile } = useTenantProfile(open);

  const form = useForm<PayInvoiceFormValues>({
    resolver: zodResolver(payInvoiceSchema),
    defaultValues: {
      provider: "PAYOS",
      otpCode: "",
      buyerName: "",
      buyerEmail: "",
      buyerPhone: "",
    },
  });

  // Auto-fill tenant information when dialog opens
  useEffect(() => {
    if (open && invoice && user) {
      // Get tenant name from profile or user
      const tenantName =
        tenantProfile?.fullName ||
        user?.displayName ||
        user?.email?.split("@")[0] ||
        "";

      // Get email from user (required)
      const tenantEmail = user?.email || "";

      // Get phone from user
      const tenantPhone = user?.phone || "";

      // Auto-fill form with tenant information
      if (tenantEmail) {
        form.reset({
          provider: "PAYOS", // Always use PayOS
          otpCode: "",
          buyerName: tenantName,
          buyerEmail: tenantEmail,
          buyerPhone: tenantPhone,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoice, tenantProfile, user]);

  const handleSendOTP = () => {
    onSendOTP();
    setOtpSent(true);
  };

  const handleSubmit = (data: PayInvoiceFormValues) => {
    onPay(data);
  };

  const handleClose = () => {
    form.reset({
      provider: "PAYOS",
      otpCode: "",
      buyerName: "",
      buyerEmail: "",
      buyerPhone: "",
    });
    setOtpSent(false);
    onOpenChange(false);
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="size-5 text-green-500" />
            Thanh toán hóa đơn
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <div>
              Thanh toán hóa đơn tháng{" "}
              {new Date(invoice.cycleMonth).toLocaleDateString("vi-VN", {
                month: "2-digit",
                year: "numeric",
              })}
            </div>
            <div className="font-semibold text-lg text-primary pt-1">
              Số tiền:{" "}
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(invoice.totalAmount)}
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Invoice Summary */}
        <div className="bg-muted rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tổng tiền:</span>
            <span className="font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(invoice.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Ngày đến hạn:</span>
            <span>{new Date(invoice.dueAt).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Provider field - hidden, always set to PAYOS */}
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem className="hidden">
                    <FormControl>
                    <Input {...field} type="hidden" value="PAYOS" />
                    </FormControl>
                </FormItem>
              )}
            />

            {/* OTP Section */}
            <div className="space-y-2">
              {!otpSent ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={isSendingOTP}
                  className="w-full"
                >
                  <Mail className="mr-2 size-4" />
                  {isSendingOTP ? "Đang gửi..." : "Lấy OTP thanh toán"}
                </Button>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 mb-2">
                    OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email.
                  </p>
                </div>
              )}

              {otpSent && (
                <FormField
                  control={form.control}
                  name="otpCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã OTP *</FormLabel>
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
                          disabled={isPaying}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Buyer Information */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm">
                Thông tin người thanh toán
              </h4>

              {/* Hidden buyerName field - auto-filled from tenant profile */}
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="email@example.com"
                        disabled={isPaying}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="0901234567"
                        disabled={isPaying}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t border-dashed pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPaying}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPaying || !otpSent}>
                {isPaying ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Thanh toán"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
