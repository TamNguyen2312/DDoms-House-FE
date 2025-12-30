import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { IContract } from "@/pages/admin/contracts/types";

const updateContractFormSchema = z.object({
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  depositAmount: z.number().min(0, "Số tiền đặt cọc phải lớn hơn hoặc bằng 0"),
});

export type UpdateContractFormValues = z.infer<typeof updateContractFormSchema>;

interface ContractDraftUpdateFormProps {
  initialData: IContract;
  onSubmit: (values: UpdateContractFormValues) => void;
  isPending?: boolean;
  showUpdateButton?: boolean;
  onCancel?: () => void;
}

export const ContractDraftUpdateForm = ({
  initialData,
  onSubmit,
  isPending = false,
  showUpdateButton = true,
  onCancel,
}: ContractDraftUpdateFormProps) => {
  const form = useForm<UpdateContractFormValues>({
    resolver: zodResolver(updateContractFormSchema) as Resolver<
      UpdateContractFormValues,
      Record<string, never>,
      UpdateContractFormValues
    >,
    defaultValues: {
      startDate: "",
      endDate: "",
      depositAmount: 0,
    },
  });

  const { handleSubmit, reset } = form;

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      reset({
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        depositAmount: initialData.depositAmount || 0,
      });
    }
  }, [initialData, reset]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mx-0.5">
        {/* Date Range */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày bắt đầu *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày kết thúc *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Deposit Amount */}
        <FormField
          control={form.control}
          name="depositAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiền đặt cọc (VND) *</FormLabel>
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
                  placeholder="Ví dụ: 10000000"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional Information Display */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700">
            Thông tin hợp đồng
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Mã hợp đồng:</span> #
              {initialData.id}
            </div>
            <div>
              <span className="font-medium">Trạng thái:</span>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs ${
                  initialData.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-800"
                    : initialData.status === "SENT"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {initialData.status === "DRAFT"
                  ? "Nháp"
                  : initialData.status === "SENT"
                  ? "Đã gửi"
                  : "Đã ký"}
              </span>
            </div>
            <div>
              <span className="font-medium">Ngày tạo:</span>{" "}
              {new Date(initialData.createdAt).toLocaleDateString("vi-VN")}
            </div>
            <div>
              <span className="font-medium">ID Phòng:</span>{" "}
              {initialData.unitId}
            </div>
          </div>
        </div>

        {(showUpdateButton || onCancel) && (
          <div className="flex justify-end gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isPending}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
            )}
            {showUpdateButton && (
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? "Đang xử lý..." : "Cập nhật thông tin"}
              </button>
            )}
          </div>
        )}
      </form>
    </Form>
  );
};
