import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUnitInvoices } from "@/hooks/useUnit";
import { formatVietnamMoney } from "@/utils/formatters";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  Loader,
  Search,
  X,
} from "lucide-react";
import { useState } from "react";

interface InvoiceSectionProps {
  unitId: number;
}

export function InvoiceSection({ unitId }: InvoiceSectionProps) {
  const [invoicesPage, setInvoicesPage] = useState(0);
  const invoicesPageSize = 8;
  const [invoicesFilters, setInvoicesFilters] = useState({
    status: "",
    type: "",
    search: "",
    fromDate: "",
    toDate: "",
  });

  const { data: invoicesData, isLoading: isLoadingInvoices } = useUnitInvoices(
    unitId,
    {
      page: invoicesPage,
      size: invoicesPageSize,
      sort: "issuedAt",
      direction: "DESC",
      ...(invoicesFilters.status && { status: invoicesFilters.status }),
      ...(invoicesFilters.type && { type: invoicesFilters.type }),
      ...(invoicesFilters.search && { search: invoicesFilters.search }),
      ...(invoicesFilters.fromDate && { fromDate: invoicesFilters.fromDate }),
      ...(invoicesFilters.toDate && { toDate: invoicesFilters.toDate }),
    },
    !!unitId
  );

  const invoices = invoicesData?.content || [];
  const invoicesPagination = invoicesData?.pagination;

  const handleInvoiceFilterChange = (key: string, value: string) => {
    setInvoicesFilters((prev) => ({ ...prev, [key]: value }));
    setInvoicesPage(0);
  };

  const resetInvoiceFilters = () => {
    setInvoicesFilters({
      status: "",
      type: "",
      search: "",
      fromDate: "",
      toDate: "",
    });
    setInvoicesPage(0);
  };

  return (
    <Card className="shadow-sm mt-6">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <FileText className="size-4 text-primary" />
          </div>
          Hóa đơn
          {invoicesPagination && (
            <Badge variant="secondary" className="ml-2">
              {invoicesPagination.totalElements}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Invoices Filters */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="size-4" />
            <span>Bộ lọc</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm..."
                value={invoicesFilters.search}
                onChange={(e) =>
                  handleInvoiceFilterChange("search", e.target.value)
                }
                className="pl-8 h-9 text-sm"
              />
            </div>
            <Select
              value={invoicesFilters.status || "all"}
              onValueChange={(value) =>
                handleInvoiceFilterChange(
                  "status",
                  value === "all" ? "" : value
                )
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                <SelectItem value="ISSUED">Đã phát hành</SelectItem>
                <SelectItem value="OVERDUE">Quá hạn</SelectItem>
                <SelectItem value="DRAFT">Nháp</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={invoicesFilters.type || "all"}
              onValueChange={(value) =>
                handleInvoiceFilterChange("type", value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Loại hóa đơn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="CONTRACT">Hóa đơn hợp đồng</SelectItem>
                <SelectItem value="SERVICE">Hóa đơn dịch vụ</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Từ ngày"
              value={invoicesFilters.fromDate}
              onChange={(e) =>
                handleInvoiceFilterChange("fromDate", e.target.value)
              }
              className="h-9 text-sm"
            />
            <div className="flex items-center gap-2">
              <Input
                type="date"
                placeholder="Đến ngày"
                value={invoicesFilters.toDate}
                onChange={(e) =>
                  handleInvoiceFilterChange("toDate", e.target.value)
                }
                className="h-9 text-sm"
              />
              {(invoicesFilters.status ||
                invoicesFilters.type ||
                invoicesFilters.search ||
                invoicesFilters.fromDate ||
                invoicesFilters.toDate) && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  onClick={resetInvoiceFilters}
                  title="Xóa bộ lọc"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoadingInvoices ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Chưa có hóa đơn nào
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoiceId}
                  className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">
                        #{invoice.invoiceId}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {invoice.type === "CONTRACT"
                          ? "Hóa đơn hợp đồng"
                          : "Hóa đơn dịch vụ"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        invoice.status === "PAID"
                          ? "default"
                          : invoice.status === "OVERDUE"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs h-5"
                    >
                      {invoice.status === "PAID"
                        ? "Đã thanh toán"
                        : invoice.status === "ISSUED"
                        ? "Đã phát hành"
                        : invoice.status === "OVERDUE"
                        ? "Quá hạn"
                        : invoice.status === "DRAFT"
                        ? "Nháp"
                        : invoice.status}
                    </Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Tháng
                      </p>
                      <p className="font-semibold text-sm">
                        {new Date(invoice.cycleMonth).toLocaleDateString(
                          "vi-VN",
                          { month: "2-digit", year: "numeric" }
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Ngày đến hạn
                      </p>
                      <p className="font-semibold text-sm">
                        {new Date(invoice.dueAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Tổng tiền
                      </p>
                      <p className="font-semibold text-sm text-primary">
                        {formatVietnamMoney(invoice.totalAmount)}
                      </p>
                    </div>
                    {invoice.issuedAt && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">
                          Ngày phát hành
                        </p>
                        <p className="font-semibold text-sm">
                          {new Date(invoice.issuedAt).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {invoicesPagination && invoicesPagination.totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {invoices.length} /{" "}
                  {invoicesPagination.totalElements} hóa đơn
                  {" - "}
                  Trang {invoicesPagination.currentPage + 1} /{" "}
                  {invoicesPagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setInvoicesPage((prev) => Math.max(0, prev - 1))
                    }
                    disabled={!invoicesPagination.hasPrevious}
                    className="h-8"
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    Trước
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, invoicesPagination.totalPages) },
                      (_, i) => {
                        const page =
                          invoicesPagination.currentPage < 2
                            ? i
                            : invoicesPagination.currentPage >
                              invoicesPagination.totalPages - 3
                            ? invoicesPagination.totalPages - 5 + i
                            : invoicesPagination.currentPage - 2 + i;
                        if (page < 0 || page >= invoicesPagination.totalPages)
                          return null;
                        return (
                          <Button
                            key={page}
                            size="sm"
                            variant={
                              page === invoicesPagination.currentPage
                                ? "default"
                                : "outline"
                            }
                            onClick={() => setInvoicesPage(page)}
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
                      setInvoicesPage((prev) =>
                        Math.min(invoicesPagination.totalPages - 1, prev + 1)
                      )
                    }
                    disabled={!invoicesPagination.hasNext}
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
