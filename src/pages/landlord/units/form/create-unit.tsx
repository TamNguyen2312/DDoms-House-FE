import LoadingCard from "@/components/common/loading-card";
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
import { useCreateUnit } from "@/hooks/useUnit";
import type { IUnit } from "@/services/api/unit.service";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

// Schema phù hợp với API
const defaultValues = {
  code: "",
  areaSqM: 20,
  bedrooms: 1,
  bathrooms: 1,
  baseRent: 5000000,
};

export default function CreateUnit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const createUnitMutation = useCreateUnit(id || "");
  const { data: property, isLoading: isLoadingProperty } = useProperty(
    id || ""
  );
  const form = useForm({
    defaultValues,
  });

  const onSubmit = async (data: IUnit) => {
    setIsSubmitting(true);
    createUnitMutation.mutate(data, {
      onSuccess: () => {
        // Reset mã phòng về trống sau khi thêm thành công
        form.setValue("code", "");
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };
  if (isLoadingProperty) {
    return (
    <div>
      <LoadingCard />
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
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Thêm Phòng Con Mới | {property?.data.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Nhập thông tin theo schema của hệ thống
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormLabel>Mã</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        placeholder="VD: A101"
                        className="w-full px-4 py-2 border rounded-lg bg-background"
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
                      <FormLabel>Diện tích (m²)</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          step="0.1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                          className="w-full px-4 py-2 border rounded-lg bg-background"
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
                      <FormLabel>Số phòng ngủ</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          className="w-full px-4 py-2 border rounded-lg bg-background"
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
                      <FormLabel>Số phòng tắm</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          className="w-full px-4 py-2 border rounded-lg bg-background"
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
                      <FormLabel>Giá thuê (VNĐ)</FormLabel>
                      <FormControl>
                        <input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          className="w-full px-4 py-2 border rounded-lg bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Đang xử lý..." : "Thêm Phòng"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
