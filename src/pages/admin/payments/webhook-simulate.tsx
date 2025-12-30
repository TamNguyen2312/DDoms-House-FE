import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import SitePageTitle from "@/components/site/site-page-title";
import { useSimulateWebhook } from "@/hooks/usePayments";
import type { PaymentProvider } from "@/types/payment.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const simulateWebhookSchema = z.object({
  provider: z.enum(["PAYOS", "VNPAY", "MOMO"]),
  signature: z.string().min(1, "Vui lòng nhập chữ ký"),
  providerOrderId: z.string().min(1, "Vui lòng nhập mã đơn hàng provider"),
  status: z.enum(["SUCCESS", "FAILED", "CANCELLED", "PENDING"]),
  amount: z.number().min(1, "Số tiền phải lớn hơn 0"),
});

type SimulateWebhookFormValues = z.infer<typeof simulateWebhookSchema>;

const PAYMENT_PROVIDERS: { value: PaymentProvider; label: string }[] = [
  { value: "PAYOS", label: "PayOS" },
  { value: "VNPAY", label: "VNPay" },
  { value: "MOMO", label: "MoMo" },
];

const PAYMENT_STATUSES: { value: string; label: string }[] = [
  { value: "SUCCESS", label: "Thành công" },
  { value: "FAILED", label: "Thất bại" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "PENDING", label: "Đang chờ" },
];

export default function WebhookSimulatePage() {
  const { mutate: simulateWebhook, isPending } = useSimulateWebhook();

  const form = useForm<SimulateWebhookFormValues>({
    resolver: zodResolver(simulateWebhookSchema),
    defaultValues: {
      provider: "PAYOS",
      signature: "demo-signature",
      providerOrderId: "",
      status: "SUCCESS",
      amount: 0,
    },
  });

  const handleSubmit = (data: SimulateWebhookFormValues) => {
    simulateWebhook({
      provider: data.provider,
      signature: data.signature,
      payload: {
        providerOrderId: data.providerOrderId,
        status: data.status as "SUCCESS" | "FAILED" | "CANCELLED" | "PENDING",
        amount: data.amount,
      },
    });
  };

  return (
    <div>
      <div className="mx-auto">
        <SitePageTitle
          title="Mô phỏng Webhook Thanh toán"
          subTitle="Dùng để test webhook từ payment provider (dev/test)"
          hideCreate={true}
          hidePrint={true}
          hideImport={true}
        />

        <Card>
          <CardHeader>
            <CardTitle>Thông tin Webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhà cung cấp *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhà cung cấp" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_PROVIDERS.map((provider) => (
                            <SelectItem
                              key={provider.value}
                              value={provider.value}
                            >
                              {provider.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chữ ký *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="demo-signature"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="providerOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã đơn hàng Provider *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="PAYOS_123"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAYMENT_STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiền (VND) *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          placeholder="2500000"
                          disabled={isPending}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Đang xử lý..." : "Gửi Webhook"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




