// import { ColumnDef } from "@tanstack/react-table";

import type { IProperty } from "@/lib/dbProperties";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
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
    accessorKey: "name",
    header: ({ column }) => <ADLColumnHeader column={column} title="Tên" />,
    cell: ({ row }) => <span className="fw-bold">{row.getValue("name")}</span>,
    enableHiding: true,
  },
  // {
  //   accessorKey: "address",
  //   header: ({ column }) => <ADLColumnHeader column={column} title="Địa chỉ" />,
  //   cell: ({ row }) => {
  //     const addressLine = row.getValue("address_line");
  //     const ward = row.getValue("ward");
  //     const district = row.getValue("district");
  //     const city = row.getValue("city");

  //     const fullAddress = [addressLine, ward, district, city]
  //       .filter(Boolean)
  //       .join(", ");

  //     return <div>{fullAddress}</div>;
  //   },
  //   enableHiding: true,
  // },

  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      const date = format(row.getValue("createdAt"), "dd/MM/yyyy");
      return <div>{date}</div>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 30);
