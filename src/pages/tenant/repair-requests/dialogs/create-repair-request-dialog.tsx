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
import { useUploadFiles } from "@/hooks/useUpload";
import { useTenantRentedUnits } from "@/hooks/useRentedUnits";
import { CreateRepairRequestSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Calendar,
  Loader2,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { CreateRepairRequest } from "@/schemas/repair-request.schema";

interface CreateRepairRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    unitId: number;
    title: string;
    description: string;
    occurredAt: string;
    fileIds?: number[];
  }) => void;
  isPending?: boolean;
  defaultUnitId?: number;
}

export function CreateRepairRequestDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  defaultUnitId,
}: CreateRepairRequestDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(
    new Map()
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Maximum total file size: 5MB
  const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  
  // Calculate total size of uploaded files
  const totalFileSize = uploadedFiles.reduce((total, file) => total + file.size, 0);
  const totalFileSizeMB = (totalFileSize / (1024 * 1024)).toFixed(2);

  // Fetch tenant rented units
  const { data: rentedUnitsData, isLoading: isLoadingUnits } =
    useTenantRentedUnits({
      page: 0,
      size: 100,
    });

  const rentedUnits = rentedUnitsData?.content || [];

  const { mutate: uploadFiles } = useUploadFiles();

  const form = useForm<CreateRepairRequest>({
    resolver: zodResolver(CreateRepairRequestSchema),
    defaultValues: {
      unitId: defaultUnitId || 0,
      title: "",
      description: "",
      occurredAt: "",
      fileIds: [],
    },
  });

  // Update form when defaultUnitId changes
  useEffect(() => {
    if (defaultUnitId && open) {
      form.setValue("unitId", defaultUnitId);
    }
  }, [defaultUnitId, open, form]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file types (images and documents)
      const validFiles = files.filter((file) => {
        const isValidType =
          file.type.startsWith("image/") ||
          file.type === "application/pdf" ||
          file.type.includes("document");
        if (!isValidType) {
          toast.error(`${file.name} không phải là file hình ảnh hoặc PDF`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Calculate total size if we add these files
      const newFilesTotalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
      const currentTotalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
      const newTotalSize = currentTotalSize + newFilesTotalSize;

      // Check if total size exceeds limit
      if (newTotalSize > MAX_TOTAL_SIZE) {
        toast.error(
          `Tổng dung lượng file không được vượt quá 5MB. Hiện tại: ${totalFileSizeMB}MB, thêm ${(newFilesTotalSize / (1024 * 1024)).toFixed(2)}MB sẽ vượt quá giới hạn.`
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Add valid files
      setUploadedFiles((prev) => [...prev, ...validFiles]);
      toast.success(`Đã thêm ${validFiles.length} file(s)`);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (index: number) => {
    const file = uploadedFiles[index];
    const url = previewUrls.get(file.name);
    if (url) {
      URL.revokeObjectURL(url);
    }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const newUrls = new Map(prev);
      newUrls.delete(file.name);
      return newUrls;
    });
  };

  const handleSubmit = async (data: CreateRepairRequest) => {
    if (uploadedFiles.length > 0) {
      setIsUploading(true);
      uploadFiles(
        {
          files: uploadedFiles,
          options: {
            module: "DOCUMENT",
            tags: ["repair-request"],
          },
        },
        {
          onSuccess: (responses) => {
            const uploadedFileIds = responses
              .filter((r) => r.success && r.data?.fileId)
              .map((r) => r.data!.fileId);

            onSubmit({
              unitId: data.unitId,
              title: data.title,
              description: data.description,
              occurredAt: data.occurredAt,
              fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
            });
            setIsUploading(false);
          },
          onError: () => {
            setIsUploading(false);
          },
        }
      );
    } else {
      onSubmit({
        unitId: data.unitId,
        title: data.title,
        description: data.description,
        occurredAt: data.occurredAt,
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setUploadedFiles([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls(new Map());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="size-5 text-primary" />
            Tạo yêu cầu sửa chữa
          </DialogTitle>
          <DialogDescription>
            Gửi yêu cầu sửa chữa cho chủ nhà với thông tin chi tiết
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chọn phòng *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ""}
                    disabled={isLoadingUnits || rentedUnits.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn phòng đã thuê" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingUnits ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="size-4 animate-spin mr-2" />
                          <span className="text-sm text-muted-foreground">
                            Đang tải danh sách phòng...
                          </span>
                        </div>
                      ) : rentedUnits.length === 0 ? (
                        <div className="py-4 text-center text-sm text-muted-foreground">
                          Bạn chưa có phòng nào đã thuê
                        </div>
                      ) : (
                        rentedUnits.map((unit) => (
                          <SelectItem
                            key={unit.unitId}
                            value={String(unit.unitId)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {unit.unitCode} - {unit.propertyName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {unit.addressLine}, {unit.ward}
                                {unit.district && `, ${unit.district}`},{" "}
                                {unit.city}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: Điều hòa hỏng, Bồn cầu rò nước..."
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
                  <FormLabel>Mô tả chi tiết *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Mô tả chi tiết vấn đề cần sửa chữa..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occurredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian xảy ra *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={
                        field.value
                          ? new Date(field.value)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          const date = new Date(value);
                          field.onChange(date.toISOString());
                        } else {
                          field.onChange("");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Hình ảnh/Tài liệu (tùy chọn)</FormLabel>
                {uploadedFiles.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Tổng dung lượng: {totalFileSizeMB}MB / 5MB
                  </span>
                )}
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Click để chọn file hoặc kéo thả vào đây
                  </span>
                  <span className="text-xs text-gray-500">
                    Hỗ trợ: JPG, PNG, PDF (tổng dung lượng tối đa 5MB)
                  </span>
                </label>
              </div>

              {/* Preview uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                  {uploadedFiles.map((file, index) => {
                    const previewUrl = previewUrls.get(file.name);
                    return (
                      <div
                        key={index}
                        className="relative border rounded-lg overflow-hidden"
                      >
                        {file.type.startsWith("image/") && previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-gray-100">
                            <span className="text-xs text-gray-600">
                              {file.name}
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending || isUploading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={
                  isPending ||
                  isUploading ||
                  rentedUnits.length === 0 ||
                  isLoadingUnits
                }
              >
                {isPending || isUploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {isUploading ? "Đang upload..." : "Đang gửi..."}
                  </>
                ) : (
                  <>
                    <Wrench className="mr-2 size-4" />
                    Gửi yêu cầu
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

