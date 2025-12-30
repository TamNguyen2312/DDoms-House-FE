import { ConfirmDeleteDialog } from "@/components/common/confirm-delete-dialog";
import LoadingSpinner from "@/components/common/loading-spinner";
import { RentalRequestBadge } from "@/components/rental-request/rental-request-badge";
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
  useCreateRentalRequest,
  useDeleteRentalRequestForTenant,
  useGetRentalRequestsForTenant,
} from "@/hooks/useRentalRequest";
import { useToast } from "@/hooks/useToast";
import type {
  GetRentalRequestsRequest,
  IRentalRequest,
  IRentalRequestStatus,
} from "@/pages/landlord/rental/types";
import { format } from "date-fns";
import {
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  MessageSquare,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";
import { CreateRentalRequestDialog } from "./dialogs/create-rental-request-dialog";
import { ViewRentalRequestDialog } from "./dialogs/view-rental-request-dialog";

const TERentalRequests = () => {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [statusFilter, setStatusFilter] = useState<
    IRentalRequestStatus | "all"
  >("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedRentalRequest, setSelectedRentalRequest] =
    useState<IRentalRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const toast = useToast();

  // Delete mutation
  const { mutate: deleteRentalRequest, isPending: isDeleting } =
    useDeleteRentalRequestForTenant();

  // Create mutation
  const { mutate: createRentalRequest, isPending: isCreating } =
    useCreateRentalRequest();

  // Build query params
  const queryParams: GetRentalRequestsRequest = {
    page,
    size,
    sort: "createdAt",
    direction: "DESC",
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const {
    data: rentalRequestsData,
    isLoading,
    error,
  } = useGetRentalRequestsForTenant(queryParams);

  const rentalRequests = rentalRequestsData?.content || [];
  const pagination = rentalRequestsData?.pagination;

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
      status === "all" ? "all" : (status as IRentalRequestStatus)
    );
    setPage(0);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteRentalRequest(deleteId, {
      onSuccess: () => {
        setOpenConfirm(false);
        setDeleteId(null);
      },
    });
  };

  const handleCreateRentalRequest = (data: {
    unitId: number;
    message: string;
  }) => {
    createRentalRequest(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
      },
    });
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
          Có lỗi xảy ra khi tải danh sách yêu cầu thuê
        </p>
      </div>
    );
  }

  const rentalRequestStatuses = [
    { value: "all", label: "Tất cả" },
    { value: "PENDING", label: "Chờ xử lý" },
    { value: "ACCEPTED", label: "Đã chấp nhận" },
    { value: "DECLINED", label: "Đã từ chối" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="mx-auto flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900 mb-2 text-xl">
              Yêu Cầu Thuê Phòng
            </h1>
            <p className="text-gray-600">
              Quản lý các yêu cầu thuê phòng của bạn
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Tạo yêu cầu thuê
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Lọc theo trạng thái:</span>
            <div className="flex flex-wrap gap-2">
              {rentalRequestStatuses.map((status) => (
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

        {/* Grid Rental Requests */}
        {rentalRequests.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <p className="text-gray-500">Chưa có yêu cầu thuê nào</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              {rentalRequests.map((request: IRentalRequest) => (
                <Card
                  key={request.id}
                  className="hover:shadow-xl transition-all duration-300 py-2"
                >
                  <CardContent className="p-4 flex flex-col space-y-2">
                    {/* Header: unit info */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1">
                        {(request.unit || request.propertyName) && (
                          <>
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold">
                                {request.unit?.propertyName ||
                                  request.propertyName ||
                                  "N/A"}
                              </h3>
                              <RentalRequestBadge status={request.status} />
                            </div>
                            {(request.unit?.addressLine ||
                              request.addressLine) && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                {request.unit?.addressLine ||
                                  request.addressLine}
                                {(request.unit?.ward || request.ward) &&
                                  `, ${request.unit?.ward || request.ward}`}
                                {(request.unit?.district || request.district) &&
                                  `, ${
                                    request.unit?.district || request.district
                                  }`}
                                {(request.unit?.city || request.city) &&
                                  `, ${request.unit?.city || request.city}`}
                              </div>
                            )}
                            {(request.unit?.unitCode || request.unitCode) && (
                              <span className="text-sm font-medium text-primary flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                Mã phòng:{" "}
                                {request.unit?.unitCode || request.unitCode}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    {request.message && (
                      <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                        <MessageSquare className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {request.message}
                        </p>
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
                              setSelectedRentalRequest(request);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" /> Chi tiết
                          </Button>
                          <Button
                            onClick={() => {
                              setDeleteId(request.id);
                              setOpenConfirm(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="bg-transparent text-black"
                          >
                            <X className="w-4 h-4 mr-1 text-red-600" /> Xóa
                          </Button>
                        </>
                      )}
                      {(request.status === "ACCEPTED" ||
                        request.status === "DECLINED" ||
                        request.status === "EXPIRED") && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedRentalRequest(request);
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

      <ConfirmDeleteDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        onConfirm={confirmDelete}
        loading={isDeleting}
      />

      {/* View Rental Request Dialog */}
      {selectedRentalRequest && (
        <ViewRentalRequestDialog
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) setSelectedRentalRequest(null);
          }}
          rentalRequest={selectedRentalRequest}
        />
      )}

      {/* Create Rental Request Dialog */}
      <CreateRentalRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateRentalRequest}
        isPending={isCreating}
      />
    </div>
  );
};

export default TERentalRequests;
