import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IListing } from "@/lib/dbListings";
import { flexRender, type Table as TableTanstack } from "@tanstack/react-table";
import { columns } from "./adl-columns";

interface ADOViewListProps {
  table: TableTanstack<IListing>;
  onRowClick?: (listingId: number) => void;
}

export function ADOViewList({ table, onRowClick }: ADOViewListProps) {
  if (!table) {
    return (
      <div className="flex size-full items-center justify-center">
        Đang tải dữ liệu &ldquo;Đối Tác&rdquo;...
      </div>
    );
  }

  const rowModel = table.getRowModel();

  if (!rowModel || rowModel.rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg">
        Không tìm thấy kết quả phù hợp với tìm kiếm.
      </div>
    );
  }

  return (
    <Table className={cn("")}>
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
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              onClick={(e) => {
                // Prevent navigation when clicking on actions column or interactive elements
                const target = e.target as HTMLElement;
                if (
                  target.closest("button") ||
                  target.closest("[role='menuitem']") ||
                  target.closest(".actions-column")
                ) {
                  return;
                }
                onRowClick?.(row.original.id);
              }}
              className={cn(
                onRowClick ? "cursor-pointer hover:bg-muted/50" : "",
                index % 2 === 0
                  ? "bg-background"
                  : "bg-muted/30 dark:bg-muted/20"
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={
                    cell.column.id === "actions" ? "actions-column" : ""
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              Không tìm thấy kết quả.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
