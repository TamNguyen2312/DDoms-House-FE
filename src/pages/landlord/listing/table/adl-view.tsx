import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Handshake, Loader } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import EmptyData from "@/components/common/empty-data";
import LoadingCard from "@/components/common/loading-card";
import { useSidebar } from "@/components/ui/sidebar";
import { useWindowSize } from "@/hooks/useWindowSize";
import { createColumns } from "./adl-columns";
import { ADOPagination } from "./adl-pagination";
import { ADOToolbar } from "./adl-toolbar";
import { ADOViewList } from "./adl-view-list";
import { ADOViewGrid } from "./adl-view-grid";

interface ADOViewProps {
  data: ListingData[];
  actions?: (row: ListingData) => React.ReactNode;
  onRowClick?: (listingId: number | string) => void;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  statusFilter?: string | "all";
  onStatusFilterChange?: (status: string | "all") => void;
  onView?: (listingId: number | string) => void;
}

// Support both API response type (id: number) and dbListings type (id: string)
export type ListingData = {
  id: number | string;
  title: string;
  description: string;
  listedPrice: number;
  isPublic: boolean;
  status: string;
  createdAt: string;
  unitId?: number | { id: string; code: string } | string;
  landlordId?: number | { id: string; display_name?: string } | string;
  [key: string]: unknown;
};

export function ADLView({
  data,
  actions,
  onRowClick,
  pagination,
  onPaginationChange,
  statusFilter,
  onStatusFilterChange,
  onView,
}: ADOViewProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    title: true,
    description: false,
    listed_price: true,
    is_public: false,
    status: true,
    created_at: true,
    category: true,
  });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [height, setHeight] = useState("calc(100dvh - 336px)");
  const { state } = useSidebar();
  const [tableInitialized, setTableInitialized] = useState(false);
  const { width: winWidth } = useWindowSize();

  // Server-side pagination state
  const [pageIndex, setPageIndex] = useState(pagination?.currentPage ?? 0);
  const [pageSize, setPageSize] = useState(pagination?.pageSize ?? 30);

  // Sync with external pagination
  useEffect(() => {
    if (pagination) {
      setPageIndex(pagination.currentPage);
      setPageSize(pagination.pageSize);
    }
  }, [pagination]);

  const calculateHeight = useCallback(() => {
    const headerHeight = state === "collapsed" ? 48 : 64;
    return `calc(100dvh - ${headerHeight}px - 187px)`;
  }, [state]);

  useEffect(() => {
    setHeight(calculateHeight());
  }, [calculateHeight, state]);

  useEffect(() => {
    const heightTable = winWidth < 1000 ? 195 : 155;
    const headerHeight = state === "collapsed" ? 48 : 64;
    setHeight(`calc(100dvh - ${headerHeight}px - ${heightTable}px - 52px)`);
  }, [winWidth]);

  // Create columns with pagination-aware STT
  const baseColumns = createColumns(pageIndex, pageSize);

  const tableColumns: ColumnDef<ListingData>[] = actions
    ? [
        ...baseColumns,
        {
          id: "actions",
          cell: ({ row }) => (
            <div className="flex justify-end">{actions(row.original)}</div>
          ),
        },
      ]
    : baseColumns;

  const table = useReactTable<ListingData>({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    pageCount: pagination?.totalPages ?? -1,
    manualPagination: !!pagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
      if (onPaginationChange) {
        onPaginationChange(newPagination.pageIndex, newPagination.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pagination ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  // Đảm bảo bảng được khởi tạo đúng cách trước khi hiển thị bất kỳ thành phần nào sử dụng nó
  useEffect(() => {
    setTableInitialized(true);
  }, []);

  if (!tableInitialized) {
    return <LoadingCard Icon={Loader} title="Đang tải danh sách báo cáo..." />;
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-x-hidden">
      {/* Toolbar - Always visible */}
      <div className="shrink-0 mb-4">
        <ADOToolbar
          table={table}
          viewMode={viewMode}
          setViewMode={setViewMode}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />
      </div>
      {data.length > 0 ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-x-hidden">
          <div
            className={`flex-1 min-h-0 overflow-x-hidden ${
              viewMode === "table" ? "rounded-md border overflow-auto" : ""
            }`}
          >
            {viewMode === "table" ? (
              <ADOViewList table={table} onRowClick={onRowClick} />
            ) : (
              <ADOViewGrid table={table} actions={actions} onView={onView} />
            )}
          </div>
          <div className="shrink-0 overflow-x-hidden">
            <ADOPagination
              table={table}
              viewmode={viewMode}
              pagination={
                pagination
                  ? {
                      totalPages: pagination.totalPages,
                      totalElements: pagination.totalElements,
                      hasNext: pagination.hasNext,
                      hasPrevious: pagination.hasPrevious,
                    }
                  : undefined
              }
              onPaginationChange={onPaginationChange}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <EmptyData
            Icon={Handshake}
            title="Chưa có bài đăng!"
            description="Danh sách bài đăng của bạn đang trống. Hãy tạo các bài đăng khi cần thiết."
          />
        </div>
      )}
    </div>
  );
}
