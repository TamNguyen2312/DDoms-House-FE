import LoadingCard from "@/components/common/loading-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenantRentedUnits } from "@/hooks/useRentedUnits";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  FileSignature,
  Package,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import type { IContractStatus } from "../../admin/rented-units/types";
import { TenantContractSection } from "./components/tenant-contract-section";
import { TenantInvoiceSection } from "./components/tenant-invoice-section";
import { CreateRepairRequestDialog } from "../repair-requests/dialogs/create-repair-request-dialog";
import { useCreateRepairRequest } from "@/hooks/useRepairRequest";

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

const TenantUnitDetailPage = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();

  // Repair request dialog state
  const [isCreateRepairRequestDialogOpen, setIsCreateRepairRequestDialogOpen] = useState(false);

  // Create repair request mutation
  const { mutate: createRepairRequest, isPending: isCreating } =
    useCreateRepairRequest();

  // Fetch all rented units to find the matching one
  const { data: rentedUnitsData, isLoading } = useTenantRentedUnits({
    page: 0,
    size: 100,
    sort: "startDate",
    direction: "DESC",
  });

  const rentedUnits = rentedUnitsData?.content || [];
  const unit = rentedUnits.find((u) => u.unitId === Number(unitId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingCard Icon={Clock} title="Đang tải thông tin phòng..." />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Không tìm thấy thông tin phòng
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

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
    <div className="">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/tenant/phong-da-thue")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Chi tiết phòng #{unit.unitCode}
            </h1>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateRepairRequestDialogOpen(true)}
          className="gap-2"
        >
          <Wrench className="size-4" />
          Tạo yêu cầu sửa chữa
        </Button>
      </div>

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
            <Card className="shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="size-4 text-primary" />
                  Thông tin Phòng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
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
              </CardContent>
            </Card>

            {/* Property Info Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="size-4 text-primary" />
                  Bất động sản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contract Info Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileSignature className="size-4 text-primary" />
                  Hợp đồng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
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
              </CardContent>
            </Card>

            {/* Landlord Info Section */}
            <Card className="shadow-sm">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="size-4 text-primary" />
                  Chủ nhà
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Email</p>
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Invoices Section */}
        {unit.unitId > 0 && <TenantInvoiceSection unitId={unit.unitId} />}

        {/* Contracts Section */}
        {unit.unitId > 0 && <TenantContractSection unitId={unit.unitId} />}
      </div>

      {/* Create Repair Request Dialog */}
      {unit && (
        <CreateRepairRequestDialog
          open={isCreateRepairRequestDialogOpen}
          onOpenChange={(open) => {
            setIsCreateRepairRequestDialogOpen(open);
          }}
          defaultUnitId={unit.unitId}
          onSubmit={(data) => {
            createRepairRequest(data, {
              onSuccess: () => {
                setIsCreateRepairRequestDialogOpen(false);
              },
            });
          }}
          isPending={isCreating}
        />
      )}
    </div>
  );
};

export default TenantUnitDetailPage;
