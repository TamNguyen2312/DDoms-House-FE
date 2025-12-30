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

/**
 * Props cho component phân trang của bảng dữ liệu
 * @template TData Kiểu dữ liệu của hàng trong bảng
 */
interface ADOPaginationProps<TData> {
  table: Table<TData>; // Instance của bảng từ TanStack Table
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

/**
 * Component hiển thị phân trang và điều khiển cho bảng dữ liệu
 * Cung cấp giao diện để:
 * - Chọn số hàng mỗi trang
 * - Điều hướng giữa các trang
 * - Hiển thị thông tin về số hàng được chọn
 * @template TData Kiểu dữ liệu của hàng trong bảng
 */
export function ADPPagination<TData>({
  table,
  className,
  viewmode = "table",
  pagination,
  onPaginationChange,
}: ADOPaginationProps<TData>) {
  // Lấy số hàng được chọn sau khi đã áp dụng bộ lọc
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  // Lấy tổng số hàng sau khi đã áp dụng bộ lọc (client-side) hoặc từ server
  const totalFilteredRowCount =
    pagination?.totalElements ?? table.getFilteredRowModel().rows.length;
  // Lấy chỉ số trang hiện tại (0-based index)
  const currentPageIndex = table.getState().pagination.pageIndex;
  // Lấy kích thước trang hiện tại
  const currentPageSize = table.getState().pagination.pageSize;
  // Lấy tổng số trang từ server hoặc client
  const pageCount = table.getPageCount();
  const totalPages =
    pagination?.totalPages ??
    (pageCount > 0
      ? pageCount
      : Math.max(1, Math.ceil(totalFilteredRowCount / currentPageSize)));
  // Kiểm tra khả năng chuyển đến trang trước (server-side hoặc client-side)
  const canGoPrevious = pagination
    ? pagination.hasPrevious
    : table.getCanPreviousPage();
  // Kiểm tra khả năng chuyển đến trang tiếp theo (server-side hoặc client-side)
  const canGoNext = pagination ? pagination.hasNext : table.getCanNextPage();

  // Các tùy chọn kích thước trang
  const pageSizeOptions = [15, 20, 30, 40, 50];

  return (
    <div
      className={cn(
        "flex items-center justify-between",
        className,
        viewmode === "table" ? undefined : "justify-end"
      )}
    >
      {/* Thông tin số hàng được chọn */}
      {viewmode === "table" ? (
        <div className="text-muted-foreground text-xs sm:text-sm">
          {selectedRowCount} trên {totalFilteredRowCount} dòng được chọn
        </div>
      ) : (
        ""
      )}

      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Chọn số hàng mỗi trang */}
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
              const newSize = Number(value);
              table.setPageSize(newSize);
              if (onPaginationChange) {
                onPaginationChange(0, newSize); // Reset to first page when size changes
              }
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

        {/* Hiển thị thông tin trang hiện tại */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Trang {currentPageIndex + 1} trên {totalPages}
        </div>

        {/* Các nút điều hướng trang */}
        <div className="flex items-center space-x-2">
          {/* Nút đến trang đầu tiên */}
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => {
              table.setPageIndex(0);
              if (onPaginationChange) {
                onPaginationChange(0, currentPageSize);
              }
            }}
            disabled={!canGoPrevious}
            title="Đến trang đầu tiên"
          >
            <span className="sr-only">Đến trang đầu tiên</span>
            <ChevronsLeft />
          </Button>

          {/* Nút đến trang trước */}
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => {
              const prevPage = currentPageIndex - 1;
              table.previousPage();
              if (onPaginationChange) {
                onPaginationChange(prevPage, currentPageSize);
              }
            }}
            disabled={!canGoPrevious}
            title="Đến trang trước"
          >
            <span className="sr-only">Đến trang trước</span>
            <ChevronLeft />
          </Button>

          {/* Nút đến trang tiếp theo */}
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => {
              const nextPage = currentPageIndex + 1;
              table.nextPage();
              if (onPaginationChange) {
                onPaginationChange(nextPage, currentPageSize);
              }
            }}
            disabled={!canGoNext}
            title="Đến trang tiếp theo"
          >
            <span className="sr-only">Đến trang tiếp theo</span>
            <ChevronRight />
          </Button>

          {/* Nút đến trang cuối cùng */}
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => {
              const lastPage = totalPages - 1;
              table.setPageIndex(lastPage);
              if (onPaginationChange) {
                onPaginationChange(lastPage, currentPageSize);
              }
            }}
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
