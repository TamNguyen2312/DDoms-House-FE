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
import { Download, Eye, MoreVertical, Trash2 } from "lucide-react";
import type { AdminPaymentItem, IPayment } from "../types";

interface ADPRowActionsProps {
  row: AdminPaymentItem | IPayment;
  onView?: (id: number | string) => void;
  onUpdate?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
}

export function ADPRowActions({
  row,
  onView,
  onUpdate,
  onDelete,
}: ADPRowActionsProps) {
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
                const id = "id" in row ? row.id : row.payment_id;
                onView(id);
              }}
            >
              <Eye size={20} strokeWidth={1.5} />
              <span>Xem</span>
            </DropdownMenuItem>
          )}
          {onUpdate && (
            <DropdownMenuItem
              onClick={() => {
                const id = "id" in row ? row.id : row.payment_id;
                onUpdate(id);
              }}
            >
              <Download size={20} strokeWidth={1.5} />
              <span>Chỉnh sửa</span>
            </DropdownMenuItem>
          )}
          {onDelete && (
            <>
              {(onView || onUpdate) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 size={20} strokeWidth={1.5} />
                <span>Xóa</span>
              </DropdownMenuItem>
            </>
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
              Bạn có chắc chắn muốn xóa thanh toán
              <span className="font-semibold">
                {" "}
                {"id" in row ? row.id : row.payment_id}
              </span>
              ? Hành động này không thể hoàn tác.
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
                  const id = "id" in row ? row.id : row.payment_id;
                  onDelete(id);
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
