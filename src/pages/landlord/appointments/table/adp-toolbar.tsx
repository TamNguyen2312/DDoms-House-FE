import { Input } from "@/components/ui/input";
import React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  IAppointment,
  IAppointmentStatus,
} from "@/pages/landlord/appointments/types";
import type { Table } from "@tanstack/react-table";
import { ADPViewOptions } from "./adp-view-options";

interface ADOToolbarProps {
  table: Table<IAppointment>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  statusFilter?: IAppointmentStatus | "all";
  onStatusFilterChange?: (status: IAppointmentStatus | "all") => void;
}

export function ADPToolbar({
  table,
  viewMode,
  statusFilter = "all",
  onStatusFilterChange,
}: ADOToolbarProps): React.JSX.Element {
  const name = table.getColumn("propertyName");
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo tên bất động sản..."
          value={(name?.getFilterValue() as string) ?? ""}
          onChange={(e) => name?.setFilterValue(e.target.value)}
          className="h-8 w-full md:w-[350px]"
        />
        {onStatusFilterChange && (
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              onStatusFilterChange((value || "all") as IAppointmentStatus | "all")
            }
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
              <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
              <SelectItem value="RESCHEDULED">Đã dời lịch</SelectItem>
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
