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
import { useAdminUnitDetail } from "@/hooks/useAdminUnits";
import { useUserProfileById } from "@/hooks/useUserProfile";
import { formatVietnamMoney } from "@/utils/formatters";
import {
  Bath,
  Bed,
  Building2,
  Home,
  Loader2,
  Ruler,
  User,
  Wallet,
} from "lucide-react";

interface UnitDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: number | null;
}

export function UnitDetailDialog({
  open,
  onOpenChange,
  unitId,
}: UnitDetailDialogProps) {
  const { data: unit, isLoading, isError } = useAdminUnitDetail(unitId, open);

  // Fetch property information
  const { data: property, isLoading: isLoadingProperty } =
    useAdminPropertyDetail(
      unit?.propertyId ?? null,
      open && !!unit?.propertyId
    );

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
            <Home className="size-5 sm:size-6" />
            <span className="break-words">Chi tiết phòng</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Thông tin chi tiết về phòng cho thuê
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">
              Đang tải thông tin...
            </span>
          </div>
        ) : isError || !unit ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-destructive">
              Không thể tải thông tin phòng
            </span>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Home className="size-4 sm:size-5" />
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Mã phòng
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {unit.code}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin địa điểm cho thuê */}
            {unit.propertyId && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Building2 className="size-4 sm:size-5" />
                    Thông tin địa điểm cho thuê
                  </h3>
                  {isLoadingProperty ? (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Loader2 className="size-3 sm:size-4 animate-spin" />
                      <span>Đang tải thông tin địa điểm...</span>
                    </div>
                  ) : property ? (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground">
                          Tên địa điểm
                        </label>
                        <div className="font-medium">{property.name}</div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Địa chỉ
                        </label>
                        <div className="font-medium text-sm sm:text-base break-words">
                          {property.addressLine}, {property.ward}
                          {property.district
                            ? `, ${property.district}`
                            : ""}, {property.city}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Không thể tải thông tin địa điểm
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Thông tin chủ nhà */}
            {property?.landlordId && (
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

            {/* Thông tin phòng */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                Thông tin phòng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Ruler className="size-3 sm:size-4" />
                    Diện tích
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {unit.areaSqM} m²
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Bed className="size-3 sm:size-4" />
                    Phòng ngủ
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {unit.bedrooms}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Bath className="size-3 sm:size-4" />
                    Phòng tắm
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {unit.bathrooms}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="size-3 sm:size-4" />
                    Giá thuê cơ bản
                  </label>
                  <div className="font-medium text-sm sm:text-base text-primary">
                    {formatVietnamMoney(unit.baseRent)}
                  </div>
                </div>
                {unit.status && (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Trạng thái
                    </label>
                    <div>
                      <Badge variant="outline" className="text-xs sm:text-sm">
                        {unit.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Furnishings */}
            {unit.furnishings && unit.furnishings.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Nội thất
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {unit.furnishings.map((furnishing) => (
                      <Badge key={furnishing.id} variant="outline">
                        {furnishing.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Media */}
            {unit.media && unit.media.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Hình ảnh
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    {unit.media.map((media) => (
                      <div key={media.id} className="relative">
                        <img
                          src={media.thumbnailUrl || media.filePath}
                          alt={`Media ${media.id}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg"
                        />
                      </div>
                    ))}
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
