import {
  ContractBadge,
  type IContractStatus,
} from "@/components/contract/contract-badge";
import type { ColumnDef } from "@tanstack/react-table";
import type { IRentedUnit } from "../types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
): ColumnDef<IRentedUnit>[] => [
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
    accessorKey: "unitCode",
    header: ({ column }) => <ADLColumnHeader column={column} title="Phòng" />,
    cell: ({ row }) => (
      <span className="font-bold">#{row.getValue("unitCode")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "propertyName",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Bất động sản" />
    ),
    cell: ({ row }) => {
      const propertyAddress = row.original.propertyAddress;
      const city = row.original.city;
      return (
        <div className="flex flex-col">
          <span className="font-semibold">{row.getValue("propertyName")}</span>
          <span className="text-xs text-muted-foreground">
            {propertyAddress}, {city}
          </span>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "depositAmount",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Giá thuê" />
    ),
    cell: ({ row }) => {
      const price = row.getValue("depositAmount") as number;
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
    accessorKey: "landlordEmail",
    header: ({ column }) => <ADLColumnHeader column={column} title="Chủ nhà" />,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("landlordEmail")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "tenantEmail",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Email Người thuê" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("tenantEmail")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "contractStatus",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Hợp đồng" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("contractStatus") as IContractStatus;
      return <ContractBadge status={status} />;
    },
    enableHiding: true,
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày bắt đầu" />
    ),
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as string;
      return <span>{new Date(startDate).toLocaleDateString("vi-VN")}</span>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày kết thúc" />
    ),
    cell: ({ row }) => {
      const endDate = row.getValue("endDate") as string;
      return <span>{new Date(endDate).toLocaleDateString("vi-VN")}</span>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 20);
