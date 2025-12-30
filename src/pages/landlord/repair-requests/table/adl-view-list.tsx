import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { flexRender, type Table as TableTanstack } from "@tanstack/react-table";
import type { IRepairRequest } from "@/types/repair-request.types";

interface ADLViewListProps {
  table: TableTanstack<IRepairRequest>;
}

export function ADLViewList({ table }: ADLViewListProps) {
  if (!table) {
    return (
      <div className="flex size-full items-center justify-center">
        Đang tải dữ liệu &ldquo;Yêu cầu sửa chữa&rdquo;...
      </div>
    );
  }

  const rowModel = table.getRowModel();

  if (!rowModel || rowModel.rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg">
        Không tìm thấy &ldquo;Yêu cầu sửa chữa&rdquo; phù hợp với tìm kiếm.
      </div>
    );
  }

  return (
    <table className="w-full min-w-max caption-bottom text-sm">
      <TableHeader className="bg-primary sticky top-0 z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-primary">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="font-semibold text-white">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row, index) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
            className={cn(
              index % 2 === 0 ? "bg-background" : "bg-muted/30 dark:bg-muted/20"
            )}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </table>
  );
}

