import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Eye, FileText, MoreVertical, Trash2 } from "lucide-react";
import type { IRentalRequest } from "../types";

interface ADLRowActionsProps {
  row: IRentalRequest;
  onView?: () => void;
  onUpdateStatus?: () => void;
  onDelete?: () => void;
  onCreateContract?: () => void;
}

export function ADLRowActions({
  row,
  onView,
  onUpdateStatus,
  onDelete,
  onCreateContract,
}: ADLRowActionsProps) {
  const canUpdate = row.status === "PENDING";
  const canDelete =
    row.status === "PENDING" ||
    row.status === "DECLINED" ||
    row.status === "EXPIRED";
  const canCreateContract = row.status === "ACCEPTED";

  return (
    <>
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
            <DropdownMenuItem onClick={onView}>
              <Eye size={20} strokeWidth={1.5} />
              <span>Xem</span>
            </DropdownMenuItem>
          )}
          {canUpdate && onUpdateStatus && (
            <>
              {onView && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={onUpdateStatus}>
                <CheckCircle size={20} strokeWidth={1.5} />
                <span>Cập nhật trạng thái</span>
              </DropdownMenuItem>
            </>
          )}
          {canCreateContract && onCreateContract && (
            <>
              {(onView || canUpdate) && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={onCreateContract}>
                <FileText size={20} strokeWidth={1.5} />
                <span>Tạo hợp đồng</span>
              </DropdownMenuItem>
            </>
          )}
          {canDelete && onDelete && (
            <>
              {(onView || canUpdate || canCreateContract) && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 size={20} strokeWidth={1.5} />
                <span>Xóa</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
