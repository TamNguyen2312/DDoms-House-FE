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
import { useEffect, useState } from "react";

import EmptyData from "@/components/common/empty-data";
import LoadingCard from "@/components/common/loading-card";
import type { IRentalRequest, IRentalRequestStatus } from "../types";
import { createColumns } from "./adp-columns";
import { ADPPagination } from "./adp-pagination";
import { ADPToolbar } from "./adp-toolbar";
import { ADPViewList } from "./adp-view-list";

interface ADPViewProps {
  data: IRentalRequest[];
  actions?: (row: IRentalRequest) => React.ReactNode;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  statusFilter?: IRentalRequestStatus | "all";
  onStatusFilterChange?: (status: IRentalRequestStatus | "all") => void;
}

export function ADPView({
  data,
  actions,
  pagination,
  onPaginationChange,
  statusFilter,
  onStatusFilterChange,
}: ADPViewProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    unit: true,
    tenant: false,
    message: true,
    status: true,
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

  const tableColumns: ColumnDef<IRentalRequest>[] = actions
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

      const request = row.original as IRentalRequest;
      const unit = request.unit;
      
      // Mã phòng
      const unitCode = String(unit?.unitCode || request.unitCode || "").toLowerCase();
      
      // Tên dự án
      const propertyName = String(unit?.propertyName || request.propertyName || "").toLowerCase();
      
      // Địa chỉ
      const addressLine = String(unit?.addressLine || request.addressLine || "").toLowerCase();
      const ward = String(unit?.ward || request.ward || "").toLowerCase();
      const district = String(unit?.district || request.district || "").toLowerCase();
      const city = String(unit?.city || request.city || "").toLowerCase();

      return (
        unitCode.includes(searchValue) ||
        propertyName.includes(searchValue) ||
        addressLine.includes(searchValue) ||
        ward.includes(searchValue) ||
        district.includes(searchValue) ||
        city.includes(searchValue)
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
      <LoadingCard Icon={Loader} title="Đang tải danh sách yêu cầu thuê..." />
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-x-hidden">
      {/* Toolbar - Always visible */}
      <div className="shrink-0 mb-4">
        <ADPToolbar
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
            <ADPViewList table={table} />
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
              onPaginationChange={onPaginationChange}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <EmptyData
            Icon={Handshake}
            title="Chưa có yêu cầu thuê!"
            description="Danh sách yêu cầu thuê của bạn đang trống."
          />
        </div>
      )}
    </div>
  );
}
