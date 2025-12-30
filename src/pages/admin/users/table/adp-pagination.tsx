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
  onPaginationChange?: (page: number, pageSize: number) => void;
}

export function ADPPagination<TData>({
  table,
  className,
  viewmode = "table",
  pagination,
  onPaginationChange,
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

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value);
    // Update table state for UI
    table.setPageSize(newPageSize);
    // Reset to first page when changing page size and notify parent
    if (onPaginationChange) {
      onPaginationChange(0, newPageSize);
    }
  };

  const handlePageChange = (newPageIndex: number) => {
    // Update table state for UI
    table.setPageIndex(newPageIndex);
    // Notify parent to fetch new page from server
    if (onPaginationChange) {
      onPaginationChange(newPageIndex, currentPageSize);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0",
        className,
        viewmode === "table" ? undefined : "justify-end"
      )}
    >
      {viewmode === "table" ? (
        <div className="text-muted-foreground text-xs sm:text-sm hidden sm:block">
          {selectedRowCount} trên {totalFilteredRowCount} dòng được chọn
        </div>
      ) : (
        ""
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:space-x-4 lg:space-x-6">
        <div className="flex items-center justify-between sm:justify-start space-x-2">
          {viewmode === "table" ? (
            <p className="whitespace-nowrap text-xs font-medium sm:text-sm hidden sm:block">
              Dòng mỗi trang
            </p>
          ) : (
            <p className="whitespace-nowrap text-xs font-medium sm:text-sm hidden sm:block">
              Danh sách thể hiện tổng
            </p>
          )}

          <Select
            value={`${currentPageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px] sm:w-[70px]">
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

        <div className="flex items-center justify-center text-xs sm:text-sm font-medium">
          <span className="hidden sm:inline">Trang </span>
          <span>{currentPageIndex + 1}</span>
          <span className="hidden sm:inline"> trên {totalPages}</span>
          <span className="sm:hidden">/{totalPages}</span>
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => handlePageChange(0)}
            disabled={!canGoPrevious}
            title="Đến trang đầu tiên"
          >
            <span className="sr-only">Đến trang đầu tiên</span>
            <ChevronsLeft />
          </Button>

          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => handlePageChange(currentPageIndex - 1)}
            disabled={!canGoPrevious}
            title="Đến trang trước"
          >
            <span className="sr-only">Đến trang trước</span>
            <ChevronLeft />
          </Button>

          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => handlePageChange(currentPageIndex + 1)}
            disabled={!canGoNext}
            title="Đến trang tiếp theo"
          >
            <span className="sr-only">Đến trang tiếp theo</span>
            <ChevronRight />
          </Button>

          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => handlePageChange(totalPages - 1)}
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
