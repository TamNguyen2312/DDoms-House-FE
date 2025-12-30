import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flexRender, type Table as TableTanstack } from "@tanstack/react-table";
import type { IListing } from "../types";

interface ADPViewListProps {
  table: TableTanstack<IListing>;
}

export function ADPViewList({ table }: ADPViewListProps) {
  if (!table) {
    return (
      <div className="flex size-full items-center justify-center">
        Đang tải dữ liệu &ldquo;Listing&rdquo;...
      </div>
    );
  }

  const rowModel = table.getRowModel();

  if (!rowModel || rowModel.rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg">
        Không tìm thấy &ldquo;Listing&rdquo; phù hợp với tìm kiếm.
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-x-auto -mx-2 sm:mx-0">
      <table className="w-full min-w-max caption-bottom text-xs sm:text-sm">
        <TableHeader className="bg-secondary sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm"
                >
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-2 sm:px-4 py-2 sm:py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </table>
    </div>
  );
}
