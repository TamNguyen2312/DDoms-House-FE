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
import type { IContractStatus, IRentedUnit } from "../types";
import { ADPViewOptions } from "./adp-view-options";

interface ADPToolbarProps {
  table: Table<IRentedUnit>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  onStatusFilterChange?: (status: IContractStatus | "all") => void;
  statusFilter?: IContractStatus | "all";
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function ADPToolbar({
  table,
  viewMode,
  onStatusFilterChange,
  statusFilter = "all",
  globalFilter = "",
  onGlobalFilterChange,
}: ADPToolbarProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm theo mã phòng, email chủ nhà..."
          value={globalFilter}
          onChange={(e) => onGlobalFilterChange?.(e.target.value)}
          className="h-8 w-full md:w-[350px]"
        />

        {onStatusFilterChange && (
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              onStatusFilterChange(value as IContractStatus | "all")
            }
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              <SelectItem value="EXPIRED">Hết hạn</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
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
