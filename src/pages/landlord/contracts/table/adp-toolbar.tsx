import { Input } from "@/components/ui/input";
import React from "react";

import type { IContract } from "./adp-columns";
import type { Table } from "@tanstack/react-table";
import { ADPViewOptions } from "./adp-view-options";

interface ADOToolbarProps {
  table: Table<IContract>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
}

export function ADPToolbar({
  table,
  viewMode,
}: ADOToolbarProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo mã hợp đồng hoặc mã phòng..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 w-full md:w-[350px]"
        />
      </div>

      <div className="flex items-center gap-2">
        {viewMode === "table" && <ADPViewOptions table={table} />}
      </div>
    </div>
  );
}
