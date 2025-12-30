import { ContractBadge } from "@/components/contract/contract-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetContractsForTenant } from "@/hooks/useContracts";
import type { GetContractsRequest } from "@/pages/admin/contracts/types";
import type { IContractDetail } from "@/pages/landlord/contracts/types";
import { formatVietnamMoney } from "@/utils/formatters";
import { format } from "date-fns";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TEContract = () => {
  const navigate = useNavigate();

  // Pagination and filter state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  // Build query params
  const queryParams: GetContractsRequest = {
    page,
    size,
    sort: "createdAt",
    direction: "DESC",
    ...(statusFilter && { status: statusFilter }),
  };

  const {
    data: contractsData,
    isLoading,
    error,
  } = useGetContractsForTenant(queryParams);

  const contracts = contractsData?.content || [];
  const pagination = contractsData?.pagination;

  const handleViewDetail = (contractId: number) => {
    navigate(`/tenant/hop-dong/${contractId}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSizeChange = (newSize: string) => {
    setSize(Number(newSize));
    setPage(0); // Reset to first page when changing size
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status === "all" ? undefined : status);
    setPage(0); // Reset to first page when changing filter
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Đang tải danh sách hợp đồng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Có lỗi xảy ra khi tải danh sách hợp đồng</p>
      </div>
    );
  }

  const contractStatuses = [
    { value: "all", label: "Tất cả" },
    { value: "SENT", label: "Chờ ký" },
    { value: "SIGNED", label: "Đã ký" },
    { value: "ACTIVE", label: "Đang hiệu lực" },
    { value: "TERMINATION_PENDING", label: "Chờ hủy" },
    { value: "CANCELLED", label: "Đã hủy" },
    { value: "EXPIRED", label: "Hết hạn" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)]">
      <div className="mx-auto flex-1 flex flex-col w-full">
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-bold text-gray-900 mb-2 text-xl">
            Hợp Đồng Thuê
          </h1>
          <p className="text-gray-600">Quản lý các hợp đồng thuê của bạn</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Lọc theo trạng thái:</span>
            <div className="flex flex-wrap gap-2">
              {contractStatuses.map((status) => (
                <Button
                  key={status.value}
                  variant={
                    (statusFilter === undefined && status.value === "all") ||
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

        {/* Grid Contracts */}
        {contracts.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <p className="text-gray-500">Chưa có hợp đồng nào</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              {contracts.map((contract: IContractDetail) => (
                <Card
                  key={contract.id}
                  className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-amber-500"
                >
                  <CardContent className="px-4 py-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-orange-400 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">
                            Hợp đồng #{contract.id}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(contract.createdAt), "dd/MM/yyyy")}
                          </div>
                        </div>
                      </div>
                      <ContractBadge status={contract.status} />
                    </div>

                    {/* Info Grid - Compact */}
                    <div className="grid grid-cols-3 gap-3 bg-linear-to-r from-amber-50/50 to-orange-50/50 rounded-lg p-3 mb-3">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 mb-0.5">
                          Đặt cọc
                        </div>
                        <div className="text-sm font-bold text-amber-600 leading-tight">
                          {formatVietnamMoney(contract.depositAmount)}
                        </div>
                      </div>
                      <div className="text-center border-x border-gray-200">
                        <div className="text-[10px] text-gray-500 mb-0.5">
                          Bắt đầu
                        </div>
                        <div className="text-xs font-medium leading-tight">
                          {format(new Date(contract.startDate), "dd/MM/yyyy")}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-500 mb-0.5">
                          Kết thúc
                        </div>
                        <div className="text-xs font-medium leading-tight">
                          {format(new Date(contract.endDate), "dd/MM/yyyy")}
                        </div>
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewDetail(contract.id)}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Xem chi tiết
                    </Button>
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
                      / {pagination.totalElements} hợp đồng
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
    </div>
  );
};

export default TEContract;
