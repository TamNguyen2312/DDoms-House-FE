import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Eye, MoreVertical, Trash2 } from "lucide-react";

interface ADLRowActionsProps {
  onView?: () => void;
  onUpdateStatus?: () => void;
  onDelete?: () => void;
}

export function ADLRowActions({
  onView,
  onUpdateStatus,
  onDelete,
}: ADLRowActionsProps) {
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
          {onUpdateStatus && (
            <DropdownMenuItem onClick={onUpdateStatus}>
              <CheckCircle size={20} strokeWidth={1.5} />
              <span>Cập nhật trạng thái</span>
            </DropdownMenuItem>
          )}
          {(onView || onUpdateStatus) && onDelete && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 size={20} strokeWidth={1.5} />
              <span>Xóa</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
