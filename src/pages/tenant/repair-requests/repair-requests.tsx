import LoadingSpinner from "@/components/common/loading-spinner";
import { RepairRequestBadge } from "@/components/repair-request/repair-request-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCancelRepairRequest,
  useCreateRepairRequest,
  useGetRepairRequestStatistics,
  useGetRepairRequestsForTenant,
} from "@/hooks/useRepairRequest";
import { useToast } from "@/hooks/useToast";
import type {
  GetRepairRequestsRequest,
  IRepairRequest,
  IRepairRequestStatus,
} from "@/types/repair-request.types";
import { format } from "date-fns";
import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  Plus,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { CancelRepairRequestDialog } from "./dialogs/cancel-repair-request-dialog";
import { CreateRepairRequestDialog } from "./dialogs/create-repair-request-dialog";
import { ViewRepairRequestDialog } from "./dialogs/view-repair-request-dialog";

const TERepairRequests = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [statusFilter, setStatusFilter] = useState<
    IRepairRequestStatus | "all"
  >("all");
  const [selectedRepairRequest, setSelectedRepairRequest] =
    useState<IRepairRequest | null>(null);
  const [selectedRepairRequestId, setSelectedRepairRequestId] = useState<number | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const toast = useToast();

  // Create mutation
  const { mutate: createRepairRequest, isPending: isCreating } =
    useCreateRepairRequest();

  // Cancel mutation
  const { mutate: cancelRepairRequest, isPending: isCancelling } =
    useCancelRepairRequest();

  // Build query params
  const queryParams: GetRepairRequestsRequest = {
    page,
    size,
    sort: "createdAt",
    direction: "DESC",
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const {
    data: repairRequestsData,
    isLoading,
    error,
  } = useGetRepairRequestsForTenant(queryParams);

  // Get statistics
  const { data: statistics, isLoading: isLoadingStats } =
    useGetRepairRequestStatistics();

  const repairRequests = repairRequestsData?.content || [];
  const pagination = repairRequestsData?.pagination;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSizeChange = (newSize: string) => {
    setSize(Number(newSize));
    setPage(0);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(
      status === "all" ? "all" : (status as IRepairRequestStatus)
    );
    setPage(0);
  };

  const handleCreateRepairRequest = (data: {
    unitId: number;
    title: string;
    description: string;
    occurredAt: string;
    fileIds?: number[];
  }) => {
    createRepairRequest(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
  };

  const handleCancelRepairRequest = (cancelReason: string) => {
    if (!selectedRepairRequest) return;
    cancelRepairRequest(
      {
        repairRequestId: selectedRepairRequest.id,
        data: { cancelReason },
      },
      {
        onSuccess: () => {
          setIsCancelDialogOpen(false);
          setSelectedRepairRequest(null);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          Có lỗi xảy ra khi tải danh sách yêu cầu sửa chữa
        </p>
      </div>
    );
  }

  const repairRequestStatuses = [
    { value: "all", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "IN_PROGRESS", label: "Đang xử lý" },
    { value: "DONE", label: "Hoàn thành" },
    { value: "CANCEL", label: "Đã hủy" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="mx-auto flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900 mb-2 text-xl">
              Yêu Cầu Sửa Chữa
            </h1>
            <p className="text-gray-600">
              Quản lý các yêu cầu sửa chữa của bạn
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo yêu cầu sửa chữa
          </Button>
        </div>

        {/* Statistics Cards */}
        {!isLoadingStats && statistics && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <Card className="bg-blue-50 border-blue-200 py-2">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 mb-1">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-600">Tổng yêu cầu</p>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {statistics.totalRequests}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200 py-2">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <p className="text-xs text-gray-600">Chờ xử lý</p>
                </div>
                <p className="text-xl font-bold text-yellow-600">
                  {statistics.pendingRequests}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200 py-2">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-gray-600">Đang xử lý</p>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {statistics.inProgressRequests}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200 py-2">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-gray-600">Hoàn thành</p>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {statistics.doneRequests}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200 py-2">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-gray-600">Đã hủy</p>
                </div>
                <p className="text-xl font-bold text-red-600">
                  {statistics.cancelledRequests}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200 py-2">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <p className="text-xs text-gray-600">Thời gian xử lý TB</p>
                </div>
                <p className="text-xl font-bold text-purple-600">
                  {statistics.averageResolutionTimeHours > 0
                    ? `${statistics.averageResolutionTimeHours.toFixed(1)}h`
                    : "N/A"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Lọc theo trạng thái:</span>
            <div className="flex flex-wrap gap-2">
              {repairRequestStatuses.map((status) => (
                <Button
                  key={status.value}
                  variant={
                    (statusFilter === "all" && status.value === "all") ||
                    statusFilter === status.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleStatusFilterChange(status.value)}
                >
                  {status.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Repair Requests */}
        {repairRequests.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <p className="text-gray-500">Chưa có yêu cầu sửa chữa nào</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              {repairRequests.map((request: IRepairRequest) => (
                <Card
                  key={request.id}
                  className="hover:shadow-xl transition-all duration-300 py-2"
                >
                  <CardContent className="p-4 flex flex-col space-y-2">
                    {/* Header: title and status */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{request.title}</h3>
                          <RepairRequestBadge status={request.status} />
                        </div>
                        {(request.propertyName || request.addressLine) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {request.propertyName && (
                              <span className="font-medium">
                                {request.propertyName}
                              </span>
                            )}
                            {request.addressLine && (
                              <>
                                {request.propertyName && " - "}
                                {request.addressLine}
                                {request.ward && `, ${request.ward}`}
                                {request.city && `, ${request.city}`}
                              </>
                            )}
                          </div>
                        )}
                        {request.unitCode && (
                          <span className="text-sm font-medium text-primary flex items-center gap-1">
                            <Building className="w-4 h-4" />
                            Mã phòng: {request.unitCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {request.description && (
                      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                        <Wrench className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                    )}

                    {/* Occurred date */}
                    {request.occurredAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Xảy ra:{" "}
                          {format(
                            new Date(request.occurredAt),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </span>
                      </div>
                    )}

                    {/* Created date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Ngày tạo:{" "}
                        {format(
                          new Date(request.createdAt),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-2">
                      {request.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRepairRequestId(request.id);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Chi tiết
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedRepairRequest(request);
                              setIsCancelDialogOpen(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-transparent text-black"
                          >
                            <X className="w-4 h-4 mr-1 text-red-600" /> Hủy
                          </Button>
                        </>
                      )}
                      {(request.status === "IN_PROGRESS" ||
                        request.status === "DONE" ||
                        request.status === "CANCEL") && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedRepairRequestId(request.id);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" /> Chi tiết
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalElements > 6 && (
              <div className="mt-auto pt-2 border-t">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  {/* Page size selector */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Hiển thị:</span>
                    <Select
                      value={size.toString()}
                      onValueChange={handleSizeChange}
                    >
                      <SelectTrigger className="w-[70px] h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-gray-500">
                      / {pagination.totalElements} yêu cầu
                    </span>
                  </div>

                  {/* Page navigation */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={!pagination.hasPrevious || page === 0}
                      className="h-8 px-3"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum: number;
                          if (pagination.totalPages <= 5) {
                            pageNum = i;
                          } else if (page < 3) {
                            pageNum = i;
                          } else if (page > pagination.totalPages - 3) {
                            pageNum = pagination.totalPages - 5 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="h-8 min-w-[32px] px-2 text-sm"
                            >
                              {pageNum + 1}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={
                        !pagination.hasNext || page >= pagination.totalPages - 1
                      }
                      className="h-8 px-3"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Page info */}
                  <div className="text-sm text-gray-500">
                    Trang <span className="font-medium">{page + 1}</span> /{" "}
                    {pagination.totalPages}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Repair Request Dialog */}
      <ViewRepairRequestDialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) setSelectedRepairRequestId(null);
        }}
        repairRequestId={selectedRepairRequestId}
      />

      {/* Create Repair Request Dialog */}
      <CreateRepairRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateRepairRequest}
        isPending={isCreating}
      />

      {/* Cancel Repair Request Dialog */}
      {selectedRepairRequest && (
        <CancelRepairRequestDialog
          open={isCancelDialogOpen}
          onOpenChange={(open) => {
            setIsCancelDialogOpen(open);
            if (!open) setSelectedRepairRequest(null);
          }}
          repairRequest={selectedRepairRequest}
          onConfirm={handleCancelRepairRequest}
          isPending={isCancelling}
        />
      )}
    </div>
  );
};

export default TERepairRequests;
