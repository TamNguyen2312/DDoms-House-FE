import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  FileSignature,
  Key,
  Package,
  User,
  XCircle,
} from "lucide-react";
import type {
  IContractStatus,
  IRentedUnit,
} from "../../../admin/rented-units/types";
import { TenantContractSection } from "../components/tenant-contract-section";
import { TenantInvoiceSection } from "../components/tenant-invoice-section";

interface TenantRentedUnitDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: IRentedUnit | null;
}

const getContractStatusBadge = (status: IContractStatus) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="default"
          className="gap-1.5 text-sm h-6 px-2.5 bg-green-300 text-green-700"
        >
          <CheckCircle2 className="size-3" />
          Hoạt động
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="destructive" className="gap-1.5 text-sm h-6 px-2.5">
          <XCircle className="size-3" />
          Đã hủy
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="secondary" className="gap-1.5 text-sm h-6 px-2.5">
          <Clock className="size-3" />
          Hết hạn
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1.5 text-sm h-6 px-2.5">
          <AlertCircle className="size-3" />
          Chờ xử lý
        </Badge>
      );
  }
};

export function TenantRentedUnitDetailDialog({
  open,
  onOpenChange,
  unit,
}: TenantRentedUnitDetailDialogProps) {
  if (!unit) return null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5 text-primary" />
            Chi tiết phòng #{unit.unitCode}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về phòng đã thuê
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Summary */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Giá trị:</span>
              <span className="text-base font-bold text-primary">
                {formatCurrency(unit.depositAmount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Trạng thái hợp đồng:
              </span>
              {getContractStatusBadge(unit.contractStatus)}
            </div>
          </div>

          {/* Main Content - Grid Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Unit Info Section */}
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
                    <p className="text-sm font-medium">#{unit.unitCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Diện tích
                    </p>
                    <p className="text-sm font-medium">{unit.areaSqM} m²</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Phòng ngủ
                    </p>
                    <p className="text-sm font-medium">{unit.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Phòng tắm
                    </p>
                    <p className="text-sm font-medium">{unit.bathrooms}</p>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Property Info Section */}
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
                    <p className="text-sm font-medium">{unit.propertyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Địa chỉ
                    </p>
                    <p className="text-sm font-medium leading-relaxed">
                      {unit.propertyAddress}, {unit.ward}
                      {unit.district && `, ${unit.district}`}, {unit.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contract Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileSignature className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">Hợp đồng</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      ID Hợp đồng
                    </p>
                    <p className="text-sm font-medium">#{unit.contractId}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Ngày bắt đầu
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(unit.startDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Ngày kết thúc
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(unit.endDate)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                </div>
              </div>

              {/* Landlord Info Section */}
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
                      {unit.landlordEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Số điện thoại
                    </p>
                    <p className="text-sm font-medium">{unit.landlordPhone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices Section */}
          {unit.unitId > 0 && <TenantInvoiceSection unitId={unit.unitId} />}

          {/* Contracts Section */}
          {unit.unitId > 0 && <TenantContractSection unitId={unit.unitId} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
