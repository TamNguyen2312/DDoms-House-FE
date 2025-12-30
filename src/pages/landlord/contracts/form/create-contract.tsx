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
import { PropertyCreateSchema, type PropertyCreate } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

export default function CreateContract() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const onSubmit = async (data: PropertyCreate) => {
    setIsSubmitting(true);
    try {
      console.log("[v0] Creating property with data:", data);
      // TODO: Add API call to create property
      // const response = await fetch('/api/properties', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      // })
    } catch (error) {
      console.error("[v0] Error creating property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleGoBack = () => {
    navigate(-1);
  };
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
              Thêm Phòng/Căn Hộ Mới
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
              {isSubmitting ? "Đang xử lý..." : "Thêm Phòng"}
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
    </div>
  );
}
