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
import { FileText, Loader } from "lucide-react";
import { useEffect, useState } from "react";

import EmptyData from "@/components/common/empty-data";
import LoadingCard from "@/components/common/loading-card";
import type { AdminContractItem, IContract } from "../types";
import { columns } from "./adp-columns";
import { ADPPagination } from "./adp-pagination";
import { ADPToolbar } from "./adp-toolbar";
import { ADPViewList } from "./adp-view-list";

interface ADPViewProps {
  data: (AdminContractItem | IContract)[];
  actions?: (row: AdminContractItem | IContract) => React.ReactNode;
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
    contract_id: true,
    tenant_name: false,
    "unit.unitCode": true,
    "unit.addressLine": false,
    landlord_name: false,
    depositAmount: false,
    startDate: false,
    endDate: false,
    status: true,
    createdAt: false,
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

  const tableColumns: ColumnDef<AdminContractItem | IContract>[] = actions
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

      const item = row.original as AdminContractItem;
      
      // Mã hợp đồng
      const contractId = String(item.id || "").toLowerCase();
      const cleanSearchValue = searchValue.replace(/^#/, "");
      
      // Mã phòng
      const unitCode = String(item.unit?.unitCode || "").toLowerCase();
      
      // Tên người thuê
      const tenantName = String(item.tenant?.displayName || "").toLowerCase();
      const tenantEmail = String(item.tenant?.email || "").toLowerCase();
      
      // Tên chủ nhà
      const landlordName = String(item.landlord?.displayName || "").toLowerCase();
      const landlordEmail = String(item.landlord?.email || "").toLowerCase();

      return (
        contractId.includes(cleanSearchValue) ||
        unitCode.includes(cleanSearchValue) ||
        tenantName.includes(cleanSearchValue) ||
        tenantEmail.includes(cleanSearchValue) ||
        landlordName.includes(cleanSearchValue) ||
        landlordEmail.includes(cleanSearchValue)
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
    return <LoadingCard Icon={Loader} title="Đang tải danh sách contract..." />;
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
            Icon={FileText}
            title="Chưa có hợp đồng!"
            description="Danh sách hợp đồng của bạn đang trống."
          />
        </div>
      )}
    </div>
  );
}
