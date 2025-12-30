import { Input } from "@/components/ui/input";
import React from "react";

import type { Table } from "@tanstack/react-table";
import type { IAdminUnit } from "../api-types";
import { ADPViewOptions } from "./adp-view-options";

interface ADOToolbarProps {
  table: Table<IAdminUnit>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
}

export function ADPToolbar({
  table,
  viewMode,
}: ADOToolbarProps): React.JSX.Element {
  const code = table.getColumn("code");
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo mã phòng..."
          value={(code?.getFilterValue() as string) ?? ""}
          onChange={(e) => code?.setFilterValue(e.target.value)}
          className="h-8 w-full md:w-[350px]"
        />
      </div>

      <div className="flex items-center gap-2">
        {viewMode === "table" && <ADPViewOptions table={table} />}
      </div>
    </div>
  );
}
