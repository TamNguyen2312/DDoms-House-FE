import AddressSelector from "@/components/address-selector";
import MapPicker from "@/components/map-picker";
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
import { useCreateProperty } from "@/hooks/useProperties";
import { useToast } from "@/hooks/useToast";
import {
  PropertyCreateSchema,
  UnitCreateSchema,
  type PropertyCreate,
} from "@/schemas";
import {
  unitService,
  type CreateUnitRequest,
} from "@/services/api/unit.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// Unit form type
type UnitFormData = {
  code: string;
  areaSqM: number;
  bedrooms: number;
  bathrooms: number;
  baseRent: number;
};

// Extended schema to include units array (optional)
const CreatePropertyWithUnitSchema = PropertyCreateSchema.extend({
  units: z
    .array(
      UnitCreateSchema.partial().extend({
        code: z.string().optional(), // Make code optional for form
        areaSqM: z.number().min(0).optional(),
        bedrooms: z.number().int().min(0).optional(),
        bathrooms: z.number().int().min(0).optional(),
        baseRent: z.number().min(0).optional(),
      })
    )
    .optional()
    .default([]),
});

// Extended form type to include units array
type CreatePropertyWithUnitForm = z.infer<typeof CreatePropertyWithUnitSchema>;

export default function CreateProperty() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const createPropertyMutation = useCreateProperty();
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);

  const form = useForm<CreatePropertyWithUnitForm>({
    resolver: zodResolver(CreatePropertyWithUnitSchema),
    defaultValues: {
      name: "",
      addressLine: "",
      ward: "",
      city: "",
      latitude: 15.969009662474273,
      longitude: 108.26089129583012,
      // Units array - empty by default (optional)
      units: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "units",
  });

  const onSubmit = async (data: CreatePropertyWithUnitForm) => {
    try {
      // Step 1: Create property trước
      const propertyData: PropertyCreate = {
        name: data.name,
        addressLine: data.addressLine,
        ward: data.ward,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      console.log("Step 1: Creating property...", propertyData);
      const propertyResponse = await createPropertyMutation.mutateAsync(
        propertyData
      );
      console.log("Property response full:", propertyResponse);

      // Step 2: Lấy property ID từ response
      // Response structure: { success, message, status, data: { id: number, ... } }
      // propertyService.create() trả về res.data là ApiResponse<IProperty>
      // Vậy propertyResponse = { data: IProperty, message, status, success }
      // propertyResponse.data = IProperty có id là number
      let propertyId: string | null = null;

      // Kiểm tra các cấu trúc có thể có
      if (
        propertyResponse?.data?.id !== undefined &&
        propertyResponse?.data?.id !== null
      ) {
        // Cấu trúc chuẩn: propertyResponse.data.id (number)
        propertyId = String(propertyResponse.data.id);
      } else if (
        (propertyResponse as any)?.id !== undefined &&
        (propertyResponse as any)?.id !== null
      ) {
        // Fallback: nếu response trả về trực tiếp IProperty
        propertyId = String((propertyResponse as any).id);
      }

      console.log("Step 2: Property ID extracted:", propertyId);
      console.log("Property response:", propertyResponse);
      console.log("Property response.data:", propertyResponse?.data);
      console.log("Property response.data.id:", propertyResponse?.data?.id);

      if (!propertyId) {
        console.error(
          "Cannot extract property ID. Full response:",
          JSON.stringify(propertyResponse, null, 2)
        );
        toast.error(
          "Không thể lấy ID của property sau khi tạo. Vui lòng kiểm tra console để xem chi tiết."
        );
        return;
      }

      // Kiểm tra units data trước khi tạo
      console.log("=== UNITS DATA CHECK ===");
      console.log("Full form data:", data);
      console.log("Units data:", data.units);
      console.log("Units type:", typeof data.units);
      console.log("Units is array:", Array.isArray(data.units));
      console.log("Units length:", data.units?.length);
      console.log(
        "Has units:",
        !!data.units && Array.isArray(data.units) && data.units.length > 0
      );
      console.log("========================");

      // Step 3: Tạo units với property ID vừa lấy được (nếu có)
      if (data.units && Array.isArray(data.units) && data.units.length > 0) {
        console.log(`Step 3: Found ${data.units.length} units to create`);
        setIsCreatingUnit(true);

        try {
          console.log(
            `Step 3: Creating ${data.units.length} units for property ${propertyId}...`
          );

          // Tạo từng unit tuần tự để dễ debug và đảm bảo thứ tự
          const createdUnits = [];
          for (let index = 0; index < data.units.length; index++) {
            const unit = data.units[index];
            const unitData: CreateUnitRequest = {
              code: unit.code || `UNIT-${Date.now()}-${index}`,
              areaSqM: unit.areaSqM,
              bedrooms: unit.bedrooms,
              bathrooms: unit.bathrooms,
              baseRent: unit.baseRent,
            };

            console.log(
              `Creating unit ${index + 1}/${
                data.units.length
              } for property ${propertyId}:`,
              unitData
            );

            try {
              const unitResponse = await unitService.create(
                propertyId,
                unitData
              );
              console.log(
                `Unit ${index + 1} created successfully:`,
                unitResponse
              );
              createdUnits.push(unitResponse);
            } catch (unitError: any) {
              console.error(`Error creating unit ${index + 1}:`, unitError);
              toast.error(
                `Lỗi khi tạo phòng ${index + 1}: ${
                  unitError?.response?.data?.message ||
                  unitError?.message ||
                  "Unknown error"
                }`
              );
              // Tiếp tục tạo các unit khác
            }
          }

          console.log(
            `Successfully created ${createdUnits.length}/${data.units.length} units`
          );

          // Invalidate units queries để refresh danh sách
          queryClient.invalidateQueries({
            queryKey: ["units", propertyId],
          });
          queryClient.invalidateQueries({
            queryKey: ["units"],
          });
          queryClient.invalidateQueries({
            queryKey: ["properties"],
          });

          if (createdUnits.length === data.units.length) {
            toast.success(
              `Tạo địa điểm và ${data.units.length} phòng thành công!`
            );
          } else {
            toast.warning(
              `Tạo địa điểm thành công. Đã tạo ${createdUnits.length}/${data.units.length} phòng.`
            );
          }
        } catch (unitError: any) {
          console.error("Error in unit creation process:", unitError);
          toast.error(
            unitError?.response?.data?.message ||
              "Tạo địa điểm thành công nhưng có lỗi khi tạo phòng. Vui lòng thử lại."
          );
          toast.success("Địa điểm đã được tạo thành công");
        } finally {
          setIsCreatingUnit(false);
        }
      } else {
        console.log("No units to create. Units data:", data.units);
        console.log("Units is array:", Array.isArray(data.units));
        console.log("Units length:", data.units?.length);
        toast.success("Tạo địa điểm thành công!");
      }

      handleGoBack();
    } catch (error: any) {
      console.error("Error creating property:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi tạo địa điểm";
      toast.error(errorMessage);
      setIsCreatingUnit(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="mx-auto space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex">
          <Button
            type="button"
            className="hover:bg-transparent dark:hover:bg-transparent hover:text-muted-foreground cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Thêm địa điểm cho thuê
            </h1>
            <p className="text-muted-foreground mt-2">
              Nhập thông tin cơ bản về bất động sản của bạn
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Property Name */}
          <Card>
            <CardHeader>
              <CardTitle>Tên Địa Điểm</CardTitle>
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
              {/* AddressSelector - không cần pass control nếu nó dùng useFormContext */}
              <AddressSelector />
            </CardContent>
          </Card>

          {/* Unit Information - Optional */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Thông Tin Phòng (Tùy chọn)</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      code: "",
                      areaSqM: 20,
                      bedrooms: 1,
                      bathrooms: 1,
                      baseRent: 5000000,
                    })
                  }
                  disabled={createPropertyMutation.isPending || isCreatingUnit}
                >
                  <Plus className="size-4 mr-1" />
                  Thêm phòng
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có phòng nào. Nhấn "Thêm phòng" để thêm phòng cho địa
                  điểm này.
                </p>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 space-y-4 bg-muted/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Phòng {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={
                          createPropertyMutation.isPending || isCreatingUnit
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Mã phòng */}
                      <FormField
                        control={form.control}
                        name={`units.${index}.code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mã phòng</FormLabel>
                            <FormControl>
                              <input
                                {...field}
                                placeholder="VD: A101"
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Diện tích */}
                      <FormField
                        control={form.control}
                        name={`units.${index}.areaSqM`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Diện tích (m²)</FormLabel>
                            <FormControl>
                              <input
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                value={field.value || ""}
                                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Số phòng ngủ */}
                      <FormField
                        control={form.control}
                        name={`units.${index}.bedrooms`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số phòng ngủ</FormLabel>
                            <FormControl>
                              <input
                                type="number"
                                {...field}
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

                      {/* Số phòng tắm */}
                      <FormField
                        control={form.control}
                        name={`units.${index}.bathrooms`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số phòng tắm</FormLabel>
                            <FormControl>
                              <input
                                type="number"
                                {...field}
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

                      {/* Giá thuê */}
                      <FormField
                        control={form.control}
                        name={`units.${index}.baseRent`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Giá thuê (VNĐ)</FormLabel>
                            <FormControl>
                              <input
                                type="number"
                                {...field}
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
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* MapPicker - không cần pass control nữa vì đã dùng useFormContext */}
          <MapPicker />

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              disabled={createPropertyMutation.isPending || isCreatingUnit}
            >
              {createPropertyMutation.isPending || isCreatingUnit
                ? "Đang xử lý..."
                : "Thêm Địa Điểm"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 bg-transparent"
              onClick={() => navigate(-1)}
            >
              Hủy
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
