import { RentalRequestBadge } from "@/components/rental-request/rental-request-badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { IRentalRequest } from "../types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 30
): ColumnDef<IRentalRequest>[] => [
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
    accessorKey: "unit",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Phòng/Địa chỉ" />
    ),
    cell: ({ row }) => {
      const request = row.original;
      const unit = request.unit;
      const unitCode = unit?.unitCode || request.unitCode;
      const propertyName = unit?.propertyName || request.propertyName;
      const addressLine = unit?.addressLine || request.addressLine;
      const ward = unit?.ward || request.ward;
      const district = unit?.district || request.district;
      const city = unit?.city || request.city;

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
      // Check if tenant info exists (from nested structure) or use tenantId
      const tenant = request.tenant;
      if (tenant) {
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {tenant.displayName || tenant.email}
            </div>
            <div className="text-xs text-muted-foreground">{tenant.phone}</div>
          </div>
        );
      }
      // If no nested tenant but has tenantId, show placeholder
      if (request.tenantId) {
        return (
          <span className="text-muted-foreground text-sm">
            ID: {request.tenantId}
          </span>
        );
      }
      return <span className="text-muted-foreground">-</span>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "message",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Tin nhắn" />
    ),
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      return (
        <div className="max-w-[300px] truncate text-sm" title={message}>
          {message || "-"}
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
      const status = row.getValue("status") as IRentalRequest["status"];
      return <RentalRequestBadge status={status} />;
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

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 30);
