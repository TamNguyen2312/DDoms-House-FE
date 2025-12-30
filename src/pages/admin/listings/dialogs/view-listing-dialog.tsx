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
import { useAdminListingDetail } from "@/hooks/useListing";
import { formatVietnamMoney } from "@/utils/formatters";
import { getBestImageUrl, handleImageError } from "@/utils/image-handler";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  FileText,
  Loader2,
  Package,
  User,
} from "lucide-react";

interface ViewListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: number;
}

export function ViewListingDialog({
  open,
  onOpenChange,
  listingId,
}: ViewListingDialogProps) {
  const {
    data: listing,
    isLoading,
    isError,
  } = useAdminListingDetail(listingId, open && !!listingId);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Chi tiết bài đăng
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về bài đăng</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">
              Đang tải thông tin...
            </span>
          </div>
        ) : isError || !listing ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-destructive">
              Không thể tải thông tin bài đăng
            </span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Summary */}
            <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Giá:</span>
                <span className="text-base font-bold text-primary">
                  {formatVietnamMoney(listing.listedPrice)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Trạng thái:
                </span>
                <BadgeStatusListing
                  value={listing.status as "PENDING" | "APPROVED" | "REJECTED"}
                />
              </div>
              <div className="flex items-center gap-2">
                {listing.isPublic ? (
                  <Badge variant="default">Công khai</Badge>
                ) : (
                  <Badge variant="secondary">Riêng tư</Badge>
                )}
              </div>
            </div>

            {/* Main Content - Grid Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Listing Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold">
                      Thông tin bài đăng
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Tiêu đề
                      </p>
                      <p className="text-sm font-medium">{listing.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Mô tả
                      </p>
                      <div
                        className="text-sm text-muted-foreground prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: listing.description || "Chưa có mô tả",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Unit Info Section */}
                {listing.unit && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">Thông tin Phòng</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Mã phòng
                        </p>
                        <p className="text-sm font-medium">
                          #{listing.unit.code}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Diện tích
                        </p>
                        <p className="text-sm font-medium">
                          {listing.unit.areaSqM} m²
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Phòng ngủ
                        </p>
                        <p className="text-sm font-medium">
                          {listing.unit.bedrooms}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Phòng tắm
                        </p>
                        <p className="text-sm font-medium">
                          {listing.unit.bathrooms}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Giá thuê
                      </p>
                      <p className="text-base font-bold text-primary">
                        {formatVietnamMoney(listing.unit.baseRent)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Property Info Section */}
                {listing.property && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">Bất động sản</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Tên BĐS
                        </p>
                        <p className="text-sm font-medium">
                          {listing.property.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Địa chỉ
                        </p>
                        <p className="text-sm font-medium leading-relaxed">
                          {listing.property.addressLine},{" "}
                          {listing.property.ward}
                          {listing.property.district &&
                            `, ${listing.property.district}`}
                          , {listing.property.city}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Landlord Info Section */}
                {listing.landlord && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">Chủ nhà</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Email
                        </p>
                        <p className="text-sm font-medium break-all">
                          {listing.landlord.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1.5">
                          Số điện thoại
                        </p>
                        <p className="text-sm font-medium">
                          {listing.landlord.phone || "Chưa cập nhật"}
                        </p>
                      </div>
                      {listing.landlord.displayName && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Họ tên
                          </p>
                          <p className="text-sm font-medium">
                            {listing.landlord.displayName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dates Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold">Thời gian</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Ngày tạo
                      </p>
                      <p className="text-sm font-medium">
                        {listing.createdAt
                          ? format(
                              new Date(listing.createdAt),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Ngày cập nhật
                      </p>
                      <p className="text-sm font-medium">
                        {listing.updatedAt
                          ? format(
                              new Date(listing.updatedAt),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Media Section */}
                {listing.media && listing.media.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">Hình ảnh</h3>
                      <Badge variant="secondary" className="text-xs">
                        {listing.media.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {listing.media.map((media) => {
                        const imageUrl = getBestImageUrl(
                          media.thumbnailUrl,
                          media.filePath,
                          undefined,
                          true
                        ) || media.thumbnailUrl || media.filePath;
                        const fallbackUrl = media.thumbnailUrl && media.filePath
                          ? (imageUrl === media.thumbnailUrl ? media.filePath : media.thumbnailUrl)
                          : null;
                        return (
                          <img
                            key={media.id}
                            src={imageUrl}
                            alt={`Media ${media.id}`}
                            className="w-full h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              handleImageError(e, fallbackUrl);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
