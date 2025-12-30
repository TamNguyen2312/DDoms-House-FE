import { RepairRequestBadge } from "@/components/repair-request/repair-request-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetRepairRequestDetailForLandlord } from "@/hooks/useRepairRequest";
import { format } from "date-fns";
import {
  Building,
  Calendar,
  FileText,
  MapPin,
  Mail,
  Phone,
  User,
  Wrench,
  Loader2,
} from "lucide-react";

interface ViewRepairRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repairRequestId: number | null;
}

export function ViewRepairRequestDialog({
  open,
  onOpenChange,
  repairRequestId,
}: ViewRepairRequestDialogProps) {
  const { data: repairRequest, isLoading, isError } =
    useGetRepairRequestDetailForLandlord(repairRequestId ?? 0, open && !!repairRequestId);

  if (!open) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError || !repairRequest) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <div className="text-center py-8">
            <p className="text-destructive">Không thể tải chi tiết yêu cầu sửa chữa</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="size-5 text-primary" />
            Chi tiết yêu cầu sửa chữa
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về yêu cầu sửa chữa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <RepairRequestBadge status={repairRequest.status} />
            <span className="text-sm text-gray-500">
              ID: #{repairRequest.id}
            </span>
          </div>

          <Separator />

          {/* Title */}
          <div>
            <h3 className="text-lg font-bold mb-2">{repairRequest.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {repairRequest.description}
            </p>
          </div>

          <Separator />

          {/* Property & Unit Info */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Building className="w-4 h-4" />
              Thông tin phòng
            </h4>
            <div className="space-y-2 pl-6">
              {repairRequest.propertyName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tên địa điểm:</span>
                  <span className="text-sm text-gray-600">
                    {repairRequest.propertyName}
                  </span>
                </div>
              )}
              {repairRequest.unitCode && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Mã phòng:</span>
                  <span className="text-sm text-gray-600">
                    {repairRequest.unitCode}
                  </span>
                </div>
              )}
              {(repairRequest.addressLine ||
                repairRequest.ward ||
                repairRequest.city) && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div className="text-sm text-gray-600">
                    {repairRequest.addressLine}
                    {repairRequest.ward && `, ${repairRequest.ward}`}
                    {repairRequest.district && `, ${repairRequest.district}`}
                    {repairRequest.city && `, ${repairRequest.city}`}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Tenant Information */}
          {(repairRequest.tenantFullName ||
            repairRequest.tenantEmail ||
            repairRequest.tenantPhone) && (
            <>
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Thông tin người thuê
                </h4>
                <div className="space-y-2 pl-6">
                  {repairRequest.tenantFullName && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Họ tên:</span>
                      <span className="text-sm text-gray-600">
                        {repairRequest.tenantFullName}
                      </span>
                    </div>
                  )}
                  {repairRequest.tenantEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm text-gray-600">
                        {repairRequest.tenantEmail}
                      </span>
                    </div>
                  )}
                  {repairRequest.tenantPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Số điện thoại:</span>
                      <span className="text-sm text-gray-600">
                        {repairRequest.tenantPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Dates */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Thông tin thời gian
            </h4>
            <div className="space-y-2 pl-6">
              {repairRequest.occurredAt && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Thời gian xảy ra:</span>
                  <span className="text-sm text-gray-600">
                    {format(
                      new Date(repairRequest.occurredAt),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Ngày tạo:</span>
                <span className="text-sm text-gray-600">
                  {format(
                    new Date(repairRequest.createdAt),
                    "dd/MM/yyyy HH:mm"
                  )}
                </span>
              </div>
              {repairRequest.updatedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Cập nhật lần cuối:</span>
                  <span className="text-sm text-gray-600">
                    {format(
                      new Date(repairRequest.updatedAt),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cancel Reason */}
          {repairRequest.status === "CANCEL" && repairRequest.cancelReason && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-red-600">
                  <FileText className="w-4 h-4" />
                  Lý do hủy
                </h4>
                <p className="text-sm text-gray-700 pl-6">
                  {repairRequest.cancelReason}
                </p>
              </div>
            </>
          )}

          {/* Media Files */}
          {repairRequest.medias && repairRequest.medias.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold">Hình ảnh/Tài liệu đính kèm</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {repairRequest.medias.map((media, index) => {
                    const imageUrl = media.thumbnailUrl || media.filePath || media.url;
                    const isImage = media.mimeType?.startsWith("image/");
                    
                    return (
                      <div
                        key={media.id ?? media.fileId ?? index}
                        className="relative border rounded-lg overflow-hidden group"
                      >
                        {isImage && imageUrl ? (
                          <a
                            href={media.filePath || media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={imageUrl}
                              alt={`Media ${media.id ?? media.fileId ?? index}`}
                              className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                // Fallback to filePath if thumbnail fails
                                if (media.thumbnailUrl && media.filePath) {
                                  e.currentTarget.src = media.filePath;
                                }
                              }}
                            />
                          </a>
                        ) : (
                          <a
                            href={media.filePath || media.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-32 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            <FileText className="w-8 h-8 text-gray-400" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

