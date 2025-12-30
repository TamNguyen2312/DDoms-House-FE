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
import { format } from "date-fns";

import EmptyData from "@/components/common/empty-data";
import LoadingCard from "@/components/common/loading-card";
import { ADPPagination } from "../../contracts/table/adp-pagination";
import { ADPToolbar } from "./adp-toolbar";
import type { IInvoice } from "./adp-columns";
import { createColumns } from "./adp-columns";
import { ADPViewList } from "./adp-view-list";

interface ADPViewProps {
  data: IInvoice[];
  actions?: (row: IInvoice) => React.ReactNode;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  onRowClick?: (invoice: IInvoice) => void;
}

export function ADPView({
  data,
  actions,
  pagination,
  onPaginationChange,
  onRowClick,
}: ADPViewProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "issuedAt", desc: true },
  ]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    contractId: true,
    cycleMonth: true,
    status: true,
    dueAt: true,
    totalAmount: true,
    issuedAt: true,
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

  const tableColumns: ColumnDef<IInvoice>[] = actions
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

      const invoice = row.original as IInvoice;
      
      // Mã hợp đồng
      const contractId = String(invoice.contractId || "").toLowerCase();
      const cleanSearchValue = searchValue.replace(/^#/, "");
      
      // Tháng (cycleMonth) - format: MM/yyyy
      const cycleMonth = invoice.cycleMonth 
        ? format(new Date(invoice.cycleMonth), "MM/yyyy").toLowerCase()
        : "";
      
      // Cũng hỗ trợ tìm theo format yyyy-MM hoặc MM-yyyy
      let monthMatch = false;
      if (cycleMonth) {
        const [month, year] = cycleMonth.split("/");
        const formats = [
          cycleMonth, // MM/yyyy
          `${year}-${month}`, // yyyy-MM
          `${month}-${year}`, // MM-yyyy
          `${year}${month}`, // yyyyMM
          `${month}${year}`, // MMyyyy
        ];
        monthMatch = formats.some(format => format.includes(cleanSearchValue));
      }

      return (
        contractId.includes(cleanSearchValue) ||
        monthMatch
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

  useEffect(() => {
    setTableInitialized(true);
  }, []);

  if (!tableInitialized) {
    return <LoadingCard Icon={Loader} title="Đang tải danh sách hóa đơn..." />;
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
            <ADPViewList table={table} onRowClick={onRowClick} />
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
