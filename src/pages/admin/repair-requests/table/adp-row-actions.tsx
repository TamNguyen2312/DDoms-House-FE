import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreVertical } from "lucide-react";
import type { IRepairRequest } from "@/types/repair-request.types";

interface ADLRowActionsProps {
  row: IRepairRequest;
  onView?: (id: number) => void;
}

export function ADLRowActions({
  row,
  onView,
}: ADLRowActionsProps) {
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
              onView(row.id);
            }}
          >
            <Eye size={20} strokeWidth={1.5} />
            <span>Xem</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

