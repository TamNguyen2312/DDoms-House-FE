import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/types/invoice.types";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ADLColumnHeader } from "../../contracts/table/adp-column-header";

export interface IInvoice extends Invoice {
  contractId: number;
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

const typeLabels: Record<string, string> = {
  CONTRACT: "Hợp đồng",
  SERVICE: "Dịch vụ",
};

const typeColors: Record<string, string> = {
  CONTRACT: "bg-blue-100 text-blue-800",
  SERVICE: "bg-purple-100 text-purple-800",
};

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 30
): ColumnDef<IInvoice>[] => [
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
    accessorKey: "contractId",
    header: () => <ADLColumnHeader title="Mã hợp đồng" />,
    cell: ({ row }) => (
      <span className="fw-bold">#{row.getValue("contractId")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "cycleMonth",
    header: () => <ADLColumnHeader title="Tháng" />,
    cell: ({ row }) => {
      const date = row.getValue("cycleMonth") as string;
      return <div>{format(new Date(date), "MM/yyyy")}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "type",
    header: () => <ADLColumnHeader title="Loại" />,
    cell: ({ row }) => {
      const type = (row.getValue("type") as string) || "CONTRACT";
      return (
        <Badge className={typeColors[type] || "bg-gray-100"}>
          {typeLabels[type] || type}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: () => <ADLColumnHeader title="Trạng thái" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge className={statusColors[status] || "bg-gray-100"}>
          {statusLabels[status] || status}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "dueAt",
    header: () => <ADLColumnHeader title="Ngày đến hạn" />,
    cell: ({ row }) => {
      const date = row.getValue("dueAt") as string;
      return <div>{format(new Date(date), "dd/MM/yyyy")}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "totalAmount",
    header: () => <ADLColumnHeader title="Tổng tiền" />,
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return (
        <span className="fw-bold">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount)}
        </span>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "issuedAt",
    header: () => <ADLColumnHeader title="Ngày phát hành" />,
    cell: ({ row }) => {
      const date = row.getValue("issuedAt") as string | undefined;
      return date ? (
        <div>{format(new Date(date), "dd/MM/yyyy HH:mm")}</div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 30)
export const columns = createColumns(0, 30);
