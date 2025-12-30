import { RepairRequestBadge } from "@/components/repair-request/repair-request-badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { IRepairRequest } from "@/types/repair-request.types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
): ColumnDef<IRepairRequest>[] => [
  {
    id: "stt",
    header: "#",
    cell: (info) => {
      return pageIndex * pageSize + info.row.index + 1;
    },
    size: 24,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Tiêu đề" />
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="font-medium max-w-[200px] truncate">{title}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Phòng/Địa chỉ" />
    ),
    cell: ({ row }) => {
      const request = row.original;
      const unitCode = request.unitCode;
      const propertyName = request.propertyName;
      const addressLine = request.addressLine;
      const ward = request.ward;
      const district = request.district;
      const city = request.city;

      if (!unitCode && !propertyName) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="space-y-1">
          {unitCode && <div className="font-medium">{unitCode}</div>}
          {(propertyName || addressLine) && (
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {propertyName && `${propertyName}`}
              {propertyName && addressLine && " - "}
              {addressLine}
              {ward && `, ${ward}`}
              {district && `, ${district}`}
              {city && `, ${city}`}
            </div>
          )}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "tenant",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Người thuê" />
    ),
    cell: ({ row }) => {
      const request = row.original;
      const tenantFullName = request.tenantFullName;
      const tenantEmail = request.tenantEmail;
      const tenantPhone = request.tenantPhone;

      if (!tenantFullName && !tenantEmail) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="space-y-1">
          <div className="font-medium">
            {tenantFullName || tenantEmail}
          </div>
          {tenantPhone && (
            <div className="text-xs text-muted-foreground">{tenantPhone}</div>
          )}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "landlord",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Chủ nhà" />
    ),
    cell: ({ row }) => {
      const request = row.original;
      const landlordFullName = request.landlordFullName;
      const landlordEmail = request.landlordEmail;
      const landlordPhone = request.landlordPhone;

      if (!landlordFullName && !landlordEmail) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <div className="space-y-1">
          <div className="font-medium">
            {landlordFullName || landlordEmail}
          </div>
          {landlordPhone && (
            <div className="text-xs text-muted-foreground">{landlordPhone}</div>
          )}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Mô tả" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[300px] truncate text-sm" title={description}>
          {description || "-"}
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
      const status = row.getValue("status") as IRepairRequest["status"];
      return <RepairRequestBadge status={status} />;
    },
    enableHiding: true,
  },
  {
    accessorKey: "occurredAt",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Thời gian xảy ra" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("occurredAt") as string;
      return date ? (
        <div>{format(new Date(date), "dd/MM/yyyy HH:mm")}</div>
      ) : (
        <span className="text-muted-foreground">-</span>
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
      const date = row.getValue("createdAt") as string;
      return <div>{format(new Date(date), "dd/MM/yyyy HH:mm")}</div>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility
export const columns = createColumns(0, 20);

