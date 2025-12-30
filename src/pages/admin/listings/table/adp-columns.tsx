import { BadgeStatusListing } from "@/components/listing/badge-status-listing";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import type { IListing } from "../types";
import { ADLColumnHeader } from "./adp-column-header";

// Helper function to create columns with pagination-aware STT
export const createColumns = (
  pageIndex: number = 0,
  pageSize: number = 20
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
  },
  {
    accessorKey: "title",
    header: ({ column }) => <ADLColumnHeader column={column} title="Tiêu đề" />,
    cell: ({ row }) => <span>{row.getValue("title")}</span>,
    enableHiding: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => <ADLColumnHeader column={column} title="Mô tả" />,
    cell: ({ row }) => {
      const description = row.getValue("description") as string;

      // Strip HTML tags from description using regex
      const stripHtml = (html: string) => {
        if (!html) return "";
        // Remove HTML tags
        const stripped = html.replace(/<[^>]*>/g, "");
        // Decode HTML entities
        const decoded = stripped
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        return decoded.trim();
      };

      const plainText = stripHtml(description);
      const truncatedDescription =
        plainText && plainText.length > 50
          ? `${plainText.substring(0, 50)}...`
          : plainText;

      return (
        <span className="max-w-[300px] truncate" title={plainText}>
          {truncatedDescription}
        </span>
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: "listedPrice",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Giá niêm yết" />
    ),
    cell: ({ row }) => {
      const price = row.getValue("listedPrice") as number;
      return (
        <span>
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
    accessorKey: "isPublic",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Công khai" />
    ),
    cell: ({ row }) => {
      const isPublic = row.getValue("isPublic") as boolean;
      return (
        <Badge variant={isPublic ? "default" : "secondary"}>
          {isPublic ? (
            <>
              <CheckCircle2 className="mr-1 size-3" />
              Công khai
            </>
          ) : (
            <>
              <XCircle className="mr-1 size-3" />
              Riêng tư
            </>
          )}
        </Badge>
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
      return <BadgeStatusListing value={row.getValue("status")} />;
    },
    enableHiding: true,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <ADLColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("createdAt")
        ? format(new Date(row.getValue("createdAt")), "dd/MM/yyyy")
        : "-";
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
      const date = row.getValue("updatedAt")
        ? format(new Date(row.getValue("updatedAt")), "dd/MM/yyyy")
        : "-";
      return <div>{date}</div>;
    },
    enableHiding: true,
  },
];

// Default export for backward compatibility (uses page 0, size 20)
export const columns = createColumns(0, 20);
