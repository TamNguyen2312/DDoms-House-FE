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
import type { IRepairRequestStatus } from "@/types/repair-request.types";
import { ADLViewOptions } from "./adp-view-options";
import type { IRepairRequest } from "@/types/repair-request.types";

interface ADLToolbarProps {
  table: Table<IRepairRequest>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  statusFilter?: IRepairRequestStatus | "all";
  onStatusFilterChange?: (status: IRepairRequestStatus | "all") => void;
}

export function ADPToolbar({
  table,
  viewMode,
  statusFilter = "all",
  onStatusFilterChange,
}: ADLToolbarProps): React.JSX.Element {
  const titleColumn = table.getColumn("title");
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo tiêu đề..."
          value={(titleColumn?.getFilterValue() as string) ?? ""}
          onChange={(e) => titleColumn?.setFilterValue(e.target.value)}
          className="h-8 w-full md:w-[350px]"
        />
        {onStatusFilterChange && (
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              onStatusFilterChange((value || "all") as IRepairRequestStatus | "all")
            }
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang xử lý</SelectItem>
              <SelectItem value="DONE">Hoàn thành</SelectItem>
              <SelectItem value="CANCEL">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-2">
        {viewMode === "table" && <ADLViewOptions table={table} />}
      </div>
    </div>
  );
}

