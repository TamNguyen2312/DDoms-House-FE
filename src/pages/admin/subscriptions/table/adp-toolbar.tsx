import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";

import type { Table } from "@tanstack/react-table";
import type { ISubscription, ISubscriptionStatus } from "../types";
import { ADPViewOptions } from "./adp-view-options";

interface ADPToolbarProps {
  table: Table<ISubscription>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  onStatusFilterChange?: (status: ISubscriptionStatus | "all") => void;
  onPlanFilterChange?: (planId: number | "all") => void;
  statusFilter?: ISubscriptionStatus | "all";
  planIdFilter?: number | "all";
  plans?: Array<{ id: number; code: string; name: string }>;
}

export function ADPToolbar({
  table,
  viewMode,
  onStatusFilterChange,
  onPlanFilterChange,
  statusFilter = "all",
  planIdFilter = "all",
  plans = [],
}: ADPToolbarProps): React.JSX.Element {
  const landlordEmail = table.getColumn("landlordEmail");

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo email landlord..."
          value={(landlordEmail?.getFilterValue() as string) ?? ""}
          onChange={(e) => landlordEmail?.setFilterValue(e.target.value)}
          className="h-8 w-full md:w-[300px]"
        />

        {onStatusFilterChange && (
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              onStatusFilterChange(
                (value || "all") as ISubscriptionStatus | "all"
              )
            }
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              <SelectItem value="SUSPENDED">Tạm dừng</SelectItem>
              <SelectItem value="EXPIRED">Hết hạn</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
            </SelectContent>
          </Select>
        )}

        {onPlanFilterChange && plans.length > 0 && (
          <Select
            value={planIdFilter === "all" ? "all" : String(planIdFilter)}
            onValueChange={(value) =>
              onPlanFilterChange(value === "all" ? "all" : Number(value))
            }
          >
            <SelectTrigger className="h-8 w-[200px]">
              <SelectValue placeholder="Lọc theo gói" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả gói</SelectItem>
              {plans
                .filter((plan) => [1, 2, 3, 4].includes(plan.id))
                .map((plan) => (
                  <SelectItem key={plan.id} value={String(plan.id)}>
                    {plan.name} ({plan.code})
                  </SelectItem>
                ))}
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
