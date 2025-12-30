import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { ISubscription } from "../types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
): ColumnDef<ISubscription>[] => [
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
    accessorKey: "subscriptionId",
    header: ({ column }) => <ADLColumnHeader column={column} title="ID" />,
    cell: ({ row }) => (
      <span className="font-bold">#{row.getValue("subscriptionId")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "landlordEmail",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Email Landlord" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("landlordEmail")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "planName",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Gói dịch vụ" />
    ),
    cell: ({ row }) => {
      const planCode = row.original.planCode;
      const planName = row.getValue("planName") as string;
      return (
        <div className="flex flex-col">
          <span className="font-semibold">{planName}</span>
          <span className="text-xs text-muted-foreground">{planCode}</span>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "listPrice",
    header: ({ column }) => <ADLColumnHeader column={column} title="Giá" />,
    cell: ({ row }) => {
      const price = row.getValue("listPrice") as number;
      return (
        <span className="font-semibold">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
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
      const status = row.getValue("status") as string;
      const isActive = row.original.isActive;
      return (
        <Badge
          variant={
            status === "ACTIVE"
              ? "default"
              : status === "CANCELLED"
              ? "destructive"
              : status === "EXPIRED"
              ? "secondary"
              : "outline"
          }
        >
          {status === "ACTIVE" ? (
            <>
              <CheckCircle2 className="mr-1 size-3" />
              Hoạt động
            </>
          ) : status === "CANCELLED" ? (
            <>
              <XCircle className="mr-1 size-3" />
              Đã hủy
            </>
          ) : status === "EXPIRED" ? (
            <>
              <Clock className="mr-1 size-3" />
              Hết hạn
            </>
          ) : status === "SUSPENDED" ? (
            <>
              <AlertCircle className="mr-1 size-3" />
              Tạm dừng
            </>
          ) : (
            <>
              <Clock className="mr-1 size-3" />
              Chờ xử lý
            </>
          )}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "startedAt",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày bắt đầu" />
    ),
    cell: ({ row }) => {
      const startedAt = row.getValue("startedAt") as string;
      return <span>{new Date(startedAt).toLocaleDateString("vi-VN")}</span>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "expiresAt",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày hết hạn" />
    ),
    cell: ({ row }) => {
      const expiresAt = row.getValue("expiresAt") as string | null;
      const daysRemaining = row.original.daysRemaining;
      if (!expiresAt) {
        return <span className="text-muted-foreground">Không giới hạn</span>;
      }
      return (
        <div className="flex flex-col">
          <span>{new Date(expiresAt).toLocaleDateString("vi-VN")}</span>
          {daysRemaining !== null && (
            <span className="text-xs text-muted-foreground">
              Còn {daysRemaining} ngày
            </span>
          )}
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
      const createdAt = row.getValue("createdAt") as string;
      return <span>{new Date(createdAt).toLocaleDateString("vi-VN")}</span>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 20);
