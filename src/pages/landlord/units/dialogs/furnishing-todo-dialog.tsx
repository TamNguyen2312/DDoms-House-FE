import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  FurnishingCategory,
  ItemCondition,
} from "@/services/api/unit.service";
import { Loader } from "lucide-react";
import { useRef } from "react";
import {
  FurnishingTodoList,
  type FurnishingTodoListRef,
} from "../components/furnishing-todo-list";

interface FurnishingTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  onSubmit: (
    items: Array<{
      name: string;
      category: FurnishingCategory;
      quantity: number;
      itemCondition: ItemCondition;
      note?: string;
    }>
  ) => Promise<void>;
  isPending?: boolean;
}

export function FurnishingTodoDialog({
  open,
  onOpenChange,
  unitId,
  onSubmit,
  isPending = false,
}: FurnishingTodoDialogProps) {
  const formRef = useRef<FurnishingTodoListRef>(null);

  const handleSubmit = () => {
    formRef.current?.submit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>Thêm vật dụng mới</DialogTitle>
          <DialogDescription>
            Thêm nhiều vật dụng cùng lúc vào phòng
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <FurnishingTodoList
            unitId={unitId}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isPending={isPending}
            ref={formRef}
          />
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader className="mr-2 size-4 animate-spin" />}
            Lưu tất cả
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
