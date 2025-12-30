import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import type { AdminPaymentItem, IPayment } from "../types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
): ColumnDef<AdminPaymentItem | IPayment>[] => [
  {
    id: "stt",
    header: "#",
    cell: (info) => {
      // Calculate STT based on pagination: (pageIndex * pageSize) + rowIndex + 1
      return pageIndex * pageSize + info.row.index + 1;
    },
    size: 24,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Mã thanh toán" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      return <span className="font-bold">#{item.id}</span>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "invoiceId",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Mã hóa đơn" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      return <span>{item.invoiceId || "-"}</span>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "contractId",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Mã hợp đồng" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      return <span>{item.contractId || "-"}</span>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "paymentType",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Loại thanh toán" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      const typeMap: Record<string, string> = {
        CONTRACT: "Hợp đồng",
        SERVICE: "Dịch vụ",
      };
      return (
        <Badge variant="outline">
          {typeMap[item.paymentType] || item.paymentType}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "provider",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Phương thức" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      const provider = item.provider;
      const providerMap: Record<string, string> = {
        PAYOS: "PayOS",
        momo: "MoMo",
        vnpay: "VNPay",
        zalopay: "ZaloPay",
      };
      return (
        <Badge variant="outline">
          {providerMap[provider.toUpperCase()] ||
            providerMap[provider.toLowerCase()] ||
            provider}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <ADLColumnHeader column={column} title="Số tiền" />,
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      const amount = item.amount;
      if (typeof amount !== "number") return <span>-</span>;
      return (
        <span className="font-semibold">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: item.currency || "VND",
          }).format(amount)}
        </span>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      const status = item.status;

      const statusMap: Record<
        string,
        {
          label: string;
          variant: "default" | "secondary" | "destructive" | "outline";
        }
      > = {
        SUCCEEDED: { label: "Thành công", variant: "default" },
        FAILED: { label: "Thất bại", variant: "destructive" },
        INITIATED: { label: "Đang xử lý", variant: "secondary" },
        CANCELLED: { label: "Đã hủy", variant: "outline" },
      };

      const statusInfo = statusMap[status] || {
        label: status,
        variant: "outline" as const,
      };

      return (
        <Badge variant={statusInfo.variant}>
          {status === "SUCCEEDED" ? (
            <>
              <CheckCircle2 className="mr-1 size-3" />
              {statusInfo.label}
            </>
          ) : status === "FAILED" ? (
            <>
              <XCircle className="mr-1 size-3" />
              {statusInfo.label}
            </>
          ) : (
            statusInfo.label
          )}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    id: "tenant_name",
    accessorFn: (row) => {
      const item = row as AdminPaymentItem;
      return item.tenant?.displayName || item.tenant?.email || "";
    },
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Người thuê" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      const tenant = item.tenant;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {tenant?.displayName || tenant?.email || "-"}
          </span>
          <span className="text-xs text-muted-foreground">
            {tenant?.phone || "-"}
          </span>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    id: "unit_info",
    accessorFn: (row) => {
      const item = row as AdminPaymentItem;
      return item.unit?.unitCode || "";
    },
    header: ({ column }) => <ADLColumnHeader column={column} title="Phòng" />,
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      const unit = item.unit;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{unit?.unitCode || "-"}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {unit?.propertyName || "-"}
          </span>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      if (!item.createdAt) return <span>-</span>;
      const date = format(new Date(item.createdAt), "dd/MM/yyyy HH:mm");
      return <div>{date}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "succeededAt",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày hoàn thành" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminPaymentItem;
      if (!item.succeededAt) return <span>-</span>;
      const date = format(new Date(item.succeededAt), "dd/MM/yyyy HH:mm");
      return <div>{date}</div>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 20);
