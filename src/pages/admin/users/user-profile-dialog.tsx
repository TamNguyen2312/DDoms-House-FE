import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAdminUserDetail } from "@/hooks/useAdminUsers";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Shield,
  User,
  XCircle
} from "lucide-react";

// Helper function to get Vietnamese role name
const getRoleDisplayName = (roleCode: string | undefined | null): string => {
  if (!roleCode || typeof roleCode !== "string") return "-";

  // Normalize to uppercase for case-insensitive matching
  const normalized = roleCode.toUpperCase().trim();

  const roleMap: Record<string, string> = {
    ADMIN: "Quản trị",
    LANDLORD: "Chủ nhà",
    TENANT: "Người thuê",
    // Handle various case formats for fallback
    Admin: "Quản trị",
    Landlord: "Chủ nhà",
    Tenant: "Người thuê",
    admin: "Quản trị",
    landlord: "Chủ nhà",
    tenant: "Người thuê",
  };

  // Try normalized first, then original
  return roleMap[normalized] || roleMap[roleCode] || roleCode;
};

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
}

export function UserProfileDialog({
  open,
  onOpenChange,
  userId,
}: UserProfileDialogProps) {
  const { data: user, isLoading, isError } = useAdminUserDetail(userId, open);

  if (!open) return null;

  const roleCode = user?.roles && user.roles.length > 0 ? user.roles[0] : null;
  const roleName = getRoleDisplayName(roleCode);

  const displayName =
    user?.landlordProfile?.displayName || user?.tenantProfile?.fullName || "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <User className="size-5 sm:size-6" />
            <span className="break-words">Thông tin người dùng</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Chi tiết thông tin tài khoản và profile của người dùng
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">
              Đang tải thông tin...
            </span>
          </div>
        ) : isError || !user ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-destructive">
              Không thể tải thông tin người dùng
            </span>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <User className="size-4 sm:size-5" />
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="size-3 sm:size-4 text-muted-foreground" />
                    <span className="font-medium text-sm sm:text-base break-all">
                      {user.email}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Số điện thoại
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="size-3 sm:size-4 text-muted-foreground" />
                    <span className="font-medium text-sm sm:text-base">
                      {user.phone || "-"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Tên hiển thị
                  </label>
                  <div className="flex items-center gap-2">
                    <User className="size-3 sm:size-4 text-muted-foreground" />
                    <span className="font-medium text-sm sm:text-base break-words">
                      {displayName}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Vai trò
                  </label>
                  <div>
                    <Badge variant="outline" className="text-xs sm:text-sm">
                      {roleName}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Trạng thái tài khoản */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Shield className="size-4 sm:size-5" />
                Trạng thái tài khoản
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Trạng thái hoạt động
                  </label>
                  <div>
                    <Badge
                      variant={user.active ? "default" : "secondary"}
                      className="text-xs sm:text-sm"
                    >
                      {user.active ? (
                        <>
                          <CheckCircle2 className="mr-1 size-3" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-1 size-3" />
                          Không hoạt động
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                {/* <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Khóa tài khoản
                  </label>
                  <div>
                    <Badge
                      variant={user.locked ? "destructive" : "outline"}
                      className="text-xs sm:text-sm"
                    >
                      {user.locked ? (
                        <>
                          <Lock className="mr-1 size-3" />
                          Đã khóa
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-1 size-3" />
                          Mở khóa
                        </>
                      )}
                    </Badge>
                  </div>
                </div> */}
                {/* <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Xác thực 2FA
                  </label>
                  <div>
                    <Badge
                      variant={user.twoFaEnabled ? "default" : "outline"}
                      className="text-xs sm:text-sm"
                    >
                      {user.twoFaEnabled ? (
                        <>
                          <Shield className="mr-1 size-3" />
                          Bật
                        </>
                      ) : (
                        <>
                          <Shield className="mr-1 size-3" />
                          Tắt
                        </>
                      )}
                    </Badge>
                  </div>
                </div> */}
              </div>
            </div>

            <Separator />

            {/* Thông tin profile theo vai trò */}
            {/* {user.landlordProfile && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Thông tin Chủ nhà
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Tên hiển thị
                      </label>
                      <div className="font-medium text-sm sm:text-base break-words">
                        {user.landlordProfile.displayName || "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Trạng thái xác thực
                      </label>
                      <div>
                        <Badge
                          variant={
                            user.landlordProfile.verified
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.landlordProfile.verified ? (
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
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Trạng thái KYC
                      </label>
                      <div>
                        {(() => {
                          const statusMap: Record<
                            string,
                            {
                              label: string;
                              variant:
                                | "default"
                                | "secondary"
                                | "destructive"
                                | "outline";
                            }
                          > = {
                            APPROVED: { label: "Đã duyệt", variant: "default" },
                            PENDING: {
                              label: "Chờ duyệt",
                              variant: "secondary",
                            },
                            REJECTED: {
                              label: "Từ chối",
                              variant: "destructive",
                            },
                          };
                          const statusInfo = statusMap[
                            user.landlordProfile.kycStatus
                          ] || {
                            label: user.landlordProfile.kycStatus,
                            variant: "outline" as const,
                          };
                          return (
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )} */}

            {/* {user.tenantProfile && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Thông tin Người thuê
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Họ và tên
                      </label>
                      <div className="font-medium text-sm sm:text-base break-words">
                        {user.tenantProfile.fullName || "-"}
                      </div>
                    </div>
                    {user.tenantProfile.dob && (
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Ngày sinh
                        </label>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3 sm:size-4 text-muted-foreground" />
                          <span className="font-medium text-sm sm:text-base">
                            {format(
                              new Date(user.tenantProfile.dob),
                              "dd/MM/yyyy"
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    {user.tenantProfile.idNumber && (
                      <div className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                          Số CMND/CCCD
                        </label>
                        <div className="font-medium text-sm sm:text-base">
                          {user.tenantProfile.idNumber}
                        </div>
                      </div>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Trạng thái xác thực
                      </label>
                      <div>
                        <Badge
                          variant={
                            user.tenantProfile.verified
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.tenantProfile.verified ? (
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
                  </div>
                </div>
                <Separator />
              </>
            )} */}

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
                      {format(new Date(user.createdAt), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Ngày cập nhật
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-3 sm:size-4 text-muted-foreground" />
                    <span className="font-medium text-sm sm:text-base">
                      {format(new Date(user.updatedAt), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
