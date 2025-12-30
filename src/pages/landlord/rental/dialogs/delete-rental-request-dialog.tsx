import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import type { IRentalRequest } from "../types";

interface DeleteRentalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalRequest: IRentalRequest;
  onConfirm?: () => void;
  isPending?: boolean;
}

export function DeleteRentalRequestDialog({
  open,
  onOpenChange,
  rentalRequest,
  onConfirm,
  isPending = false,
}: DeleteRentalRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="size-5 text-red-500" />
            Xác nhận xóa yêu cầu thuê
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Bạn có chắc chắn muốn xóa yêu cầu thuê ID{" "}
          <span className="font-semibold">{rentalRequest.id}</span>? Hành động
          này không thể hoàn tác.
        </DialogDescription>
        <div className="py-4">
          {rentalRequest.unit && (
            <p className="text-sm text-muted-foreground">
              Phòng: {rentalRequest.unit.unitCode} -{" "}
              {rentalRequest.unit.propertyName}
            </p>
          )}
        </div>
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
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                Xóa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
