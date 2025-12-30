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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info, Loader, Plus, Receipt, Trash2 } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const serviceInvoiceItemSchema = z.object({
  itemType: z.enum(["ELECTRICITY", "WATER", "OTHER"]),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  quantity: z.number().min(0.01, "Số lượng phải lớn hơn 0"),
  unitPrice: z
    .number()
    .min(0, "Đơn giá phải lớn hơn hoặc bằng 0")
    .max(20000, "Đơn giá không được vượt quá 20,000 VND"),
});

const createServiceInvoiceSchema = z
  .object({
  cycleMonth: z.string().optional(), // Bỏ ràng buộc bắt buộc chọn tháng
  dueAt: z.string().min(1, "Vui lòng chọn ngày đến hạn"),
  taxAmount: z.number().min(0, "Thuế phải lớn hơn hoặc bằng 0"),
  items: z
    .array(serviceInvoiceItemSchema)
    .min(1, "Phải có ít nhất 1 mục hóa đơn"),
  })
  .refine(
    (data) => {
      // Check for duplicate itemTypes
      const itemTypes = data.items.map((item) => item.itemType);
      const uniqueItemTypes = new Set(itemTypes);
      return itemTypes.length === uniqueItemTypes.size;
    },
    {
      message: "Mỗi loại dịch vụ chỉ được chọn một lần",
      path: ["items"],
    }
  )
  .refine(
    (data) => {
      // If dueAt is provided, validate it's not in the past
      if (data.dueAt) {
        const selectedDate = new Date(data.dueAt);
        const now = new Date();
        return selectedDate >= now;
      }
      return true;
    },
    {
      message: "Ngày đến hạn phải từ thời điểm hiện tại trở đi",
      path: ["dueAt"],
    }
  );

type CreateServiceInvoiceFormValues = z.infer<
  typeof createServiceInvoiceSchema
>;

interface CreateServiceInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: number;
  onSubmit: (data: CreateServiceInvoiceFormValues) => void;
  isPending?: boolean;
  feeDetail?: string; // feeDetail từ contract để lấy giá điện/nước
}

const itemTypeLabels: Record<string, string> = {
  ELECTRICITY: "Tiền điện",
  WATER: "Tiền nước",
  OTHER: "Khác",
};

// Helper functions to format and parse currency
const formatCurrency = (value: number | string | undefined): string => {
  if (value === undefined || value === null || value === "") return "";
  const numValue = typeof value === "string" ? parseFloat(value) || 0 : value;
  if (isNaN(numValue)) return "";
  return new Intl.NumberFormat("vi-VN").format(numValue);
};

const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove all non-digit characters except minus sign and decimal point
  const cleaned = value.replace(/[^\d.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

// Get current month in YYYY-MM format for default cycleMonth
const getCurrentMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// Parse feeDetail to extract electricity and water prices
const parseFeeDetail = (feeDetail?: string): {
  electricityPrice?: number;
  waterPrice?: number;
} => {
  if (!feeDetail) return {};

  const result: {
    electricityPrice?: number;
    waterPrice?: number;
  } = {};

  // Parse sections: format "NUMBER. Title\n\nContent\n\nNUMBER. Title..."
  const parts = feeDetail.split(/\n\n+/);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;

    // Check if this part starts with "NUMBER. " pattern
    const match = part.match(/^(\d+)\.\s*(.+)$/s);
    if (match) {
      const title = match[2].trim().replace(/:\s*$/, "");
      
      // Get content from next part if available
      let content = "";
      if (i + 1 < parts.length) {
        const nextPart = parts[i + 1].trim();
        if (nextPart && !/^\d+\./.test(nextPart)) {
          content = nextPart;
          i++; // Skip the next part as we've used it
        }
      }

      // Check if title contains "Giá điện" or "Giá nước"
      const normalizedTitle = title.toLowerCase().trim();
      
      if (normalizedTitle.includes("giá điện") || normalizedTitle.includes("điện")) {
        // Extract number from content (look for numbers in the content)
        const priceMatch = content.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)/);
        if (priceMatch) {
          const priceStr = priceMatch[1].replace(/[.,]/g, "");
          const price = parseInt(priceStr, 10);
          if (!isNaN(price)) {
            result.electricityPrice = price;
          }
        }
      } else if (normalizedTitle.includes("giá nước") || normalizedTitle.includes("nước")) {
        // Extract number from content
        const priceMatch = content.match(/(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)/);
        if (priceMatch) {
          const priceStr = priceMatch[1].replace(/[.,]/g, "");
          const price = parseInt(priceStr, 10);
          if (!isNaN(price)) {
            result.waterPrice = price;
          }
        }
      }
    }
  }

  return result;
};

export function CreateServiceInvoiceDialog({
  open,
  onOpenChange,
  contractId,
  onSubmit,
  isPending = false,
  feeDetail,
}: CreateServiceInvoiceDialogProps) {
  const form = useForm<CreateServiceInvoiceFormValues>({
    resolver: zodResolver(createServiceInvoiceSchema),
    defaultValues: {
      cycleMonth: "", // Không mặc định chọn tháng
      dueAt: "",
      taxAmount: 0,
      items: [
        {
          itemType: "ELECTRICITY",
          description: "",
          quantity: 0, // Start with 0 for ELECTRICITY/WATER
          unitPrice: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Watch cycleMonth to generate description
  const cycleMonth = form.watch("cycleMonth");
  const items = form.watch("items");

  // Generate description based on itemType and cycleMonth
  const generateDescription = (itemType: string, cycleMonth: string) => {
    if (!cycleMonth) return "";

    // Parse YYYY-MM format
    const [, month] = cycleMonth.split("-");
    const monthNum = parseInt(month, 10);

    const typeLabel = itemTypeLabels[itemType] || itemType;
    return `${typeLabel} tháng ${monthNum}`;
  };

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      form.reset({
        cycleMonth: "", // Không mặc định chọn tháng
        dueAt: "",
        taxAmount: 0,
        items: [
          {
            itemType: "ELECTRICITY",
            description: "",
            quantity: 0, // Start with 0 for ELECTRICITY/WATER
            unitPrice: 0,
          },
        ],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-update descriptions when cycleMonth changes
  React.useEffect(() => {
    if (cycleMonth && items && items.length > 0) {
      items.forEach((item, index) => {
        // Only auto-update for ELECTRICITY and WATER, not for OTHER
        if (item.itemType && item.itemType !== "OTHER") {
          const description = generateDescription(item.itemType, cycleMonth);
          form.setValue(`items.${index}.description`, description, {
            shouldValidate: false,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleMonth, items]);

  const handleSubmit = (data: CreateServiceInvoiceFormValues) => {
    // Convert dates to proper format
    // cycleMonth format: YYYY-MM -> YYYY-MM-01 (chỉ khi có giá trị)
    const cycleMonthFormatted = data.cycleMonth
      ? `${data.cycleMonth}-01`
      : undefined;

    // dueAt: datetime-local returns YYYY-MM-DDTHH:mm
    // Convert to ISO string format, ensuring we preserve local time as UTC
    const dueAtDate = new Date(data.dueAt);
    // Format as ISO string: YYYY-MM-DDTHH:mm:ss.sssZ
    const dueAtFormatted = dueAtDate.toISOString();

    onSubmit({
      cycleMonth: cycleMonthFormatted || "",
      dueAt: dueAtFormatted,
      taxAmount: data.taxAmount,
      items: data.items,
    });
  };

  const handleClose = () => {
    form.reset({
      cycleMonth: "", // Không mặc định chọn tháng
      dueAt: "",
      taxAmount: 0,
      items: [
        {
          itemType: "ELECTRICITY",
          description: "",
          quantity: 0, // Start with 0 for ELECTRICITY/WATER
          unitPrice: 0,
        },
      ],
    });
    onOpenChange(false);
  };

  // Calculate total
  const taxAmount = form.watch("taxAmount") || 0;
  const subtotal = items.reduce((sum, item) => {
    // For ELECTRICITY and WATER: quantity × unitPrice
    // For OTHER: unitPrice is already the total (quantity = 1)
    if (item.itemType === "ELECTRICITY" || item.itemType === "WATER") {
      return sum + (item.quantity || 0) * (item.unitPrice || 0);
    } else {
      return sum + (item.unitPrice || 0);
    }
  }, 0);
  const total = subtotal + taxAmount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            Tạo hóa đơn dịch vụ
          </DialogTitle>
          <DialogDescription>
            Tạo hóa đơn dịch vụ mới cho hợp đồng #{contractId}. Hãy điền đầy đủ
            thông tin.
          </DialogDescription>
        </DialogHeader>

        {/* Display electricity and water prices from feeDetail if available */}
        {(() => {
          const prices = parseFeeDetail(feeDetail);
          if (prices.electricityPrice || prices.waterPrice) {
            return (
              <Alert className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <div className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                    Giá dịch vụ từ hợp đồng:
                  </div>
                  <div className="space-y-1 text-blue-800 dark:text-blue-200">
                    {prices.electricityPrice && (
                      <div>
                        <strong>Giá điện:</strong>{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(prices.electricityPrice)}
                        /kWh
                      </div>
                    )}
                    {prices.waterPrice && (
                      <div>
                        <strong>Giá nước:</strong>{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(prices.waterPrice)}
                        /m³
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            );
          }
          return null;
        })()}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cycleMonth"
                render={({ field }) => {
                  return (
                  <FormItem>
                    <FormLabel>Tháng</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="month"
                        lang="vi-VN"
                        value={field.value || ""}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="dueAt"
                render={({ field }) => {
                  // Get minimum datetime (current date and time)
                  const now = new Date();
                  const year = now.getFullYear();
                  const month = String(now.getMonth() + 1).padStart(2, "0");
                  const day = String(now.getDate()).padStart(2, "0");
                  const hours = String(now.getHours()).padStart(2, "0");
                  const minutes = String(now.getMinutes()).padStart(2, "0");
                  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

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

            {/* Thuế - Ẩn và mặc định là 0 */}
            <FormField
              control={form.control}
              name="taxAmount"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormLabel>Thuế (VND) *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      disabled={isPending}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice Items - Dynamic */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Danh mục hóa đơn *</FormLabel>
                {(() => {
                  // Check if all 3 types are already selected
                  const selectedItemTypes = new Set(
                    items.map((item) => item.itemType)
                  );
                  const allTypes: Array<"ELECTRICITY" | "WATER" | "OTHER"> = [
                    "ELECTRICITY",
                    "WATER",
                    "OTHER",
                  ];
                  const hasAllTypes = allTypes.every((type) =>
                    selectedItemTypes.has(type)
                  );

                  // Hide button if all 3 types are selected
                  if (hasAllTypes) return null;

                  return (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                      onClick={() => {
                        // Find first available type
                        const availableType =
                          allTypes.find(
                            (type) => !selectedItemTypes.has(type)
                          ) || "OTHER";

                        // Auto-generate description if cycleMonth is set and type is not OTHER
                        const description =
                          cycleMonth && availableType !== "OTHER"
                            ? generateDescription(availableType, cycleMonth)
                            : "";

                    append({
                          itemType: availableType,
                          description,
                      quantity: availableType === "OTHER" ? 1 : 0, // 0 for ELECTRICITY/WATER, 1 for OTHER
                      unitPrice: 0,
                        });
                      }}
                  disabled={isPending}
                >
                  <Plus className="mr-2 size-4" />
                  Thêm mục
                </Button>
                  );
                })()}
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 space-y-4 bg-muted/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Mục {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemType`}
                      render={({ field }) => {
                        // Get all selected itemTypes from other items (excluding current item)
                        const selectedItemTypes = items
                          .map((item, idx) =>
                            idx !== index ? item.itemType : null
                          )
                          .filter(
                            (type): type is "ELECTRICITY" | "WATER" | "OTHER" =>
                              type !== null
                          );

                        // Available options: all types except those already selected
                        const allTypes: Array<{
                          value: "ELECTRICITY" | "WATER" | "OTHER";
                          label: string;
                        }> = [
                          { value: "ELECTRICITY", label: "Tiền điện" },
                          { value: "WATER", label: "Tiền nước" },
                          { value: "OTHER", label: "Khác" },
                        ];

                        const availableTypes = allTypes.filter(
                          (type) =>
                            !selectedItemTypes.includes(type.value) ||
                            type.value === field.value
                        );

                        const currentItemType = field.value;

                        return (
                        <FormItem>
                          <FormLabel>Loại *</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Auto-fill description when itemType changes (except for OTHER)
                              if (cycleMonth && value !== "OTHER") {
                                const description = generateDescription(
                                  value,
                                  cycleMonth
                                );
                                form.setValue(
                                  `items.${index}.description`,
                                  description
                                );
                              } else if (value === "OTHER") {
                                // Clear description when switching to OTHER to let user input
                                  form.setValue(
                                    `items.${index}.description`,
                                    ""
                                  );
                              }
                              // Reset quantity and unitPrice when changing type
                              if (value === "ELECTRICITY" || value === "WATER") {
                                form.setValue(`items.${index}.quantity`, 0);
                                form.setValue(`items.${index}.unitPrice`, 0);
                              } else {
                                form.setValue(`items.${index}.quantity`, 1);
                                form.setValue(`items.${index}.unitPrice`, 0);
                              }
                            }}
                            value={field.value}
                            disabled={isPending}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn loại" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {availableTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                              </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => {
                        const currentItemType = form.watch(`items.${index}.itemType`);
                        let placeholder = "Nhập mô tả";
                        if (currentItemType === "ELECTRICITY") {
                          placeholder = "Ví dụ: Tiền điện tháng 11";
                        } else if (currentItemType === "WATER") {
                          placeholder = "Ví dụ: Tiền nước tháng 11";
                        }
                        
                        return (
                          <FormItem>
                            <FormLabel>Mô tả *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={placeholder}
                                disabled={isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  {/* Conditional rendering based on itemType */}
                  {(() => {
                    const currentItemType = form.watch(`items.${index}.itemType`);
                    const isElectricityOrWater = currentItemType === "ELECTRICITY" || currentItemType === "WATER";
                    const quantity = form.watch(`items.${index}.quantity`) || 0;
                    const unitPrice = form.watch(`items.${index}.unitPrice`) || 0;
                    const totalAmount = isElectricityOrWater ? quantity * unitPrice : unitPrice;

                    if (isElectricityOrWater) {
                      // For ELECTRICITY and WATER: show quantity and unit price inputs
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {currentItemType === "ELECTRICITY" ? "Số điện (kWh)" : "Số nước (m³)"} *
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      disabled={isPending}
                                      placeholder={currentItemType === "ELECTRICITY" ? "Nhập số kWh" : "Nhập số m³"}
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

                            <FormField
                              control={form.control}
                              name={`items.${index}.unitPrice`}
                              render={({ field }) => {
                                const [displayValue, setDisplayValue] = React.useState(
                                  field.value ? formatCurrency(field.value) : ""
                                );
                                const [isFocused, setIsFocused] = React.useState(false);

                                // Chỉ update displayValue từ field.value khi không focus (người dùng không đang nhập)
                                React.useEffect(() => {
                                  if (!isFocused) {
                                    setDisplayValue(field.value ? formatCurrency(field.value) : "");
                                  }
                                }, [field.value, isFocused]);

                                return (
                                  <FormItem>
                                    <FormLabel>
                                      Đơn giá ({currentItemType === "ELECTRICITY" ? "VND/kWh" : "VND/m³"}) *
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Input
                                          type="text"
                                          disabled={isPending}
                                          placeholder="Nhập đơn giá (tối đa 20,000)"
                                          value={displayValue}
                                          onFocus={() => setIsFocused(true)}
                                          onBlur={() => {
                                            setIsFocused(false);
                                            // Format lại khi blur và đảm bảo không vượt quá 20,000
                                            const currentValue = field.value || 0;
                                            const limitedValue = currentValue > 20000 ? 20000 : currentValue;
                                            if (currentValue !== limitedValue) {
                                              field.onChange(limitedValue);
                                            }
                                            const formatted = formatCurrency(limitedValue);
                                            setDisplayValue(formatted);
                                          }}
                                          onChange={(e) => {
                                            const rawValue = e.target.value;
                                            // Giữ nguyên rawValue khi đang nhập (không format)
                                            setDisplayValue(rawValue);
                                            
                                            // Parse giá trị số
                                            const parsed = parseCurrency(rawValue);
                                            
                                            // Chỉ giới hạn nếu giá trị vượt quá 20000
                                            if (parsed > 20000) {
                                              // Giới hạn xuống 20000
                                              field.onChange(20000);
                                              setDisplayValue(formatCurrency(20000));
                                            } else {
                                              // Lưu giá trị đã parse vào form
                                              field.onChange(parsed);
                                            }
                                          }}
                                          className="pr-16"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                          VND
                                        </span>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          </div>

                          <div className="text-right text-sm font-medium text-primary">
                            Thành tiền:{" "}
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(totalAmount)}
                          </div>
                        </>
                      );
                    } else {
                      // For OTHER: show only unitPrice (total amount) input
                      return (
                        <>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <input
                                type="hidden"
                                {...field}
                                value={1}
                                onChange={() => field.onChange(1)}
                              />
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => {
                              const [displayValue, setDisplayValue] = React.useState(
                                formatCurrency(field.value)
                              );

                              React.useEffect(() => {
                                setDisplayValue(formatCurrency(field.value));
                              }, [field.value]);

                              return (
                                <FormItem>
                                  <FormLabel>Thành tiền (VND) *</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        type="text"
                                        disabled={isPending}
                                        placeholder="Nhập số tiền"
                                        value={displayValue}
                                        onChange={(e) => {
                                          const rawValue = e.target.value;
                                          setDisplayValue(rawValue);
                                          const parsed = parseCurrency(rawValue);
                                          field.onChange(parsed);
                                        }}
                                        onBlur={() => {
                                          // Format lại khi blur
                                          const formatted = formatCurrency(field.value);
                                          setDisplayValue(formatted);
                                        }}
                                        className="pr-16"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                                        VND
                                      </span>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </>
                      );
                    }
                  })()}
                </div>
              ))}
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
              <div className="flex justify-between text-sm">
                <span>Thuế:</span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(taxAmount)}
                </span>
              </div>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo hóa đơn"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
