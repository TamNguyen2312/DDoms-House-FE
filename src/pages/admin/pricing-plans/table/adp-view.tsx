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
import type { IPricingPlan } from "../types";
import { columns } from "./adp-columns";
import { ADPPagination } from "./adp-pagination";
import { ADPToolbar } from "./adp-toolbar";
import { ADPViewList } from "./adp-view-list";

interface ADPViewProps {
  data: IPricingPlan[];
  actions?: (row: IPricingPlan) => React.ReactNode;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
}

export function ADPView({
  data,
  actions,
  pagination,
  onPaginationChange,
}: ADPViewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    code: true,
    name: true,
    description: false,
    durationMonths: true,
    listPrice: true,
    status: true,
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
  }, [pagination?.currentPage, pagination?.pageSize]);

  const tableColumns: ColumnDef<IPricingPlan>[] = actions
    ? [
        ...columns,
        {
          id: "actions",
          cell: ({ row }) => (
            <div className="flex justify-end">{actions(row.original)}</div>
          ),
        },
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue || "").toLowerCase().trim();
      if (!searchValue) return true;

      const plan = row.original as IPricingPlan;

      // Mã gói
      const code = String(plan.code || "").toLowerCase();

      // Tên gói
      const name = String(plan.name || "").toLowerCase();

      // Thời hạn (durationMonths)
      const durationMonths = plan.durationMonths || 0;
      const durationText =
        durationMonths === 0 ? "không giới hạn" : `${durationMonths} tháng`;
      const durationSearch = durationText.toLowerCase();

      return (
        code.includes(searchValue) ||
        name.includes(searchValue) ||
        durationSearch.includes(searchValue) ||
        String(durationMonths).includes(searchValue)
      );
    },
    pageCount: pagination?.totalPages ?? -1,
    manualPagination: !!pagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
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
    return (
      <LoadingCard Icon={Loader} title="Đang tải danh sách gói dịch vụ..." />
    );
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
            <ADPViewList table={table} />
          </div>
          <div className="shrink-0 overflow-x-hidden">
            <ADPPagination
              table={table}
              viewmode={viewMode}
              onPaginationChange={onPaginationChange}
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
          <EmptyData />
        </div>
      )}
    </div>
  );
}
