import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { InvoiceItemType } from "@/types/invoice.types";
import { format } from "date-fns";
import { FileText, Receipt, X } from "lucide-react";
import type { IInvoice } from "../table/adp-columns";

interface InvoiceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: IInvoice | null;
  isLoading?: boolean;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  ISSUED: "Đã phát hành",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  ISSUED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const itemTypeLabels: Record<InvoiceItemType, string> = {
  RENT: "Tiền thuê",
  DEPOSIT: "Tiền đặt cọc",
  ELECTRICITY: "Tiền điện",
  WATER: "Tiền nước",
  OTHER: "Khác",
};

export function InvoiceDetailDialog({
  open,
  onOpenChange,
  invoice,
  isLoading = false,
}: InvoiceDetailDialogProps) {
  if (!invoice && !isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="size-5 text-primary" />
            Chi tiết hóa đơn #{invoice?.id || ""}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về hóa đơn dịch vụ
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="ml-2 text-sm text-muted-foreground">Đang tải...</p>
          </div>
        ) : invoice ? (
        <div className="space-y-4">
          {/* Header Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Hợp đồng</p>
              <p className="text-sm font-semibold">#{invoice.contractId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Phòng</p>
              <p className="text-sm font-semibold">
                {invoice.unitId ? `#${invoice.unitId}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Tháng</p>
              <p className="text-sm font-semibold">
                {format(new Date(invoice.cycleMonth), "MM/yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Trạng thái</p>
              <Badge className={statusColors[invoice.status] || ""}>
                {statusLabels[invoice.status] || invoice.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="size-4" />
              Chi tiết hóa đơn
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold">
                      Loại
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold">
                      Mô tả
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">
                      Số lượng
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">
                      Đơn giá
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-2 text-sm">
                          {itemTypeLabels[item.itemType] || item.itemType}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className="line-clamp-1" title={item.description}>
                            {item.description}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {item.quantity.toLocaleString("vi-VN")}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.unitPrice)}
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold text-right">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.amount || item.quantity * item.unitPrice)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        Không có mục nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(invoice.subtotal || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Thuế:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(invoice.taxAmount || 0)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Tổng cộng:</span>
              <span className="text-primary">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(invoice.totalAmount)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Ngày phát hành:</p>
              <p className="font-medium">
                {invoice.issuedAt
                  ? format(new Date(invoice.issuedAt), "dd/MM/yyyy HH:mm")
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Ngày đến hạn:</p>
              <p className="font-medium">
                {format(new Date(invoice.dueAt), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
        </div>
        ) : null}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="mr-2 size-4" />
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

