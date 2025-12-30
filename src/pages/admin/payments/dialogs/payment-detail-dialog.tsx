import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetAdminPaymentDetail } from "@/hooks/usePayments";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CheckCircle2,
  CreditCard,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Wallet,
  XCircle,
} from "lucide-react";

interface PaymentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: number | null;
  paymentType?: string;
}

const statusLabels: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  SUCCEEDED: { label: "Thành công", variant: "default" },
  FAILED: { label: "Thất bại", variant: "destructive" },
  INITIATED: { label: "Đang xử lý", variant: "secondary" },
  CANCELLED: { label: "Đã hủy", variant: "outline" },
};

const typeLabels: Record<string, string> = {
  CONTRACT: "Hợp đồng",
  SERVICE: "Dịch vụ",
};

const providerLabels: Record<string, string> = {
  PAYOS: "PayOS",
  MOMO: "MoMo",
  VNPAY: "VNPay",
  ZALOPAY: "ZaloPay",
};

export function PaymentDetailDialog({
  open,
  onOpenChange,
  paymentId,
  paymentType = "ALL",
}: PaymentDetailDialogProps) {
  const { data: response, isLoading, isError } = useGetAdminPaymentDetail(
    paymentId ?? 0,
    paymentType,
    open && !!paymentId
  );

  const payment = response?.data;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <CreditCard className="size-5 sm:size-6" />
            <span className="break-words">Chi tiết thanh toán</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Thông tin chi tiết về giao dịch thanh toán
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">
              Đang tải thông tin...
            </span>
          </div>
        ) : isError || !payment ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-sm text-destructive">
              Không thể tải thông tin thanh toán
            </span>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Thông tin cơ bản thanh toán */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Wallet className="size-4 sm:size-5" />
                Thông tin thanh toán
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Mã thanh toán
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    #{payment.id}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </label>
                  <div>
                    <Badge
                      variant={
                        statusLabels[payment.status]?.variant || "outline"
                      }
                    >
                      {payment.status === "SUCCEEDED" ? (
                        <>
                          <CheckCircle2 className="mr-1 size-3" />
                          {statusLabels[payment.status]?.label || payment.status}
                        </>
                      ) : payment.status === "FAILED" ? (
                        <>
                          <XCircle className="mr-1 size-3" />
                          {statusLabels[payment.status]?.label || payment.status}
                        </>
                      ) : (
                        statusLabels[payment.status]?.label || payment.status
                      )}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Loại thanh toán
                  </label>
                  <div>
                    <Badge variant="outline">
                      {typeLabels[payment.paymentType] || payment.paymentType}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Phương thức thanh toán
                  </label>
                  <div>
                    <Badge variant="outline">
                      {providerLabels[payment.provider.toUpperCase()] ||
                        payment.provider}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Số tiền
                  </label>
                  <div className="font-semibold text-base sm:text-lg text-primary">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: payment.currency || "VND",
                    }).format(payment.amount)}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Mã giao dịch (Provider)
                  </label>
                  <div className="font-mono text-xs sm:text-sm break-all">
                    {payment.providerTxnId || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Ngày tạo
                  </label>
                  <div className="text-sm sm:text-base">
                    {payment.createdAt
                      ? format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: vi,
                        })
                      : "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Ngày hoàn thành
                  </label>
                  <div className="text-sm sm:text-base">
                    {payment.succeededAt
                      ? format(
                          new Date(payment.succeededAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )
                      : "-"}
                  </div>
                </div>
                {payment.invoiceId && (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Mã hóa đơn
                    </label>
                    <div className="font-medium text-sm sm:text-base">
                      #{payment.invoiceId}
                    </div>
                  </div>
                )}
                {payment.serviceInvoiceId && (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Mã hóa đơn dịch vụ
                    </label>
                    <div className="font-medium text-sm sm:text-base">
                      #{payment.serviceInvoiceId}
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Mã hợp đồng
                  </label>
                  <div className="font-medium text-sm sm:text-base">
                    #{payment.contractId}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin phòng */}
            {payment.unit && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Home className="size-4 sm:size-5" />
                    Thông tin phòng
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Mã phòng
                      </label>
                      <div className="font-medium text-sm sm:text-base">
                        {payment.unit.unitCode}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Tên tòa nhà
                      </label>
                      <div className="text-sm sm:text-base">
                        {payment.unit.propertyName}
                      </div>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <MapPin className="size-3 sm:size-4" />
                        Địa chỉ
                      </label>
                      <div className="text-sm sm:text-base">
                        {[
                          payment.unit.addressLine,
                          payment.unit.ward,
                          payment.unit.district,
                          payment.unit.city,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Thông tin chủ nhà */}
            {payment.landlord && (
              <>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <User className="size-4 sm:size-5" />
                    Thông tin chủ nhà
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                        Tên
                      </label>
                      <div className="font-medium text-sm sm:text-base">
                        {payment.landlord.displayName || "-"}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Mail className="size-3 sm:size-4" />
                        Email
                      </label>
                      <div className="text-sm sm:text-base break-all">
                        {payment.landlord.email}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Phone className="size-3 sm:size-4" />
                        Số điện thoại
                      </label>
                      <div className="text-sm sm:text-base">
                        {payment.landlord.phone || "-"}
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Thông tin người thuê */}
            {payment.tenant && (
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <User className="size-4 sm:size-5" />
                  Thông tin người thuê
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Tên
                    </label>
                    <div className="font-medium text-sm sm:text-base">
                      {payment.tenant.displayName || "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Mail className="size-3 sm:size-4" />
                      Email
                    </label>
                    <div className="text-sm sm:text-base break-all">
                      {payment.tenant.email}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Phone className="size-3 sm:size-4" />
                      Số điện thoại
                    </label>
                    <div className="text-sm sm:text-base">
                      {payment.tenant.phone || "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

