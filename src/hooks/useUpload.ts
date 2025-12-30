import {
  uploadService,
  type UploadFileRequest,
  type UploadProgress,
} from "@/services/api/upload.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// -----------------------------
// Query Keys
// -----------------------------
export const uploadKeys = {
  all: ["uploads"] as const,
  files: () => [...uploadKeys.all, "files"] as const,
  file: (fileId: number) => [...uploadKeys.files(), fileId] as const,
  metadata: (fileId: number) =>
    [...uploadKeys.file(fileId), "metadata"] as const,
  downloadUrl: (fileId: number) =>
    [...uploadKeys.file(fileId), "download-url"] as const,
};

// -----------------------------
// Queries
// -----------------------------

/**
 * Hook để lấy thông tin file theo fileId
 * @param fileId - ID của file
 * @param options - Các options cho useQuery
 */
export const useFile = (
  fileId: number,
  options?: {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: uploadKeys.file(fileId),
    queryFn: () => uploadService.getFile(fileId),
    enabled: !!fileId && options?.enabled !== false,
    ...options,
  });
};

/**
 * Hook để lấy metadata của file theo fileId
 * @param fileId - ID của file
 * @param options - Các options cho useQuery
 */
export const useFileMetadata = (
  fileId: number,
  options?: {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: uploadKeys.metadata(fileId),
    queryFn: () => uploadService.getMetadata(fileId),
    enabled: !!fileId && options?.enabled !== false,
    ...options,
  });
};

/**
 * Hook để lấy download URL của file theo fileId
 * @param fileId - ID của file
 * @param options - Các options cho useQuery
 */
export const useDownloadUrl = (
  fileId: number,
  options?: {
    enabled?: boolean;
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery({
    queryKey: uploadKeys.downloadUrl(fileId),
    queryFn: () => uploadService.getDownloadUrl(fileId),
    enabled: !!fileId && options?.enabled !== false,
    ...options,
  });
};

// -----------------------------
// Mutations
// -----------------------------

/**
 * Hook để upload một file
 * @param onProgress - Callback để theo dõi tiến trình upload
 */
export const useUploadFile = (
  onProgress?: (progress: UploadProgress) => void
) => {
  return useMutation({
    mutationFn: (request: UploadFileRequest) =>
      uploadService.uploadFile(request, onProgress),
    onSuccess: (response) => {
      toast.success(response.message || "Upload file thành công!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Upload file thất bại. Vui lòng thử lại!";
      toast.error(message);
    },
  });
};

/**
 * Hook để upload nhiều files
 * @param onProgress - Callback để theo dõi tiến trình upload của từng file
 */
export const useUploadFiles = (
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
) => {
  return useMutation({
    mutationFn: ({
      files,
      options,
    }: {
      files: File[];
      options?: {
        module?: UploadFileRequest["module"];
        tags?: string[];
        metadata?: UploadFileRequest["metadata"];
      };
    }) => uploadService.uploadFiles(files, options, onProgress),
    onSuccess: (responses) => {
      const successCount = responses.filter((r) => r.success).length;
      toast.success(
        `Upload thành công ${successCount}/${responses.length} file(s)!`
      );
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Upload files thất bại. Vui lòng thử lại!";
      toast.error(message);
    },
  });
};

/**
 * Hook để xóa file
 */
export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      hardDelete = false,
    }: {
      fileId: number;
      hardDelete?: boolean;
    }) => uploadService.deleteFile(fileId, hardDelete),
    onSuccess: (response, variables) => {
      // Invalidate file query
      queryClient.invalidateQueries({
        queryKey: uploadKeys.file(variables.fileId),
      });
      // Invalidate files list
      queryClient.invalidateQueries({
        queryKey: uploadKeys.files(),
      });
      toast.success(response.message || "Xóa file thành công!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Xóa file thất bại!";
      toast.error(message);
    },
  });
};

/**
 * Hook để download file
 * Sử dụng API /api/files/{fileId}/download-url để lấy signed URL và trigger download
 */
export const useDownloadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fileId,
      fileName,
    }: {
      fileId: number;
      fileName?: string;
    }) => {
      // Fetch download URL (fresh, no cache since signed URLs may expire)
      const response = await queryClient.fetchQuery({
        queryKey: uploadKeys.downloadUrl(fileId),
        queryFn: () => uploadService.getDownloadUrl(fileId),
        staleTime: 0, // Always fetch fresh download URL (signed URLs expire)
        gcTime: 0, // Don't cache download URLs
      });

      return {
        downloadUrl: response.data?.downloadUrl,
        fileName: fileName || `file-${fileId}`,
      };
    },
    onSuccess: async (data) => {
      if (data.downloadUrl) {
        try {
          // Fetch file as blob to avoid navigation
          const response = await fetch(data.downloadUrl);
          if (!response.ok) {
            throw new Error("Failed to fetch file");
          }
          const blob = await response.blob();
          
          // Create blob URL and trigger download
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = data.fileName;
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          
          // Clean up immediately after click
          document.body.removeChild(link);
          
          // Revoke blob URL after a delay to ensure download starts
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 200);
          
          toast.success("Đang tải xuống file...");
        } catch (error) {
          console.error("Error downloading file:", error);
          // Fallback: try direct download link (without target="_blank")
          const link = document.createElement("a");
          link.href = data.downloadUrl;
          link.download = data.fileName;
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success("Đang tải xuống file...");
        }
      } else {
        toast.error("Không thể lấy URL tải xuống");
      }
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Tải xuống file thất bại. Vui lòng thử lại!";
      toast.error(message);
    },
  });
};

// -----------------------------
// Usage Examples
// -----------------------------

/*
// Upload một file với progress tracking
const uploadMutation = useUploadFile((progress) => {
  console.log(`Upload progress: ${progress.percentage}%`);
});

const handleUpload = (file: File) => {
  uploadMutation.mutate({
    file,
    module: "LISTING_MEDIA",
    tags: ["cover", "listing"],
    metadata: {
      description: "Ảnh cover",
    },
  });
};

// Upload nhiều files
const uploadFilesMutation = useUploadFiles((fileIndex, progress) => {
  console.log(`File ${fileIndex}: ${progress.percentage}%`);
});

const handleUploadMultiple = (files: File[]) => {
  uploadFilesMutation.mutate({
    files,
    options: {
      module: "LISTING_MEDIA",
      tags: ["gallery"],
    },
  });
};

// Xóa file (soft delete - mặc định)
const deleteMutation = useDeleteFile();
const handleDelete = (fileId: number) => {
  deleteMutation.mutate({ fileId, hardDelete: false });
};

// Xóa file vĩnh viễn (hard delete)
const handleHardDelete = (fileId: number) => {
  deleteMutation.mutate({ fileId, hardDelete: true });
};

// Lấy thông tin file
const { data: fileData } = useFile(6);

// Lấy metadata của file
const { data: metadataData } = useFileMetadata(6);

// Lấy download URL
const { data: downloadUrlData } = useDownloadUrl(6);
if (downloadUrlData?.data?.downloadUrl) {
  // Sử dụng downloadUrl để download file
  window.open(downloadUrlData.data.downloadUrl, '_blank');
}
*/
