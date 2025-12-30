import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUnitContracts } from "@/hooks/useUnit";
import { formatVietnamMoney } from "@/utils/formatters";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

interface ContractSectionProps {
  unitId: number;
}

export function ContractSection({ unitId }: ContractSectionProps) {
  const [contractsPage, setContractsPage] = useState(0);
  const contractsPageSize = 8;
  const [contractsFilters, setContractsFilters] = useState({
    status: "",
  });

  const { data: contractsData, isLoading: isLoadingContracts } =
    useUnitContracts(
      unitId,
      {
        page: contractsPage,
        size: contractsPageSize,
        sort: "createdAt",
        direction: "DESC",
        ...(contractsFilters.status && { status: contractsFilters.status }),
      },
      !!unitId
    );

  const contracts = contractsData?.content || [];
  const contractsPagination = contractsData?.pagination;

  const handleContractFilterChange = (key: string, value: string) => {
    setContractsFilters((prev) => ({ ...prev, [key]: value }));
    setContractsPage(0);
  };

  const resetContractFilters = () => {
    setContractsFilters({
      status: "",
    });
    setContractsPage(0);
  };

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <Users className="size-4 text-primary" />
          </div>
          Hợp đồng
          {contractsPagination && (
            <Badge variant="secondary" className="ml-2">
              {contractsPagination.totalElements}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contracts Filters */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="size-4" />
            <span>Bộ lọc</span>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={contractsFilters.status || "all"}
              onValueChange={(value) =>
                handleContractFilterChange(
                  "status",
                  value === "all" ? "" : value
                )
              }
            >
              <SelectTrigger className="h-9 text-sm w-[200px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="SENT">Đã gửi</SelectItem>
                <SelectItem value="SIGNED">Đã ký</SelectItem>
                <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                <SelectItem value="TERMINATION_PENDING">
                  Chờ kết thúc
                </SelectItem>
                <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            {contractsFilters.status && (
              <Button
                size="sm"
                variant="ghost"
                onClick={resetContractFilters}
                className="h-9 text-xs"
              >
                <X className="size-3 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {isLoadingContracts ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Chưa có hợp đồng nào
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {contracts.map((contract) => (
                <div
                  key={contract.contractId}
                  className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">
                        #{contract.contractId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Hợp đồng #{contract.contractId}
                      </p>
                    </div>
                    <Badge
                      variant={
                        contract.status === "ACTIVE"
                          ? "default"
                          : contract.status === "EXPIRED" ||
                            contract.status === "CANCELLED" ||
                            contract.status === "TERMINATED"
                          ? "destructive"
                          : contract.status === "SIGNED"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs h-5"
                    >
                      {contract.status === "ACTIVE"
                        ? "Đang hoạt động"
                        : contract.status === "SENT"
                        ? "Đã gửi"
                        : contract.status === "SIGNED"
                        ? "Đã ký"
                        : contract.status === "DRAFT"
                        ? "Nháp"
                        : contract.status === "TERMINATION_PENDING"
                        ? "Chờ kết thúc"
                        : contract.status === "EXPIRED"
                        ? "Hết hạn"
                        : contract.status === "CANCELLED"
                        ? "Đã hủy"
                        : contract.status === "TERMINATED"
                        ? "Đã kết thúc"
                        : contract.status}
                    </Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Người thuê
                      </p>
                      <p className="font-semibold text-sm truncate">
                        {contract.tenant.displayName || contract.tenant.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Tiền đặt cọc
                      </p>
                      <p className="font-semibold text-sm text-primary">
                        {formatVietnamMoney(contract.depositAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Ngày tạo
                      </p>
                      <p className="font-semibold text-sm">
                        {new Date(contract.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Thời gian
                      </p>
                      <p className="font-semibold text-sm">
                        {new Date(contract.startDate).toLocaleDateString(
                          "vi-VN",
                          { day: "2-digit", month: "2-digit" }
                        )}{" "}
                        -{" "}
                        {new Date(contract.endDate).toLocaleDateString(
                          "vi-VN",
                          { day: "2-digit", month: "2-digit" }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {contractsPagination && contractsPagination.totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {contracts.length} /{" "}
                  {contractsPagination.totalElements} hợp đồng
                  {" - "}
                  Trang {contractsPagination.currentPage + 1} /{" "}
                  {contractsPagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setContractsPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={!contractsPagination.hasPrevious}
                    className="h-8"
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, contractsPagination.totalPages) },
                      (_, i) => {
                        const page =
                          contractsPagination.currentPage < 2
                            ? i
                            : contractsPagination.currentPage >
                              contractsPagination.totalPages - 3
                            ? contractsPagination.totalPages - 5 + i
                            : contractsPagination.currentPage - 2 + i;
                        if (page < 0 || page >= contractsPagination.totalPages)
                          return null;
                        return (
                          <Button
                            key={page}
                            size="sm"
                            variant={
                              page === contractsPagination.currentPage
                                ? "default"
                                : "outline"
                            }
                            onClick={() => setContractsPage(page)}
                            className="h-8 w-8 p-0"
                          >
                            {page + 1}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setContractsPage((prev) =>
                        Math.min(contractsPagination.totalPages - 1, prev + 1)
                      )
                    }
                    disabled={!contractsPagination.hasNext}
                    className="h-8"
                  >
                    Sau
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
