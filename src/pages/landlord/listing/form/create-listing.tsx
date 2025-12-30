import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCreateListingWithMedia, useMyListings } from "@/hooks/useListing";
import { useProperties } from "@/hooks/useProperties";
import { useLandlordRentedUnits } from "@/hooks/useRentedUnits";
import { useToast } from "@/hooks/useToast";
import { useUnits } from "@/hooks/useUnit";
import { useUploadFiles } from "@/hooks/useUpload";
import {
  ListingCreateSchema,
  type ListingCreate,
} from "@/schemas/listing.schema";
import type { IProperty } from "@/services/api/property.service";
import type { IUnit } from "@/services/api/unit.service";
import { formatVietnamMoney } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Home,
  Image,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// Compact info display components
interface PropertyInfoDisplayProps {
  property: IProperty & { documents_verified?: boolean };
}

const PropertyInfoDisplay = ({ property }: PropertyInfoDisplayProps) => {
  if (!property) return null;

  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg border bg-blue-50/50 dark:bg-blue-950/10">
      <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-1 mt-0.5 shrink-0">
        <Building2 className="size-3.5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold">Thông tin dự án</p>
          {property.documents_verified && (
            <span className="text-[10px] text-green-700 dark:text-green-400 flex items-center gap-0.5">
              <CheckCircle className="size-2.5" />
              Đã xác minh
            </span>
          )}
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-medium truncate">{property.name}</p>
          <p className="text-muted-foreground truncate">
            {property.addressLine}
          </p>
          <p className="text-muted-foreground">
            {property.ward}, {property.district}, {property.city}
          </p>
        </div>
      </div>
    </div>
  );
};

interface UnitInfoDisplayProps {
  unit: IUnit;
}

const UnitInfoDisplay = ({ unit }: UnitInfoDisplayProps) => {
  if (!unit) return null;

  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg border bg-primary/5 border-primary/20">
      <div className="rounded-full bg-primary/10 p-1 mt-0.5 shrink-0">
        <Home className="size-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-xs font-semibold text-primary">
          Thông tin căn hộ/phòng
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="text-muted-foreground">Mã căn:</span>{" "}
            <span className="font-medium">{unit.code}</span>
          </div>
          {unit.areaSqM && (
            <div>
              <span className="text-muted-foreground">Diện tích:</span>{" "}
              <span className="font-medium">{unit.areaSqM}m²</span>
            </div>
          )}
          {unit.bedrooms && (
            <div>
              <span className="text-muted-foreground">Phòng ngủ:</span>{" "}
              <span className="font-medium">{unit.bedrooms}</span>
            </div>
          )}
          {unit.bathrooms && (
            <div>
              <span className="text-muted-foreground">Phòng tắm:</span>{" "}
              <span className="font-medium">{unit.bathrooms}</span>
            </div>
          )}
          {unit.baseRent && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Giá ban đầu:</span>{" "}
              <span className="font-medium text-amber-700 dark:text-amber-400">
                {formatVietnamMoney(unit.baseRent)}/tháng
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CreateListingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(
    new Map()
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ListingCreate>({
    resolver: zodResolver(ListingCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      listedPrice: undefined,
    },
  });

  // Use separate state for unitId and propertyId since they're not in the schema
  const [selectedUnitId, setSelectedUnitId] = useState<number | undefined>(
    undefined
  );
  const [selectedPropertyId, setSelectedPropertyId] = useState<
    string | undefined
  >(undefined);

  // Fetch properties
  const { data: propertiesData, isLoading: isLoadingProperties } =
    useProperties({});
  const properties = propertiesData?.content || [];

  // Fetch units - only when property is selected
  const { data: unitsResponse, isLoading: isLoadingUnits } = useUnits(
    selectedPropertyId ?? ""
  );
  const units = unitsResponse?.content || [];

  // Check if unit has existing listings
  const { data: listingsData } = useMyListings({
    page: 0,
    size: 100,
    sort: "createdAt",
    direction: "DESC",
  });
  const existingListings = listingsData?.content || [];
  const unitListings = selectedUnitId
    ? existingListings.filter(
        (listing: { unit?: { id?: number } }) =>
          listing.unit?.id === selectedUnitId
      )
    : [];

  // Check if unit is currently rented
  const { data: rentedUnitsData } = useLandlordRentedUnits({
    page: 0,
    size: 100,
    sort: "startDate",
    direction: "DESC",
  });
  const rentedUnits = rentedUnitsData?.content || [];
  const rentedUnit = selectedUnitId
    ? rentedUnits.find(
        (unit: { unitId: number; startDate?: string; endDate?: string }) =>
          unit.unitId === selectedUnitId
      )
    : undefined;
  const isUnitRented = !!rentedUnit;

  const {
    mutate: createListingWithMedia,
    isPending: isCreatingListingWithMedia,
  } = useCreateListingWithMedia();
  const { mutate: uploadFiles } = useUploadFiles();

  const isPending = isCreatingListingWithMedia || isUploading;

  // Find selected items
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const selectedUnit = units.find((u) => u.id === selectedUnitId);

  // Handle property change
  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedUnitId(undefined);
  };

  // Generate preview URLs for uploaded files
  useEffect(() => {
    setPreviewUrls((prevUrls) => {
      const newUrls = new Map<string, string>();
      const currentFileNames = new Set(uploadedFiles.map((f) => f.name));

      // Revoke URLs for files that are no longer selected
      prevUrls.forEach((url, fileName) => {
        if (!currentFileNames.has(fileName)) {
          URL.revokeObjectURL(url);
        } else {
          // Keep existing URL for files that are still selected
          newUrls.set(fileName, url);
        }
      });

      // Create new URLs only for files that don't have one yet
      uploadedFiles.forEach((file) => {
        if (!newUrls.has(file.name)) {
          const url = URL.createObjectURL(file);
          newUrls.set(file.name, url);
        }
      });

      return newUrls;
    });
  }, [uploadedFiles]);

  // Cleanup all preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file types
      const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} không phải là file hình ảnh`);
          return false;
        }
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} vượt quá kích thước tối đa 10MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setUploadedFiles((prev) => [...prev, ...validFiles]);
      }

      // Reset input to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit handler
  const onSubmit = async (data: ListingCreate) => {
    if (!selectedUnit?.id) {
      toast.error("Vui lòng chọn căn hộ/phòng");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất một hình ảnh");
      return;
    }

    setIsUploading(true);
    uploadFiles(
      {
        files: uploadedFiles,
        options: {
          module: "LISTING_MEDIA",
          tags: ["listing"],
        },
      },
      {
        onSuccess: (responses) => {
          const uploadedFileIds = responses
            .filter((r) => r.success && r.data?.fileId)
            .map((r) => r.data!.fileId);

          if (uploadedFileIds.length === 0) {
            toast.error("Upload ảnh thất bại. Vui lòng thử lại.");
            setIsUploading(false);
            return;
          }

          // Create listing with media
          if (!selectedUnit?.id) {
            toast.error("Vui lòng chọn căn hộ/phòng");
            setIsUploading(false);
            return;
          }

          createListingWithMedia(
            {
              unitId: selectedUnit.id.toString(),
              data: {
                title: data.title,
                description: data.description || "",
                listedPrice: data.listedPrice,
                fileIds: uploadedFileIds,
              },
            },
            {
              onSuccess: () => {
                toast.success("Tạo bài đăng thành công");
                navigate(-1);
              },
              onError: (error: unknown) => {
                const axiosError = error as {
                  response?: {
                    status?: number;
                    statusText?: string;
                    data?: { message?: string };
                  };
                  config?: { method?: string; url?: string; baseURL?: string };
                  message?: string;
                };
                const status = axiosError?.response?.status;
                const method =
                  axiosError?.config?.method?.toUpperCase() || "UNKNOWN";
                const url =
                  axiosError?.config?.url ||
                  axiosError?.config?.baseURL ||
                  "UNKNOWN URL";
                const fullUrl = axiosError?.config?.baseURL
                  ? `${axiosError.config.baseURL}${url}`
                  : url;
                const errorMessage =
                  axiosError?.response?.data?.message ||
                  axiosError?.message ||
                  "Có lỗi xảy ra vui lòng thử lại sau";

                // Log detailed error information
                console.error("❌ Create listing API error:", {
                  method,
                  url: fullUrl,
                  status,
                  statusText: axiosError?.response?.statusText,
                  message: errorMessage,
                  error: error,
                });

                // Check if it's a subscription limit error
                if (
                  status === 403 &&
                  errorMessage.includes("MAX_ACTIVE_LISTINGS")
                ) {
                  toast.error(
                    "Bạn đã đạt giới hạn số lượng bài đăng cho phép. Vui lòng nâng cấp gói dịch vụ để đăng thêm bài."
                  );
                  // Optionally redirect to subscription page after a delay
                  setTimeout(() => {
                    navigate("/landlord/goi-dich-vu");
                  }, 3000);
                } else {
                  toast.error(`${errorMessage} (${method} ${url} - ${status})`);
                }
                setIsUploading(false);
              },
            }
          );
        },
        onError: () => {
          toast.error("Upload ảnh thất bại. Vui lòng thử lại.");
          setIsUploading(false);
        },
      }
    );
  };

  // Format price display
  const formatPrice = (value: number) => {
    if (!value) return "";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  const isFormValid =
    selectedPropertyId &&
    selectedUnitId &&
    uploadedFiles.length > 0 &&
    !isPending;

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
            disabled={isPending}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Đăng Tin Cho Thuê
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Tạo tin đăng cho thuê phòng/căn hộ của bạn
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Single Card with all content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <Image className="size-4 text-primary" />
                </div>
                Thông tin bài đăng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Dự án/Tòa nhà <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedPropertyId?.toString()}
                  onValueChange={handlePropertyChange}
                  disabled={isLoadingProperties || isPending}
                >
                  <SelectTrigger className="w-full">
                    {selectedProperty ? (
                      <div className="flex flex-col items-start text-left w-full">
                        <span className="font-medium truncate max-w-full">
                          {selectedProperty.name}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {selectedProperty.addressLine},{" "}
                          {selectedProperty.ward}
                        </span>
                      </div>
                    ) : (
                      <SelectValue
                        placeholder={
                          isLoadingProperties
                            ? "Đang tải..."
                            : "Chọn dự án/tòa nhà"
                        }
                      />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {properties.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Không có dự án nào
                      </div>
                    ) : (
                      properties.map((property) => (
                        <SelectItem
                          key={property.id}
                          value={property.id.toString()}
                        >
                          <div className="flex flex-col py-1">
                            <span className="font-medium">{property.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {property.addressLine}, {property.ward},{" "}
                              {property.district}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Căn hộ/Phòng <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={(value) => {
                    const unitId = Number(value);
                    setSelectedUnitId(unitId);
                  }}
                  value={selectedUnitId?.toString()}
                  disabled={!selectedPropertyId || isLoadingUnits || isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        !selectedPropertyId
                          ? "Vui lòng chọn dự án trước"
                          : isLoadingUnits
                          ? "Đang tải..."
                          : "Chọn căn hộ/phòng"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {units.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        {isLoadingUnits
                          ? "Đang tải..."
                          : "Không có căn hộ/phòng nào"}
                      </div>
                    ) : (
                      units.map((unit) => (
                        <SelectItem
                          key={unit.id}
                          value={unit.id?.toString() || ""}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              Phòng {unit.code}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Display selected property and unit info - Compact */}
              {selectedProperty && (
                <PropertyInfoDisplay property={selectedProperty} />
              )}
              {selectedUnit && <UnitInfoDisplay unit={selectedUnit} />}

              {/* Warning alerts for unit status */}
              {selectedUnitId && (
                <>
                  {isUnitRented && rentedUnit && (
                    <Alert
                      variant="destructive"
                      className="border-2 border-red-500 shadow-lg"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Cảnh báo</AlertTitle>
                      <AlertDescription className="space-y-1">
                        <p>
                          Phòng này đang được cho thuê. Bạn có chắc chắn muốn
                          tạo bài đăng cho phòng đang có hợp đồng thuê không?
                        </p>
                        {rentedUnit.startDate && rentedUnit.endDate && (
                          <p className="text-sm font-medium mt-2">
                            Thời gian hợp đồng:{" "}
                            {new Date(rentedUnit.startDate).toLocaleDateString(
                              "vi-VN"
                            )}{" "}
                            -{" "}
                            {new Date(rentedUnit.endDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                  {unitListings.length > 0 && (
                    <Alert
                      variant="default"
                      className="border-2 border-yellow-500 shadow-lg bg-yellow-50 dark:bg-yellow-950/20"
                    >
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-yellow-800 dark:text-yellow-400">
                        Thông báo
                      </AlertTitle>
                      <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                        Phòng này đã có {unitListings.length} bài đăng. Bạn có
                        muốn tạo thêm bài đăng mới cho phòng này không?
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {(selectedProperty || selectedUnit) && <Separator />}

              {/* Listing Details */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tiêu đề <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="VD: Phòng trọ cao cấp gần Đại học Bách Khoa"
                        disabled={isPending}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {field.value?.length || 0}/200 ký tự
                    </FormDescription>
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
                      <RichTextEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Mô tả chi tiết về phòng/căn hộ, tiện ích xung quanh..."
                        disabled={isPending}
                        maxLength={2000}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Sử dụng các công cụ định dạng để làm nổi bật thông tin
                      quan trọng
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Giá cho thuê (VNĐ/tháng){" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="5000000"
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : parseFloat(value) || 0
                          );
                        }}
                        value={field.value ?? ""}
                        disabled={isPending}
                        min={1}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {field.value && field.value > 0 && (
                        <span className="font-medium">
                          ≈ {formatPrice(field.value)} VNĐ/tháng
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Image Upload Section */}
              <div className="space-y-2">
                <FormLabel>
                  Hình ảnh <span className="text-red-500">*</span>
                </FormLabel>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={isPending}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload className="size-4" />
                      <span className="text-sm">Chọn hình ảnh</span>
                    </label>
                    {uploadedFiles.length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        Đã chọn {uploadedFiles.length} ảnh
                      </span>
                    )}
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="relative group"
                        >
                          <img
                            src={previewUrls.get(file.name) || ""}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                            onError={() => {
                              console.error(
                                "Failed to load image preview:",
                                file.name
                              );
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            disabled={isPending}
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <FormDescription className="text-xs">
                  Vui lòng chọn ít nhất một hình ảnh để đăng bài
                </FormDescription>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              className="flex-1"
              size="lg"
              disabled={!isFormValid}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Đang xử lý..." : "Đăng Tin"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => navigate(-1)}
              disabled={isPending}
            >
              Hủy
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
