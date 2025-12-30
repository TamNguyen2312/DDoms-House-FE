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
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function UpdateContract() {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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

  // Fetch property data on mount
  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        console.log("[v0] Fetching property with id:", id);
        // TODO: Add API call to fetch property
        // const response = await fetch(`/api/properties/${id}`);
        // const data = await response.json();

        // Mock data for demonstration
        const mockData: PropertyCreate = {
          name: "Phòng 201",
          addressLine: "123 Đường Nguyễn Huệ",
          ward: "Phường Bến Nghé",
          city: "Quận 1, TP. Hồ Chí Minh",
          latitude: 10.796427317494299,
          longitude: 106.72639460578407,
        };

        // Set form values with fetched data
        form.reset(mockData);
      } catch (error) {
        console.error("[v0] Error fetching property:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [id, form]);

  const onSubmit: SubmitHandler<PropertyCreate> = async (data) => {
    setIsSubmitting(true);
    try {
      console.log("[v0] Updating property with data:", data);
      // TODO: Add API call to update property
      // const response = await fetch(`/api/properties/${id}`, {
      //   method: 'PUT',
      //   body: JSON.stringify(data),
      // })

      // Navigate back after successful update
      // navigate(-1);
    } catch (error) {
      console.error("[v0] Error updating property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
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
      {id}
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
              {isSubmitting ? "Đang xử lý..." : "Cập Nhật"}
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
