import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCancelPayment, useSyncPaymentStatus } from "@/hooks/usePayments";
import type { PaymentDetail } from "@/types/payment.types";
import { format } from "date-fns";
import { RefreshCw, X, CheckCircle, XCircle, Clock, Loader } from "lucide-react";

interface PaymentStatusCardProps {
  payment: PaymentDetail;
  onRefresh?: () => void;
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Đang chờ",
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="size-4" />,
  },
  PROCESSING: {
    label: "Đang xử lý",
    color: "bg-blue-100 text-blue-800",
    icon: <Loader className="size-4 animate-spin" />,
  },
  SUCCESS: {
    label: "Thành công",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="size-4" />,
  },
  FAILED: {
    label: "Thất bại",
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="size-4" />,
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "bg-gray-100 text-gray-800",
    icon: <X className="size-4" />,
  },
  EXPIRED: {
    label: "Hết hạn",
    color: "bg-gray-100 text-gray-800",
    icon: <XCircle className="size-4" />,
  },
};

export function PaymentStatusCard({
  payment,
  onRefresh,
}: PaymentStatusCardProps) {
  const { mutate: syncPayment, isPending: isSyncing } = useSyncPaymentStatus();
  const { mutate: cancelPayment, isPending: isCancelling } =
    useCancelPayment();

  const statusInfo = statusConfig[payment.status] || {
    label: payment.status,
    color: "bg-gray-100 text-gray-800",
    icon: null,
  };

  const canCancel =
    payment.status === "PENDING" || payment.status === "PROCESSING";
  const canSync = payment.status === "PENDING" || payment.status === "PROCESSING";

  const handleSync = () => {
    syncPayment(payment.id, {
      onSuccess: () => {
        onRefresh?.();
      },
    });
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy thanh toán này? Hành động này không thể hoàn tác."
      )
    ) {
      cancelPayment(payment.id, {
        onSuccess: () => {
          onRefresh?.();
        },
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Trạng thái thanh toán
          </CardTitle>
          <Badge className={`${statusInfo.color} flex items-center gap-1`}>
            {statusInfo.icon}
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mã thanh toán:</span>
            <span className="font-medium">{payment.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nhà cung cấp:</span>
            <span className="font-medium">{payment.provider}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Số tiền:</span>
            <span className="font-medium">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(payment.amount)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mã đơn hàng:</span>
            <span className="font-medium">{payment.orderId}</span>
          </div>
          {payment.providerOrderId && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mã đơn (Provider):</span>
              <span className="font-medium">{payment.providerOrderId}</span>
            </div>
          )}
          {payment.createdAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ngày tạo:</span>
              <span className="font-medium">
                {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
          )}
          {payment.paidAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ngày thanh toán:</span>
              <span className="font-medium">
                {format(new Date(payment.paidAt), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
          )}
          {payment.expiresAt && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hết hạn:</span>
              <span className="font-medium">
                {format(new Date(payment.expiresAt), "dd/MM/yyyy HH:mm")}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {(canSync || canCancel) && (
          <div className="flex gap-2 pt-4 border-t">
            {canSync && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1"
              >
                <RefreshCw
                  className={`mr-2 size-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                Đồng bộ
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1"
              >
                <X className="mr-2 size-4" />
                Hủy thanh toán
              </Button>
            )}
          </div>
        )}

        {/* Payment URL / QR Code */}
        {payment.paymentUrl && canCancel && (
          <div className="pt-4 border-t">
            <Button
              variant="default"
              className="w-full"
              onClick={() => {
                window.open(payment.paymentUrl, "_blank");
              }}
            >
              Thanh toán ngay
            </Button>
          </div>
        )}

        {payment.qrCode && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">QR Code:</p>
            <img
              src={payment.qrCode}
              alt="Payment QR Code"
              className="w-full max-w-xs mx-auto"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}




