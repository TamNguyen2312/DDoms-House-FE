import { Input } from "@/components/ui/input";
import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Table } from "@tanstack/react-table";
import type { IRentalRequestStatus } from "../types";
import { ADPViewOptions } from "./adp-view-options";

interface ADOToolbarProps {
  table: Table<IRentalRequest>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  statusFilter?: IRentalRequestStatus | "all";
  onStatusFilterChange?: (status: IRentalRequestStatus | "all") => void;
}

export function ADPToolbar({
  table,
  viewMode,
  statusFilter = "all",
  onStatusFilterChange,
}: ADOToolbarProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo phòng..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 w-full md:w-[350px]"
        />
        {onStatusFilterChange && (
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              onStatusFilterChange((value || "all") as IRentalRequestStatus | "all")
            }
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="ACCEPTED">Đã chấp nhận</SelectItem>
              <SelectItem value="DECLINED">Đã từ chối</SelectItem>
              <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2">
        {viewMode === "table" && <ADPViewOptions table={table} />}
      </div>
    </div>
  );
}
