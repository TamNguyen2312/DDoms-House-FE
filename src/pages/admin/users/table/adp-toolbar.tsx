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
import type { IAdminUser } from "../api-types";
import { ADPViewOptions } from "./adp-view-options";

interface ADOToolbarProps {
  table: Table<IAdminUser>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
}

export function ADPToolbar({
  table,
  viewMode,
  searchTerm,
  onSearchTermChange,
  roleFilter,
  onRoleFilterChange,
}: ADOToolbarProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo email hoặc số điện thoại..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="h-8 w-full sm:w-[250px] md:w-[350px] text-xs sm:text-sm"
        />
        <Select
          value={roleFilter || "ALL"}
          onValueChange={(value) =>
            onRoleFilterChange(value === "ALL" ? "" : value)
          }
        >
          <SelectTrigger className="h-8 w-full sm:w-[180px] text-xs sm:text-sm">
            <SelectValue placeholder="Tất cả vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả vai trò</SelectItem>
            <SelectItem value="ADMIN">Quản trị</SelectItem>
            <SelectItem value="LANDLORD">Chủ nhà</SelectItem>
            <SelectItem value="TENANT">Người thuê</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {viewMode === "table" && <ADPViewOptions table={table} />}
      </div>
    </div>
  );
}
