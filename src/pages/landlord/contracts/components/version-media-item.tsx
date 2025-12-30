import { Button } from "@/components/ui/button";
import { useGetContractVersionMedia } from "@/hooks/useContracts";
import { getBestImageUrl, handleImageError } from "@/utils/image-handler";
import type { ContractMediaItem } from "@/types/contract.types";
import { Download, Eye, FileText, Image } from "lucide-react";
import type { IContractVersion } from "../types";

interface VersionMediaItemProps {
  version: IContractVersion;
  onManageClick: (versionId: number) => void;
  onViewImage?: (item: ContractMediaItem) => void;
  onDownloadFile?: (item: ContractMediaItem) => void;
}

export function VersionMediaItem({
  version,
  onManageClick,
  onViewImage,
  onDownloadFile,
}: VersionMediaItemProps) {
  const isImage = (mimeType?: string) => {
    return mimeType?.startsWith("image/") ?? false;
  };

  const isPdf = (mimeType?: string) => {
    return mimeType === "application/pdf" || mimeType?.includes("pdf");
  };
  const { data: vMedia = [], isLoading: isLoadingVMedia } =
    useGetContractVersionMedia(version.id, true);

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
            v{version.versionNo}
          </div>
          <div>
            <p className="text-sm font-semibold">
              Phiên bản {version.versionNo}
            </p>
            <p className="text-xs text-muted-foreground">
              {version.templateCode}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onManageClick(version.id)}
          className="h-7 text-xs"
        >
          <Image className="size-3 mr-1" />
          Quản lý ({vMedia.length})
        </Button>
      </div>
      {isLoadingVMedia ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      ) : vMedia.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {vMedia.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="relative group border rounded overflow-hidden bg-muted/50"
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
                    className="w-full h-16 object-cover cursor-pointer"
                    onClick={() => onViewImage?.(item)}
                    onError={(e) => {
                      const fallbackUrl = item.thumbnailUrl && item.filePath 
                        ? (e.currentTarget.src === item.thumbnailUrl ? item.filePath : item.thumbnailUrl)
                        : null;
                      handleImageError(e, fallbackUrl);
                    }}
                  />
                  ) : (
                    <div
                      className="w-full h-16 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/20 cursor-pointer"
                      onClick={() => onViewImage?.(item)}
                    >
                      <FileText className="size-6 text-red-600 dark:text-red-400 mb-0.5" />
                      <span className="text-[9px] text-red-700 dark:text-red-300 font-medium">
                        PDF
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    {onViewImage && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 bg-white/90 hover:bg-white text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewImage(item);
                        }}
                        title={isPdf(item.mimeType) ? "Xem PDF" : "Xem ảnh"}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    )}
                    {onDownloadFile && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 bg-white/90 hover:bg-white text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadFile(item);
                        }}
                        title="Tải xuống"
                      >
                        <Download className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-16 flex items-center justify-center bg-muted group">
                  <FileText className="size-4 text-muted-foreground" />
                  {onDownloadFile && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 bg-white/90 hover:bg-white text-black"
                        onClick={() => onDownloadFile(item)}
                        title="Tải xuống"
                      >
                        <Download className="size-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {vMedia.length > 3 && (
            <div className="flex items-center justify-center border rounded bg-muted/50">
              <p className="text-[10px] text-muted-foreground">
                +{vMedia.length - 3}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

