import { PaymentStatusCard } from "@/components/payments/PaymentStatusCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSyncTenantServicePaymentStatus } from "@/hooks/useInvoices";
import { useGetPaymentStatus, useSyncPaymentStatus } from "@/hooks/usePayments";
import { useToast } from "@/hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CheckCircle, Loader, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PaymentResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId?: string | number;
  paymentUrl?: string;
  onSuccess?: () => void;
  isServicePayment?: boolean; // Flag to determine if this is a service payment
}

export function PaymentResultDialog({
  open,
  onOpenChange,
  paymentId,
  paymentUrl,
  onSuccess,
  isServicePayment = false,
}: PaymentResultDialogProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const hasSyncedRef = useRef(false);
  const [isChecking, setIsChecking] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Convert paymentId to string for API calls
  const paymentIdString = paymentId ? String(paymentId) : "";

  const {
    data: payment,
    isLoading,
    error,
  } = useGetPaymentStatus(paymentIdString, open && !!paymentIdString);

  // Sync functions for different payment types
  const { mutate: syncPayment, isPending: isSyncing } = useSyncPaymentStatus(); // Hóa đơn thường: /api/payments/{id}/sync
  const { mutate: syncServicePayment, isPending: isSyncingService } =
    useSyncTenantServicePaymentStatus(); // Hóa đơn dịch vụ: /api/tenant/service-payments/{id}/sync

  // Use appropriate sync function based on payment type
  // Regular invoice: POST /api/payments/{payment_id}/sync
  // Service invoice: POST /api/tenant/service-payments/{service_payment_id}/sync
  const syncPaymentFn = isServicePayment ? syncServicePayment : syncPayment;
  const isSyncingPayment = isServicePayment ? isSyncingService : isSyncing;

  // Helper function to handle successful payment UI
  const handlePaymentSuccess = useCallback(() => {
              // Stop polling
              if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
              }

    toast.success("Thanh toán thành công! Đang cập nhật thông tin...");
              setIsChecking(false);
              hasSyncedRef.current = true;

              // Invalidate queries to refresh data
              queryClient.invalidateQueries({
                queryKey: ["payment", paymentIdString],
              });
              queryClient.invalidateQueries({
                queryKey: ["invoices"],
              });
              if (isServicePayment) {
                queryClient.invalidateQueries({
                  queryKey: ["invoices", "service"],
                });
              }
              queryClient.invalidateQueries({
                queryKey: ["contracts"],
              });

              // Call success callback after a delay
              setTimeout(() => {
                onSuccess?.();
              }, 1500);
  }, [
    paymentIdString,
    isServicePayment,
    toast,
    queryClient,
    onSuccess,
  ]);

  // Helper function to sync payment khi detect thanh toán thành công
  // Áp dụng cho CẢ hóa đơn thường và hóa đơn dịch vụ
  // Vì PayOS webhook có thể không call được API BE, nên cần sync ngay khi detect success
  // syncPaymentFn tự động chọn đúng API:
  // - Hóa đơn thường: POST /api/payments/{paymentId}/sync
  // - Hóa đơn dịch vụ: POST /api/tenant/service-payments/{servicePaymentId}/sync
  const syncPaymentOnSuccess = useCallback(() => {
    if (!paymentIdString || hasSyncedRef.current) return;
    
    console.log(
      `Payment success detected - syncing immediately to update BE (${isServicePayment ? "SERVICE" : "REGULAR"}):`,
      paymentIdString
    );
    hasSyncedRef.current = true;
    
    syncPaymentFn(paymentIdString, {
      onSuccess: (response) => {
        const syncData = response.data;
        console.log("Sync response after payment success:", syncData);
        
        // Refresh data sau khi sync thành công
        queryClient.invalidateQueries({
          queryKey: ["payment", paymentIdString],
        });
        queryClient.invalidateQueries({
          queryKey: ["invoices"],
        });
        if (isServicePayment) {
          queryClient.invalidateQueries({
            queryKey: ["invoices", "service"],
          });
        }
        queryClient.invalidateQueries({
          queryKey: ["contracts"],
        });
        
        // Hiển thị UI success
        handlePaymentSuccess();
      },
      onError: (error: AxiosError<{ message?: string }>) => {
        console.error("Sync error after payment success:", error);
        // Reset flag để có thể retry
        hasSyncedRef.current = false;
        // Vẫn hiển thị success message (vì PayOS đã confirm thành công)
        // Sync có thể retry sau, nhưng user đã thanh toán thành công rồi
        handlePaymentSuccess();
      },
    });
  }, [
    paymentIdString,
    syncPaymentFn,
    queryClient,
    isServicePayment,
    handlePaymentSuccess,
  ]);

  // Polling to sync payment status continuously when dialog is open
  // Áp dụng cho CẢ hóa đơn thường và hóa đơn dịch vụ
  // syncPaymentFn tự động chọn đúng API dựa trên isServicePayment flag
  useEffect(() => {
    if (!open || !paymentIdString) return;

    // Nếu có paymentUrl (PayOS/MoMo/VNPay) thì người dùng CẦN thanh toán
    // KHÔNG hiển thị success ngay dù payment status có thể là SUCCESS (có thể là cache cũ)
    // Chỉ hiển thị success khi thực sự đã thanh toán (từ postMessage, polling, hoặc khi đóng dialog)
    if (paymentUrl) {
      // Có payment URL - cần đợi người dùng thanh toán, không check status ngay
      // Chỉ bắt đầu polling
    } else if ((payment?.status === "SUCCESS" || payment?.status === "SUCCEEDED") && !hasSyncedRef.current) {
      // Không có payment URL (có thể là payment đã hoàn tất) - sync ngay
      console.log(
        `Payment is already SUCCESS (no payment URL), syncing immediately (${isServicePayment ? "SERVICE" : "REGULAR"})...`
      );
      syncPaymentOnSuccess();
      return; // Không cần polling nữa
    }

    // Clear any existing interval first
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }

    // Start polling immediately when dialog opens (no delay)
    setIsChecking(true);

    checkIntervalRef.current = setInterval(() => {
      // Check if payment is already successful before syncing
      if (hasSyncedRef.current) {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        return;
      }

      syncPaymentFn(paymentIdString, {
        onSuccess: (response) => {
          const syncData = response.data;
          console.log("Polling sync response:", syncData);
          
          // Nếu sync confirm thanh toán thành công
          if (
            syncData?.status === "SUCCEEDED" ||
            syncData?.status === "SUCCESS" ||
            syncData?.status === "success"
          ) {
            // Đã sync thành công, hiển thị UI
            handlePaymentSuccess();
            }
          },
          onError: (error: AxiosError<{ message?: string }>) => {
            // Don't show error during polling (payment might not be complete yet)
          // Only log for debugging
          if (error.response?.status !== 404) {
            console.log("Payment status check:", error.response?.data?.message);
          }
          },
        });
      }, 3000); // Check every 3 seconds

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      setIsChecking(false);
    };
  }, [
    open,
    paymentIdString,
    syncPaymentFn,
    handlePaymentSuccess,
    payment?.status,
    syncPaymentOnSuccess,
  ]);

  // Listen for messages from iframe (if PayOS sends postMessage)
  // Áp dụng cho CẢ hóa đơn thường và hóa đơn dịch vụ
  useEffect(() => {
    if (!open || !paymentUrl || !paymentIdString) return;

    const handleMessage = (event: MessageEvent) => {
      // Only handle messages from PayOS domain
      if (
        event.origin.includes("payos.vn") ||
        event.origin.includes("pay.payos.vn")
      ) {
        console.log("Message from PayOS:", event.data);

        // If payment success notification from PayOS
        // Áp dụng cho cả 2 loại: regular và service invoice
        if (
          event.data?.status === "SUCCESS" ||
          event.data?.status === "PAID" ||
          event.data?.code === "00" ||
          event.data?.code === 0
        ) {
          console.log(
            `PayOS payment success detected via postMessage, syncing immediately (${isServicePayment ? "SERVICE" : "REGULAR"})...`
          );
          
          // Gọi sync ngay khi PayOS confirm thành công (vì webhook có thể không call được)
          // syncPaymentFn tự động chọn đúng API cho cả 2 loại
          syncPaymentOnSuccess();
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [
    open,
    paymentUrl,
    paymentIdString,
    syncPaymentOnSuccess,
  ]);

  // Auto-sync when payment status becomes SUCCESS (from query)
  // Áp dụng cho CẢ hóa đơn thường và hóa đơn dịch vụ
  // CHỈ sync nếu KHÔNG có paymentUrl (nghĩa là không cần thanh toán qua iframe)
  // Nếu có paymentUrl, đợi người dùng thanh toán trước (qua postMessage hoặc polling)
  useEffect(() => {
    // Chỉ sync nếu:
    // 1. Dialog đang mở
    // 2. Payment status là SUCCESS
    // 3. Có paymentId
    // 4. Chưa sync
    // 5. KHÔNG có paymentUrl (vì nếu có paymentUrl thì cần đợi người dùng thanh toán)
    if (
      open &&
      (payment?.status === "SUCCESS" || payment?.status === "SUCCEEDED") &&
      paymentIdString &&
      !hasSyncedRef.current &&
      !paymentUrl // CHỈ sync nếu KHÔNG có payment URL (không cần thanh toán)
    ) {
      console.log(
        `Payment status is SUCCESS (no payment URL), syncing immediately (${isServicePayment ? "SERVICE" : "REGULAR"})...`
      );
      // Gọi sync ngay khi detect payment status = SUCCESS và không có payment URL
      syncPaymentOnSuccess();
    }
  }, [
    open,
    payment?.status,
    paymentIdString,
    syncPaymentOnSuccess,
    isServicePayment,
    paymentUrl, // Thêm paymentUrl vào dependency
  ]);

  // Sync payment when dialog closes (backup - nếu handleClose không được gọi)
  // Áp dụng cho CẢ hóa đơn thường và hóa đơn dịch vụ
  // syncPaymentFn tự động chọn đúng API dựa trên isServicePayment flag
  useEffect(() => {
    // Detect khi dialog đóng: open từ true -> false
    // Chỉ sync nếu chưa sync qua handleClose
    if (!open && paymentIdString && !hasSyncedRef.current) {
      console.log(
        `Dialog closed (detected via useEffect) - syncing payment (${isServicePayment ? "SERVICE" : "REGULAR"}):`,
        paymentIdString
      );
      syncPaymentFn(paymentIdString, {
        onSuccess: () => {
          console.log("Payment synced successfully on dialog close (via useEffect)");
          // Refresh data
          queryClient.invalidateQueries({
            queryKey: ["payment", paymentIdString],
          });
          queryClient.invalidateQueries({
            queryKey: ["invoices"],
          });
          if (isServicePayment) {
            queryClient.invalidateQueries({
              queryKey: ["invoices", "service"],
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["contracts"],
          });
        },
        onError: (syncError: unknown) => {
          // Log error nhưng không hiển thị (non-blocking)
          console.log(
            "Sync error on dialog close (non-blocking):",
            (syncError as { response?: { data?: { message?: string } } })
              ?.response?.data?.message
          );
        },
      });
      hasSyncedRef.current = true;
    }
  }, [open, paymentIdString, syncPaymentFn, queryClient, isServicePayment]);

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset checking state
      setIsChecking(false);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      // Note: Không reset hasSyncedRef ở đây vì cần để track đã sync chưa
    } else {
      // Reset sync flag khi mở dialog mới
      hasSyncedRef.current = false;
    }
  }, [open]);

  const handleClose = () => {
    // Sync trước khi đóng dialog (nếu chưa sync)
    // Áp dụng cho CẢ hóa đơn thường và hóa đơn dịch vụ
    // syncPaymentFn tự động chọn đúng API dựa trên isServicePayment flag
    if (paymentIdString && !hasSyncedRef.current) {
      console.log(
        `User closed dialog - syncing payment (${isServicePayment ? "SERVICE" : "REGULAR"}):`,
        paymentIdString
      );
      syncPaymentFn(paymentIdString, {
        onSuccess: () => {
          console.log("Payment synced successfully before dialog close");
          // Refresh data
          queryClient.invalidateQueries({
            queryKey: ["payment", paymentIdString],
          });
          queryClient.invalidateQueries({
            queryKey: ["invoices"],
          });
          if (isServicePayment) {
            queryClient.invalidateQueries({
              queryKey: ["invoices", "service"],
            });
          }
          queryClient.invalidateQueries({
            queryKey: ["contracts"],
          });
        },
        onError: (syncError: unknown) => {
          // Log error nhưng vẫn đóng dialog
          console.log(
            "Sync error before dialog close (non-blocking):",
            (syncError as { response?: { data?: { message?: string } } })
              ?.response?.data?.message
          );
        },
      });
      hasSyncedRef.current = true;
    }
    onOpenChange(false);
  };

  // Show iframe with payment URL (full screen)
  // Nhúng link PayOS trong iframe, không chuyển trang, full màn hình
  if (paymentUrl && open) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="fixed !top-0 !left-0 !right-0 !bottom-0 w-screen h-screen !max-w-none !max-h-none p-0 m-0 !rounded-none !translate-x-0 !translate-y-0 z-[100] !grid-cols-1"
          showCloseButton={false}
        >
          <div className="flex flex-col h-full w-full bg-white">
            {/* Header với nút đóng */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-white">
                <div>
                <h2 className="text-lg font-semibold">Thanh toán qua PayOS</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Vui lòng hoàn tất thanh toán trong form bên dưới. Vui lòng không đóng cửa sổ này.
                </p>
                </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClose}
                className="shrink-0"
              >
                  <X className="size-5" />
                </Button>
              </div>

            {/* Iframe chứa link thanh toán PayOS - full màn, không redirect */}
            <div className="relative flex-1 w-full overflow-hidden bg-gray-50">
              <iframe
                ref={iframeRef}
                src={paymentUrl}
                className="w-full h-full border-0"
                title="PayOS Payment"
                allow="payment *; camera *; microphone *"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                loading="eager"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />

              {/* Loading indicator when checking payment status */}
              {isChecking && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 z-10 border">
                  <Loader className="size-4 animate-spin text-primary" />
                  <span className="text-sm font-medium text-gray-900">
                    Đang kiểm tra trạng thái thanh toán...
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show loading state
  if (isLoading || isSyncingPayment) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đang xử lý thanh toán</DialogTitle>
            <DialogDescription>
              {isSyncing
                ? "Đang đồng bộ trạng thái thanh toán..."
                : "Đang tải thông tin thanh toán..."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader className="size-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              {isSyncingPayment
                ? "Đang đồng bộ trạng thái thanh toán với nhà cung cấp..."
                : "Vui lòng đợi trong giây lát..."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show error state
  if (error || (!payment && !paymentUrl)) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="size-5" />
              Lỗi thanh toán
            </DialogTitle>
            <DialogDescription>
              {error
                ? "Có lỗi xảy ra khi tải thông tin thanh toán"
                : "Không tìm thấy thông tin thanh toán"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              {error
                ? "Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục."
                : "Không thể tìm thấy thông tin thanh toán. Vui lòng kiểm tra lại."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Show payment result (chỉ khi KHÔNG có paymentUrl - vì nếu có paymentUrl thì đã hiển thị iframe ở trên)
  if (payment && !paymentUrl) {
    const isSuccess = payment.status === "SUCCESS";

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isSuccess ? (
                <>
                  <CheckCircle className="size-5 text-green-500" />
                  Thanh toán thành công
                </>
              ) : (
                "Kết quả thanh toán"
              )}
            </DialogTitle>
            <DialogDescription>
              {isSuccess
                ? "Giao dịch thanh toán của bạn đã được xử lý thành công"
                : "Thông tin chi tiết về giao dịch thanh toán"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <PaymentStatusCard payment={payment} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Đóng
            </Button>
            {isSuccess && (
              <Button
                onClick={() => {
                  handleClose();
                  onSuccess?.();
                }}
              >
                Xem hóa đơn
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}

