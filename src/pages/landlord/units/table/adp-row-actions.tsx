import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IUnit } from "@/services/api/unit.service";
import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react";

interface ADLRowActionsProps {
  row: IUnit;
  onView?: (id: number) => void;
  onUpdate?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function ADLRowActions({
  row,
  onView,
  onUpdate,
  onDelete,
}: ADLRowActionsProps) {
  // const toast = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
            <DropdownMenuItem
              onClick={() => {
                console.log(row);
                onView(row.id);
              }}
            >
              <Eye size={20} strokeWidth={1.5} />
              <span>Xem</span>
            </DropdownMenuItem>
          )}
          {onUpdate && (
            <DropdownMenuItem onClick={() => onUpdate(row.id)}>
              <Edit size={20} strokeWidth={1.5} />
              <span>Chỉnh sửa</span>
            </DropdownMenuItem>
          )}
          {(onView || onUpdate) && onDelete && <DropdownMenuSeparator />}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive"
            >
              <Trash2 size={20} strokeWidth={1.5} />
              <span>Xóa</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog xác nhận xoá */}
      {onDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="size-5 text-red-500" />
                Xác nhận xóa
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa
              <span className="font-semibold">{row.name}</span>? Hành động này
              không thể hoàn tác.
            </DialogDescription>
            <DialogFooter className="border-t border-dashed pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(row.id as string);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
