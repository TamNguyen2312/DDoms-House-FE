// Contract Media Types
export interface ContractMediaItem {
  id: number;
  ownerType: string;
  ownerId: number;
  fileId: number;
  filePath: string;
  thumbnailUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  sortOrder: number;
  // Computed properties for backward compatibility
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
}

export interface ContractMediaResponse {
  id: number;
  ownerType: string;
  ownerId: number;
  fileId: number;
  filePath: string;
  thumbnailUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  sortOrder: number;
}

