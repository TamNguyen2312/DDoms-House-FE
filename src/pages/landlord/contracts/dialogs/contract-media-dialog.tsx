import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUploadFiles } from "@/hooks/useUpload";
import { uploadService } from "@/services/api/upload.service";
import { getBestImageUrl, handleImageError } from "@/utils/image-handler";
import type { ContractMediaItem } from "@/types/contract.types";
import { Download, Eye, FileText, Image, Loader, Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface ContractMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: number;
  mediaItems: ContractMediaItem[];
  isLoading?: boolean;
  onAddMedia: (fileId: number) => void;
  onRemoveMedia: (mediaId: number) => void;
  isAddingMedia?: boolean;
  isRemovingMedia?: boolean;
  title?: string;
  description?: string;
}

export function ContractMediaDialog({
  open,
  onOpenChange,
  contractId,
  mediaItems = [],
  isLoading = false,
  onAddMedia,
  onRemoveMedia,
  isAddingMedia = false,
  isRemovingMedia = false,
  title = "Quản lý Media",
  description = "Thêm hoặc xóa file media cho hợp đồng",
}: ContractMediaDialogProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = React.useState<Map<string, string>>(new Map());
  const [previewImage, setPreviewImage] = React.useState<{
    url: string;
    fileName: string;
    mimeType?: string;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { mutate: uploadFiles, isPending: isUploading } = useUploadFiles();

  // Reset when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSelectedFiles([]);
      setPreviewUrls((prevUrls) => {
        // Revoke all preview URLs before clearing
        prevUrls.forEach((url) => URL.revokeObjectURL(url));
        return new Map();
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  // Generate preview URLs for all selected files
  React.useEffect(() => {
    setPreviewUrls((prevUrls) => {
      const newUrls = new Map<string, string>();
      const currentFileNames = new Set(selectedFiles.map((f) => f.name));

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
      selectedFiles.forEach((file) => {
        if (!newUrls.has(file.name)) {
          const url = URL.createObjectURL(file);
          newUrls.set(file.name, url);
        }
      });

      return newUrls;
    });
  }, [selectedFiles]);

  // Cleanup all preview URLs on unmount
  React.useEffect(() => {
    return () => {
      setPreviewUrls((prevUrls) => {
        prevUrls.forEach((url) => URL.revokeObjectURL(url));
        return new Map();
      });
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const removeSelectedFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName));
    // URL cleanup will happen in useEffect when selectedFiles changes
  };

  const handleUploadAndAdd = () => {
    if (selectedFiles.length === 0) return;

    uploadFiles(
      {
        files: selectedFiles,
        options: {
          module: "CONTRACT_MEDIA",
          tags: ["contract"],
          metadata: {
            contractId: contractId.toString(),
          },
        },
      },
      {
        onSuccess: (responses) => {
          // Add each successfully uploaded file to media
          responses.forEach((response) => {
            if (response.success && response.data?.fileId) {
              onAddMedia(response.data.fileId);
            }
          });

          // Clear selected files after upload completes
          const filesToClear = [...selectedFiles];
          setSelectedFiles([]);
          // Revoke all preview URLs
          filesToClear.forEach((file) => {
            const url = previewUrls.get(file.name);
            if (url) {
              URL.revokeObjectURL(url);
            }
          });
          setPreviewUrls(new Map());
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        onError: () => {
          // Keep files selected on error so user can retry
          // Or clear them - we'll clear for now
          const filesToClear = [...selectedFiles];
          setSelectedFiles([]);
          filesToClear.forEach((file) => {
            const url = previewUrls.get(file.name);
            if (url) {
              URL.revokeObjectURL(url);
            }
          });
          setPreviewUrls(new Map());
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      }
    );
  };

  const isPending = isUploading || isAddingMedia;

  const isImage = (mimeType?: string) => {
    return mimeType?.startsWith("image/") ?? false;
  };

  const isPdf = (mimeType?: string) => {
    return mimeType === "application/pdf" || mimeType?.includes("pdf");
  };

  const handleViewImage = (item: ContractMediaItem) => {
    const fileUrl = item.fileUrl || item.filePath;
    if (fileUrl) {
      setPreviewImage({
        url: fileUrl,
        fileName: item.fileName || item.filePath?.split("/").pop() || `file-${item.fileId}`,
        mimeType: item.mimeType,
      });
    }
  };

  const handleDownloadFile = async (item: ContractMediaItem) => {
    // Sử dụng API download-url để lấy URL và download file
    // API: GET /api/files/{file_id}/download-url
    if (!item.fileId) {
      toast.error("Không tìm thấy ID file");
      return;
    }

    const fileName = item.fileName || item.filePath?.split("/").pop() || `file-${item.fileId}`;

    try {
      // Gọi API để lấy download URL
      const response = await uploadService.getDownloadUrl(item.fileId);
      const downloadUrl = response.data?.downloadUrl;

      if (!downloadUrl) {
        toast.error("Không thể lấy URL tải xuống");
        return;
      }

      // Fetch file về dưới dạng blob để tránh browser navigate đến URL Cloudinary
      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) {
          throw new Error("Failed to fetch file");
        }
      const blob = await fileResponse.blob();
      
      // Tạo blob URL và trigger download - không chuyển trang
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      
      // Clean up blob URL sau một khoảng thời gian
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
      }, 200);
      
      toast.success("Đang tải xuống file...");
    } catch (error) {
        console.error("Download error:", error);
        toast.error("Không thể tải xuống file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="size-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="text-sm font-semibold">Thêm file mới</h3>
            <div className="space-y-3">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                onChange={handleFileSelect}
                disabled={isPending}
                className="cursor-pointer"
              />

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Đã chọn {selectedFiles.length} file
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-3">
                    {selectedFiles.map((file) => {
                      const previewUrl = previewUrls.get(file.name);
                      return (
                        <div key={file.name} className="relative group">
                          {previewUrl && isImage(file.type) ? (
                            <img
                              src={previewUrl}
                              alt={file.name}
                              className="w-full h-24 object-cover rounded-lg border bg-muted"
                            />
                          ) : (
                            <div className="w-full h-24 flex flex-col items-center justify-center rounded-lg border bg-muted">
                              <FileText className="size-6 text-muted-foreground mb-1" />
                              <span className="text-[10px] text-muted-foreground text-center px-1 truncate w-full">
                                {file.name}
                              </span>
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeSelectedFile(file.name)}
                            disabled={isPending}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={handleUploadAndAdd}
                disabled={selectedFiles.length === 0 || isPending}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Loader className="mr-2 size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 size-4" />
                    Upload và thêm
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Media List */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              Danh sách media ({mediaItems.length})
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-primary" />
                <p className="ml-2 text-sm text-muted-foreground">
                  Đang tải...
                </p>
              </div>
            ) : mediaItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="size-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chưa có media nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative group border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
                  >
                    {(item.fileUrl || item.filePath) &&
                    (isImage(item.mimeType) || isPdf(item.mimeType)) ? (
                      <div className="relative">
                        {isImage(item.mimeType) ? (
                        <img
                          src={getBestImageUrl(
                            item.thumbnailUrl,
                            item.filePath,
                            item.fileUrl,
                            true
                          ) || item.fileUrl || item.filePath}
                          alt={item.fileName || `file-${item.fileId}`}
                          className="w-full h-32 object-cover cursor-pointer"
                          onClick={() => handleViewImage(item)}
                          onError={(e) => {
                            const fallbackUrl = item.thumbnailUrl && item.filePath 
                              ? (e.currentTarget.src === item.thumbnailUrl ? item.filePath : item.thumbnailUrl)
                              : null;
                            handleImageError(e, fallbackUrl);
                          }}
                        />
                        ) : (
                          <div
                            className="w-full h-32 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/20 cursor-pointer"
                            onClick={() => handleViewImage(item)}
                          >
                            <FileText className="size-10 text-red-600 dark:text-red-400 mb-1" />
                            <span className="text-xs text-red-700 dark:text-red-300 font-medium">
                              PDF
                            </span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => handleViewImage(item)}
                          title={isPdf(item.mimeType) ? "Xem PDF" : "Xem ảnh"}
                        >
                          <Eye className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full h-32 flex flex-col items-center justify-center bg-muted">
                        <FileText className="size-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground text-center px-2 truncate w-full">
                          {item.fileName}
                        </span>
                      </div>
                    )}
                    <div className="p-2 space-y-1">
                      <p className="text-xs font-medium truncate">
                        {item.fileName || item.filePath?.split("/").pop() || `file-${item.fileId}`}
                      </p>
                      {(item.fileSize || item.sizeBytes) && (
                        <p className="text-xs text-muted-foreground">
                          {((item.fileSize || item.sizeBytes || 0) / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isImage(item.mimeType) && !isPdf(item.mimeType) && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="h-7 w-7 bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => handleDownloadFile(item)}
                          title="Tải xuống"
                        >
                          <Download className="size-3.5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onRemoveMedia(item.id)}
                        disabled={isRemovingMedia}
                        title="Xóa"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* File Preview Dialog (Image & PDF) */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="!max-w-[100vw] !w-screen !h-screen !max-h-screen !p-0 !m-0 !rounded-none flex flex-col overflow-hidden">
            <DialogHeader className="px-6 pt-4 pb-2 flex-shrink-0 border-b">
              <DialogTitle className="text-base font-medium truncate">
                {previewImage.fileName}
              </DialogTitle>
            </DialogHeader>
            <div className="relative flex items-center justify-center flex-1 min-h-0 bg-black/5 overflow-hidden">
              {isPdf(previewImage.mimeType) ? (
                <iframe
                  src={previewImage.url}
                  className="w-full h-full border-0"
                  style={{ width: '100%', height: '100%' }}
                  title={previewImage.fileName}
                />
              ) : (
              <img
                src={previewImage.url}
                alt={previewImage.fileName}
                className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
              )}
            </div>
            <DialogFooter className="px-6 py-4 flex-shrink-0 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewImage(null)}
              >
                Đóng
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (previewImage.url) {
                    window.open(previewImage.url, "_blank");
                  }
                }}
              >
                <Download className="mr-2 size-4" />
                Tải xuống
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

