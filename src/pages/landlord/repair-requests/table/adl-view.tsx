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
import { Loader, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import EmptyData from "@/components/common/empty-data";
import LoadingCard from "@/components/common/loading-card";
import type {
  IRepairRequest,
  IRepairRequestStatus,
} from "@/types/repair-request.types";
import { createColumns } from "./adl-columns";
import { ADLPagination } from "./adl-pagination";
import { ADLToolbar } from "./adl-toolbar";
import { ADLViewList } from "./adl-view-list";

interface ADLViewProps {
  data: IRepairRequest[];
  actions?: (row: IRepairRequest) => React.ReactNode;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  statusFilter?: IRepairRequestStatus | "all";
  onStatusFilterChange?: (status: IRepairRequestStatus | "all") => void;
}

export function ADLView({
  data,
  actions,
  pagination,
  onPaginationChange,
  statusFilter,
  onStatusFilterChange,
}: ADLViewProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    title: true,
    unit: true,
    tenant: false,
    description: true,
    status: true,
    occurredAt: true,
    createdAt: true,
  });
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [tableInitialized, setTableInitialized] = useState(false);

  // Server-side pagination state
  const [pageIndex, setPageIndex] = useState(pagination?.currentPage ?? 0);
  const [pageSize, setPageSize] = useState(pagination?.pageSize ?? 30);

  // Sync with external pagination
  useEffect(() => {
    if (pagination) {
      setPageIndex(pagination.currentPage);
      setPageSize(pagination.pageSize);
    }
  }, [pagination?.currentPage, pagination?.pageSize]);

  // Create columns with pagination-aware STT
  const baseColumns = createColumns(pageIndex, pageSize);

  const tableColumns: ColumnDef<IRepairRequest>[] = actions
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

  useEffect(() => {
    setTableInitialized(true);
  }, []);

  if (!tableInitialized) {
    return (
      <LoadingCard
        Icon={Loader}
        title="Đang tải danh sách yêu cầu sửa chữa..."
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-x-hidden">
      {/* Toolbar - Always visible */}
      <div className="shrink-0 mb-4">
        <ADLToolbar
          table={table}
          viewMode={viewMode}
          setViewMode={setViewMode}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />
      </div>
      {data?.length > 0 ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-x-hidden">
          <div
            className={`flex-1 min-h-0 overflow-x-hidden ${
              viewMode === "table" ? "rounded-md border overflow-auto" : ""
            }`}
          >
            <ADLViewList table={table} />
          </div>
          <div className="shrink-0 overflow-x-hidden">
            <ADLPagination
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
            Icon={Wrench}
            title="Chưa có yêu cầu sửa chữa!"
            description="Danh sách yêu cầu sửa chữa của bạn đang trống."
          />
        </div>
      )}
    </div>
  );
}
