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
import { useProperty } from "@/hooks/useProperties";
import { useToast } from "@/hooks/useToast";
import { useUnit } from "@/hooks/useUnit";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as z from "zod";

// Schema for unit
const UnitSchema = z.object({
  code: z.string().min(1, "Mã phòng là bắt buộc"),
  areaSqM: z.number().min(0.1, "Diện tích phải lớn hơn 0"),
  bedrooms: z.number().int().min(0, "Số phòng ngủ phải >= 0"),
  bathrooms: z.number().int().min(0, "Số phòng tắm phải >= 0"),
  baseRent: z.number().min(0, "Giá thuê phải lớn hơn 0"),
});

type UnitFormData = z.infer<typeof UnitSchema>;

export default function UpdateUnit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id, unitid } = useParams();
  console.log({ id }, { unitid });

  const toast = useToast();
  // Hooks
  const { data: property, isLoading: isLoadingProperty } = useProperty(
    id || ""
  );
  const { data: unitsRes, isLoading: isLoadingUnits } = useUnit(unitid || "");
  // const updateUnitMutation = useUpdateUnit(id || "", unitid || "");

  const form = useForm<UnitFormData>({
    resolver: zodResolver(UnitSchema),
    defaultValues: {
      code: "",
      areaSqM: 0,
      bedrooms: 0,
      bathrooms: 0,
      baseRent: 0,
    },
  });

  // Populate form với dữ liệu unit khi load xong
  useEffect(() => {
    if (unitsRes?.content) {
      const unit = unitsRes.content;
      console.log({ unit });
      form.reset({
        code: unit.code || "",
        areaSqM: unit.areaSqM || 0,
        bedrooms: unit.bedrooms || 0,
        bathrooms: unit.bathrooms || 0,
        baseRent: unit.baseRent || 0,
      });
    }
  }, [unitid, form, unitsRes?.content]);

  const onSubmit = async (data: UnitFormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Cập nhật thành công");
      setIsSubmitting(false);
    }, 1500);
    // updateUnitMutation.mutate(data, {
    //   onSuccess: () => {
    //     toast.success("Cập nhật phòng thành công!");
    //     navigate(-1);
    //   },
    //   onError: (error) => {
    //     console.error("Error updating unit:", error);
    //     toast.error("Lỗi khi cập nhật phòng!");
    //   },
    //   onSettled: () => {
    //     setIsSubmitting(false);
    //   },
    // });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Show loading khi đang load property hoặc unit
  if (isLoadingProperty || isLoadingUnits) {
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
    <div className="mx-auto space-y-4">
      {/* Header */}
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
              Cập Nhật Phòng {unitsRes?.data?.code}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {property?.data?.name} - Chỉnh sửa thông tin phòng/căn hộ
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Mã phòng */}
          <Card>
            <CardHeader>
              <CardTitle>Mã Phòng</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mã <span className="text-red-500">*</span>
                    </FormLabel>
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
            </CardContent>
          </Card>

          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Chi Tiết</CardTitle>
            </CardHeader>

            <CardContent>
              {/* Grid 2 cột */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Diện tích */}
                <FormField
                  control={form.control}
                  name="areaSqM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Diện tích (m²) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="VD: 35.5"
                          {...field}
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

                {/* Phòng ngủ */}
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Số phòng ngủ <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          min="0"
                          placeholder="VD: 2"
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

                {/* Phòng tắm */}
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Số phòng tắm <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          min="0"
                          placeholder="VD: 1"
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
                  name="baseRent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Giá thuê (₫) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          min="0"
                          placeholder="VD: 5000000"
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
            </CardContent>
          </Card>

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
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1 bg-transparent"
              onClick={handleGoBack}
            >
              Hủy
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
