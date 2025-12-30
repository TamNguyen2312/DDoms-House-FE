import SitePageTitle from "@/components/site/site-page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAdminInvoices } from "@/hooks/useAdminInvoices";
import { useToast } from "@/hooks/useToast";
// import { Popover } from "@radix-ui/react-popover";
// import { PopoverContent } from "@radix-ui/react-popover";
// import { PopoverContent } from "@radix-ui/react-popover";
// import { PopoverTrigger } from "@radix-ui/react-popover";
// import { PopoverTrigger } from "@radix-ui/react-popover";
// import { Popover } from "@radix-ui/react-popover";
import { format, parseISO } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

/**
 * Export Invoices Page - New Implementation
 * Uses the new admin invoices API: /api/admin/invoices
 */
const ExportPaymentsPage = () => {
  const toast = useToast();

  // Filter and pagination states
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [isAllMonths, setIsAllMonths] = useState(false);
  const [isMonthPopoverOpen, setIsMonthPopoverOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch invoices with current filters
  const { data, isLoading, error } = useGetAdminInvoices({
    month: isAllMonths ? undefined : selectedMonth,
    status: selectedStatus !== "ALL" ? (selectedStatus as any) : undefined,
    invoiceType:
      selectedInvoiceType !== "ALL" ? (selectedInvoiceType as any) : undefined,
    page: currentPage,
    size: pageSize,
  });

  const invoices = data?.data?.content || [];
  const pagination = data?.data?.pagination;

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page
  };

  // Filter change handlers (reset to first page)
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setCurrentPage(0);
  };

  const handleAllMonthsChange = (checked: boolean) => {
    setIsAllMonths(checked);
    setCurrentPage(0);
    setIsMonthPopoverOpen(false);
  };

  const handleSpecificMonthSelect = () => {
    setIsAllMonths(false);
    setCurrentPage(0);
    // Keep popover open for month input
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(0);
  };

  const handleInvoiceTypeChange = (type: string) => {
    setSelectedInvoiceType(type);
    setCurrentPage(0);
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (invoices.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Chi tiết hóa đơn
      const detailData = invoices.map((invoice, index) => ({
        STT: index + 1,
        "ID Hóa đơn": invoice.id,
        "Loại hóa đơn":
          invoice.invoiceType === "CONTRACT" ? "Hợp đồng" : "Dịch vụ",
        "ID Hợp đồng": invoice.contractId,
        "Tháng chu kỳ": invoice.cycleMonth,
        "Trạng thái": getStatusLabel(invoice.status),
        "Số tiền phụ": invoice.subtotal,
        "Tiền thuế": invoice.taxAmount,
        "Tổng tiền": invoice.totalAmount,
        "Ngày phát hành": invoice.issuedAt
          ? format(parseISO(invoice.issuedAt), "dd/MM/yyyy HH:mm:ss")
          : "N/A",
        "Ngày đến hạn": invoice.dueAt
          ? format(parseISO(invoice.dueAt), "dd/MM/yyyy HH:mm:ss")
          : "N/A",
        "Ngày tạo": invoice.createdAt
          ? format(parseISO(invoice.createdAt), "dd/MM/yyyy HH:mm:ss")
          : "N/A",
        "Là điều kiện tiên quyết": invoice.isPrerequisite ? "Có" : "Không",
        // Tenant info
        "ID Khách thuê": invoice.tenant.userId,
        "Tên khách thuê": invoice.tenant.fullName || "Chưa cập nhật",
        "Email khách thuê": invoice.tenant.email,
        "SĐT khách thuê": invoice.tenant.phone,
        "CCCD khách thuê": invoice.tenant.idNumber || "Chưa cập nhật",
        // Landlord info
        "ID Chủ nhà": invoice.landlord.userId,
        "Tên chủ nhà": invoice.landlord.displayName || "Chưa cập nhật",
        "Email chủ nhà": invoice.landlord.email,
        "SĐT chủ nhà": invoice.landlord.phone,
        "Ngân hàng": invoice.landlord.bankName || "Chưa cập nhật",
        "Số tài khoản": invoice.landlord.bankAccountNumber || "Chưa cập nhật",
        "Tên tài khoản": invoice.landlord.bankAccountName || "Chưa cập nhật",
        // Unit info
        "ID Phòng": invoice.unit.id,
        "Mã phòng": invoice.unit.code,
        "ID Địa điểm": invoice.unit.propertyId,
        "Tên địa điểm": invoice.unit.propertyName,
        "Địa chỉ": invoice.unit.propertyAddress,
        "Giá thuê cơ bản": invoice.unit.baseRent,
        // Payment info
        "ID Thanh toán": invoice.payment?.paymentId || "N/A",
        "Nhà cung cấp": invoice.payment?.provider || "N/A",
        "Mã giao dịch": invoice.payment?.providerTxnId || "N/A",
        "Số tiền thanh toán": invoice.payment?.amount || 0,
        "Trạng thái thanh toán": invoice.payment?.status || "N/A",
        "Ngày tạo thanh toán": invoice.payment?.createdAt
          ? format(parseISO(invoice.payment.createdAt), "dd/MM/yyyy HH:mm:ss")
          : "N/A",
        "Ngày thành công": invoice.payment?.succeededAt
          ? format(parseISO(invoice.payment.succeededAt), "dd/MM/yyyy HH:mm:ss")
          : "N/A",
      }));

      const detailSheet = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(workbook, detailSheet, "Chi tiết hóa đơn");

      // Sheet 2: Chi tiết các mục hóa đơn
      const itemsData: any[] = [];
      invoices.forEach((invoice) => {
        invoice.items.forEach((item, itemIndex) => {
          itemsData.push({
            "ID Hóa đơn": invoice.id,
            "Mã phòng": invoice.unit.code,
            "STT Mục": itemIndex + 1,
            "ID Mục": item.id,
            "Loại mục": getItemTypeLabel(item.itemType),
            "Mô tả": item.description,
            "Số lượng": item.quantity,
            "Đơn giá": item.unitPrice,
            "Thành tiền": item.amount,
            "Trạng thái hóa đơn": getStatusLabel(invoice.status),
            "Tên khách thuê": invoice.tenant.fullName || "Chưa cập nhật",
            "Tên chủ nhà": invoice.landlord.displayName || "Chưa cập nhật",
          });
        });
      });

      const itemsSheet = XLSX.utils.json_to_sheet(itemsData);
      XLSX.utils.book_append_sheet(workbook, itemsSheet, "Chi tiết các mục");

      // Sheet 3: Tổng hợp theo trạng thái
      const statusSummary = new Map<
        string,
        { count: number; totalAmount: number }
      >();
      invoices.forEach((invoice) => {
        const status = invoice.status;
        if (!statusSummary.has(status)) {
          statusSummary.set(status, { count: 0, totalAmount: 0 });
        }
        const summary = statusSummary.get(status)!;
        summary.count += 1;
        summary.totalAmount += invoice.totalAmount;
      });

      const statusSummaryData = Array.from(statusSummary.entries()).map(
        ([status, summary], index) => ({
          STT: index + 1,
          "Trạng thái": getStatusLabel(status),
          "Số lượng hóa đơn": summary.count,
          "Tổng tiền": summary.totalAmount,
          "Tỷ lệ (%)": ((summary.count / invoices.length) * 100).toFixed(2),
        })
      );

      const statusSheet = XLSX.utils.json_to_sheet(statusSummaryData);
      XLSX.utils.book_append_sheet(
        workbook,
        statusSheet,
        "Tổng hợp theo trạng thái"
      );

      // Sheet 4: Tổng hợp theo loại hóa đơn
      const typeSummary = new Map<
        string,
        { count: number; totalAmount: number }
      >();
      invoices.forEach((invoice) => {
        const type = invoice.invoiceType;
        if (!typeSummary.has(type)) {
          typeSummary.set(type, { count: 0, totalAmount: 0 });
        }
        const summary = typeSummary.get(type)!;
        summary.count += 1;
        summary.totalAmount += invoice.totalAmount;
      });

      const typeSummaryData = Array.from(typeSummary.entries()).map(
        ([type, summary], index) => ({
          STT: index + 1,
          "Loại hóa đơn": type === "CONTRACT" ? "Hợp đồng" : "Dịch vụ",
          "Số lượng hóa đơn": summary.count,
          "Tổng tiền": summary.totalAmount,
          "Tỷ lệ (%)": ((summary.count / invoices.length) * 100).toFixed(2),
        })
      );

      const typeSheet = XLSX.utils.json_to_sheet(typeSummaryData);
      XLSX.utils.book_append_sheet(workbook, typeSheet, "Tổng hợp theo loại");

      // Sheet 5: Thống kê tổng quan
      const totalAmount = invoices.reduce(
        (sum, invoice) => sum + invoice.totalAmount,
        0
      );
      const totalSubtotal = invoices.reduce(
        (sum, invoice) => sum + invoice.subtotal,
        0
      );
      const totalTax = invoices.reduce(
        (sum, invoice) => sum + invoice.taxAmount,
        0
      );
      const paidInvoices = invoices.filter((inv) => inv.status === "PAID");
      const paidAmount = paidInvoices.reduce(
        (sum, invoice) => sum + invoice.totalAmount,
        0
      );

      const overviewData = [
        { "Chỉ số": "Tháng báo cáo", "Giá trị": selectedMonth },
        {
          "Chỉ số": "Bộ lọc trạng thái",
          "Giá trị":
            selectedStatus === "ALL"
              ? "Tất cả"
              : getStatusLabel(selectedStatus),
        },
        {
          "Chỉ số": "Bộ lọc loại hóa đơn",
          "Giá trị":
            selectedInvoiceType === "ALL"
              ? "Tất cả"
              : selectedInvoiceType === "CONTRACT"
              ? "Hợp đồng"
              : "Dịch vụ",
        },
        { "Chỉ số": "Tổng số hóa đơn", "Giá trị": invoices.length },
        {
          "Chỉ số": "Số hóa đơn đã thanh toán",
          "Giá trị": paidInvoices.length,
        },
        { "Chỉ số": "Tổng tiền phụ", "Giá trị": totalSubtotal },
        { "Chỉ số": "Tổng tiền thuế", "Giá trị": totalTax },
        { "Chỉ số": "Tổng tiền hóa đơn", "Giá trị": totalAmount },
        { "Chỉ số": "Tổng tiền đã thanh toán", "Giá trị": paidAmount },
        {
          "Chỉ số": "Tỷ lệ thanh toán (%)",
          "Giá trị":
            invoices.length > 0
              ? ((paidInvoices.length / invoices.length) * 100).toFixed(2)
              : "0",
        },
        {
          "Chỉ số": "Thời gian xuất",
          "Giá trị": format(new Date(), "dd/MM/yyyy HH:mm:ss"),
        },
      ];

      const overviewSheet = XLSX.utils.json_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(
        workbook,
        overviewSheet,
        "Thống kê tổng quan"
      );

      // Generate filename
      const fileName = `xuat-hoa-don-${selectedMonth}-${format(
        new Date(),
        "yyyy-MM-dd-HHmmss"
      )}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, fileName);
      toast.success(`Đã xuất ${invoices.length} hóa đơn thành công!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất file Excel");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper functions
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ISSUED":
        return "Đã phát hành";
      case "PAID":
        return "Đã thanh toán";
      case "OVERDUE":
        return "Quá hạn";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getItemTypeLabel = (itemType: string) => {
    switch (itemType) {
      case "RENT":
        return "Tiền thuê";
      case "DEPOSIT":
        return "Tiền cọc";
      case "RENEWAL_DEPOSIT":
        return "Cọc gia hạn";
      default:
        return itemType;
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <SitePageTitle
        title="Xuất hóa đơn"
        subTitle="Xuất dữ liệu hóa đơn ra file Excel"
        hideCreate={true}
        hidePrint={true}
        hideImport={true}
      />

      <div className="flex-1 min-h-0 mt-4 space-y-4">
        {/* Filters and Export Section - Combined */}
        <div className="rounded-lg border p-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Bộ lọc và Xuất dữ liệu</h3>
            {!isLoading && !error && invoices.length > 0 && (
              <Button
                onClick={handleExportExcel}
                disabled={isExporting || invoices.length === 0}
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Xuất Excel ({invoices.length})
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Chọn tháng</Label>
              <Popover
                open={isMonthPopoverOpen}
                onOpenChange={setIsMonthPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {isAllMonths
                      ? "Tất cả tháng"
                      : `Tháng ${format(
                          parseISO(selectedMonth + "-01"),
                          "MM/yyyy"
                        )}`}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Button
                        variant={isAllMonths ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => handleAllMonthsChange(true)}
                      >
                        Tất cả tháng
                      </Button>

                      <div className="space-y-2">
                        <Button
                          variant={!isAllMonths ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={handleSpecificMonthSelect}
                        >
                          Chọn tháng cụ thể
                        </Button>

                        {!isAllMonths && (
                          <Input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => {
                              handleMonthChange(e.target.value);
                              setIsMonthPopoverOpen(false);
                            }}
                            className="w-full"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ISSUED">Đã phát hành</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán</SelectItem>
                  <SelectItem value="OVERDUE">Quá hạn</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Loại hóa đơn</Label>
              <Select
                value={selectedInvoiceType}
                onValueChange={handleInvoiceTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả loại</SelectItem>
                  <SelectItem value="CONTRACT">Hợp đồng</SelectItem>
                  <SelectItem value="SERVICE">Dịch vụ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              {isLoading
                ? "Đang tải dữ liệu..."
                : error
                ? "Có lỗi xảy ra khi tải dữ liệu"
                : `Tìm thấy ${invoices.length} hóa đơn${
                    pagination
                      ? ` (Trang ${pagination.currentPage + 1}/${
                          pagination.totalPages
                        })`
                      : ""
                  }`}
            </div>

            {!isLoading && !error && invoices.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Excel: 5 sheets • Chi tiết hóa đơn • Các mục • Tổng hợp
              </div>
            )}
          </div>
        </div>

        {/* Data Table Section */}
        {!isLoading && !error && invoices.length > 0 && (
          <div className="rounded-lg border">
            {/* Table Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Danh sách hóa đơn</h3>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Hiển thị:</Label>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) =>
                      handlePageSizeChange(Number(value))
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">ID</th>
                    <th className="text-left p-3 font-medium">Loại</th>
                    <th className="text-left p-3 font-medium">Mã phòng</th>
                    <th className="text-left p-3 font-medium">Khách thuê</th>
                    <th className="text-left p-3 font-medium">Chủ nhà</th>
                    <th className="text-right p-3 font-medium">Tổng tiền</th>
                    <th className="text-left p-3 font-medium">Trạng thái</th>
                    <th className="text-left p-3 font-medium">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">{invoice.id}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            invoice.invoiceType === "CONTRACT"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {invoice.invoiceType === "CONTRACT"
                            ? "Hợp đồng"
                            : "Dịch vụ"}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{invoice.unit.code}</td>
                      <td className="p-3">
                        <div
                          className="max-w-32 truncate"
                          title={
                            invoice.tenant.fullName || invoice.tenant.email
                          }
                        >
                          {invoice.tenant.fullName || invoice.tenant.email}
                        </div>
                      </td>
                      <td className="p-3">
                        <div
                          className="max-w-32 truncate"
                          title={
                            invoice.landlord.displayName ||
                            invoice.landlord.email
                          }
                        >
                          {invoice.landlord.displayName ||
                            invoice.landlord.email}
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium">
                        {invoice.totalAmount.toLocaleString("vi-VN")} VNĐ
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            invoice.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "OVERDUE"
                              ? "bg-red-100 text-red-800"
                              : invoice.status === "ISSUED"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="p-3">
                        {invoice.createdAt
                          ? format(parseISO(invoice.createdAt), "dd/MM/yyyy")
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && (
              <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Hiển thị {currentPage * pageSize + 1} -{" "}
                    {Math.min(
                      (currentPage + 1) * pageSize,
                      pagination.totalElements
                    )}
                    trong tổng số {pagination.totalElements} hóa đơn
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevious}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) {
                            pageNum = i;
                          } else if (currentPage < 3) {
                            pageNum = i;
                          } else if (currentPage > pagination.totalPages - 4) {
                            pageNum = pagination.totalPages - 5 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
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
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="gap-1"
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive p-6 text-destructive">
            <h3 className="font-semibold">Lỗi khi tải dữ liệu</h3>
            <p className="text-sm mt-1">
              Vui lòng thử lại sau hoặc liên hệ quản trị viên.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && invoices.length === 0 && (
          <div className="rounded-lg border p-6 text-center">
            <h3 className="font-semibold text-muted-foreground">
              Không có dữ liệu
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Không tìm thấy hóa đơn nào với bộ lọc hiện tại.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportPaymentsPage;
