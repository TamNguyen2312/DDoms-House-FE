import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical, Wrench } from "lucide-react";
import type { IRentedUnit } from "../types";

interface ADPRowActionsProps {
  row: IRentedUnit;
  onView?: (unit: IRentedUnit) => void;
  onCreateRepairRequest?: (unit: IRentedUnit) => void;
}

export function ADPRowActions({ row, onView, onCreateRepairRequest }: ADPRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onView && (
          <DropdownMenuItem
            onClick={() => {
              onView(row);
            }}
          >
            <Eye size={20} strokeWidth={1.5} />
            <span>Xem chi tiết</span>
          </DropdownMenuItem>
        )}
        {onCreateRepairRequest && (
          <DropdownMenuItem
            onClick={() => {
              onCreateRepairRequest(row);
            }}
          >
            <Wrench size={20} strokeWidth={1.5} />
            <span>Tạo yêu cầu sửa chữa</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
