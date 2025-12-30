import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";

import type { IListing } from "../types";
import type { Table } from "@tanstack/react-table";
import { LayoutGrid, LayoutList } from "lucide-react";
import { ADPViewOptions } from "./adp-view-options";

interface ADOToolbarProps {
  table: Table<IListing>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
}

export function ADPToolbar({
  table,
  viewMode,
  setViewMode,
}: ADOToolbarProps): React.JSX.Element {
  const title = table.getColumn("title");
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo tiêu đề..."
          value={(title?.getFilterValue() as string) ?? ""}
          onChange={(e) => title?.setFilterValue(e.target.value)}
          className="h-8 w-full md:w-[350px]"
        />
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
        {viewMode === "table" && <ADPViewOptions table={table} />}
      </div>
    </div>
  );
}

