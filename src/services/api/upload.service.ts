import axiosInstance, { type ApiResponse } from "./axios.config";

// -----------------------------
// Types
// -----------------------------

export interface UploadFileMetadata {
  description?: string;
  [key: string]: any;
}

export interface UploadFileRequest {
  file: File;
  module?:
    | "LISTING_MEDIA"
    | "PROPERTY_MEDIA"
    | "UNIT_MEDIA"
    | "USER_AVATAR"
    | "DOCUMENT";
  tags?: string[];
  metadata?: UploadFileMetadata;
  description?: string;
}

export interface UploadedFile {
  fileId: number;
  provider: "CLOUDINARY" | "LOCAL" | "S3";
  url: string;
  thumbnailUrl?: string;
  checksum: string;
  mimeType: string;
  sizeBytes: number;
  module: string;
  tags: string[];
  retentionDays?: number;
  metadata?: UploadFileMetadata;
}

export interface UploadResponse extends ApiResponse<UploadedFile> {
  message: string;
  status: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  expiresAt?: string;
}

// -----------------------------
// Service
// -----------------------------

class UploadService {
  private readonly BASE_PATH = "/files";

  /**
   * Upload a single file
   * @param request - Upload file request with file and optional metadata
   * @param onProgress - Optional progress callback
   * @returns Promise with upload response
   */
  async uploadFile(
    request: UploadFileRequest,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", request.file);

    if (request.module) {
      formData.append("module", request.module);
    }

    if (request.tags && request.tags.length > 0) {
      // Server expects comma-separated string, not JSON
      formData.append("tags", request.tags.join(","));
    }

    if (request.metadata) {
      formData.append("metadata", JSON.stringify(request.metadata));
    }

    if (request.description) {
      formData.append("description", request.description);
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const loaded = progressEvent.loaded;
          const total = progressEvent.total;
          const percentage = Math.round((loaded * 100) / total);

          onProgress({
            loaded,
            total,
            percentage,
          });
        }
      },
    };

    const res = await axiosInstance.post<UploadResponse>(
      this.BASE_PATH,
      formData,
      config
    );

    return res.data;
  }

  /**
   * Upload multiple files
   * @param files - Array of files to upload
   * @param options - Upload options (module, tags, metadata)
   * @param onProgress - Optional progress callback for each file
   * @returns Promise with array of upload responses
   */
  async uploadFiles(
    files: File[],
    options?: {
      module?: UploadFileRequest["module"];
      tags?: string[];
      metadata?: UploadFileMetadata;
    },
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResponse[]> {
    const uploadPromises = files.map((file, index) => {
      return this.uploadFile(
        {
          file,
          module: options?.module,
          tags: options?.tags,
          metadata: options?.metadata,
        },
        (progress) => {
          if (onProgress) {
            onProgress(index, progress);
          }
        }
      );
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Delete an uploaded file by fileId
   * @param fileId - ID of the file to delete
   * @param hardDelete - If true, permanently delete the file. If false, soft delete (default: false)
   * @returns Promise with delete response
   */
  async deleteFile(
    fileId: number,
    hardDelete: boolean = false
  ): Promise<ApiResponse<void>> {
    const res = await axiosInstance.delete<ApiResponse<void>>(
      `/files/${fileId}`,
      {
        params: {
          hardDelete,
        },
      }
    );
    return res.data;
  }

  /**
   * Get file information by fileId (includes metadata)
   * @param fileId - ID of the file
   * @returns Promise with file information including metadata
   */
  async getFile(fileId: number): Promise<ApiResponse<UploadedFile>> {
    const res = await axiosInstance.get<ApiResponse<UploadedFile>>(
      `/files/${fileId}`
    );
    return res.data;
  }

  /**
   * Get file metadata by fileId
   * Alias for getFile, but can be used for clarity when only metadata is needed
   * @param fileId - ID of the file
   * @returns Promise with file information including metadata
   */
  async getMetadata(fileId: number): Promise<ApiResponse<UploadedFile>> {
    return this.getFile(fileId);
  }

  /**
   * Get download URL for a file by fileId
   * @param fileId - ID of the file
   * @returns Promise with download URL response
   */
  async getDownloadUrl(
    fileId: number
  ): Promise<ApiResponse<DownloadUrlResponse>> {
    const res = await axiosInstance.get<ApiResponse<DownloadUrlResponse>>(
      `/files/${fileId}/download-url`
    );
    return res.data;
  }
}

export const uploadService = new UploadService();
