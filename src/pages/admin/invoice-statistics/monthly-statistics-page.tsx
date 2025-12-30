import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useGetAdminMonthlyStatistics } from "@/hooks/useAdminInvoiceStatistics";
import { useToast } from "@/hooks/useToast";
import { formatVietnamMoney } from "@/utils/formatters";
import { format } from "date-fns";
import {
  Building,
  Calendar,
  DollarSign,
  Download,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

/**
 * Admin Monthly Invoice Statistics Page
 * Displays comprehensive monthly statistics for invoices, tenants, and landlords
 */
export default function MonthlyStatisticsPage() {
  const toast = useToast();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useGetAdminMonthlyStatistics({
    month: selectedMonth,
  });

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(event.target.value);
  };

  // Function to export statistics to Excel
  const handleExportExcel = () => {
    if (!data) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Tổng quan (Summary)
      const summaryData = [
        { "Chỉ số": "Tháng báo cáo", "Giá trị": data.month },
        { "Chỉ số": "Đơn vị tiền tệ", "Giá trị": data.currency },
        { "Chỉ số": "Tổng doanh thu", "Giá trị": data.summary.totalRevenue },
        {
          "Chỉ số": "Tiền thuê phòng",
          "Giá trị": data.summary.totalRentCollected,
        },
        {
          "Chỉ số": "Phí dịch vụ",
          "Giá trị": data.summary.totalServiceCollected,
        },
        { "Chỉ số": "Tiền cọc", "Giá trị": data.summary.totalDepositCollected },
        { "Chỉ số": "Số khách thuê", "Giá trị": data.summary.totalTenants },
        { "Chỉ số": "Số chủ nhà", "Giá trị": data.summary.totalLandlords },
        { "Chỉ số": "Tổng số phòng", "Giá trị": data.summary.totalRooms },
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng quan");

      // Sheet 2: Chi tiết khách thuê (Tenants Detail)
      const tenantsDetailData: any[] = [];
      const tenantMergeRanges: Array<{
        s: { r: number; c: number };
        e: { r: number; c: number };
      }> = [];

      let currentRow = 0;
      data.tenants.forEach((tenant) => {
        const startRow = currentRow;
        tenant.rooms.forEach((room, index) => {
          tenantsDetailData.push({
            "ID Khách thuê": tenant.userId,
            "Tên khách thuê": tenant.fullName || "Chưa cập nhật",
            Email: tenant.email,
            "Số điện thoại": tenant.phone,
            "Mã phòng": room.roomCode,
            "ID Phòng": room.unitId,
            "ID Hợp đồng": room.contractId,
            "Tiền cọc": room.depositAmount,
            "Tiền thuê": room.rentAmount,
            "Phí dịch vụ": room.serviceAmount,
            "Tổng tiền phòng":
              room.depositAmount + room.rentAmount + room.serviceAmount,
            // Chỉ hiển thị thông tin tổng kết ở dòng đầu tiên
            ...(index === 0
              ? {
                  "Tổng số phòng": tenant.totalRooms,
                  "Tổng tiền cọc": tenant.totalDepositPaid,
                  "Tổng tiền thuê": tenant.totalRentPaid,
                  "Tổng phí dịch vụ": tenant.totalServicePaid,
                  "Tổng thanh toán": tenant.totalAmount,
                }
              : {
                  "Tổng số phòng": "",
                  "Tổng tiền cọc": "",
                  "Tổng tiền thuê": "",
                  "Tổng phí dịch vụ": "",
                  "Tổng thanh toán": "",
                }),
          });
          currentRow++;
        });

        // Tạo merge ranges cho tenant này nếu có nhiều hơn 1 phòng
        if (tenant.rooms.length > 1) {
          const endRow = currentRow - 1;
          // Merge các cột thông tin cá nhân (ID, Tên, Email, SĐT)
          tenantMergeRanges.push(
            { s: { r: startRow + 1, c: 0 }, e: { r: endRow + 1, c: 0 } }, // ID Khách thuê
            { s: { r: startRow + 1, c: 1 }, e: { r: endRow + 1, c: 1 } }, // Tên khách thuê
            { s: { r: startRow + 1, c: 2 }, e: { r: endRow + 1, c: 2 } }, // Email
            { s: { r: startRow + 1, c: 3 }, e: { r: endRow + 1, c: 3 } }, // Số điện thoại
            // Merge các cột tổng kết
            { s: { r: startRow + 1, c: 11 }, e: { r: endRow + 1, c: 11 } }, // Tổng số phòng
            { s: { r: startRow + 1, c: 12 }, e: { r: endRow + 1, c: 12 } }, // Tổng tiền cọc
            { s: { r: startRow + 1, c: 13 }, e: { r: endRow + 1, c: 13 } }, // Tổng tiền thuê
            { s: { r: startRow + 1, c: 14 }, e: { r: endRow + 1, c: 14 } }, // Tổng phí dịch vụ
            { s: { r: startRow + 1, c: 15 }, e: { r: endRow + 1, c: 15 } } // Tổng thanh toán
          );
        }
      });

      const tenantsSheet = XLSX.utils.json_to_sheet(tenantsDetailData);

      // Apply merge ranges and center alignment
      if (tenantMergeRanges.length > 0) {
        tenantsSheet["!merges"] = tenantMergeRanges;
        
        // Add center alignment for merged cells
        tenantMergeRanges.forEach((range) => {
          for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              if (!tenantsSheet[cellAddress]) continue;
              
              if (!tenantsSheet[cellAddress].s) {
                tenantsSheet[cellAddress].s = {};
              }
              tenantsSheet[cellAddress].s.alignment = {
                horizontal: "center",
                vertical: "center"
              };
            }
          }
        });
      }

      XLSX.utils.book_append_sheet(
        workbook,
        tenantsSheet,
        "Chi tiết khách thuê"
      );

      // Sheet 3: Tóm tắt khách thuê (Tenants Summary)
      const tenantsSummaryData = data.tenants.map((tenant) => ({
        ID: tenant.userId,
        Tên: tenant.fullName || "Chưa cập nhật",
        Email: tenant.email,
        "Số điện thoại": tenant.phone,
        "Số phòng": tenant.totalRooms,
        "Tổng tiền cọc": tenant.totalDepositPaid,
        "Tổng tiền thuê": tenant.totalRentPaid,
        "Tổng phí dịch vụ": tenant.totalServicePaid,
        "Tổng thanh toán": tenant.totalAmount,
      }));
      const tenantsSummarySheet = XLSX.utils.json_to_sheet(tenantsSummaryData);
      XLSX.utils.book_append_sheet(
        workbook,
        tenantsSummarySheet,
        "Tóm tắt khách thuê"
      );

      // Sheet 4: Chi tiết chủ nhà (Landlords Detail)
      const landlordsDetailData: any[] = [];
      const landlordMergeRanges: Array<{
        s: { r: number; c: number };
        e: { r: number; c: number };
      }> = [];

      let landlordCurrentRow = 0;
      data.landlords.forEach((landlord) => {
        const startRow = landlordCurrentRow;
        landlord.rooms.forEach((room, index) => {
          landlordsDetailData.push({
            "ID Chủ nhà": landlord.userId,
            "Tên chủ nhà": landlord.displayName || "Chưa cập nhật",
            Email: landlord.email,
            "Số điện thoại": landlord.phone,
            "Ngân hàng": landlord.bankName || "Chưa cập nhật",
            "Số tài khoản": landlord.bankAccountNumber || "Chưa cập nhật",
            "Tên tài khoản": landlord.bankAccountName || "Chưa cập nhật",
            "Mã phòng": room.roomCode,
            "ID Phòng": room.unitId,
            "ID Hợp đồng": room.contractId,
            "ID Khách thuê": room.tenantId,
            "Tiền thuê": room.rentAmount,
            "Phí dịch vụ": room.serviceAmount,
            "Tổng tiền phòng": room.rentAmount + room.serviceAmount,
            // Chỉ hiển thị thông tin tổng kết ở dòng đầu tiên
            ...(index === 0
              ? {
                  "Tổng số phòng": landlord.totalRooms,
                  "Tổng tiền cọc nhận": landlord.totalDepositReceived,
                  "Tổng tiền thuê nhận": landlord.totalRentReceived,
                  "Tổng phí dịch vụ nhận": landlord.totalServiceReceived,
                  "Tổng doanh thu": landlord.totalAmount,
                }
              : {
                  "Tổng số phòng": "",
                  "Tổng tiền cọc nhận": "",
                  "Tổng tiền thuê nhận": "",
                  "Tổng phí dịch vụ nhận": "",
                  "Tổng doanh thu": "",
                }),
          });
          landlordCurrentRow++;
        });

        // Tạo merge ranges cho landlord này nếu có nhiều hơn 1 phòng
        if (landlord.rooms.length > 1) {
          const endRow = landlordCurrentRow - 1;
          // Merge các cột thông tin cá nhân (ID, Tên, Email, SĐT, Ngân hàng, STK, Tên TK)
          landlordMergeRanges.push(
            { s: { r: startRow + 1, c: 0 }, e: { r: endRow + 1, c: 0 } }, // ID Chủ nhà
            { s: { r: startRow + 1, c: 1 }, e: { r: endRow + 1, c: 1 } }, // Tên chủ nhà
            { s: { r: startRow + 1, c: 2 }, e: { r: endRow + 1, c: 2 } }, // Email
            { s: { r: startRow + 1, c: 3 }, e: { r: endRow + 1, c: 3 } }, // Số điện thoại
            { s: { r: startRow + 1, c: 4 }, e: { r: endRow + 1, c: 4 } }, // Ngân hàng
            { s: { r: startRow + 1, c: 5 }, e: { r: endRow + 1, c: 5 } }, // Số tài khoản
            { s: { r: startRow + 1, c: 6 }, e: { r: endRow + 1, c: 6 } }, // Tên tài khoản
            // Merge các cột tổng kết
            { s: { r: startRow + 1, c: 14 }, e: { r: endRow + 1, c: 14 } }, // Tổng số phòng
            { s: { r: startRow + 1, c: 15 }, e: { r: endRow + 1, c: 15 } }, // Tổng tiền cọc nhận
            { s: { r: startRow + 1, c: 16 }, e: { r: endRow + 1, c: 16 } }, // Tổng tiền thuê nhận
            { s: { r: startRow + 1, c: 17 }, e: { r: endRow + 1, c: 17 } }, // Tổng phí dịch vụ nhận
            { s: { r: startRow + 1, c: 18 }, e: { r: endRow + 1, c: 18 } } // Tổng doanh thu
          );
        }
      });

      const landlordsSheet = XLSX.utils.json_to_sheet(landlordsDetailData);

      // Apply merge ranges and center alignment
      if (landlordMergeRanges.length > 0) {
        landlordsSheet["!merges"] = landlordMergeRanges;
        
        // Add center alignment for merged cells
        landlordMergeRanges.forEach((range) => {
          for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              if (!landlordsSheet[cellAddress]) continue;
              
              if (!landlordsSheet[cellAddress].s) {
                landlordsSheet[cellAddress].s = {};
              }
              landlordsSheet[cellAddress].s.alignment = {
                horizontal: "center",
                vertical: "center"
              };
            }
          }
        });
      }

      XLSX.utils.book_append_sheet(
        workbook,
        landlordsSheet,
        "Chi tiết chủ nhà"
      );

      // Sheet 5: Tóm tắt chủ nhà (Landlords Summary)
      const landlordsSummaryData = data.landlords.map((landlord) => ({
        ID: landlord.userId,
        Tên: landlord.displayName || "Chưa cập nhật",
        Email: landlord.email,
        "Số điện thoại": landlord.phone,
        "Ngân hàng": landlord.bankName || "Chưa cập nhật",
        "Số tài khoản": landlord.bankAccountNumber || "Chưa cập nhật",
        "Tên tài khoản": landlord.bankAccountName || "Chưa cập nhật",
        "Số phòng": landlord.totalRooms,
        "Tổng tiền cọc nhận": landlord.totalDepositReceived,
        "Tổng tiền thuê nhận": landlord.totalRentReceived,
        "Tổng phí dịch vụ nhận": landlord.totalServiceReceived,
        "Tổng doanh thu": landlord.totalAmount,
      }));
      const landlordsSummarySheet =
        XLSX.utils.json_to_sheet(landlordsSummaryData);
      XLSX.utils.book_append_sheet(
        workbook,
        landlordsSummarySheet,
        "Tóm tắt chủ nhà"
      );

      // Generate filename with timestamp
      const fileName = `Thong-ke-hoa-don-${data.month}-${format(
        new Date(),
        "yyyy-MM-dd-HHmmss"
      )}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, fileName);

      toast.success(`Đã xuất thống kê tháng ${data.month} thành công!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất file Excel");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải thống kê...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="font-medium">Lỗi khi tải dữ liệu</p>
              <p className="text-sm mt-1">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thống Kê Thanh Toán Hàng Tháng</h1>
          <p className="text-muted-foreground mt-2">
            Báo cáo chi tiết về doanh thu và hoạt động hàng tháng
          </p>
        </div>

        <div className="flex items-end gap-4">
          <div className="w-48">
            <Label htmlFor="month-select">Chọn tháng</Label>
            <Input
              id="month-select"
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="mt-1"
            />
          </div>

          {data && (
            <Button
              onClick={handleExportExcel}
              disabled={isExporting}
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
                  Xuất Excel
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng Doanh Thu
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatVietnamMoney(data.summary.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tiền thuê + Dịch vụ
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Người Thuê
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.totalTenants}
                </div>
                <p className="text-xs text-muted-foreground">
                  Khách hàng hoạt động
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chủ Nhà</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.totalLandlords}
                </div>
                <p className="text-xs text-muted-foreground">
                  Đối tác cho thuê
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng Phòng</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.summary.totalRooms}
                </div>
                <p className="text-xs text-muted-foreground">
                  Phòng có hoạt động
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Chi Tiết Doanh Thu Tháng {data.month}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatVietnamMoney(data.summary.totalRentCollected)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tiền Thuê Phòng
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatVietnamMoney(data.summary.totalServiceCollected)}
                  </div>
                  <p className="text-sm text-muted-foreground">Phí Dịch Vụ</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatVietnamMoney(data.summary.totalDepositCollected)}
                  </div>
                  <p className="text-sm text-muted-foreground">Tiền Cọc</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Thông Tin Tháng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tháng báo cáo:</span>
                    <span className="font-bold">{data.month}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Đơn vị tiền tệ:</span>
                    <span className="font-bold">{data.currency}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Tổng số phòng:</span>
                    <span className="font-bold">{data.summary.totalRooms}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Thống Kê Chi Tiết
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Trung bình phòng/khách thuê:</span>
                    <span className="font-bold">
                      {data.summary.totalTenants > 0 
                        ? (data.summary.totalRooms / data.summary.totalTenants).toFixed(1)
                        : '0'} phòng
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Trung bình phòng/chủ nhà:</span>
                    <span className="font-bold">
                      {data.summary.totalLandlords > 0 
                        ? (data.summary.totalRooms / data.summary.totalLandlords).toFixed(1)
                        : '0'} phòng
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span>Doanh thu trung bình/phòng:</span>
                    <span className="font-bold">
                      {data.summary.totalRooms > 0 
                        ? formatVietnamMoney(data.summary.totalRevenue / data.summary.totalRooms)
                        : formatVietnamMoney(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Tenant and Landlord Statistics */}
          <div className="space-y-6">
            {/* Danh sách đầy đủ khách thuê */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Danh Sách Khách Thuê ({data.tenants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">ID</th>
                        <th className="text-left p-3 font-medium">Tên khách thuê</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Số điện thoại</th>
                        <th className="text-center p-3 font-medium">Số phòng</th>
                        <th className="text-right p-3 font-medium">Tiền cọc</th>
                        <th className="text-right p-3 font-medium">Tiền thuê</th>
                        <th className="text-right p-3 font-medium">Phí dịch vụ</th>
                        <th className="text-right p-3 font-medium">Tổng thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.tenants
                        .sort((a, b) => b.totalAmount - a.totalAmount)
                        .map((tenant, index) => (
                          <tr key={tenant.userId} className={`border-b hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                            <td className="p-3 font-mono text-sm">{tenant.userId}</td>
                            <td className="p-3">
                              <div className="font-medium">{tenant.fullName || 'Chưa cập nhật'}</div>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">{tenant.email}</td>
                            <td className="p-3 text-sm">{tenant.phone}</td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-bold">
                                {tenant.totalRooms}
                              </span>
                            </td>
                            <td className="p-3 text-right font-medium text-orange-600">
                              {formatVietnamMoney(tenant.totalDepositPaid)}
                            </td>
                            <td className="p-3 text-right font-medium text-blue-600">
                              {formatVietnamMoney(tenant.totalRentPaid)}
                            </td>
                            <td className="p-3 text-right font-medium text-purple-600">
                              {formatVietnamMoney(tenant.totalServicePaid)}
                            </td>
                            <td className="p-3 text-right font-bold text-green-600">
                              {formatVietnamMoney(tenant.totalAmount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Danh sách đầy đủ chủ nhà */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Danh Sách Chủ Nhà ({data.landlords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">ID</th>
                        <th className="text-left p-3 font-medium">Tên chủ nhà</th>
                        <th className="text-left p-3 font-medium">Email</th>
                        <th className="text-left p-3 font-medium">Số điện thoại</th>
                        <th className="text-left p-3 font-medium">Ngân hàng</th>
                        <th className="text-center p-3 font-medium">Số phòng</th>
                        <th className="text-right p-3 font-medium">Tiền cọc nhận</th>
                        <th className="text-right p-3 font-medium">Tiền thuê nhận</th>
                        <th className="text-right p-3 font-medium">Phí dịch vụ nhận</th>
                        <th className="text-right p-3 font-medium">Tổng doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.landlords
                        .sort((a, b) => b.totalAmount - a.totalAmount)
                        .map((landlord, index) => (
                          <tr key={landlord.userId} className={`border-b hover:bg-muted/50 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}>
                            <td className="p-3 font-mono text-sm">{landlord.userId}</td>
                            <td className="p-3">
                              <div className="font-medium">{landlord.displayName || 'Chưa cập nhật'}</div>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground">{landlord.email}</td>
                            <td className="p-3 text-sm">{landlord.phone}</td>
                            <td className="p-3 text-sm">
                              <div>{landlord.bankName || 'Chưa cập nhật'}</div>
                              <div className="text-xs text-muted-foreground">
                                {landlord.bankAccountNumber || 'Chưa có STK'}
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-bold">
                                {landlord.totalRooms}
                              </span>
                            </td>
                            <td className="p-3 text-right font-medium text-orange-600">
                              {formatVietnamMoney(landlord.totalDepositReceived)}
                            </td>
                            <td className="p-3 text-right font-medium text-blue-600">
                              {formatVietnamMoney(landlord.totalRentReceived)}
                            </td>
                            <td className="p-3 text-right font-medium text-purple-600">
                              {formatVietnamMoney(landlord.totalServiceReceived)}
                            </td>
                            <td className="p-3 text-right font-bold text-green-600">
                              {formatVietnamMoney(landlord.totalAmount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
