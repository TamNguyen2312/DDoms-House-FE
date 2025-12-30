import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import type {
  FurnishingCategory,
  ItemCondition,
} from "@/services/api/unit.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { forwardRef, useImperativeHandle } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";

const furnishingItemSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên vật dụng"),
  category: z.enum([
    "BED",
    "MATTRESS",
    "WARDROBE",
    "VANITY_TABLE",
    "TABLE",
    "CHAIR",
    "DESK",
    "SOFA",
    "BOOKSHELF",
    "FRIDGE",
    "AIR_CON",
    "FAN",
    "TV",
    "WIFI",
    "STOVE",
    "WATER_HEATER",
    "WASHING_MACHINE",
    "OTHER",
  ]),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  itemCondition: z.enum(["GOOD", "FAIR", "POOR", "NEW", "OLD"]),
  note: z.string().optional(),
});

const furnishingTodoListSchema = z
  .object({
    items: z.array(furnishingItemSchema).min(1, "Phải có ít nhất 1 vật dụng"),
  })
  .superRefine((data, ctx) => {
    const names = data.items.map((item) => item.name.trim().toLowerCase());
    const nameCounts = new Map<string, number[]>();

    // Tìm các index có tên trùng
    names.forEach((name, index) => {
      if (name) {
        if (!nameCounts.has(name)) {
          nameCounts.set(name, []);
        }
        nameCounts.get(name)!.push(index);
      }
    });

    // Set error cho các field bị trùng
    nameCounts.forEach((indices, name) => {
      if (indices.length > 1) {
        indices.forEach((index) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Tên vật dụng không được trùng với vật dụng khác",
            path: ["items", index, "name"],
          });
        });
      }
    });
  });

type FurnishingTodoListFormValues = z.infer<typeof furnishingTodoListSchema>;

export type FurnishingTodoListRef = {
  submit: () => void;
};

interface FurnishingTodoListProps {
  unitId: string;
  onSubmit: (items: FurnishingTodoListFormValues["items"]) => Promise<void>;
  onCancel: () => void;
  isPending?: boolean;
}

const categoryLabels: Record<FurnishingCategory, string> = {
  BED: "Giường ngủ",
  MATTRESS: "Nệm",
  WARDROBE: "Tủ quần áo",
  VANITY_TABLE: "Bàn trang điểm",
  TABLE: "Bàn",
  CHAIR: "Ghế",
  DESK: "Bàn làm việc",
  SOFA: "Sofa",
  BOOKSHELF: "Kệ sách",
  FRIDGE: "Tủ lạnh",
  AIR_CON: "Điều hòa",
  FAN: "Quạt",
  TV: "Tivi",
  WIFI: "Wi-Fi",
  STOVE: "Bếp",
  WATER_HEATER: "Nóng lạnh",
  WASHING_MACHINE: "Máy giặt",
  OTHER: "Khác",
};

const conditionLabels: Record<ItemCondition, string> = {
  GOOD: "Tốt",
  FAIR: "Khá",
  POOR: "Kém",
  NEW: "Mới",
  OLD: "Cũ",
};

export const FurnishingTodoList = forwardRef<
  FurnishingTodoListRef,
  FurnishingTodoListProps
>(({ unitId, onSubmit, onCancel, isPending = false }, ref) => {
  const form = useForm<FurnishingTodoListFormValues>({
    resolver: zodResolver(furnishingTodoListSchema),
    defaultValues: {
      items: [
        {
          name: "",
          category: "BED",
          quantity: 1,
          itemCondition: "GOOD",
          note: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleAddForm = () => {
    append({
      name: "",
      category: "BED",
      quantity: 1,
      itemCondition: "GOOD",
      note: "",
    });
  };

  const handleSubmit = async (values: FurnishingTodoListFormValues) => {
    await onSubmit(values.items);
  };

  // Expose submit function to parent via ref
  useImperativeHandle(ref, () => ({
    submit: () => {
      form.handleSubmit(handleSubmit)();
    },
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Danh sách vật dụng cần thêm</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddForm}
          disabled={isPending}
        >
          <Plus className="size-4 mr-1" />
          Thêm form nhập
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-lg p-4 space-y-4 bg-muted/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Vật dụng {index + 1}
                  </span>
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

                <FormField
                  control={form.control}
                  name={`items.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên vật dụng *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Giường đơn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.category`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[9999]">
                            {Object.entries(categoryLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.itemCondition`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tình trạng *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn tình trạng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="z-[9999]">
                            {Object.entries(conditionLabels).map(
                              ([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.note`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ví dụ: Giường đơn + nệm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>
        </form>
      </Form>
    </div>
  );
});

FurnishingTodoList.displayName = "FurnishingTodoList";
