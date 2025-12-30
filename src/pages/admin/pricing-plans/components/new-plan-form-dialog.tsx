import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { pricingPlanService } from "@/services/api/pricing-plan.service";
import { subscriptionVersionService } from "@/services/api/subscription-version.service";
import { useToast } from "@/hooks/useToast";
import { pricingPlanKeys } from "@/hooks/usePricingPlan";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const newPlanFormSchema = z.object({
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
  billingCycle: z.enum(["YEARLY", "MONTHLY"], {
    required_error: "Vui lòng chọn chu kỳ thanh toán",
  }),
  durationMonths: z
    .number()
    .int()
    .min(1, "Thời hạn phải lớn hơn hoặc bằng 1 tháng"),
  trialDays: z
    .number()
    .int()
    .min(0, "Số ngày dùng thử phải lớn hơn hoặc bằng 0"),
  featureValue: z
    .string()
    .min(1, "Số lượng bài đăng tối đa không được để trống"),
});

export type NewPlanFormValues = z.infer<typeof newPlanFormSchema>;

const defaultFormValues: NewPlanFormValues = {
  code: "",
  name: "",
  description: "",
  listPrice: 0,
  salePrice: 0,
  billingCycle: "MONTHLY",
  durationMonths: 1,
  trialDays: 0,
  featureValue: "",
};

interface NewPlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Hardcoded values
const HARDCODED_CHANGELOG = "Mô tả thay đổi cho version mới";
const HARDCODED_FEATURE_CODE = "MAX_ACTIVE_LISTINGS";

export const NewPlanFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: NewPlanFormDialogProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewPlanFormValues>({
    resolver: zodResolver(newPlanFormSchema) as Resolver<
      NewPlanFormValues,
      Record<string, never>,
      NewPlanFormValues
    >,
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, reset } = form;

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  };

  // Handle form submission with sequential API calls
  const onSubmit = async (values: NewPlanFormValues) => {
    setIsSubmitting(true);

    try {
      // Step 1: Create Plan
      const planData = {
        code: values.code.toUpperCase(),
        name: values.name,
        description: values.description,
        listPrice: values.listPrice,
        salePrice: values.salePrice,
        billingCycle: values.billingCycle,
        durationMonths: values.durationMonths,
        trialDays: values.trialDays,
        status: "ACTIVE" as const,
        features: null,
        isPublic: true,
      };

      const planResponse = await pricingPlanService.createPricingPlan(planData);
      
      if (!planResponse.success || !planResponse.data) {
        throw new Error(planResponse.message || "Không thể tạo gói dịch vụ");
      }

      const planCode = planResponse.data.code;

      // Step 2: Create Version
      const versionData = {
        planCode,
        changelog: HARDCODED_CHANGELOG,
      };

      const versionResponse = await subscriptionVersionService.createVersion(
        versionData
      );

      if (!versionResponse.success || !versionResponse.data) {
        throw new Error(versionResponse.message || "Không thể tạo version");
      }

      const versionId = versionResponse.data.id;

      // Step 3: Set Version Features
      const featuresData = {
        items: [
          {
            featureCode: HARDCODED_FEATURE_CODE,
            value: values.featureValue,
          },
        ],
      };

      const featuresResponse =
        await subscriptionVersionService.setVersionFeatures(versionId, featuresData);

      if (!featuresResponse.success) {
        throw new Error(
          featuresResponse.message || "Không thể thiết lập tính năng"
        );
      }

      // Step 4: Publish Version
      const publishResponse = await subscriptionVersionService.publishVersion(
        versionId
      );

      if (!publishResponse.success) {
        throw new Error(publishResponse.message || "Không thể publish version");
      }

      // Success!
      toast.success("Tạo gói dịch vụ thành công!");
      
      // Invalidate queries to refetch plans list
      queryClient.invalidateQueries({
        queryKey: pricingPlanKeys.all,
      });
      
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating plan:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi tạo gói dịch vụ"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo gói dịch vụ mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo gói dịch vụ mới. Hệ thống sẽ tự động tạo
            version và publish sau khi tạo gói.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-3">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Code */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã gói *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: ENTERPRISE"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên gói *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Enterprise Plan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ví dụ: Gói dành cho doanh nghiệp lớn"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* List Price and Sale Price */}
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
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const parsed = e.target.valueAsNumber;
                            field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                          }}
                          placeholder="Ví dụ: 5000000"
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
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const parsed = e.target.valueAsNumber;
                            field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                          }}
                          placeholder="Ví dụ: 4500000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Billing Cycle and Duration Months */}
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chu kỳ thanh toán *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chu kỳ thanh toán" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MONTHLY">MONTHLY</SelectItem>
                          <SelectItem value="YEARLY">YEARLY</SelectItem>
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
                          onChange={(e) => {
                            const parsed = e.target.valueAsNumber;
                            field.onChange(Number.isNaN(parsed) ? 1 : parsed);
                          }}
                          placeholder="Ví dụ: 3"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Trial Days */}
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
                        onChange={(e) => {
                          const parsed = e.target.valueAsNumber;
                          field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                        }}
                        placeholder="Ví dụ: 30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Feature Value */}
              <FormField
                control={form.control}
                name="featureValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Số lượng bài đăng tối đa *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ví dụ: 10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    onOpenChange(false);
                  }}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Đang tạo..." : "Tạo gói"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

