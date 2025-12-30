import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetAdminContractDetail } from "@/hooks/useContracts";
import { formatVietnamDate, formatVietnamDateTime, formatVietnamMoney } from "@/utils/formatters";
import {
    Building2,
    Calendar,
    Clock,
    FileText,
    Home,
    Loader2,
    Mail,
    MapPin,
    Phone,
    User,
    Users,
    Wallet,
} from "lucide-react";

interface ContractDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: number | null;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Bản nháp", variant: "outline" },
  SENT: { label: "Đã gửi", variant: "secondary" },
  SIGNED: { label: "Đã ký", variant: "default" },
  ACTIVE: { label: "Đang hoạt động", variant: "default" },
  TERMINATION_PENDING: { label: "Chờ hủy", variant: "secondary" },
  CANCELLED: { label: "Đã hủy", variant: "destructive" },
  EXPIRED: { label: "Đã hết hạn", variant: "destructive" },
};

export function ContractDetailDialog({
  open,
  onOpenChange,
  contractId,
}: ContractDetailDialogProps) {
  const { data: response, isLoading, isError } = useGetAdminContractDetail(
    contractId ?? 0,
    open && !!contractId
  );

  const contractData = response?.data;
  const contract = contractData?.contract;
  const versions = contractData?.versions || [];
  const parties = contractData?.parties || [];
  const signatures = contractData?.signatures || [];

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <FileText className="size-5 sm:size-6" />
            <span className="break-words">Chi tiết hợp đồng</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Thông tin chi tiết về hợp đồng thuê phòng
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">
              Đang tải thông tin...
            </span>
          </div>
        ) : isError || !contract ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-destructive">
              Không thể tải thông tin hợp đồng
            </span>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Thông tin cơ bản hợp đồng */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <FileText className="size-4 sm:size-5" />
                Thông tin hợp đồng
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Mã hợp đồng
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    #{contract.id}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </label>
                  <div>
                    <Badge variant={statusLabels[contract.status]?.variant || "outline"}>
                      {statusLabels[contract.status]?.label || contract.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="size-3 sm:size-4" />
                    Ngày bắt đầu
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {formatVietnamDate(contract.startDate)}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="size-3 sm:size-4" />
                    Ngày kết thúc
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {formatVietnamDate(contract.endDate)}
                  </div>
                </div>
                {contract.pendingEndDate && (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Ngày kết thúc chờ duyệt
                    </label>
                    <div className="font-medium text-sm sm:text-base text-orange-600">
                      {formatVietnamDate(contract.pendingEndDate)}
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Wallet className="size-3 sm:size-4" />
                    Tiền đặt cọc
                  </label>
                  <div className="font-medium text-sm sm:text-base text-primary">
                    {formatVietnamMoney(contract.depositAmount)}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="size-3 sm:size-4" />
                    Ngày tạo
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {formatVietnamDateTime(contract.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin phòng */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Home className="size-4 sm:size-5" />
                Thông tin phòng
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Mã phòng
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {contract.unit.unitCode}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Building2 className="size-3 sm:size-4" />
                    Tên dự án
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {contract.unit.propertyName}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="size-3 sm:size-4" />
                    Địa chỉ
                  </label>
                  <div className="font-medium text-sm sm:text-base break-words">
                    {contract.unit.addressLine}, {contract.unit.ward}
                    {contract.unit.district ? `, ${contract.unit.district}` : ""}, {contract.unit.city}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin chủ nhà */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <User className="size-4 sm:size-5" />
                Thông tin chủ nhà
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="size-3 sm:size-4" />
                    Email
                  </label>
                  <div className="font-medium text-sm sm:text-base break-all">
                    {contract.landlord.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="size-3 sm:size-4" />
                    Số điện thoại
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {contract.landlord.phone || "-"}
                  </div>
                </div>
                {contract.landlord.displayName && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Tên hiển thị
                    </label>
                    <div className="font-medium text-sm sm:text-base">
                      {contract.landlord.displayName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Thông tin người thuê */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <User className="size-4 sm:size-5" />
                Thông tin người thuê
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="size-3 sm:size-4" />
                    Email
                  </label>
                  <div className="font-medium text-sm sm:text-base break-all">
                    {contract.tenant.email}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="size-3 sm:size-4" />
                    Số điện thoại
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    {contract.tenant.phone || "-"}
                  </div>
                </div>
                {contract.tenant.displayName && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Tên hiển thị
                    </label>
                    <div className="font-medium text-sm sm:text-base">
                      {contract.tenant.displayName}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Phiên bản hợp đồng */}
            {versions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <FileText className="size-4 sm:size-5" />
                    Phiên bản hợp đồng ({versions.length})
                  </h3>
                  <div className="space-y-3">
                    {versions.map((version) => (
                      <div key={version.id} className="border rounded-lg p-3 sm:p-4 bg-muted/30">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                              Phiên bản
                            </label>
                            <div className="font-medium text-sm">
                              v{version.versionNo}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                              Mã template
                            </label>
                            <div className="font-medium text-sm">
                              {version.templateCode}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                              Ngày tạo
                            </label>
                            <div className="font-medium text-sm">
                              {version.createdAt ? formatVietnamDateTime(version.createdAt) : "-"}
                            </div>
                          </div>
                        </div>
                        {version.content && (
                          <div className="mt-3 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                              Nội dung
                            </label>
                            <div className="text-sm bg-background p-3 rounded border max-h-32 overflow-y-auto">
                              {version.content}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Các bên tham gia */}
            {parties.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Users className="size-4 sm:size-5" />
                    Các bên tham gia ({parties.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {parties.map((party) => (
                      <div key={party.id} className="border rounded-lg p-3 sm:p-4 bg-muted/30">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={party.role === "LANDLORD" ? "default" : "secondary"}>
                              {party.role === "LANDLORD" ? "Chủ nhà" : "Người thuê"}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{party.email}</div>
                            <div className="text-sm text-muted-foreground">{party.phone}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Chữ ký */}
            {signatures.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Chữ ký ({signatures.length})
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Có {signatures.length} chữ ký được ghi nhận
                  </div>
                </div>
              </>
            )}

            {/* Media */}
            {contract.media && contract.media.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Tài liệu đính kèm ({contract.media.length})
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    Có {contract.media.length} tài liệu đính kèm
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