import { BadgePublicListing } from "@/components/listing/badge-public-listing";
import { BadgeStatusListing } from "@/components/listing/badge-status-listing";
import type { IListing } from "@/lib/dbListings";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ADLColumnHeader } from "./adl-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 30
): ColumnDef<IListing>[] => [
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
    enableGlobalFilter: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <ADLColumnHeader column={column} title="Tiêu đề" />,
    cell: ({ row }) => <span className="fw-bold">{row.getValue("title")}</span>,
    enableHiding: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <ADLColumnHeader column={column} title="Mô tả" />,
    cell: ({ row }) => <div>{row.getValue("description")}</div>,
    enableHiding: true,
  },
  {
    accessorKey: "listedPrice",
    header: ({ column }) => <ADLColumnHeader column={column} title="Giá" />,
    cell: ({ row }) => {
      const price = row.getValue("listedPrice") as number;
      return (
        <div className="font-semibold">
          {price
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(price)
            : "-"}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "isPublic",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Công khai" />
    ),
    cell: ({ row }) => {
      console.log("=========", row);
      return (
        <div>
          <BadgePublicListing value={row.getValue("isPublic")} />
        </div>
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
      return (
        <div>
          <BadgeStatusListing value={row.getValue("status")} />
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
      const date = format(new Date(row.getValue("createdAt")), "dd/MM/yyyy");
      return <div>{date}</div>;
    },
    enableHiding: true,
    enableGlobalFilter: false,
  },
];

// Default export for backward compatibility (uses page 0, size 10)
export const columns = createColumns(0, 30);
