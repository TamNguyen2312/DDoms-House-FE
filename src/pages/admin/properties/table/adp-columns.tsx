import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import type { IAdminProperty } from "../api-types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
): ColumnDef<IAdminProperty>[] => [
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
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Tên địa điểm" />
    ),
    cell: ({ row }) => (
      <span
        className="fw-bold max-w-[120px] sm:max-w-none truncate block text-xs sm:text-sm"
        title={row.getValue("name") as string}
      >
        {row.getValue("name")}
      </span>
    ),
    enableHiding: true,
  },
  {
    id: "address",
    accessorFn: (row) => {
      const property = row as IAdminProperty;
      return `${property.addressLine}, ${property.ward}${
        property.district ? `, ${property.district}` : ""
      }, ${property.city}`;
    },
    header: ({ column }) => <ADLColumnHeader column={column} title="Địa chỉ" />,
    cell: ({ row }) => {
      const property = row.original;
      const address = `${property.addressLine}, ${property.ward}${
        property.district ? `, ${property.district}` : ""
      }, ${property.city}`;
      return (
        <span
          className="max-w-[150px] sm:max-w-[300px] truncate block text-xs sm:text-sm"
          title={address}
        >
          {address}
        </span>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "landlordId",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="ID Chủ nhà" />
    ),
    cell: ({ row }) => <span>#{row.getValue("landlordId")}</span>,
    enableHiding: true,
  },
  {
    accessorKey: "documentsVerified",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Xác thực tài liệu" />
    ),
    cell: ({ row }) => {
      const isVerified = row.getValue("documentsVerified") as boolean;
      return (
        <Badge variant={isVerified ? "default" : "secondary"}>
          {isVerified ? (
            <>
              <CheckCircle2 className="mr-1 size-3" />
              Đã xác thực
            </>
          ) : (
            <>
              <XCircle className="mr-1 size-3" />
              Chưa xác thực
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
      const date = format(new Date(row.getValue("createdAt")), "dd/MM/yyyy");
      return <div>{date}</div>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 20);
