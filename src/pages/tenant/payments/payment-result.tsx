import { PaymentStatusCard } from "@/components/payments/PaymentStatusCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGetPaymentStatus, useSyncPaymentStatus } from "@/hooks/usePayments";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const paymentId = searchParams.get("payment_id") || searchParams.get("id");
  const hasSyncedRef = useRef(false);

  const {
    data: payment,
    isLoading,
    error,
  } = useGetPaymentStatus(paymentId || "", !!paymentId);

  const { mutate: syncPayment, isPending: isSyncing } = useSyncPaymentStatus();

  useEffect(() => {
    // Sync payment when payment is successful and hasn't been synced yet
    if (payment?.status === "SUCCESS" && paymentId && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      // Sync payment status from provider
      syncPayment(paymentId, {
        onSuccess: () => {
          // Reload payment status after sync
          queryClient.invalidateQueries({
            queryKey: ["payment", paymentId],
          });
        },
      });
    }
  }, [payment?.status, paymentId, syncPayment, queryClient]);

  if (!paymentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy mã thanh toán
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/tenant/hop-dong")}
            >
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Loader className="size-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isSyncing
                ? "Đang đồng bộ trạng thái thanh toán..."
                : "Đang tải thông tin thanh toán..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <p className="text-red-500 mb-4">
              {error
                ? "Có lỗi xảy ra khi tải thông tin thanh toán"
                : "Không tìm thấy thông tin thanh toán"}
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/tenant/hop-dong")}
            >
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Kết quả thanh toán</h1>
          <p className="text-muted-foreground">
            Thông tin chi tiết về giao dịch thanh toán của bạn
          </p>
        </div>

        <PaymentStatusCard payment={payment} />

        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/tenant/hop-dong")}
          >
            Quay lại hợp đồng
          </Button>
          {payment.status === "SUCCESS" && (
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                // Navigate to invoice detail or contract detail
                navigate("/tenant/quan-ly-hoa-don");
              }}
            >
              Xem hóa đơn
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
