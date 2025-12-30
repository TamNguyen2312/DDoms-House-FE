import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { AdminAppointmentItem } from "../types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
): ColumnDef<AdminAppointmentItem>[] => [
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
    id: "tenant_name",
    accessorFn: (row) => row.tenant.displayName || row.tenant.email,
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Người thuê" />
    ),
    cell: ({ row }) => {
      const tenant = row.original.tenant;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {tenant.displayName || tenant.email}
          </span>
          <span className="text-xs text-muted-foreground">{tenant.phone}</span>
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
      const unit = row.original.unit;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{unit.unitCode}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px]">
            {unit.propertyName}
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
      const unit = row.original.unit;
      const address = `${unit.addressLine}, ${unit.ward}${
        unit.district ? `, ${unit.district}` : ""
      }, ${unit.city}`;
      return (
        <span className="max-w-[250px] truncate" title={address}>
          {address}
        </span>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "landlord.displayName",
    header: ({ column }) => <ADLColumnHeader column={column} title="Chủ nhà" />,
    cell: ({ row }) => {
      const landlord = row.original.landlord;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {landlord.displayName || landlord.email}
          </span>
          <span className="text-xs text-muted-foreground">
            {landlord.phone}
          </span>
        </div>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Thời gian hẹn" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.startTime);
      return (
        <div className="flex flex-col">
          <span>{format(date, "dd/MM/yyyy")}</span>
          <span className="text-xs text-muted-foreground">
            {format(date, "HH:mm")}
          </span>
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
      const status = row.getValue("status") as string;

      const statusMap: Record<
        string,
        {
          label: string;
          variant: "default" | "secondary" | "destructive" | "outline";
          icon: React.ReactNode;
        }
      > = {
        PENDING: {
          label: "Chờ xác nhận",
          variant: "secondary",
          icon: <Clock className="mr-1 size-3" />,
        },
        CONFIRMED: {
          label: "Đã xác nhận",
          variant: "default",
          icon: <CheckCircle2 className="mr-1 size-3" />,
        },
        REJECTED: {
          label: "Đã từ chối",
          variant: "destructive",
          icon: <XCircle className="mr-1 size-3" />,
        },
        RESCHEDULED: {
          label: "Đã dời lịch",
          variant: "outline",
          icon: <Calendar className="mr-1 size-3" />,
        },
      };

      const statusInfo = statusMap[status] || {
        label: status,
        variant: "outline" as const,
        icon: null,
      };

      return (
        <Badge variant={statusInfo.variant}>
          {statusInfo.icon}
          {statusInfo.label}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "note",
    header: ({ column }) => <ADLColumnHeader column={column} title="Ghi chú" />,
    cell: ({ row }) => {
      const note = row.getValue("note") as string | undefined;
      if (!note) return <span className="text-muted-foreground">-</span>;
      return (
        <span className="max-w-[200px] truncate" title={note}>
          {note}
        </span>
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
      const date = format(new Date(row.original.createdAt), "dd/MM/yyyy");
      return <div>{date}</div>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 20);
