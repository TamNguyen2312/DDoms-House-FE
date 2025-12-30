import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { IProperty } from "@/lib/dbProperties";
import { ListingCreateSchema, type ListingCreate } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

type MediaItem = { id: string; url: string };

export default function UpdateListing() {
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUploadedImages, setNewUploadedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<MediaItem[]>([]);
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isLoadingListing, setIsLoadingListing] = useState(true);
  const navigate = useNavigate();

  const form = useForm<ListingCreate>({
    resolver: zodResolver(ListingCreateSchema),
    defaultValues: {
      property_id: "",
      title: "",
      description: "",
      listed_price: 0,
      is_public: false,
    },
  });

  // Fetch properties on mount
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoadingProperties(true);
      try {
        console.log("[v0] Fetching properties...");
        // TODO: Replace with actual API call
        // const response = await fetch('/api/properties');
        // const data = await response.json();

        // Mock data - using your structure
        const mockProperties: IProperty[] = [
          {
            id: "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
            name: "Chung cư Golden Star",
            address_line: "123 Nguyễn Văn Linh",
            ward: "Tân Phú",
            district: "Quận 7",
            city: "TP. Hồ Chí Minh",
            latitude: 10.7326,
            longitude: 106.7192,
            documents_verified: true,
            created_at: "2024-02-25T10:00:00Z",
            landlord: {
              id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
              email: "landlord.nguyen@gmail.com",
              phone: "+84912345678",
              display_name: "Nguyễn Văn Hùng",
              verified: true,
            },
          },
          {
            id: "p2b3c4d5-e6f7-8901-bcde-f12345678901",
            name: "Căn hộ Sunrise City",
            address_line: "456 Nguyễn Hữu Thọ",
            ward: "Tân Hưng",
            district: "Quận 7",
            city: "TP. Hồ Chí Minh",
            latitude: 10.7412,
            longitude: 106.7103,
            documents_verified: true,
            created_at: "2024-03-01T09:30:00Z",
            landlord: {
              id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
              display_name: "Nguyễn Văn Hùng",
              verified: true,
            },
          },
          {
            id: "p3c4d5e6-f7a8-9012-cdef-123456789012",
            name: "Nhà trọ An Phú",
            address_line: "789 Lê Văn Việt",
            ward: "Hiệp Phú",
            district: "Quận 9",
            city: "TP. Hồ Chí Minh",
            latitude: 10.8506,
            longitude: 106.7826,
            documents_verified: true,
            created_at: "2024-04-10T11:15:00Z",
            landlord: {
              id: "d4e5f6a7-b8c9-0123-def1-234567890123",
              display_name: "Lê Thị Mai",
              verified: true,
            },
          },
        ];

        setProperties(mockProperties);
      } catch (error) {
        console.error("[v0] Error fetching properties:", error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  // Fetch listing on mount
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        navigate("/landlord/listings");
        return;
      }
      setIsLoadingListing(true);
      try {
        console.log("[v0] Fetching listing:", id);
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/listings/${id}`);
        // const listing = await response.json();

        // Mock data
        const mockListing: ListingCreate & { media?: MediaItem[] } = {
          property_id: "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
          title: "Phòng trọ cao cấp gần Đại học Bách Khoa",
          description:
            "Phòng trọ sạch sẽ, thoáng mát, gần trường đại học. Tiện ích đầy đủ: wifi, máy lạnh, tủ lạnh...",
          listed_price: 3000000,
          is_public: true,
          media: [
            {
              id: "img1",
              url: "https://via.placeholder.com/300x200?text=Room+Image+1",
            },
            {
              id: "img2",
              url: "https://via.placeholder.com/300x200?text=Room+Image+2",
            },
          ],
        };

        setExistingImages(mockListing.media || []);
        form.reset({
          property_id: mockListing.property_id,
          title: mockListing.title,
          description: mockListing.description,
          listed_price: mockListing.listed_price,
          is_public: mockListing.is_public,
        });
      } catch (error) {
        console.error("[v0] Error fetching listing:", error);
      } finally {
        setIsLoadingListing(false);
      }
    };

    fetchListing();
  }, [id, form, navigate]);

  const selectedPropertyId = form.watch("property_id");
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewUploadedImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setNewUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imgId: string) => {
    setExistingImages((prev) => prev.filter((i) => i.id !== imgId));
  };

  const onSubmit: SubmitHandler<ListingCreate> = async (data) => {
    setIsSubmitting(true);
    try {
      console.log("[v0] Updating listing with data:", data);
      console.log("[v0] New uploaded images:", newUploadedImages);
      console.log(
        "[v0] Kept existing image IDs:",
        existingImages.map((i) => i.id)
      );

      // TODO: Upload new images first
      // const formData = new FormData();
      // newUploadedImages.forEach(file => formData.append('files', file));
      // const uploadResponse = await fetch('/api/files/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const { file_ids: new_file_ids } = await uploadResponse.json();

      // TODO: Update listing
      // const kept_media_ids = existingImages.map(i => i.id);
      // const removed_media_ids = /* track separately if needed */;
      // const response = await fetch(`/api/listings/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...data,
      //     media_file_ids_to_add: new_file_ids,
      //     media_file_ids_to_keep: kept_media_ids
      //   }),
      // });

      // Navigate to listing detail after success
      navigate(`/landlord/listings/${id}`);
    } catch (error) {
      console.error("[v0] Error updating listing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoadingListing) {
    return (
      <div className="mx-auto flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">
          Đang tải thông tin tin đăng...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          className="hover:bg-transparent dark:hover:bg-transparent hover:text-muted-foreground"
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Cập Nhật Tin Đăng
          </h1>
          <p className="text-muted-foreground mt-2">
            Chỉnh sửa thông tin tin đăng cho thuê phòng/căn hộ của bạn
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Property Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn Bất Động Sản</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="property_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Bất động sản <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoadingProperties}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              isLoadingProperties
                                ? "Đang tải..."
                                : "Chọn bất động sản"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {property.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {property.address_line}, {property.ward},{" "}
                                {property.district}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Chọn bất động sản bạn muốn đăng tin
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Info Display */}
              {selectedProperty && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Thông tin bất động sản</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Địa chỉ:</span>{" "}
                      {selectedProperty.address_line}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Khu vực:</span>{" "}
                      {selectedProperty.ward}, {selectedProperty.district},{" "}
                      {selectedProperty.city}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Xác minh:</span>{" "}
                      {selectedProperty.documents_verified ? (
                        <span className="text-green-600">✓ Đã xác minh</span>
                      ) : (
                        <span className="text-yellow-600">Chưa xác minh</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Listing Details */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Tin Đăng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tiêu đề <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        placeholder="VD: Phòng trọ cao cấp gần Đại học Bách Khoa"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Mô tả chi tiết về phòng/căn hộ, tiện ích xung quanh..."
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listed_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giá cho thuê (VNĐ/tháng){" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="number"
                        placeholder="5000000"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormDescription>
                      Nhập giá cho thuê hàng tháng
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Công khai tin đăng
                      </FormLabel>
                      <FormDescription>
                        Bật để hiển thị tin đăng cho tất cả người dùng
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Images Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Hình Ảnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Thêm hình ảnh mới
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Hỗ trợ JPG, PNG (Tối đa 10 ảnh)
                  </span>
                </label>
              </div>

              {(existingImages.length > 0 || newUploadedImages.length > 0) && (
                <>
                  <div className="text-sm font-medium text-foreground mb-2">
                    Hình ảnh hiện tại
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img) => (
                      <div key={`exist-${img.id}`} className="relative group">
                        <img
                          src={img.url}
                          alt="Existing image"
                          className="w-full h-32 object-cover rounded-lg"
                          onError={(e) => {
                            handleImageError(e, null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    {newUploadedImages.map((file, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
              {isSubmitting ? "Đang xử lý..." : "Cập Nhật"}
            </Button>
            <Link to={`/landlord/listings/${id}`}>
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
