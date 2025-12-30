import { Button } from "@/components/ui/button";
import { useGetContractPartyMedia } from "@/hooks/useContracts";
import { getBestImageUrl, handleImageError } from "@/utils/image-handler";
import type { ContractMediaItem } from "@/types/contract.types";
import { Download, Eye, FileText, Image, User } from "lucide-react";
import type { IContractParty } from "../types";

interface PartyMediaItemProps {
  party: IContractParty;
  onManageClick: (partyId: number) => void;
  onViewImage?: (item: ContractMediaItem) => void;
  onDownloadFile?: (item: ContractMediaItem) => void;
}

export function PartyMediaItem({
  party,
  onManageClick,
  onViewImage,
  onDownloadFile,
}: PartyMediaItemProps) {
  const isImage = (mimeType?: string) => {
    return mimeType?.startsWith("image/") ?? false;
  };

  const isPdf = (mimeType?: string) => {
    return mimeType === "application/pdf" || mimeType?.includes("pdf");
  };
  const { data: pMedia = [], isLoading: isLoadingPMedia } =
    useGetContractPartyMedia(party.id, true);

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-1.5">
            <User className="size-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              {party.role === "LANDLORD" ? "Chủ nhà" : "Người thuê"}
            </p>
            <p className="text-xs text-muted-foreground">{party.email}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onManageClick(party.id)}
          className="h-7 text-xs"
        >
          <Image className="size-3 mr-1" />
          Quản lý ({pMedia.length})
        </Button>
      </div>
      {isLoadingPMedia ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      ) : pMedia.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {pMedia.slice(0, 2).map((item) => (
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
                    className="w-full h-20 object-cover cursor-pointer"
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
                      className="w-full h-20 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/20 cursor-pointer"
                      onClick={() => onViewImage?.(item)}
                    >
                      <FileText className="size-7 text-red-600 dark:text-red-400 mb-0.5" />
                      <span className="text-[10px] text-red-700 dark:text-red-300 font-medium">
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
                <div className="relative w-full h-20 flex items-center justify-center bg-muted group">
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
          {pMedia.length > 2 && (
            <div className="flex items-center justify-center border rounded bg-muted/50">
              <p className="text-[10px] text-muted-foreground">
                +{pMedia.length - 2}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

