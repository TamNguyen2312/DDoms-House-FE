import { formatVietnamMoney } from "@/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";
import type { IAdminUnit } from "../api-types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
): ColumnDef<IAdminUnit>[] => [
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
      <ADLColumnHeader column={column} title="Mã phòng" />
    ),
    cell: ({ row }) => (
      <span
        className="fw-bold text-xs sm:text-sm max-w-[100px] sm:max-w-none truncate block"
        title={row.getValue("code") as string}
      >
        {row.getValue("code")}
      </span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "propertyId",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="ID Địa điểm" />
    ),
    cell: ({ row }) => <span>#{row.getValue("propertyId")}</span>,
    enableHiding: true,
  },
  {
    accessorKey: "areaSqM",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Diện tích (m²)" />
    ),
    cell: ({ row }) => (
      <span className="fw-bold">{row.getValue("areaSqM")} m²</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "bedrooms",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Phòng ngủ" />
    ),
    cell: ({ row }) => (
      <span className="fw-bold">{row.getValue("bedrooms")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "bathrooms",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Phòng tắm" />
    ),
    cell: ({ row }) => (
      <span className="fw-bold">{row.getValue("bathrooms")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "baseRent",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Giá thuê cơ bản" />
    ),
    cell: ({ row }) => {
      const price = row.getValue("baseRent") as number;
      return (
        <span className="fw-bold text-xs sm:text-sm whitespace-nowrap">
          {formatVietnamMoney(price)}
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
      const status = row.getValue("status") as string | null;
      return <span>{status || "-"}</span>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 20);
