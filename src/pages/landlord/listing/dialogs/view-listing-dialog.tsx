import { BadgeStatusListing } from "@/components/listing/badge-status-listing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLandlordListingDetail, useLandlordListingMedia } from "@/hooks/useListing";
import { formatVietnamMoney } from "@/utils/formatters";
import { getBestImageUrl, handleImageError, getFallbackImageUrl } from "@/utils/image-handler";
import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ViewListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number | string;
}

export function ViewListingDialog({
  open,
  onOpenChange,
  listingId,
}: ViewListingDialogProps) {
  const { data: listing, isLoading } = useLandlordListingDetail(String(listingId), open);
  const { data: mediaData, isLoading: isLoadingMedia } =
    useLandlordListingMedia(String(listingId), open);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Process media images
  const images = useMemo(() => {
    if (!mediaData || mediaData.length === 0) return [];
    return mediaData
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => {
        const url = getBestImageUrl(
          item.thumbnailUrl,
          item.filePath,
          undefined,
          true // isImage
        );
        return url || getFallbackImageUrl();
      })
      .filter((url) => url && url.trim() !== "");
  }, [mediaData]);

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Reset image index when dialog opens or images change
  useEffect(() => {
    if (open && images.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [open, images.length]);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-5xl! sm:max-w-5xl! max-h-[90vh] overflow-y-auto"
          style={{ maxWidth: "80rem !important", width: "90vw" }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Chi tiết bài đăng
            </DialogTitle>
            <DialogDescription>Đang tải thông tin...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!listing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-5xl! sm:max-w-5xl! max-h-[90vh] overflow-y-auto"
          style={{ maxWidth: "80rem !important", width: "90vw" }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Chi tiết bài đăng
            </DialogTitle>
            <DialogDescription>
              Không tìm thấy thông tin bài đăng
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl! sm:max-w-5xl! max-h-[90vh] overflow-y-auto data-[state=closed]:zoom-out-100! data-[state=open]:zoom-in-100!"
        style={{ maxWidth: "80rem !important", width: "90vw" }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Chi tiết bài đăng
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về bài đăng</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hình ảnh */}
          {images.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Hình ảnh:</span>
              </div>
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <div className="bg-gray-200 flex items-center justify-center h-[300px]">
                  <img
                    src={images[currentImageIndex]}
                    alt={`Listing image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain max-h-[300px]"
                    onError={(e) => {
                      handleImageError(e, null);
                    }}
                  />
                </div>

                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}

                {/* Thumbnail grid */}
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2 p-2 bg-white/50">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative aspect-video rounded overflow-hidden border-2 transition-all ${
                          currentImageIndex === idx
                            ? "border-primary"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            handleImageError(e, null);
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoadingMedia && images.length === 0 && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Đang tải hình ảnh...
              </span>
            </div>
          )}

          {/* Tiêu đề */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Tiêu đề:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {listing.title}
            </p>
          </div>

          {/* Mô tả */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Mô tả:</span>
            </div>
            <div
              className="text-sm text-muted-foreground ml-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: listing.description || "Chưa có mô tả",
              }}
            />
          </div>

          {/* Thông tin bất động sản */}
          {listing.property && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Bất động sản:</span>
              </div>
              <div className="ml-6 space-y-1">
                <p className="text-sm font-medium">{listing.property.name}</p>
                <p className="text-sm text-muted-foreground">
                  {listing.property.addressLine}, {listing.property.ward},{" "}
                  {listing.property.city}
                </p>
              </div>
            </div>
          )}

          {/* Thông tin phòng */}
          {listing.unit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">Mã phòng:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {listing.unit.code}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">Diện tích:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {listing.unit.areaSqM} m²
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">Phòng ngủ:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {listing.unit.bedrooms}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">Phòng tắm:</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {listing.unit.bathrooms}
                </p>
              </div>
            </div>
          )}

          {/* Giá niêm yết */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Giá niêm yết:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {formatVietnamMoney(listing.listedPrice)}
            </p>
          </div>

          {/* Grid 2 cột cho công khai và trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            {/* Công khai */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {listing.isPublic ? (
                  <Eye className="size-4 text-muted-foreground" />
                ) : (
                  <EyeOff className="size-4 text-muted-foreground" />
                )}
                <span className="text-sm font-semibold">Công khai:</span>
              </div>
              <div className="ml-6">
                <Badge variant={listing.isPublic ? "default" : "secondary"}>
                  {listing.isPublic ? "Công khai" : "Riêng tư"}
                </Badge>
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">Trạng thái:</span>
              </div>
              <div className="ml-6">
                <BadgeStatusListing
                  value={listing.status as "PENDING" | "APPROVED" | "REJECTED"}
                />
              </div>
            </div>
          </div>

          {/* Grid 2 cột cho ngày tạo và ngày cập nhật */}
          <div className="grid grid-cols-2 gap-4">
            {/* Ngày tạo */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Ngày tạo:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {listing.createdAt
                  ? format(new Date(listing.createdAt), "dd/MM/yyyy HH:mm")
                  : "-"}
              </p>
            </div>

            {/* Ngày cập nhật */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Ngày cập nhật:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {listing.updatedAt
                  ? format(new Date(listing.updatedAt), "dd/MM/yyyy HH:mm")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
