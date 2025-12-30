import EmptyData from "@/components/common/empty-data";
import SitePageTitle from "@/components/site/site-page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { IPricingPlan } from "./types";

const PricingPlanDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Lấy plan data từ location state
  const plan = location.state?.plan as IPricingPlan | undefined;

  if (!plan) {
    return (
      <div className="container mx-auto">
        <EmptyData
          title="Không tìm thấy gói dịch vụ"
          description="Gói dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
        />
        <div className="mt-4">
          <Button onClick={() => navigate("/admin/bang-gia-dich-vu")}>
            <ArrowLeft className="mr-2 size-4" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/bang-gia-dich-vu")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 size-4" />
          Quay lại
        </Button>
        <SitePageTitle
          title={plan.name}
          subTitle={`Mã gói: ${plan.code}`}
          hideCreate={true}
          hidePrint={true}
          hideImport={true}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Chi tiết về gói dịch vụ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Mã gói
              </p>
              <p className="text-lg font-semibold">{plan.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Tên gói
              </p>
              <p className="text-lg font-semibold">{plan.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mô tả</p>
              <p className="text-sm">{plan.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Trạng thái
              </p>
              <Badge
                variant={
                  plan.status === "ACTIVE"
                    ? "default"
                    : plan.status === "ARCHIVED"
                    ? "secondary"
                    : "outline"
                }
              >
                {plan.status === "ACTIVE" ? (
                  <>
                    <CheckCircle2 className="mr-1 size-3" />
                    Hoạt động
                  </>
                ) : plan.status === "ARCHIVED" ? (
                  <>
                    <XCircle className="mr-1 size-3" />
                    Đã lưu trữ
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 size-3" />
                    Không hoạt động
                  </>
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin giá và thời hạn</CardTitle>
            <CardDescription>
              Chi tiết về giá và thời hạn sử dụng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Giá niêm yết
              </p>
              <p className="text-lg font-semibold">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(plan.listPrice)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Thời hạn
              </p>
              <p className="text-lg font-semibold">
                {plan.durationMonths === 0
                  ? "Không giới hạn"
                  : `${plan.durationMonths} tháng`}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ngày tạo
              </p>
              <p className="text-sm">
                {new Date(plan.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Cập nhật lần cuối
              </p>
              <p className="text-sm">
                {new Date(plan.updatedAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricingPlanDetailPage;
