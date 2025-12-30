import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCheckoutSubscription,
  useLandlordCurrentSubscription,
  useLandlordSubscriptionHistory,
  useSwitchSubscription,
  useSyncSubscriptionPayment,
} from "@/hooks/useLandlordSubscription";
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PaymentOverlay } from "./components/payment-overlay";
import type { ILandlordSubscriptionStatus } from "./types";

const getStatusBadge = (status: ILandlordSubscriptionStatus) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="default" className="gap-1 text-sm h-5 px-2">
          <CheckCircle2 className="size-3" />
          Hoạt động
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="destructive" className="gap-1 text-sm h-5 px-2">
          <XCircle className="size-3" />
          Đã hủy
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="secondary" className="gap-1 text-sm h-5 px-2">
          <Clock className="size-3" />
          Hết hạn
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge variant="outline" className="gap-1 text-sm h-5 px-2">
          <AlertCircle className="size-3" />
          Tạm dừng
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1 text-sm h-5 px-2">
          <Clock className="size-3" />
          Chờ xử lý
        </Badge>
      );
  }
};

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

const LandlordSubscriptionsPage = () => {
  const [page, setPage] = useState(0);
  const [size] = useState(30);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentUrl: string;
    paymentId: number;
    amount: number;
    subscriptionId: number;
    provider: string;
  } | null>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy subscription hiện tại
  const {
    data: currentSubscription,
    isLoading: isLoadingCurrent,
    error: errorCurrent,
    refetch: refetchCurrentSubscription,
  } = useLandlordCurrentSubscription();

  // State để track subscription mới sau khi thanh toán
  const [newSubscriptionId, setNewSubscriptionId] = useState<number | null>(
    null
  );

  // Fetch subscription history
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: errorHistory,
    refetch: refetchHistory,
  } = useLandlordSubscriptionHistory({
    page,
    size,
    sort: "startedAt",
    direction: "DESC",
  });

  // Mutation checkout subscription (cho cả mua mới và chuyển đổi)
  const { mutate: checkoutSubscription, isPending: isCheckingOut } =
    useCheckoutSubscription();

  // Mutation switch subscription (fallback khi checkout báo lỗi ACTIVE_SUBSCRIPTION_EXISTS)
  const { mutate: switchSubscription, isPending: isSwitching } =
    useSwitchSubscription();

  // Mutation đồng bộ thanh toán
  const { mutate: syncPayment, isPending: isSyncing } =
    useSyncSubscriptionPayment();

  // Kiểm tra payment ID trong URL params hoặc sessionStorage và đồng bộ trạng thái thanh toán
  useEffect(() => {
    // Kiểm tra URL params trước (từ PayOS redirect)
    const paymentIdFromUrl = searchParams.get("paymentId");
    // Kiểm tra sessionStorage (từ checkout)
    const paymentIdFromStorage = sessionStorage.getItem(
      "pending_subscription_payment_id"
    );

    const paymentId = paymentIdFromUrl || paymentIdFromStorage;

    if (paymentId) {
      const paymentIdNum = parseInt(paymentId, 10);
      if (!isNaN(paymentIdNum)) {
        // Xóa khỏi sessionStorage để tránh đồng bộ trùng lặp
        sessionStorage.removeItem("pending_subscription_payment_id");

        // Đồng bộ trạng thái thanh toán
        syncPayment(paymentIdNum, {
          onSuccess: (response) => {
            const syncData = response.data;
            if (
              syncData?.status === "SUCCEEDED" ||
              syncData?.status === "success"
            ) {
              toast.success(
                "Thanh toán thành công! Đang cập nhật thông tin subscription..."
              );

              // Lưu subscriptionId để highlight sau
              if (syncData?.subscriptionId) {
                setNewSubscriptionId(syncData.subscriptionId);
              }

              // Làm mới dữ liệu subscription
              Promise.all([
                refetchCurrentSubscription(),
                refetchHistory(),
              ]).then(() => {
                // Xóa paymentId khỏi URL nếu có
                if (paymentIdFromUrl) {
                  const url = new URL(window.location.href);
                  url.searchParams.delete("paymentId");
                  url.searchParams.delete("status");
                  window.history.replaceState({}, "", url.toString());
                }

                // Scroll to top để user thấy thay đổi
                window.scrollTo({ top: 0, behavior: "smooth" });

                // Clear highlight sau 5 giây
                setTimeout(() => {
                  setNewSubscriptionId(null);
                }, 5000);
              });
            } else {
              toast.info(
                "Đang xử lý thanh toán... Vui lòng đợi trong giây lát."
              );
            }
          },
          onError: (error: AxiosError<{ message?: string }>) => {
            toast.error(
              error.response?.data?.message ||
                "Có lỗi xảy ra khi đồng bộ trạng thái thanh toán"
            );
            // Vẫn xóa paymentId khỏi URL ngay cả khi có lỗi
            if (paymentIdFromUrl) {
              const url = new URL(window.location.href);
              url.searchParams.delete("paymentId");
              url.searchParams.delete("status");
              window.history.replaceState({}, "", url.toString());
            }
          },
        });
      }
    }
  }, [
    searchParams,
    syncPayment,
    toast,
    refetchCurrentSubscription,
    refetchHistory,
  ]);

  const handleSelectPlan = (planCode: string) => {
    // Luôn gọi checkout API (cho cả mua mới và chuyển đổi)
    checkoutSubscription(
      {
        planCode,
        autoRenew: true,
        provider: "PAYOS",
      },
      {
        onSuccess: (response) => {
          console.log("Checkout subscription full response:", response);

          // Cấu trúc response: ApiResponse<CheckoutSubscriptionResponse>
          // response.data = CheckoutSubscriptionResponse { success, message, status, data: {...} }
          const checkoutResponse = response.data;

          // Thử lấy dữ liệu từ cấu trúc lồng nhau
          let responseData = checkoutResponse?.data;

          // Fallback: nếu response.data đã là object dữ liệu
          if (!responseData && checkoutResponse?.paymentUrl) {
            responseData = checkoutResponse;
          }

          console.log("Checkout response data:", {
            checkoutResponse,
            responseData,
            paymentUrl: responseData?.paymentUrl,
            paymentId: responseData?.paymentId,
            amount: responseData?.amount,
            subscriptionId: responseData?.subscriptionId,
            provider: responseData?.provider,
          });

          const paymentUrl = responseData?.paymentUrl;
          const paymentId = responseData?.paymentId;
          const amount = responseData?.amount;
          const subscriptionId = responseData?.subscriptionId;
          const provider = responseData?.provider;

          // Nếu có paymentUrl thì hiển thị dialog thanh toán
          if (paymentUrl) {
            console.log("Opening payment dialog with:", {
              paymentUrl,
              paymentId,
              amount,
              subscriptionId,
              provider,
            });

            // Lưu paymentId để sync sau khi quay lại (nếu có)
            if (paymentId) {
              sessionStorage.setItem(
                "pending_subscription_payment_id",
                paymentId.toString()
              );
            }

            // Lưu thông tin thanh toán và hiển thị dialog
            setPaymentData({
              paymentUrl,
              paymentId: paymentId || 0,
              amount: amount || 0,
              subscriptionId: subscriptionId || 0,
              provider: provider || "PAYOS",
            });

            // Mở dialog thanh toán
            setTimeout(() => {
              setPaymentDialogOpen(true);
            }, 100);
          } else {
            console.warn("No paymentUrl in response:", {
              paymentUrl,
              paymentId,
              responseData,
              checkoutResponse,
            });
            toast.error("Không tìm thấy link thanh toán. Vui lòng thử lại.");
          }
        },
        onError: (
          error: AxiosError<{ message?: string; data?: { code?: string } }>
        ) => {
          const errorCode = error.response?.data?.data?.code;
          const errorMessage = error.response?.data?.message;

          // Nếu lỗi là ACTIVE_SUBSCRIPTION_EXISTS, tự động chuyển sang switch API
          if (errorCode === "ACTIVE_SUBSCRIPTION_EXISTS") {
            console.log(
              "Active subscription exists, switching to switch API..."
            );

            // Gọi switch API với cùng input
            switchSubscription(
              {
                planCode,
                autoRenew: true,
                provider: "PAYOS",
              },
              {
                onSuccess: (response) => {
                  const switchResponse = response.data;
                  let responseData = switchResponse?.data;

                  // Fallback: nếu response.data đã là object dữ liệu
                  if (!responseData && switchResponse?.paymentUrl) {
                    responseData = switchResponse;
                  }

                  console.log("Switch subscription response:", {
                    switchResponse,
                    responseData,
                    paymentUrl: responseData?.paymentUrl,
                    paymentId: responseData?.paymentId,
                  });

                  const paymentUrl = responseData?.paymentUrl;
                  const paymentId = responseData?.paymentId;
                  const amount = responseData?.amount;
                  const subscriptionId = responseData?.subscriptionId;
                  const provider = responseData?.provider;

                  // Nếu có paymentUrl thì hiển thị overlay thanh toán
                  if (paymentUrl) {
                    if (paymentId) {
                      sessionStorage.setItem(
                        "pending_subscription_payment_id",
                        paymentId.toString()
                      );
                    }

                    setPaymentData({
                      paymentUrl,
                      paymentId: paymentId || 0,
                      amount: amount || 0,
                      subscriptionId: subscriptionId || 0,
                      provider: provider || "PAYOS",
                    });

                    setTimeout(() => {
                      setPaymentDialogOpen(true);
                    }, 100);
                  } else {
                    toast.error(
                      "Không tìm thấy link thanh toán. Vui lòng thử lại."
                    );
                  }
                },
                onError: (switchError: AxiosError<{ message?: string }>) => {
                  toast.error(
                    switchError.response?.data?.message ||
                      "Có lỗi xảy ra khi chuyển đổi gói dịch vụ"
                  );
                },
              }
            );
          } else {
            // Các lỗi khác thì hiển thị thông báo lỗi
            toast.error(errorMessage || "Có lỗi xảy ra khi xử lý gói dịch vụ");
          }
        },
      }
    );
  };

  const isProcessing = isCheckingOut || isSwitching || isSyncing;

  if (isLoadingCurrent) {
    return (
      <LoadingCard Icon={Loader2} title="Đang tải thông tin subscription..." />
    );
  }

  if (errorCurrent) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-destructive">
        Có lỗi xảy ra khi tải thông tin subscription. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <SitePageTitle
            title="Gói dịch vụ"
            subTitle="Quản lý subscription và lịch sử đăng ký của bạn"
            hideCreate={true}
            hidePrint={true}
            hideImport={true}
          />
        </div>
        <Button
          onClick={() => navigate("/landlord/bang-gia-dich-vu")}
          className="gap-2"
        >
          <ShoppingCart className="size-4" />
          {currentSubscription ? "Chuyển đổi gói" : "Mua gói dịch vụ"}
        </Button>
      </div>

      {/* Card Subscription hiện tại */}
      {currentSubscription && (
        <Card
          className={`transition-all duration-500 ${
            newSubscriptionId === currentSubscription.subscriptionId
              ? "ring-2 ring-primary ring-offset-2 shadow-lg animate-in zoom-in-50"
              : ""
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Package className="size-5" />
              Gói dịch vụ hiện tại
              {newSubscriptionId === currentSubscription.subscriptionId && (
                <Badge variant="default" className="ml-2 animate-pulse">
                  Mới
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-2 md:grid-cols-1">
              <div className="">
                <span className="font-semibold mr-1">Tên gói:</span>
                <span className="text-sm">{currentSubscription.planName}</span>
              </div>
              <div className="">
                <span className="font-semibold">Mã gói: </span>
                <span className="text-sm">{currentSubscription.planCode}</span>
              </div>
              <div className="">
                <span className="font-semibold mr-1">Trạng thái: </span>
                {getStatusBadge(currentSubscription.status)}
              </div>
              <div className="">
                <span className="font-semibold mr-1">Giá niêm yết:</span>
                <span className="text-sm">
                  {formatCurrency(currentSubscription.listPrice)}
                </span>
              </div>
              <div className="">
                <span className="font-semibold mr-1">Ngày bắt đầu:</span>
                <span className="text-sm">
                  {formatDate(currentSubscription.startedAt)}
                </span>
              </div>
              {currentSubscription.expiresAt && (
                <div className="">
                  <span className="font-semibold mr-1">Ngày hết hạn: </span>
                  <span className="text-sm">
                    {formatDate(currentSubscription.expiresAt)}
                  </span>
                </div>
              )}
              {currentSubscription.daysRemaining !== null && (
                <div className="">
                  <span className="font-semibold mr-1">Số ngày còn lại: </span>
                  <span className="text-sm">
                    {currentSubscription.daysRemaining} ngày
                  </span>
                </div>
              )}
              {/* <div className="">
                <span className="font-semibold mr-1">Tự động gia hạn: </span>
                <Badge
                  variant={
                    currentSubscription.autoRenew ? "default" : "outline"
                  }
                  className="text-sm h-5 px-2"
                >
                  {currentSubscription.autoRenew ? "Có" : "Không"}
                </Badge>
              </div> */}
            </div>
            {currentSubscription.planDescription && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-1">Mô tả</p>
                <p className="text-sm">{currentSubscription.planDescription}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lịch sử Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Calendar className="size-5" />
            Lịch sử đăng ký
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <LoadingCard Icon={Loader2} title="Đang tải lịch sử..." />
          ) : errorHistory ? (
            <div className="rounded-lg border border-destructive p-4 text-destructive">
              Có lỗi xảy ra khi tải lịch sử. Vui lòng thử lại sau.
            </div>
          ) : !historyData?.content || historyData.content.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có lịch sử đăng ký
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Mã gói</TableHead>
                      <TableHead className="text-left">Tên gói</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead className="text-center">Trạng thái</TableHead>
                      <TableHead className="text-center">
                        Ngày bắt đầu
                      </TableHead>
                      <TableHead className="text-center">
                        Ngày hết hạn
                      </TableHead>
                      <TableHead className="text-center">
                        Số ngày còn lại
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.content.map((item) => {
                      const isNew = newSubscriptionId === item.subscriptionId;
                      return (
                        <TableRow
                          key={item.subscriptionId}
                          className={`transition-all duration-300 ${
                            isNew
                              ? "bg-primary/10 ring-2 ring-primary/50 animate-in fade-in-50"
                              : ""
                          }`}
                        >
                          <TableCell className="font-medium text-left">
                            <div className="flex items-center gap-2">
                              {item.planCode}
                              {isNew && (
                                <Badge
                                  variant="default"
                                  className="text-xs animate-pulse"
                                >
                                  Mới
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-left">
                            {item.planName}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.listPrice)}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDate(item.startedAt)}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.expiresAt
                              ? formatDate(item.expiresAt)
                              : "Không giới hạn"}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.daysRemaining !== null
                              ? `${item.daysRemaining} ngày`
                              : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Phân trang */}
              {historyData.pagination &&
                historyData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Trang {historyData.pagination.currentPage + 1} /{" "}
                      {historyData.pagination.totalPages} (
                      {historyData.pagination.totalElements} bản ghi)
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={!historyData.pagination.hasPrevious}
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Trước
                      </button>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!historyData.pagination.hasNext}
                        className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overlay thanh toán toàn màn hình */}
      {paymentDialogOpen && paymentData && (
        <PaymentOverlay
          paymentUrl={paymentData.paymentUrl}
          paymentId={paymentData.paymentId}
          onClose={() => {
            setPaymentDialogOpen(false);
            setPaymentData(null);
          }}
          onPaymentSuccess={() => {
            // Làm mới dữ liệu subscription sau khi thanh toán thành công
            Promise.all([refetchCurrentSubscription(), refetchHistory()]).then(
              () => {
                setPaymentDialogOpen(false);
                setPaymentData(null);

                // Cuộn lên đầu để người dùng thấy thay đổi
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            );
          }}
          syncPayment={syncPayment}
        />
      )}
    </div>
  );
};

export default LandlordSubscriptionsPage;
