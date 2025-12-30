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
import { Textarea } from "@/components/ui/textarea";
import {
  type FurnishingCategory,
  type IFurnishing,
  type ItemCondition,
} from "@/services/api/unit.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const furnishingFormSchema = z.object({
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

type FurnishingFormValues = z.infer<typeof furnishingFormSchema>;

interface FurnishingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  furnishing?: IFurnishing | null;
  onSubmit: (data: FurnishingFormValues) => void;
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

export function FurnishingFormDialog({
  open,
  onOpenChange,
  unitId,
  furnishing,
  onSubmit,
  isPending = false,
}: FurnishingFormDialogProps) {
  const form = useForm<FurnishingFormValues>({
    resolver: zodResolver(furnishingFormSchema),
    defaultValues: {
      name: "",
      category: "BED",
      quantity: 1,
      itemCondition: "GOOD",
      note: "",
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (open) {
      if (furnishing) {
        reset({
          name: furnishing.name,
          category: furnishing.category,
          quantity: furnishing.quantity,
          itemCondition: furnishing.itemCondition,
          note: furnishing.note || "",
        });
      } else {
        reset({
          name: "",
          category: "BED",
          quantity: 1,
          itemCondition: "GOOD",
          note: "",
        });
      }
    }
  }, [open, furnishing, reset]);

  const handleFormSubmit = (values: FurnishingFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {furnishing ? "Chỉnh sửa vật dụng" : "Thêm vật dụng mới"}
          </DialogTitle>
          <DialogDescription>
            {furnishing
              ? "Cập nhật thông tin vật dụng"
              : "Thêm vật dụng mới vào phòng"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
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
                name="category"
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
                      <SelectContent>
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
                name="itemCondition"
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
                      <SelectContent>
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
              name="quantity"
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
              name="note"
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
                {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                {furnishing ? "Cập nhật" : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
