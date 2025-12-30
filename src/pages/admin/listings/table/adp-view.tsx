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
import { Home, Loader } from "lucide-react";
import { useEffect, useState } from "react";

import EmptyData from "@/components/common/empty-data";
import LoadingCard from "@/components/common/loading-card";
import type { IListing } from "../types";
import { createColumns } from "./adp-columns";
import { ADPPagination } from "./adp-pagination";
import { ADPToolbar } from "./adp-toolbar";
import { ADPViewList } from "./adp-view-list";
import { ADPViewGrid } from "./adp-view-grid";

interface ADPViewProps {
  data: IListing[];
  actions?: (row: IListing) => React.ReactNode;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  onView?: (listingId: number) => void;
}

export function ADPView({
  data,
  actions,
  pagination,
  onPaginationChange,
  onView,
}: ADPViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // id: true,
    // unitId: true,
    // landlordId: true,
    title: true,
    description: false,
    listedPrice: true,
    isPublic: true,
    status: true,
    createdAt: false,
    updatedAt: false,
  });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [tableInitialized, setTableInitialized] = useState(false);
  // Server-side pagination state
  const [pageIndex, setPageIndex] = useState(pagination?.currentPage ?? 0);
  const [pageSize, setPageSize] = useState(pagination?.pageSize ?? 50);

  // Sync with external pagination
  useEffect(() => {
    if (pagination) {
      setPageIndex(pagination.currentPage);
      setPageSize(pagination.pageSize);
    }
  }, [pagination]);

  // Create columns with pagination-aware STT
  const baseColumns = createColumns(pageIndex, pageSize);

  const tableColumns: ColumnDef<IListing>[] = actions
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

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
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
  });

  // Đảm bảo bảng được khởi tạo đúng cách trước khi hiển thị bất kỳ thành phần nào sử dụng nó
  useEffect(() => {
    setTableInitialized(true);
  }, []);

  if (!tableInitialized) {
    return <LoadingCard Icon={Loader} title="Đang tải danh sách listing..." />;
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-x-hidden">
      {data.length > 0 ? (
        <div className="shrink-0 mb-4">
          <ADPToolbar
            table={table}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      ) : null}
      {data.length > 0 ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-x-hidden">
          <div
            className={`flex-1 min-h-0 overflow-x-hidden ${
              viewMode === "table" ? "rounded-md border overflow-auto" : ""
            }`}
          >
            {viewMode === "table" ? (
              <ADPViewList table={table} />
            ) : (
              <ADPViewGrid table={table} actions={actions} onView={onView} />
            )}
          </div>
          <div className="shrink-0 overflow-x-hidden">
            <ADPPagination
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
            />
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <EmptyData
            Icon={Home}
            title="Chưa có listing!"
            description="Danh sách listing của bạn đang trống."
          />
        </div>
      )}
    </div>
  );
}
