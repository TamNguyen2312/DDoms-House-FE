import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, XCircle } from "lucide-react";
import type { IPricingPlan } from "../types";
import { ADLColumnHeader } from "./adp-column-header";

export const columns: ColumnDef<IPricingPlan>[] = [
  {
    id: "stt",
    header: "#",
    cell: (info) => info.row.index + 1,
    size: 24,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "code",
    header: ({ column }) => <ADLColumnHeader column={column} title="Mã gói" />,
    cell: ({ row }) => (
      <span className="font-bold">{row.getValue("code")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <ADLColumnHeader column={column} title="Tên gói" />,
    cell: ({ row }) => (
      <span className="font-semibold">{row.getValue("name")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <ADLColumnHeader column={column} title="Mô tả" />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <span className="max-w-[300px] truncate" title={description}>
          {description}
        </span>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "durationMonths",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Thời hạn (tháng)" />
    ),
    cell: ({ row }) => {
      const durationMonths = row.getValue("durationMonths") as number;
      return (
        <span className="font-semibold">
          {durationMonths === 0 ? "Không giới hạn" : `${durationMonths} tháng`}
        </span>
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
      return (
        <Badge
          variant={
            status === "ACTIVE"
              ? "default"
              : status === "ARCHIVED"
              ? "secondary"
              : "outline"
          }
        >
          {status === "ACTIVE" ? (
            <>
              <CheckCircle2 className="mr-1 size-3" />
              Hoạt động
            </>
          ) : status === "ARCHIVED" ? (
            <>
              <XCircle className="mr-1 size-3" />
              Đã lưu trữ
            </>
          ) : (
            <>
              <XCircle className="mr-1 size-3" />
              Không hoạt động
            </>
          )}
        </Badge>
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
