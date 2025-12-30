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
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

import EmptyData from "@/components/common/empty-data";
import LoadingCard from "@/components/common/loading-card";
import type { ISubscription, ISubscriptionStatus } from "../types";
import { createColumns } from "./adp-columns";
import { ADPPagination } from "./adp-pagination";
import { ADPToolbar } from "./adp-toolbar";
import { ADPViewList } from "./adp-view-list";

interface ADPViewProps {
  data: ISubscription[];
  actions?: (row: ISubscription) => React.ReactNode;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  onStatusFilterChange?: (status: ISubscriptionStatus | "all") => void;
  onPlanFilterChange?: (planId: number | "all") => void;
  statusFilter?: ISubscriptionStatus | "all";
  planIdFilter?: number | "all";
  plans?: Array<{ id: number; code: string; name: string }>;
}

export function ADPView({
  data,
  actions,
  pagination,
  onPaginationChange,
  onStatusFilterChange,
  onPlanFilterChange,
  statusFilter,
  planIdFilter,
  plans,
}: ADPViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    subscriptionId: true,
    landlordEmail: true,
    planName: true,
    listPrice: true,
    status: true,
    startedAt: true,
    expiresAt: true,
    createdAt: true,
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

  const tableColumns: ColumnDef<ISubscription>[] = actions
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
      <LoadingCard Icon={Loader} title="Đang tải danh sách subscriptions..." />
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Toolbar - Always visible with explicit background */}
      <div className="shrink-0 mb-4 bg-background z-10">
        <ADPToolbar
          table={table}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onStatusFilterChange={onStatusFilterChange}
          onPlanFilterChange={onPlanFilterChange}
          statusFilter={statusFilter}
          planIdFilter={planIdFilter}
          plans={plans}
        />
      </div>
      
      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {data.length > 0 ? (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 overflow-hidden">
              <div
                className={`h-full ${
                  viewMode === "table" ? "rounded-md border overflow-auto" : ""
                }`}
              >
                <ADPViewList table={table} />
              </div>
            </div>
            <div className="shrink-0 mt-2">
              <ADPPagination
                table={table}
                viewmode={viewMode}
                pagination={pagination}
              />
            </div>
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-full">
              <EmptyData />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
