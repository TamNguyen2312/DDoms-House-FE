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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Receipt, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const invoiceItemSchema = z.object({
  itemType: z.enum(["RENT", "DEPOSIT"]),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number().min(0, "Đơn giá phải lớn hơn hoặc bằng 0"),
});

const createInvoiceSchema = z.object({
  cycleMonth: z.string().min(1, "Vui lòng chọn tháng chu kỳ"),
  dueAt: z.string().min(1, "Vui lòng chọn ngày đến hạn"),
  taxAmount: z.number().min(0, "Thuế phải lớn hơn hoặc bằng 0"),
  items: z.array(invoiceItemSchema).length(2, "Phải có đủ 2 mục hóa đơn"),
});

type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateInvoiceFormValues) => void;
  isPending?: boolean;
  depositAmount?: number; // Giá trị hợp đồng từ contract
  status?:
    | "SENT"
    | "DRAFT"
    | "SIGNED"
    | "ACTIVE"
    | "TERMINATION_PENDING"
    | "CANCELLED"
    | "EXPIRED"; // Trạng thái hợp đồng
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  depositAmount = 0,
  status,
}: CreateInvoiceDialogProps) {
  const form = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      cycleMonth: "",
      dueAt: "",
      taxAmount: 0,
      items: [
        {
          itemType: "RENT",
          description: "Tiền thuê",
          quantity: 1,
          unitPrice: depositAmount || 0,
        },
        {
          itemType: "DEPOSIT",
          description: "Cọc",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    },
  });

  // Update form when depositAmount changes or dialog opens
  useEffect(() => {
    if (open && depositAmount > 0) {
      form.setValue("items.0.unitPrice", depositAmount);
    }
    // Set taxAmount to 0 when dialog opens
    if (open) {
      form.setValue("taxAmount", 0);
    }
    // Reset adjustment amount when dialog opens
    if (open) {
      setAdjustmentAmount(0);
      setAdjustmentError(null);
    }
  }, [open, depositAmount, form]);

  const handleSubmit = (data: CreateInvoiceFormValues) => {
    // Validate adjustment amount - use depositAmount if available, otherwise use totalBeforeAdjustment
    const subtotal = data.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
    const totalBeforeAdjustment = subtotal + data.taxAmount;
    const maxAmount = depositAmount > 0 ? depositAmount : totalBeforeAdjustment;

    if (adjustmentAmount > maxAmount) {
      form.setError("root", {
        message: `Số tiền giảm không được lớn hơn ${
          depositAmount > 0 ? "giá trị hợp đồng" : "tổng thanh toán"
        } (${new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(maxAmount)})`,
      });
      return;
    }

    // Convert dates to proper format
    const cycleMonthDate = new Date(data.cycleMonth);
    const cycleMonthFormatted = `${cycleMonthDate.getFullYear()}-${String(
      cycleMonthDate.getMonth() + 1
    ).padStart(2, "0")}-01`;

    const dueAtDate = new Date(data.dueAt);
    const dueAtFormatted = dueAtDate.toISOString();

    // Calculate unit prices after applying adjustment (discount)
    // Trừ giảm giá vào item RENT trước, nếu còn dư thì trừ vào DEPOSIT
    let rentUnitPrice = data.items[0]?.unitPrice || 0;
    let depositUnitPrice = data.items[1]?.unitPrice || 0;
    let remainingAdjustment = adjustmentAmount;

    // Trừ giảm giá vào RENT trước
    if (remainingAdjustment > 0 && rentUnitPrice > 0) {
      if (remainingAdjustment >= rentUnitPrice) {
        // Nếu giảm giá >= tiền thuê, trừ hết tiền thuê
        remainingAdjustment -= rentUnitPrice;
        rentUnitPrice = 0;
      } else {
        // Nếu giảm giá < tiền thuê, trừ phần giảm giá
        rentUnitPrice -= remainingAdjustment;
        remainingAdjustment = 0;
      }
    }

    // Nếu còn giảm giá, trừ vào DEPOSIT
    if (remainingAdjustment > 0 && depositUnitPrice > 0) {
      if (remainingAdjustment >= depositUnitPrice) {
        // Nếu giảm giá còn lại >= cọc, trừ hết cọc
        depositUnitPrice = 0;
      } else {
        // Nếu giảm giá còn lại < cọc, trừ phần giảm giá
        depositUnitPrice -= remainingAdjustment;
      }
    }

    // Ensure items have correct structure with adjusted prices
    const items = [
      {
        itemType: "RENT" as const,
        description: "Tiền thuê",
        quantity: 1,
        unitPrice: Math.max(0, rentUnitPrice), // Đảm bảo không âm
      },
      {
        itemType: "DEPOSIT" as const,
        description: "Cọc",
        quantity: 1,
        unitPrice: Math.max(0, depositUnitPrice), // Đảm bảo không âm
      },
    ];

    onSubmit({
      cycleMonth: cycleMonthFormatted,
      dueAt: dueAtFormatted,
      taxAmount: 0,
      items,
    });
  };

  const handleClose = () => {
    form.reset({
      cycleMonth: "",
      dueAt: "",
      taxAmount: 0,
      items: [
        {
          itemType: "RENT",
          description: "Tiền thuê",
          quantity: 1,
          unitPrice: 0,
        },
        {
          itemType: "DEPOSIT",
          description: "Cọc",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    });
    setAdjustmentAmount(0);
    onOpenChange(false);
  };

  // State for adjustment amount (FE only) - chỉ dùng để giảm giá
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);

  // Calculate total
  const items = form.watch("items");
  const taxAmount = form.watch("taxAmount") || 0;
  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );
  const totalBeforeAdjustment = subtotal + taxAmount;
  const total = totalBeforeAdjustment - adjustmentAmount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-5 text-blue-500" />
            Tạo thanh toán từ hợp đồng
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4" />
            <span>Chỉ nhập tiền cọc cho lần đầu thanh toán nhận phòng.</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cycleMonth"
                render={({ field }) => {
                  const now = new Date();
                  const currentYear = now.getFullYear();
                  const currentMonthNum = now.getMonth() + 1;
                  const currentMonth = `${currentYear}-${String(
                    currentMonthNum
                  ).padStart(2, "0")}`;

                  let minMonth: string | undefined;
                  let maxMonth: string | undefined;
                  let isInvalidStatus = false;

                  // Validate based on contract status
                  if (status === "SIGNED" || status === "ACTIVE") {
                    // From current month to future
                    minMonth = currentMonth;
                    maxMonth = undefined; // No max limit for future
                  } else if (status === "EXPIRED") {
                    // ±1 month from current month
                    const oneMonthBefore = new Date(now);
                    oneMonthBefore.setMonth(oneMonthBefore.getMonth() - 1);
                    minMonth = `${oneMonthBefore.getFullYear()}-${String(
                      oneMonthBefore.getMonth() + 1
                    ).padStart(2, "0")}`;

                    const oneMonthAfter = new Date(now);
                    oneMonthAfter.setMonth(oneMonthAfter.getMonth() + 1);
                    maxMonth = `${oneMonthAfter.getFullYear()}-${String(
                      oneMonthAfter.getMonth() + 1
                    ).padStart(2, "0")}`;
                  } else {
                    // Other statuses: invalid for payment
                    isInvalidStatus = true;
                    minMonth = undefined;
                    maxMonth = undefined;
                  }

                  return (
                    <FormItem>
                      <FormLabel>Tháng thanh toán *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="month"
                          min={minMonth}
                          max={maxMonth}
                          disabled={isPending || !status || isInvalidStatus}
                        />
                      </FormControl>
                      {isInvalidStatus && (
                        <p className="text-xs text-red-600">
                          Trạng thái hợp đồng không hợp lệ để thực hiện thanh
                          toán
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="dueAt"
                render={({ field }) => {
                  // Get minimum datetime (tomorrow at 00:00)
                  const now = new Date();
                  const tomorrow = new Date(now);
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(0, 0, 0, 0);

                  // Format as YYYY-MM-DDTHH:mm for datetime-local input
                  const minDateTime = `${tomorrow.getFullYear()}-${String(
                    tomorrow.getMonth() + 1
                  ).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(
                    2,
                    "0"
                  )}T${String(tomorrow.getHours()).padStart(2, "0")}:${String(
                    tomorrow.getMinutes()
                  ).padStart(2, "0")}`;

                  return (
                    <FormItem>
                      <FormLabel>Ngày đến hạn *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                          min={minDateTime}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Thuế - Hidden field */}
            <FormField
              control={form.control}
              name="taxAmount"
              render={({ field }) => (
                <input type="hidden" {...field} value={0} />
              )}
            />

            {/* Invoice Items - Fixed 2 items: RENT and DEPOSIT */}
            <div className="space-y-4">
              <FormLabel>Danh mục hóa đơn *</FormLabel>

              {/* RENT Item - Display as text only when depositAmount is provided */}
              {depositAmount > 0 ? (
                <div className="space-y-2 border rounded-lg p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">
                      Tiền thuê
                    </span>
                    <span className="text-sm font-semibold text-green-700">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(depositAmount)}
                    </span>
                  </div>
                  {/* Hidden fields for RENT item */}
                  <FormField
                    control={form.control}
                    name="items.0.itemType"
                    render={({ field }) => (
                      <input type="hidden" {...field} value="RENT" />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="items.0.description"
                    render={({ field }) => (
                      <input type="hidden" {...field} value="Tiền thuê" />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="items.0.quantity"
                    render={({ field }) => (
                      <input type="hidden" {...field} value={1} />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="items.0.unitPrice"
                    render={({ field }) => (
                      <input type="hidden" {...field} value={depositAmount} />
                    )}
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                  <div className="mb-2">
                    <span className="text-sm font-medium">Tiền thuê</span>
                  </div>

                  {/* Hidden fields for RENT item */}
                  <FormField
                    control={form.control}
                    name="items.0.itemType"
                    render={({ field }) => (
                      <input type="hidden" {...field} value="RENT" />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="items.0.description"
                    render={({ field }) => (
                      <input type="hidden" {...field} value="Tiền thuê" />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="items.0.quantity"
                    render={({ field }) => (
                      <input type="hidden" {...field} value={1} />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="items.0.unitPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Đơn giá (VND) *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            disabled={isPending}
                            placeholder="Nhập số tiền"
                            value={field.value || ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-right text-sm text-muted-foreground">
                    Thành tiền:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(form.watch("items.0.unitPrice") || 0)}
                  </div>
                </div>
              )}

              {/* DEPOSIT Item */}
              <div className="border rounded-lg px-4 py-2 space-y-4 bg-muted/50">
                <div className="mb-2">
                  <span className="text-sm font-medium">Cọc</span>
                </div>

                {/* Hidden fields for DEPOSIT item */}
                <FormField
                  control={form.control}
                  name="items.1.itemType"
                  render={({ field }) => (
                    <input type="hidden" {...field} value="DEPOSIT" />
                  )}
                />
                <FormField
                  control={form.control}
                  name="items.1.description"
                  render={({ field }) => (
                    <input type="hidden" {...field} value="Cọc" />
                  )}
                />
                <FormField
                  control={form.control}
                  name="items.1.quantity"
                  render={({ field }) => (
                    <input type="hidden" {...field} value={1} />
                  )}
                />

                <FormField
                  control={form.control}
                  name="items.1.unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn giá (VND) *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          disabled={isPending}
                          placeholder="Nhập số tiền"
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-right text-sm text-muted-foreground">
                  Thành tiền:{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(form.watch("items.1.unitPrice") || 0)}
                </div>
              </div>

              {/* Giảm giá (FE only) */}
              <div className="border rounded-lg px-4 py-2 space-y-4 bg-muted/50">
                <div className="mb-2">
                  <span className="text-sm font-medium">Giảm giá</span>
                </div>

                {/* Amount input */}
                <div className="space-y-2">
                  <FormLabel>Số tiền giảm (VND)</FormLabel>
                  <Input
                    type="number"
                    min={0}
                    max={
                      depositAmount > 0 ? depositAmount : totalBeforeAdjustment
                    }
                    placeholder="Nhập số tiền giảm"
                    value={adjustmentAmount === 0 ? "" : adjustmentAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        setAdjustmentAmount(0);
                        setAdjustmentError(null);
                        return;
                      }

                      const numValue = Number(value);
                      const maxAmount =
                        depositAmount > 0
                          ? depositAmount
                          : totalBeforeAdjustment;

                      // Prevent entering value greater than max - cap it at max
                      if (numValue > maxAmount) {
                        setAdjustmentAmount(maxAmount);
                        setAdjustmentError(
                          `Số tiền giảm không được lớn hơn ${
                            depositAmount > 0
                              ? "giá trị hợp đồng"
                              : "tổng thanh toán"
                          } (${new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(maxAmount)})`
                        );
                      } else {
                        setAdjustmentAmount(numValue);
                        setAdjustmentError(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent typing if it would exceed max
                      const maxAmount =
                        depositAmount > 0
                          ? depositAmount
                          : totalBeforeAdjustment;

                      // Allow backspace, delete, arrow keys, etc.
                      if (
                        e.key === "Backspace" ||
                        e.key === "Delete" ||
                        e.key === "ArrowLeft" ||
                        e.key === "ArrowRight" ||
                        e.key === "ArrowUp" ||
                        e.key === "ArrowDown" ||
                        e.key === "Tab" ||
                        e.key === "Enter" ||
                        e.ctrlKey ||
                        e.metaKey ||
                        e.altKey
                      ) {
                        return;
                      }

                      // If typing a digit, check if it would exceed max
                      if (/[0-9]/.test(e.key)) {
                        const input = e.currentTarget;
                        const selectionStart = input.selectionStart || 0;
                        const selectionEnd = input.selectionEnd || 0;
                        const newValueStr =
                          input.value.slice(0, selectionStart) +
                          e.key +
                          input.value.slice(selectionEnd);
                        const newValue =
                          newValueStr === "" ? 0 : Number(newValueStr);

                        if (newValue > maxAmount) {
                          e.preventDefault();
                        }
                      }
                    }}
                    disabled={isPending}
                    className={adjustmentError ? "border-red-500" : ""}
                  />
                  {adjustmentError && (
                    <p className="text-xs text-red-600">{adjustmentError}</p>
                  )}
                  <div className="text-right text-sm text-muted-foreground">
                    Thành tiền:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(adjustmentAmount || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(subtotal)}
                </span>
              </div>
              {adjustmentAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Giảm giá:</span>
                  <span className="text-red-600">
                    -
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(adjustmentAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Tổng cộng:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(total)}
                </span>
              </div>
            </div>

            <DialogFooter className="border-t border-dashed pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isPending || !!adjustmentError}>
                {isPending ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo thanh toán"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
