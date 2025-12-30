import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface ADOPaginationProps<TData> {
  table: Table<TData>;
  className?: string;
  viewmode?: "table" | "grid";
  pagination?: {
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export function ADPPagination<TData>({
  table,
  className,
  viewmode = "table",
  pagination,
}: ADOPaginationProps<TData>) {
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const totalFilteredRowCount = pagination
    ? pagination.totalElements
    : table.getFilteredRowModel().rows.length;
  const currentPageIndex = table.getState().pagination.pageIndex;
  const currentPageSize = table.getState().pagination.pageSize;
  const totalPages = pagination ? pagination.totalPages : table.getPageCount();
  const canGoPrevious = pagination
    ? pagination.hasPrevious
    : table.getCanPreviousPage();
  const canGoNext = pagination ? pagination.hasNext : table.getCanNextPage();

  const pageSizeOptions = [10, 20, 30, 40, 50];

  return (
    <div
      className={cn(
        "flex items-center justify-between",
        className,
        viewmode === "table" ? undefined : "justify-end"
      )}
    >
      {viewmode === "table" ? (
        <div className="text-muted-foreground text-xs sm:text-sm">
          {selectedRowCount} trên {totalFilteredRowCount} dòng được chọn
        </div>
      ) : (
        ""
      )}

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          {viewmode === "table" ? (
            <p className="whitespace-nowrap text-xs font-medium sm:text-sm">
              Dòng mỗi trang
            </p>
          ) : (
            <p className="whitespace-nowrap text-xs font-medium sm:text-sm">
              Danh sách thể hiện tổng
            </p>
          )}

          <Select
            value={`${currentPageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={currentPageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Trang {currentPageIndex + 1} trên {totalPages}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!canGoPrevious}
            title="Đến trang đầu tiên"
          >
            <span className="sr-only">Đến trang đầu tiên</span>
            <ChevronsLeft />
          </Button>

          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!canGoPrevious}
            title="Đến trang trước"
          >
            <span className="sr-only">Đến trang trước</span>
            <ChevronLeft />
          </Button>

          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!canGoNext}
            title="Đến trang tiếp theo"
          >
            <span className="sr-only">Đến trang tiếp theo</span>
            <ChevronRight />
          </Button>

          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!canGoNext}
            title="Đến trang cuối cùng"
          >
            <span className="sr-only">Đến trang cuối cùng</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
