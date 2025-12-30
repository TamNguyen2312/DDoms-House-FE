import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Table } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";
import React from "react";

const COLUMN_NAME_MAP: Record<string, string> = {
  id: "ID",
  unitId: "Unit ID",
  landlordId: "Landlord ID",
  title: "Tiêu đề",
  description: "Mô tả",
  listedPrice: "Giá niêm yết",
  isPublic: "Công khai",
  status: "Trạng thái",
  createdAt: "Ngày tạo",
  updatedAt: "Ngày cập nhật",
};

interface ADPViewOptionsProps<TData> {
  table: Table<TData>;
}

export function ADPViewOptions<TData>({
  table,
}: ADPViewOptionsProps<TData>): React.JSX.Element {
  const getColumnName = (columnId: string): string => {
    return COLUMN_NAME_MAP[columnId] || columnId;
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 items-center gap-1 lg:flex"
        >
          <Settings2 className="size-4" />
          <span>Cột</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {getColumnName(column.id)}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

