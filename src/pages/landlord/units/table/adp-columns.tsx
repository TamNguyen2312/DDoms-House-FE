// import { ColumnDef } from "@tanstack/react-table";

import type { IProperty } from "@/lib/dbProperties";
import { formatVietnamMoney } from "@/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 30
): ColumnDef<IProperty>[] => [
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
    accessorKey: "code",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Tên phòng" />
    ),
    cell: ({ row }) => <span className="fw-bold">{row.getValue("code")}</span>,
    enableHiding: true,
  },
  {
    accessorKey: "areaSqM",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Diện tích" />
    ),
    cell: ({ row }) => (
      <span className="fw-bold">{row.getValue("areaSqM")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "bedrooms",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Phòng tắm" />
    ),
    cell: ({ row }) => (
      <span className="fw-bold">{row.getValue("bedrooms")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "bathrooms",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Phòng ngủ" />
    ),
    cell: ({ row }) => (
      <span className="fw-bold">{row.getValue("bathrooms")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "baseRent",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Giá ban đầu" />
    ),
    cell: ({ row }) => (
      <span className="fw-bold">
        {formatVietnamMoney(row.getValue("baseRent"))}
      </span>
    ),
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 30);
