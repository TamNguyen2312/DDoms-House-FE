import { ContractBadge } from "@/components/contract/contract-badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ADLColumnHeader } from "./adp-column-header";

// Contract type based on API response
export interface IContractUnit {
  unitId: number;
  unitCode: string;
  propertyId: number;
  propertyName: string;
  addressLine: string;
  ward: string;
  district: string | null;
  city: string;
}

export interface IContractUser {
  userId: number;
  displayName: string | null;
  email: string;
  phone: string;
}

export interface IContractMedia {
  id: number;
  ownerType: string;
  ownerId: number;
  fileId: number;
  sortOrder: number;
  filePath: string;
  thumbnailUrl: string;
  mimeType: string;
  sizeBytes: number;
}

export interface IContract {
  id: number;
  unit: IContractUnit;
  landlord: IContractUser;
  tenant: IContractUser;
  startDate: string;
  endDate: string;
  pendingEndDate: string | null;
  status:
    | "SENT"
    | "DRAFT"
    | "SIGNED"
    | "ACTIVE"
    | "TERMINATION_PENDING"
    | "CANCELLED"
    | "EXPIRED";
  depositAmount: number;
  createdAt: string;
  media: IContractMedia[];
}

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 30
): ColumnDef<IContract>[] => [
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
    accessorKey: "id",
    header: () => <ADLColumnHeader title="Mã hợp đồng" />,
    cell: ({ row }) => (
      <span className="font-medium">#{row.getValue("id")}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "unit",
    header: () => <ADLColumnHeader title="Phòng/Địa chỉ" />,
    cell: ({ row }) => {
      const unit = row.original.unit;
      return (
        <div className="space-y-1">
          <div className="font-medium">{unit.unitCode}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            {unit.propertyName} - {unit.addressLine}
          </div>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "tenant",
    header: () => <ADLColumnHeader title="Người thuê" />,
    cell: ({ row }) => {
      const tenant = row.original.tenant;
      return (
        <div className="space-y-1">
          <div className="font-medium">
            {tenant.displayName || tenant.email}
          </div>
          <div className="text-xs text-muted-foreground">{tenant.phone}</div>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "depositAmount",
    header: () => <ADLColumnHeader title="Tiền đặt cọc" />,
    cell: ({ row }) => {
      const amount = row.getValue("depositAmount") as number;
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
    accessorKey: "startDate",
    header: () => <ADLColumnHeader title="Ngày bắt đầu" />,
    cell: ({ row }) => {
      const date = row.getValue("startDate") as string;
      return <div>{format(new Date(date), "dd/MM/yyyy")}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "endDate",
    header: () => <ADLColumnHeader title="Ngày kết thúc" />,
    cell: ({ row }) => {
      const date = row.getValue("endDate") as string;
      return <div>{format(new Date(date), "dd/MM/yyyy")}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: () => <ADLColumnHeader title="Trạng thái" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as
        | "SENT"
        | "DRAFT"
        | "SIGNED"
        | "ACTIVE"
        | "TERMINATION_PENDING"
        | "CANCELLED"
        | "EXPIRED";
      return <ContractBadge status={status} />;
    },
    enableHiding: true,
  },
  {
    accessorKey: "createdAt",
    header: () => <ADLColumnHeader title="Ngày tạo" />,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string;
      return <div>{format(new Date(date), "dd/MM/yyyy HH:mm")}</div>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 30)
export const columns = createColumns(0, 30);
