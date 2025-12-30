import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IListing } from "@/lib/dbListings";
import type { Table } from "@tanstack/react-table";
import { LayoutGrid, LayoutList } from "lucide-react";
import { ADOViewOptions } from "./adl-view-options";

interface ADOToolbarProps {
  table: Table<IListing>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  statusFilter?: string | "all";
  onStatusFilterChange?: (status: string | "all") => void;
}

export function ADOToolbar({
  table,
  viewMode,
  setViewMode,
  statusFilter = "all",
  onStatusFilterChange,
}: ADOToolbarProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 w-full md:w-[350px]"
        />
        {onStatusFilterChange && (
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              onStatusFilterChange((value || "all") as string | "all")
            }
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
              <SelectItem value="DRAFT">Nháp</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-8 rounded-r-none"
            onClick={() => setViewMode("table")}
            title="Xem dạng bảng"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 rounded-l-none border-l"
            onClick={() => setViewMode("grid")}
            title="Xem dạng lưới"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        {viewMode === "table" && <ADOViewOptions table={table} />}
      </div>
    </div>
  );
}
