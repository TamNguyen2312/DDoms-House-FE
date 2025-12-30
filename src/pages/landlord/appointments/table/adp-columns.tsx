import { AppointmentBadge } from "@/components/appointment/appoinment-badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { IAppointment, IAppointmentStatus } from "../types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 30
): ColumnDef<IAppointment>[] => [
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
    accessorKey: "propertyName",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Tên bất động sản" />
    ),
    cell: ({ row }) => (
      <span className="fw-bold">{row.original.propertyName}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: "unitCode",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Mã phòng" />
    ),
    cell: ({ row }) => <span className="fw-bold">{row.original.unitCode}</span>,
    enableHiding: true,
  },
  {
    accessorKey: "addressLine",
    header: ({ column }) => <ADLColumnHeader column={column} title="Địa chỉ" />,
    cell: ({ row }) => {
      const { addressLine, ward, district, city } = row.original;
      const fullAddress = `${addressLine}, ${ward}, ${district}, ${city}`;
      return (
        <span className="fw-bold max-w-[300px] truncate block" title={fullAddress}>
          {fullAddress}
        </span>
      );
    },
    enableHiding: true,
    size: 300,
    maxSize: 400,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as IAppointmentStatus;
      return <AppointmentBadge status={status} />;
    },
    enableHiding: true,
  },
  {
    accessorKey: "startTime",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Thời gian" />
    ),
    cell: ({ row }) => {
      const date = format(
        new Date(row.getValue("startTime")),
        "dd/MM/yyyy HH:mm"
      );
      return <div>{date}</div>;
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
export const columns = createColumns(0, 30);
