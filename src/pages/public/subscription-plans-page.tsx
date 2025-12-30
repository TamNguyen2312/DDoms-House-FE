import LoadingCard from "@/components/common/loading-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCheckoutSubscription,
  useSwitchSubscription,
  useSyncSubscriptionPayment,
} from "@/hooks/useLandlordSubscription";
import { usePublicPlans } from "@/hooks/usePublicSubscription";
import { useToast } from "@/hooks/useToast";
import { PaymentOverlay } from "@/pages/landlord/subscriptions/components/payment-overlay";
import { formatVietnamMoney } from "@/utils/formatters";
import { AxiosError } from "axios";
import { Check, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

export default function SubscriptionPlansPage() {
  const { data, isLoading, error } = usePublicPlans({
    status: "ACTIVE",
    includeFeatures: true,
  });

  // Detect context: landlord using /landlord/bang-gia-dich-vu
  const location = useLocation();
  const isLandlordContext = location.pathname.startsWith("/landlord");

  // Toast & payment state (only used in landlord context)
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentUrl: string;
    paymentId: number;
    amount: number;
    subscriptionId: number;
    provider: string;
  } | null>(null);

  // Landlord subscription mutations
  const { mutate: checkoutSubscription, isPending: isCheckingOut } =
    useCheckoutSubscription();
  const { mutate: switchSubscription, isPending: isSwitching } =
    useSwitchSubscription();
  const { mutate: syncPayment, isPending: isSyncing } =
    useSyncSubscriptionPayment();

  const isProcessing = isCheckingOut || isSwitching || isSyncing;

  // Sync payment status when coming back from PayOS (optional, in case provider redirects with paymentId)
  useEffect(() => {
    if (!isLandlordContext) return;

    const paymentIdFromUrl = searchParams.get("paymentId");
    const paymentIdFromStorage = sessionStorage.getItem(
      "pending_subscription_payment_id"
    );
    const paymentId = paymentIdFromUrl || paymentIdFromStorage;

    if (paymentId) {
      const paymentIdNum = parseInt(paymentId, 10);
      if (!isNaN(paymentIdNum)) {
        sessionStorage.removeItem("pending_subscription_payment_id");

        syncPayment(paymentIdNum, {
          onSuccess: (response) => {
            const syncData = response.data;
            if (
              syncData?.status === "SUCCEEDED" ||
              syncData?.status === "success"
            ) {
              toast.success(
                "Thanh toán thành công! Thông tin gói dịch vụ đã được cập nhật."
              );

              // Clean query params from URL if present
              if (paymentIdFromUrl) {
                const url = new URL(window.location.href);
                url.searchParams.delete("paymentId");
                url.searchParams.delete("status");
                window.history.replaceState({}, "", url.toString());
              }
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
  }, [isLandlordContext, searchParams, syncPayment, toast]);

  // Handle landlord buy/switch plan directly from pricing page
  const handleLandlordBuyPlan = (planCode: string) => {
    if (!isLandlordContext) return;

    checkoutSubscription(
      {
        planCode,
        autoRenew: true,
        provider: "PAYOS",
      },
      {
        onSuccess: (response) => {
          const checkoutResponse = response.data;
          let responseData = checkoutResponse?.data;

          if (!responseData && checkoutResponse?.paymentUrl) {
            responseData = checkoutResponse;
          }

          const paymentUrl = responseData?.paymentUrl;
          const paymentId = responseData?.paymentId;
          const amount = responseData?.amount;
          const subscriptionId = responseData?.subscriptionId;
          const provider = responseData?.provider;

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

            setPaymentDialogOpen(true);
          } else {
            toast.error("Không tìm thấy link thanh toán. Vui lòng thử lại.");
          }
        },
        onError: (
          error: AxiosError<{ message?: string; data?: { code?: string } }>
        ) => {
          const errorCode = error.response?.data?.data?.code;
          const errorMessage = error.response?.data?.message;

          if (errorCode === "ACTIVE_SUBSCRIPTION_EXISTS") {
            // Fallback: call switch API with same payload
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

                  if (!responseData && switchResponse?.paymentUrl) {
                    responseData = switchResponse;
                  }

                  const paymentUrl = responseData?.paymentUrl;
                  const paymentId = responseData?.paymentId;
                  const amount = responseData?.amount;
                  const subscriptionId = responseData?.subscriptionId;
                  const provider = responseData?.provider;

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

                    setPaymentDialogOpen(true);
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
            toast.error(errorMessage || "Có lỗi xảy ra khi xử lý gói dịch vụ");
          }
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <LoadingCard
            Icon={Loader2}
            title="Đang tải danh sách gói dịch vụ..."
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
            <p className="text-muted-foreground">
              Không thể tải danh sách gói dịch vụ. Vui lòng thử lại sau.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const plans = data?.data || [];

  // Filter plans: chỉ hiển thị các plan có planId là 1, 2, 3, 4
  const allowedPlanIds = [1, 2, 3, 4];
  const filteredPlans = plans.filter((plan) =>
    allowedPlanIds.includes(plan.planId)
  );

  // Sort plans by price (free first, then ascending)
  const sortedPlans = [...filteredPlans].sort((a, b) => {
    if (a.listPrice === 0) return -1;
    if (b.listPrice === 0) return 1;
    return a.listPrice - b.listPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Bảng Giá Dịch Vụ</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chọn gói dịch vụ phù hợp với nhu cầu của bạn. Tất cả gói đều bao gồm
            hỗ trợ 24/7 và cập nhật thường xuyên.
          </p>
        </div>

        {/* Plans Grid */}
        {sortedPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sortedPlans.map((plan) => {
              const isPopular =
                plan.code === "PLAN_12M" || plan.code === "PLAN_6M";
              const isFree = plan.listPrice === 0;

              return (
                <Card
                  key={plan.planId}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    isPopular ? "border-primary shadow-md" : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                      <Star className="w-3 h-3 inline mr-1" />
                      Phổ biến
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      {isFree && (
                        <Badge variant="secondary" className="ml-2">
                          Miễn phí
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm min-h-[3rem]">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">
                          {isFree
                            ? "Miễn phí"
                            : formatVietnamMoney(plan.listPrice)}
                        </span>
                        {!isFree && (
                          <span className="text-muted-foreground">
                            /
                            {plan.durationMonths === 0
                              ? "vĩnh viễn"
                              : `${plan.durationMonths} tháng`}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    {plan.features && plan.features.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Tính năng:</h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>{feature.name}:</strong> {feature.value}
                                {feature.unit && ` ${feature.unit}`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        <p>Không có tính năng đặc biệt</p>
                      </div>
                    )}

                    {/* CTA Button */}
                    {isLandlordContext ? (
                      <Button
                        className="w-full mt-6"
                        variant={isPopular ? "default" : "outline"}
                        size="lg"
                        disabled={isProcessing}
                        onClick={() => handleLandlordBuyPlan(plan.code)}
                      >
                        {isProcessing
                          ? "Đang xử lý..."
                          : "Mua ngay"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full mt-6"
                        variant={isPopular ? "default" : "outline"}
                        size="lg"
                        asChild
                      >
                        <Link to="/auth/register">Đăng ký ngay</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Hiện tại không có gói dịch vụ nào.
            </p>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Cần tư vấn?{" "}
            <Link to="/lien-he" className="text-primary hover:underline">
              Liên hệ với chúng tôi
            </Link>
          </p>
        </div>
      </div>
      {/* Landlord Payment Overlay */}
      {isLandlordContext && paymentDialogOpen && paymentData && (
        <PaymentOverlay
          paymentUrl={paymentData.paymentUrl}
          paymentId={paymentData.paymentId}
          onClose={() => {
            setPaymentDialogOpen(false);
            setPaymentData(null);
          }}
          onPaymentSuccess={() => {
            setPaymentDialogOpen(false);
            setPaymentData(null);
          }}
          syncPayment={syncPayment}
        />
      )}
    </div>
  );
}
