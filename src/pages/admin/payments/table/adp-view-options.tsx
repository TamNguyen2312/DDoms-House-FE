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
  payment_id: "Mã thanh toán",
  invoice_id: "Mã hóa đơn",
  tenant_id: "Mã người thuê",
  provider: "Phương thức",
  provider_txn_id: "Mã giao dịch",
  amount: "Số tiền",
  status: "Trạng thái",
  "invoice.cycle_month": "Chu kỳ",
  created_at: "Ngày tạo",
  succeeded_at: "Ngày hoàn thành",
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

