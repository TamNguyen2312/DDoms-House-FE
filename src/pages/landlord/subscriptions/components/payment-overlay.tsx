import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PaymentOverlayProps {
  paymentUrl: string;
  paymentId: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
  syncPayment: (paymentId: number, options?: any) => void;
}

export function PaymentOverlay({
  paymentUrl,
  paymentId,
  onClose,
  onPaymentSuccess,
  syncPayment,
}: PaymentOverlayProps) {
  const [isChecking, setIsChecking] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const toast = useToast();

  // Polling để check payment status mỗi 3 giây
  useEffect(() => {
    if (!paymentId || isChecking) return;

    // Bắt đầu polling sau 5 giây (để user có thời gian thanh toán)
    const startPolling = setTimeout(() => {
      setIsChecking(true);

      checkIntervalRef.current = setInterval(() => {
        syncPayment(paymentId, {
          onSuccess: (response) => {
            const syncData = response.data;
            if (
              syncData?.status === "SUCCEEDED" ||
              syncData?.status === "success"
            ) {
              // Dừng polling
              if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
              }

              toast.success(
                "Thanh toán thành công! Đang cập nhật thông tin..."
              );
              setIsChecking(false);

              // Gọi callback success
              setTimeout(() => {
                onPaymentSuccess();
              }, 1000);
            }
          },
          onError: (error: AxiosError<{ message?: string }>) => {
            // Không hiển thị lỗi khi đang polling (có thể payment chưa hoàn tất)
            console.log("Payment status check:", error.response?.data?.message);
          },
        });
      }, 3000); // Check mỗi 3 giây
    }, 5000);

    return () => {
      clearTimeout(startPolling);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [paymentId, syncPayment, toast, onPaymentSuccess, isChecking]);

  // Lắng nghe tin nhắn từ iframe (nếu PayOS gửi postMessage)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Chỉ xử lý tin nhắn từ domain PayOS
      if (
        event.origin.includes("payos.vn") ||
        event.origin.includes("pay.payos.vn")
      ) {
        console.log("Message from PayOS:", event.data);

        // Nếu có thông báo thanh toán thành công
        if (
          event.data?.status === "SUCCESS" ||
          event.data?.status === "PAID" ||
          event.data?.code === "00"
        ) {
          // Đồng bộ trạng thái thanh toán
          syncPayment(paymentId, {
            onSuccess: (response) => {
              const syncData = response.data;
              if (
                syncData?.status === "SUCCEEDED" ||
                syncData?.status === "success"
              ) {
                toast.success(
                  "🎉 Thanh toán thành công! Đang cập nhật thông tin..."
                );

                // Dừng polling nếu đang chạy
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                  checkIntervalRef.current = null;
                }

                setIsChecking(false);

                // Gọi callback success sau 1.5 giây để user thấy thông báo
                setTimeout(() => {
                  onPaymentSuccess();
                }, 1500);
              }
            },
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [paymentId, syncPayment, toast, onPaymentSuccess]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Nền mờ */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Container thanh toán */}
      <div className="relative w-full h-full flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-110"
          aria-label="Đóng"
        >
          <X className="size-5 text-gray-900 dark:text-gray-100" />
        </button>

        {/* Iframe thanh toán */}
        <div className="flex-1 w-full h-full p-4">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border-4 border-white/20 bg-white relative">
            <iframe
              ref={iframeRef}
              src={paymentUrl}
              className="w-full h-full border-0"
              title="PayOS Payment"
              allow="payment *"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            />

            {/* Loading indicator khi đang check payment status */}
            {isChecking && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2">
                <div className="size-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Đang kiểm tra trạng thái thanh toán...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
