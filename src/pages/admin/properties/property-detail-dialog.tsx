import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAdminPropertyDetail } from "@/hooks/useAdminProperties";
import { useUserProfileById } from "@/hooks/useUserProfile";
import { getBestImageUrl, handleImageError } from "@/utils/image-handler";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  MapPin,
  User,
  XCircle,
} from "lucide-react";

interface PropertyDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: number | null;
}

export function PropertyDetailDialog({
  open,
  onOpenChange,
  propertyId,
}: PropertyDetailDialogProps) {
  const {
    data: property,
    isLoading,
    isError,
  } = useAdminPropertyDetail(propertyId, open);

  // Fetch landlord information
  const { data: landlord, isLoading: isLoadingLandlord } = useUserProfileById(
    property?.landlordId ?? 0,
    open && !!property?.landlordId
  );

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Building2 className="size-5 sm:size-6" />
            <span className="break-words">Chi tiết địa điểm cho thuê</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Thông tin chi tiết về địa điểm cho thuê
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">
              Đang tải thông tin...
            </span>
          </div>
        ) : isError || !property ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-destructive">
              Không thể tải thông tin địa điểm cho thuê
            </span>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Building2 className="size-4 sm:size-5" />
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Tên địa điểm
                  </label>
                  <div className="font-medium text-sm sm:text-base break-words">
                    {property.name}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin chủ nhà */}
            {property.landlordId && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <User className="size-4 sm:size-5" />
                    Thông tin chủ nhà
                  </h3>
                  {isLoadingLandlord ? (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Loader2 className="size-3 sm:size-4 animate-spin" />
                      <span>Đang tải thông tin chủ nhà...</span>
                    </div>
                  ) : landlord ? (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <div className="font-medium text-sm sm:text-base break-all">
                          {landlord.email}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Số điện thoại
                        </label>
                        <div className="font-medium text-sm sm:text-base">
                          {landlord.phone || "-"}
                        </div>
                      </div>
                      {landlord.landlordProfile?.displayName && (
                        <div className="space-y-1">
                          <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                            Tên hiển thị
                          </label>
                          <div className="font-medium text-sm sm:text-base">
                            {landlord.landlordProfile.displayName}
                          </div>
                        </div>
                      )}
                      {landlord.landlordProfile && (
                        <div className="space-y-1">
                          <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                            Trạng thái xác thực
                          </label>
                          <div>
                            <Badge
                              variant={
                                landlord.landlordProfile.verified
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {landlord.landlordProfile.verified ? (
                                <>
                                  <CheckCircle2 className="mr-1 size-3" />
                                  Đã xác thực
                                </>
                              ) : (
                                <>
                                  <XCircle className="mr-1 size-3" />
                                  Chưa xác thực
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Không thể tải thông tin chủ nhà
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Địa chỉ */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <MapPin className="size-4 sm:size-5" />
                Địa chỉ
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Địa chỉ
                  </label>
                  <div className="font-medium text-sm sm:text-base break-words">
                    {property.addressLine}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Phường/Xã
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {property.ward}
                  </div>
                </div>
                {property.district && (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Quận/Huyện
                    </label>
                    <div className="font-medium text-sm sm:text-base">
                      {property.district}
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Thành phố/Tỉnh
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {property.city}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin ngày tháng */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Calendar className="size-4 sm:size-5" />
                Thông tin ngày tháng
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3 sm:size-4 text-muted-foreground" />
                    <span className="font-medium text-sm sm:text-base">
                      {format(new Date(property.createdAt), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Media */}
            {property.media && property.media.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Hình ảnh
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    {property.media.map((media) => {
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
                        <div key={media.id} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Media ${media.id}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg"
                            onError={(e) => {
                              handleImageError(e, fallbackUrl);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
