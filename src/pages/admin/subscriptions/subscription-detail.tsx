import EmptyData from "@/components/common/empty-data";
import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscriptionById } from "@/hooks/useSubscriptionManagement";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  User,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ISubscriptionDetail } from "./types";

const SubscriptionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get from location state first, then fetch from API
  const subscriptionFromState = location.state?.subscription as
    | ISubscriptionDetail
    | undefined;

  const subscriptionId = id ? Number(id) : 0;
  const { data: subscription, isLoading } = useSubscriptionById(subscriptionId);

  const subscriptionData = subscriptionFromState || subscription;

  if (isLoading && !subscriptionFromState) {
    return (
      <div className="container mx-auto">
        <LoadingCard Icon={Loader2} title="Đang tải chi tiết subscription..." />
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="container mx-auto">
        <EmptyData
          title="Không tìm thấy subscription"
          description="Subscription bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        />
        <div className="mt-4">
          <Button onClick={() => navigate("/admin/quan-ly-dang-ky")}>
            <ArrowLeft className="mr-2 size-4" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge variant="default" className="gap-0.5 text-xs h-4 px-1.5">
            <CheckCircle2 className="size-2" />
            Hoạt động
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="gap-0.5 text-xs h-4 px-1.5">
            <XCircle className="size-2" />
            Đã hủy
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge variant="secondary" className="gap-0.5 text-xs h-4 px-1.5">
            <Clock className="size-2" />
            Hết hạn
          </Badge>
        );
      case "SUSPENDED":
        return (
          <Badge variant="outline" className="gap-0.5 text-xs h-4 px-1.5">
            <AlertCircle className="size-2" />
            Tạm dừng
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-0.5 text-xs h-4 px-1.5">
            <Clock className="size-2" />
            Chờ xử lý
          </Badge>
        );
    }
  };

  return (
    <div className="mx-auto space-y-1.5">
      <div className="mb-1.5">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/quan-ly-dang-ky")}
          className="mb-1"
        >
          <ArrowLeft className="mr-2 size-4" />
          Quay lại
        </Button>
        <SitePageTitle
          title={`Subscription #${subscriptionData.subscriptionId}`}
          subTitle="Chi tiết subscription của landlord"
        />
      </div>

      <div className="grid gap-2 lg:grid-cols-3 md:grid-cols-2">
        {/* Subscription Info */}
        <Card className="gap-0 p-2">
          <CardHeader className="p-1.5 pb-0">
            <CardTitle className="flex items-center gap-1 text-xs font-semibold">
              <Package className="size-3.5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1.5 pt-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Trạng thái</span>
              {getStatusBadge(subscriptionData.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ID</span>
              <span className="text-xs font-semibold">
                #{subscriptionData.subscriptionId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Tự động gia hạn
              </span>
              <Badge
                variant={subscriptionData.autoRenew ? "default" : "outline"}
                className="text-xs h-4 px-1.5"
              >
                {subscriptionData.autoRenew ? "Có" : "Không"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Đang hoạt động
              </span>
              <Badge
                variant={subscriptionData.isActive ? "default" : "outline"}
                className="text-xs h-4 px-1.5"
              >
                {subscriptionData.isActive ? "Có" : "Không"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Đã hết hạn</span>
              <Badge
                variant={subscriptionData.isExpired ? "destructive" : "outline"}
                className="text-xs h-4 px-1.5"
              >
                {subscriptionData.isExpired ? "Có" : "Không"}
              </Badge>
            </div>
            {subscriptionData.daysRemaining !== null && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Còn lại</span>
                <span className="text-xs font-semibold">
                  {subscriptionData.daysRemaining} ngày
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card className="gap-0 p-2">
          <CardHeader className="p-1.5 pb-0">
            <CardTitle className="flex items-center gap-1 text-xs font-semibold">
              <Package className="size-3.5" />
              Gói dịch vụ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1.5 pt-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tên gói</span>
              <span className="text-xs font-semibold truncate ml-2 max-w-[60%] text-right">
                {subscriptionData.planName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Mã gói</span>
              <span className="text-xs font-semibold">
                {subscriptionData.planCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Giá</span>
              <span className="text-xs font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(subscriptionData.listPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Thời hạn</span>
              <span className="text-xs font-semibold">
                {subscriptionData.durationMonths === 0
                  ? "Không giới hạn"
                  : `${subscriptionData.durationMonths} tháng`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Version</span>
              <span className="text-xs font-semibold">
                #{subscriptionData.versionNo}
              </span>
            </div>
            {subscriptionData.planDescription && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Mô tả</p>
                <p className="text-xs leading-tight">
                  {subscriptionData.planDescription}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Landlord Info */}
        <Card className="gap-0 p-2">
          <CardHeader className="p-1.5 pb-0">
            <CardTitle className="flex items-center gap-1 text-xs font-semibold">
              <User className="size-3.5" />
              Landlord
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1.5 pt-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">ID</span>
              <span className="text-xs font-semibold">
                #{subscriptionData.landlordId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-xs font-semibold truncate ml-2 max-w-[60%] text-right">
                {subscriptionData.landlordEmail}
              </span>
            </div>
            {subscriptionData.landlordPhone && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Số điện thoại
                </span>
                <span className="text-xs font-semibold">
                  {subscriptionData.landlordPhone}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="lg:col-span-3 md:col-span-2">
          <CardHeader className="p-1.5 pb-0">
            <CardTitle className="flex items-center gap-1 text-xs font-semibold">
              <Calendar className="size-3.5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-1.5 pt-1 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-2">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Ngày bắt đầu</p>
                <p className="text-xs font-semibold">
                  {new Date(subscriptionData.startedAt).toLocaleDateString(
                    "vi-VN",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(subscriptionData.startedAt).toLocaleTimeString(
                    "vi-VN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Ngày hết hạn</p>
                <p className="text-xs font-semibold">
                  {subscriptionData.expiresAt
                    ? new Date(subscriptionData.expiresAt).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        }
                      )
                    : "Không giới hạn"}
                </p>
                {subscriptionData.expiresAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(subscriptionData.expiresAt).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                )}
              </div>
              {subscriptionData.cancelledAt && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Ngày hủy</p>
                  <p className="text-xs font-semibold">
                    {new Date(subscriptionData.cancelledAt).toLocaleDateString(
                      "vi-VN",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(subscriptionData.cancelledAt).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              )}
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Ngày tạo</p>
                <p className="text-xs font-semibold">
                  {new Date(subscriptionData.createdAt).toLocaleDateString(
                    "vi-VN",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(subscriptionData.createdAt).toLocaleTimeString(
                    "vi-VN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  Cập nhật lần cuối
                </p>
                <p className="text-xs font-semibold">
                  {new Date(subscriptionData.updatedAt).toLocaleDateString(
                    "vi-VN",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(subscriptionData.updatedAt).toLocaleTimeString(
                    "vi-VN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
            {subscriptionData.cancelReason && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Lý do hủy</p>
                <p className="text-xs leading-tight">
                  {subscriptionData.cancelReason}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionDetailPage;
