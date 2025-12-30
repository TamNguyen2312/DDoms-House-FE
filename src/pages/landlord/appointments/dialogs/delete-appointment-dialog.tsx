import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import type { IAppointment } from "../types";

interface DeleteAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: IAppointment;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DeleteAppointmentDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: DeleteAppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="size-5 text-red-500" />
            Xác nhận xóa
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Bạn có chắc chắn muốn xóa lịch hẹn này? Hành động này không thể hoàn
          tác.
        </DialogDescription>
        <DialogFooter className="border-t border-dashed pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
