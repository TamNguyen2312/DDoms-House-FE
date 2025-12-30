import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Invoice } from "@/types/invoice.types";
import { format } from "date-fns";
import { CreditCard, Eye, MoreVertical, Receipt } from "lucide-react";

interface InvoiceListProps {
  invoices: Invoice[];
  onPay?: (invoice: Invoice) => void;
  onView?: (invoice: Invoice) => void;
  isLoading?: boolean;
  showPayButton?: boolean;
  showViewButton?: boolean;
  title?: string;
  headerAction?: React.ReactNode;
}

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  ISSUED: "Đã phát hành",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ISSUED: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export function InvoiceList({
  invoices,
  onPay,
  onView,
  isLoading = false,
  showPayButton = false,
  showViewButton = false,
  title = "Hóa đơn",
  headerAction,
}: InvoiceListProps) {
  // Ensure invoices is always an array
  const invoicesArray = Array.isArray(invoices) ? invoices : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5" />
              {title}
            </CardTitle>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </CardContent>
      </Card>
    );
  }

  if (invoicesArray.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-5" />
              {title}
            </CardTitle>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có hóa đơn nào
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            {title} ({invoicesArray.length})
          </CardTitle>
          {headerAction && <div>{headerAction}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tháng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày đến hạn</TableHead>
              <TableHead>Tổng tiền</TableHead>
              {(showPayButton || showViewButton) && (
                <TableHead className="text-right">Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoicesArray.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  {format(new Date(invoice.cycleMonth), "MM/yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      invoice.type === "SERVICE"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {invoice.type === "SERVICE" ? "Dịch vụ" : "Hợp đồng"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[invoice.status] || "bg-gray-100"}
                  >
                    {statusLabels[invoice.status] || invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(invoice.dueAt), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(invoice.totalAmount)}
                </TableCell>
                {(showPayButton || showViewButton) && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-8 p-0">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {showViewButton && onView && (
                          <DropdownMenuItem onClick={() => onView(invoice)}>
                            <Eye size={20} strokeWidth={1.5} />
                            <span>Xem chi tiết</span>
                          </DropdownMenuItem>
                        )}
                        {showPayButton &&
                          invoice.status === "ISSUED" &&
                          onPay && (
                            <>
                              {showViewButton && <DropdownMenuSeparator />}
                              <DropdownMenuItem onClick={() => onPay(invoice)}>
                                <CreditCard size={20} strokeWidth={1.5} />
                                <span>Thanh toán</span>
                              </DropdownMenuItem>
                            </>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
