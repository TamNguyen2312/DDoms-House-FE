import AddressSelector from "@/components/address-selector";
import MapPicker from "@/components/map-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { useProperty, useUpdateProperty } from "@/hooks/useProperties";
import { useCreateUnit, useUnits } from "@/hooks/useUnit";
import type { IUnit } from "@/lib/dbUnits";
import { PropertyCreateSchema, type PropertyCreate } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

// Schema for subunit
const SubunitSchema = z.object({
  code: z.string().min(1, "Mã phòng là bắt buộc"),
  areaSqM: z.number().min(0.1, "Diện tích phải lớn hơn 0"),
  bedrooms: z.number().int().min(0, "Số phòng ngủ phải >= 0"),
  bathrooms: z.number().int().min(0, "Số phòng tắm phải >= 0"),
  baseRent: z.number().min(0, "Giá thuê phải lớn hơn 0"),
});

type Subunit = z.infer<typeof SubunitSchema>;

export default function UpdateProperty() {
  const { id } = useParams();
  console.log({ id });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<IUnit | null>(null);
  const [localUnits, setLocalUnits] = useState<IUnit[]>([]);
  const { data: property, isLoading: isLoadingProperty } = useProperty(id);
  const navigate = useNavigate();
  const updateProperty = useUpdateProperty();

  // Hooks
  const { data: unitsResponse, isLoading: isLoadingUnits } = useUnits(id || "");
  console.log({ unitsResponse });
  const createUnitMutation = useCreateUnit(id || "");

  const form = useForm<PropertyCreate>({
    resolver: zodResolver(PropertyCreateSchema),
    defaultValues: {
      name: "",
      addressLine: "",
      ward: "",
      city: "",
      latitude: 10.796427317494299,
      longitude: 106.72639460578407,
    },
  });

  const subunitForm = useForm<Subunit>({
    resolver: zodResolver(SubunitSchema),
    defaultValues: {
      code: "",
      areaSqM: 0,
      bedrooms: 0,
      bathrooms: 0,
      baseRent: 0,
    },
  });
  // ✅ Reset form when property data is loaded
  useEffect(() => {
    if (property?.data) {
      console.log("Resetting form with data:", property.data);

      // Use setTimeout to ensure the form is fully mounted
      setTimeout(() => {
        form.reset({
          name: property.data.name,
          addressLine: property.data.addressLine,
          ward: property.data.ward,
          city: property.data.city,
          latitude: property.data.latitude,
          longitude: property.data.longitude,
        });
      }, 100);
    }
  }, [property?.data]);
  // Sync server data to local state
  useEffect(() => {
    console.log("useEffect", unitsResponse);
    if (unitsResponse?.content && Array.isArray(unitsResponse.content)) {
      setLocalUnits(unitsResponse?.content);
    }
  }, [unitsResponse?.content]);

  const onSubmit: SubmitHandler<PropertyCreate> = async (data) => {
    setIsSubmitting(true);
    try {
      console.log("[v0] Updating property with data:", data);
      console.log("[v0] Units to submit:", localUnits);
      // updateProperty.mutate(
      //   { id, data },
      //   {
      //     onSuccess: () => {
      //       console.log("Updated!");
      //     },
      //   }
      // );
      toast.success("Cập nhật thành công!");
    } catch (error) {
      console.error("[v0] Error updating property:", error);
      toast.error("Lỗi khi cập nhật!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAddSubunit = () => {
    setEditingUnit(null);
    subunitForm.reset({
      code: "",
      areaSqM: 0,
      bedrooms: 0,
      bathrooms: 0,
      baseRent: 0,
    });
    setIsDialogOpen(true);
  };

  const handleEditSubunit = (unit: IUnit) => {
    setEditingUnit(unit);
    subunitForm.reset(unit);
    setIsDialogOpen(true);
  };

  const handleDeleteSubunit = (unitCode: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;

    // Delete from local state only
    setLocalUnits((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.filter((unit) => unit.code !== unitCode);
    });
    toast.success("Xóa phòng thành công!");
  };

  const handleSubunitSubmit = async (data: Subunit) => {
    if (editingUnit) {
      // Update existing unit in local state
      setLocalUnits((prev) => {
        if (!Array.isArray(prev)) return [{ ...data }];
        return prev.map((unit) =>
          unit.code === editingUnit.code ? { ...unit, ...data } : unit
        );
      });
      toast.success("Cập nhật phòng thành công!");
      setIsDialogOpen(false);
    } else {
      // Create new unit via API
      createUnitMutation.mutate(data, {
        onSuccess: (response) => {
          console.log({ response });
          // Add to local state after successful API call
          if (response?.data) {
            setLocalUnits((prev) => {
              if (!Array.isArray(prev)) return [response.data];
              return [...prev, response.data];
            });
          }
          setIsDialogOpen(false);
        },
      });
    }
  };

  if (isLoadingProperty) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex">
          <Button
            className="hover:bg-transparent dark:hover:bg-transparent hover:text-muted-foreground cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Cập Nhật Phòng/Căn Hộ
            </h1>
            <p className="text-muted-foreground mt-2">
              Chỉnh sửa thông tin bất động sản của bạn
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Property Name */}
          <Card>
            <CardHeader>
              <CardTitle>Tên Phòng/Căn Hộ</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên bất động sản <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        placeholder="VD: Phòng 201, Căn Hộ 1BR, Nhà Nguyên Căn..."
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Địa Chỉ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="addressLine"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Địa chỉ chi tiết <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        placeholder="VD: 123 Đường Nguyễn Huệ"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* AddressSelector */}
              <AddressSelector control={form.control} />
            </CardContent>
          </Card>

          {/* Subunits */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Phòng Con</CardTitle>
              <Button
                type="button"
                size="sm"
                onClick={handleAddSubunit}
                className="gap-2"
                disabled={createUnitMutation.isPending}
              >
                <Plus size={16} />
                Thêm Phòng
              </Button>
            </CardHeader>
            <CardContent>
              {!localUnits || localUnits.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Chưa có phòng con nào. Nhấn "Thêm Phòng" để thêm mới.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex gap-4 pb-4">
                    {localUnits.map((unit) => (
                      <div
                        key={unit.code}
                        className="min-w-[280px] border border-border rounded-lg p-4 bg-card"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg">{unit.code}</h3>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditSubunit(unit)}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteSubunit(unit.code)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Diện tích:
                            </span>
                            <span className="font-medium">
                              {unit.areaSqM} m²
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Phòng ngủ:
                            </span>
                            <span className="font-medium">{unit.bedrooms}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Phòng tắm:
                            </span>
                            <span className="font-medium">
                              {unit.bathrooms}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-muted-foreground">
                              Giá thuê:
                            </span>
                            <span className="font-semibold text-primary">
                              {unit.baseRent.toLocaleString("vi-VN")} ₫
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MapPicker */}
          <MapPicker control={form.control} />

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Cập Nhật"
              )}
            </Button>
            <Link to="/dashboard" className="flex-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full bg-transparent"
              >
                Hủy
              </Button>
            </Link>
          </div>
        </form>
      </Form>

      {/* Subunit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? "Chỉnh Sửa Phòng" : "Thêm Phòng Mới"}
            </DialogTitle>
          </DialogHeader>
          <Form {...subunitForm}>
            <div className="space-y-4">
              <FormField
                control={subunitForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mã phòng <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        placeholder="VD: A101"
                        disabled={!!editingUnit}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={subunitForm.control}
                name="areaSqM"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Diện tích (m²) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="number"
                        step="0.1"
                        placeholder="VD: 35.5"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        value={field.value || ""}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={subunitForm.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phòng ngủ <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="number"
                          min="0"
                          placeholder="VD: 2"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          value={field.value || ""}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={subunitForm.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Phòng tắm <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="number"
                          min="0"
                          placeholder="VD: 1"
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          value={field.value || ""}
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={subunitForm.control}
                name="baseRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giá thuê (₫) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="number"
                        min="0"
                        placeholder="VD: 5000000"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        value={field.value || ""}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  onClick={() => setIsDialogOpen(false)}
                  disabled={createUnitMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={subunitForm.handleSubmit(handleSubunitSubmit)}
                  disabled={createUnitMutation.isPending}
                >
                  {createUnitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : editingUnit ? (
                    "Cập Nhật"
                  ) : (
                    "Thêm"
                  )}
                </Button>
              </DialogFooter>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
