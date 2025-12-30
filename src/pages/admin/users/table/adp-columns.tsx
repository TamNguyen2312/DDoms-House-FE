import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CheckCircle2, Lock, Unlock, XCircle } from "lucide-react";
import type { IAdminUser } from "../api-types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to get Vietnamese role name
const getRoleDisplayName = (roleCode: string | undefined | null): string => {
  if (!roleCode || typeof roleCode !== "string") return "-";

  // Normalize to uppercase for case-insensitive matching
  const normalized = roleCode.toUpperCase().trim();

  const roleMap: Record<string, string> = {
    ADMIN: "Quản trị",
    LANDLORD: "Chủ nhà",
    TENANT: "Người thuê",
    // Handle various case formats (for backward compatibility)
    Admin: "Quản trị",
    Landlord: "Chủ nhà",
    Tenant: "Người thuê",
    admin: "Quản trị",
    landlord: "Chủ nhà",
    tenant: "Người thuê",
  };

  // Try normalized first, then original
  const displayName = roleMap[normalized] || roleMap[roleCode] || roleCode;

  // Debug: Log if role is not mapped (remove in production)
  if (
    process.env.NODE_ENV === "development" &&
    !roleMap[normalized] &&
    !roleMap[roleCode]
  ) {
    console.warn(
      `[Role Mapping] Unmapped role code: "${roleCode}" (normalized: "${normalized}")`
    );
  }

  return displayName;
};

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
): ColumnDef<IAdminUser>[] => [
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
    accessorKey: "email",
    header: ({ column }) => <ADLColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <span className="fw-bold">{row.getValue("email")}</span>,
    enableHiding: true,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Số điện thoại" />
    ),
    cell: ({ row }) => <span>{row.getValue("phone")}</span>,
    enableHiding: true,
  },
  {
    accessorKey: "roles",
    header: ({ column }) => <ADLColumnHeader column={column} title="Vai trò" />,
    cell: ({ row }) => {
      const roles = row.getValue("roles") as string[];
      const roleCode = roles && roles.length > 0 ? roles[0] : null;
      const roleName = getRoleDisplayName(roleCode);
      return <Badge variant="outline">{roleName}</Badge>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("active") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? (
            <>
              <CheckCircle2 className="mr-1 size-3" />
              Hoạt động
            </>
          ) : (
            <>
              <XCircle className="mr-1 size-3" />
              Không hoạt động
            </>
          )}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "locked",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Khóa tài khoản" />
    ),
    cell: ({ row }) => {
      const isLocked = row.getValue("locked") as boolean;
      return (
        <Badge variant={isLocked ? "destructive" : "outline"}>
          {isLocked ? (
            <>
              <Lock className="mr-1 size-3" />
              Đã khóa
            </>
          ) : (
            <>
              <Unlock className="mr-1 size-3" />
              Mở khóa
            </>
          )}
        </Badge>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "twoFaEnabled",
    header: ({ column }) => <ADLColumnHeader column={column} title="2FA" />,
    cell: ({ row }) => {
      const twoFaEnabled = row.getValue("twoFaEnabled") as boolean;
      return (
        <Badge variant={twoFaEnabled ? "default" : "secondary"}>
          {twoFaEnabled ? "Bật" : "Tắt"}
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
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày cập nhật" />
    ),
    cell: ({ row }) => {
      const date = format(new Date(row.getValue("updatedAt")), "dd/MM/yyyy");
      return <div>{date}</div>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 20);
