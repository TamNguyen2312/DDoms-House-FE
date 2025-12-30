import { ContractBadge, type IContractStatus } from "@/components/contract/contract-badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { AdminContractItem, IContract } from "../types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
): ColumnDef<AdminContractItem | IContract>[] => [
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
    id: "contract_id",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Mã hợp đồng" />
    ),
    cell: ({ row }) => {
      const contract = row.original as AdminContractItem;
      return <span className="font-medium">#{contract.id}</span>;
    },
    enableHiding: true,
  },
  {
    id: "tenant_name",
    accessorFn: (row) => {
      const item = row as AdminContractItem;
      return item.tenant?.displayName || item.tenant?.email || "";
    },
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Người thuê" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminContractItem;
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
    accessorKey: "unit.unitCode",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Mã phòng" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminContractItem;
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
    accessorKey: "unit.addressLine",
    header: ({ column }) => <ADLColumnHeader column={column} title="Địa chỉ" />,
    cell: ({ row }) => {
      const item = row.original as AdminContractItem;
      const unit = item.unit;
      const address = unit
        ? `${unit.addressLine}, ${unit.ward}${
            unit.district ? `, ${unit.district}` : ""
          }, ${unit.city}`
        : "-";
      return (
        <span className="max-w-[250px] truncate" title={address}>
          {address}
        </span>
      );
    },
    enableHiding: true,
  },
  {
    id: "landlord_name",
    accessorFn: (row) => {
      const item = row as AdminContractItem;
      return item.landlord?.displayName || item.landlord?.email || "";
    },
    header: ({ column }) => <ADLColumnHeader column={column} title="Chủ nhà" />,
    cell: ({ row }) => {
      const item = row.original as AdminContractItem;
      const landlord = item.landlord;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {landlord?.displayName || landlord?.email || "-"}
          </span>
          <span className="text-xs text-muted-foreground">
            {landlord?.phone || "-"}
          </span>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "depositAmount",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Tiền cọc" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminContractItem;
      const deposit = item.depositAmount;
      if (typeof deposit !== "number") return <span>-</span>;
      return (
        <span>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(deposit)}
        </span>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày bắt đầu" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminContractItem;
      if (!item.startDate) return <span>-</span>;
      const date = new Date(item.startDate);
      return <div>{format(date, "dd/MM/yyyy")}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày kết thúc" />
    ),
    cell: ({ row }) => {
      const item = row.original as AdminContractItem;
      if (!item.endDate) return <span>-</span>;
      const date = new Date(item.endDate);
      return <div>{format(date, "dd/MM/yyyy")}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as IContractStatus;
      return (
          <ContractBadge status={status} />
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
      const item = row.original as AdminContractItem;
      if (!item.createdAt) return <span>-</span>;
      const date = format(new Date(item.createdAt), "dd/MM/yyyy");
      return <div>{date}</div>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 20);
