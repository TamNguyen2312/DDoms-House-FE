import { RentalRequestBadge } from "@/components/rental-request/rental-request-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useUserProfileById } from "@/hooks/useUserProfile";
import { format } from "date-fns";
import {
  Building,
  Calendar,
  Code,
  Eye,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import type { IRentalRequest } from "../types";

interface ViewRentalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalRequest: IRentalRequest;
}

export function ViewRentalRequestDialog({
  open,
  onOpenChange,
  rentalRequest,
}: ViewRentalRequestDialogProps) {
  // Fetch tenant profile if tenantId exists and not nested tenant data
  const shouldFetchTenant = !rentalRequest.tenant && !!rentalRequest.tenantId;
  const {
    data: tenantProfile,
    isLoading: isLoadingTenant,
    isError: isErrorTenant,
  } = useUserProfileById(
    rentalRequest.tenantId || 0,
    open && shouldFetchTenant
  );

  // Use nested tenant data if available, otherwise use fetched profile
  const tenantData =
    rentalRequest.tenant ||
    (tenantProfile && {
      userId: tenantProfile.id,
      displayName: tenantProfile.tenantProfile?.fullName || null,
      email: tenantProfile.email,
      phone: tenantProfile.phone,
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            Chi tiết yêu cầu thuê
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về yêu cầu thuê
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Trạng thái:</span>
            <RentalRequestBadge status={rentalRequest.status} />
          </div>

          <Separator />

          {/* Tenant Information Section */}
          {(rentalRequest.tenantId || tenantData) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span className="text-sm font-semibold">
                  Thông tin người thuê
                </span>
              </div>
              <Separator />
              <div className="space-y-2 pl-6">
                {isLoadingTenant && shouldFetchTenant ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Đang tải thông tin...</span>
                  </div>
                ) : isErrorTenant ? (
                  <div className="text-sm text-muted-foreground">
                    Không thể tải thông tin người thuê
                  </div>
                ) : tenantData ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm text-muted-foreground">
                        {tenantData.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Số điện thoại:
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {tenantData.phone || "Chưa cập nhật"}
                      </span>
                    </div>
                    {tenantData.displayName && (
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Họ tên:</span>
                        <span className="text-sm text-muted-foreground">
                          {tenantData.displayName}
                        </span>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          )}

          <Separator />

          {/* Unit Information Section */}
          {(rentalRequest.unit ||
            rentalRequest.propertyName ||
            rentalRequest.unitCode) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="size-4 text-primary" />
                <span className="text-sm font-semibold">Thông tin phòng</span>
              </div>
              <Separator />
              <div className="space-y-2 pl-6">
                {(rentalRequest.unit?.unitCode || rentalRequest.unitCode) && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Code className="size-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Mã phòng:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {rentalRequest.unit?.unitCode || rentalRequest.unitCode}
                    </p>
                  </div>
                )}
                {(rentalRequest.unit?.propertyName ||
                  rentalRequest.propertyName) && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="size-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        Tên tòa nhà:
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {rentalRequest.unit?.propertyName ||
                        rentalRequest.propertyName}
                    </p>
                  </div>
                )}
                {(rentalRequest.unit?.addressLine ||
                  rentalRequest.addressLine) && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">Địa chỉ:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {rentalRequest.unit?.addressLine ||
                        rentalRequest.addressLine}
                      {(rentalRequest.unit?.ward || rentalRequest.ward) &&
                        `, ${rentalRequest.unit?.ward || rentalRequest.ward}`}
                      {(rentalRequest.unit?.district ||
                        rentalRequest.district) &&
                        `, ${
                          rentalRequest.unit?.district || rentalRequest.district
                        }`}
                      {(rentalRequest.unit?.city || rentalRequest.city) &&
                        `, ${rentalRequest.unit?.city || rentalRequest.city}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Message */}
          {rentalRequest.message && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Tin nhắn:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6 whitespace-pre-wrap">
                {rentalRequest.message}
              </p>
            </div>
          )}

          {/* Created At */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Ngày tạo:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {format(new Date(rentalRequest.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
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
