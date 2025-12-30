import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { IPricingPlan } from "../types";

const pricingPlanFormSchema = z.object({
  code: z
    .string()
    .min(2, "Mã gói phải có ít nhất 2 ký tự")
    .max(30, "Mã gói tối đa 30 ký tự"),
  name: z
    .string()
    .min(3, "Tên gói phải có ít nhất 3 ký tự")
    .max(120, "Tên gói tối đa 120 ký tự"),
  description: z
    .string()
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .max(400, "Mô tả tối đa 400 ký tự"),
  listPrice: z.number().min(0, "Giá niêm yết phải lớn hơn hoặc bằng 0"),
  salePrice: z.number().min(0, "Giá bán phải lớn hơn hoặc bằng 0"),
  billingCycle: z
    .enum(["MONTHLY", "YEARLY"])
    .refine((val) => val !== undefined, {
      message: "Vui lòng chọn chu kỳ thanh toán",
    }),
  trialDays: z
    .number()
    .int()
    .min(0, "Số ngày dùng thử phải lớn hơn hoặc bằng 0"),
  status: z
    .enum(["ACTIVE", "INACTIVE", "ARCHIVED"])
    .refine((val) => val !== undefined, {
      message: "Vui lòng chọn trạng thái",
    }),
  isPublic: z.boolean(),
  durationMonths: z.number().int().min(1, "Thời hạn phải lớn hơn 0"),
});

export type PricingPlanFormValues = z.infer<typeof pricingPlanFormSchema>;

const defaultFormValues: PricingPlanFormValues = {
  code: "",
  name: "",
  description: "",
  listPrice: 0,
  salePrice: 0,
  billingCycle: "MONTHLY",
  trialDays: 0,
  status: "ACTIVE",
  isPublic: true,
  durationMonths: 1,
};

interface PricingPlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IPricingPlan | null;
  onSubmit: (values: PricingPlanFormValues) => void;
  isPending?: boolean;
}

export const PricingPlanFormDialog = ({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending = false,
}: PricingPlanFormDialogProps) => {
  const form = useForm<PricingPlanFormValues>({
    resolver: zodResolver(pricingPlanFormSchema) as Resolver<
      PricingPlanFormValues,
      Record<string, never>,
      PricingPlanFormValues
    >,
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, reset, setValue, watch, getValues } = form;

  // Watch status and isPublic để debug
  const watchedStatus = watch("status");
  const watchedIsPublic = watch("isPublic");

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Khi edit, lấy giá trị từ initialData
        // Nếu không có thì dùng giá trị mặc định
        // Lấy giá trị từ initialData, nếu không có thì dùng giá trị mặc định
        // Note: IPricingPlan không có các field salePrice, billingCycle, trialDays, isPublic
        // nên cần cast để lấy hoặc dùng giá trị mặc định
        const extendedData = initialData as IPricingPlan & {
          salePrice?: number;
          billingCycle?: "MONTHLY" | "YEARLY";
          trialDays?: number;
          isPublic?: boolean;
        };

        const formValues = {
          code: initialData.code,
          name: initialData.name,
          description: initialData.description,
          listPrice: initialData.listPrice,
          salePrice: extendedData.salePrice ?? initialData.listPrice,
          billingCycle: extendedData.billingCycle ?? "MONTHLY",
          trialDays: extendedData.trialDays ?? 0,
          status: initialData.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
          isPublic: extendedData.isPublic ?? true,
          durationMonths: initialData.durationMonths,
        };
        console.log("Resetting form with values:", formValues);
        console.log("Initial data status:", initialData.status);
        console.log("Initial data isPublic:", extendedData.isPublic);

        reset(formValues);

        // Force set status and isPublic sau khi reset để đảm bảo Select và Checkbox nhận đúng giá trị
        // Sử dụng setTimeout để đảm bảo reset đã hoàn tất
        setTimeout(() => {
          const statusValue = initialData.status as
            | "ACTIVE"
            | "INACTIVE"
            | "ARCHIVED";
          const extendedData = initialData as IPricingPlan & {
            isPublic?: boolean;
          };
          const isPublicValue = Boolean(extendedData.isPublic ?? true);

          console.log("Setting status to:", statusValue);
          console.log("Setting isPublic to:", isPublicValue);

          setValue("status", statusValue, {
            shouldValidate: false,
            shouldDirty: true,
          });
          setValue("isPublic", isPublicValue, {
            shouldValidate: false,
            shouldDirty: true,
          });
        }, 100);
      } else {
        reset(defaultFormValues);
      }
    }
  }, [initialData, open, reset, setValue]);

  const dialogTitle = useMemo(
    () => (initialData ? "Chỉnh sửa gói dịch vụ" : "Tạo gói dịch vụ mới"),
    [initialData]
  );

  const dialogDescription = useMemo(
    () =>
      initialData
        ? "Cập nhật thông tin gói dịch vụ để phù hợp nhu cầu kinh doanh."
        : "Điền thông tin chi tiết để tạo gói dịch vụ mới cho khách hàng.",
    [initialData]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" key={initialData?.id || "new"}>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-3">
          <Form {...form}>
            <form
              onSubmit={handleSubmit((values) => {
                // Đảm bảo lấy giá trị đúng từ form state
                const currentStatus = getValues("status");
                const currentIsPublic = getValues("isPublic");

                console.log("Form submit values:", values);
                console.log("Current status from getValues:", currentStatus);
                console.log(
                  "Current isPublic from getValues:",
                  currentIsPublic
                );
                console.log("Watched status:", watchedStatus);
                console.log("Watched isPublic:", watchedIsPublic);

                // Đảm bảo gửi đúng giá trị từ form state
                // Sử dụng getValues để đảm bảo lấy giá trị mới nhất
                const finalStatus = currentStatus || values.status;
                const finalIsPublic =
                  currentIsPublic !== undefined
                    ? currentIsPublic
                    : values.isPublic;

                const finalValues = {
                  ...values,
                  status: finalStatus,
                  isPublic: finalIsPublic,
                };

                console.log("Final values to submit:", finalValues);
                console.log(
                  "Status comparison - values.status:",
                  values.status,
                  "currentStatus:",
                  currentStatus
                );
                console.log(
                  "IsPublic comparison - values.isPublic:",
                  values.isPublic,
                  "currentIsPublic:",
                  currentIsPublic
                );

                onSubmit(finalValues);
              })}
              className="space-y-6 mx-0.5"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã gói *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="VD: ENTERPRISE, BASE..."
                          className="uppercase"
                          disabled={!!initialData}
                        />
                      </FormControl>
                      {initialData && (
                        <FormDescription>
                          Mã gói không thể thay đổi khi chỉnh sửa
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên gói *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Tên hiển thị cho khách hàng"
                          disabled={!!initialData}
                        />
                      </FormControl>
                      {initialData && (
                        <FormDescription>
                          Chỉ có thể cập nhật trạng thái khi chỉnh sửa
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Mô tả ngắn gọn lợi ích và đối tượng phù hợp"
                        disabled={!!initialData}
                      />
                    </FormControl>
                    {initialData && (
                      <FormDescription>
                        Chỉ có thể cập nhật trạng thái khi chỉnh sửa
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="listPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá niêm yết (VND) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="1000"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(event) => {
                            const parsed = event.target.valueAsNumber;
                            field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                          }}
                          placeholder="Ví dụ: 5000000"
                          disabled={!!initialData}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá bán (VND) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="1000"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(event) => {
                            const parsed = event.target.valueAsNumber;
                            field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                          }}
                          placeholder="Ví dụ: 4500000"
                          disabled={!!initialData}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chu kỳ thanh toán *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!initialData}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chu kỳ thanh toán" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                          <SelectItem value="YEARLY">Hàng năm</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời hạn (tháng) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={field.value ?? 1}
                          onChange={(event) => {
                            const parsed = event.target.valueAsNumber;
                            field.onChange(Number.isNaN(parsed) ? 1 : parsed);
                          }}
                          placeholder="Ví dụ: 1"
                          disabled={!!initialData}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="trialDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số ngày dùng thử *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          value={field.value ?? 0}
                          onChange={(event) => {
                            const parsed = event.target.valueAsNumber;
                            field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                          }}
                          placeholder="Ví dụ: 30"
                          disabled={!!initialData}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => {
                    console.log("Status field value:", field.value);
                    return (
                      <FormItem>
                        <FormLabel>Trạng thái *</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            console.log("Status changed to:", value);
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                            <SelectItem value="INACTIVE">
                              Không hoạt động
                            </SelectItem>
                            <SelectItem value="ARCHIVED">Đã lưu trữ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel>Công khai</FormLabel>
                      <FormDescription>
                        Hiển thị gói này cho tất cả người dùng.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                        key={`isPublic-${field.value}`}
                        disabled={!!initialData}
                      />
                    </FormControl>
                    {initialData && (
                      <FormDescription>
                        Chỉ có thể cập nhật trạng thái khi chỉnh sửa
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? "Đang xử lý..."
                    : initialData
                    ? "Lưu thay đổi"
                    : "Tạo mới"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
