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
import { Edit, Eye, MoreVertical, Receipt, Send, Trash2 } from "lucide-react";
import type { IContract } from "./adp-columns";

interface ADLRowActionsProps {
  row: IContract;
  onView?: (id: number) => void;
  onUpdate?: (id: number) => void;
  onDelete?: (id: number) => void;
  onSend?: (id: number) => void;
  onCreateInvoice?: (id: number) => void;
  isSending?: boolean;
}

export function ADLRowActions({
  row,
  onView,
  onUpdate,
  onDelete,
  onSend,
  onCreateInvoice,
  isSending = false,
}: ADLRowActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

  const isDraft = row.status === "DRAFT";
  const isSigned = row.status === "SIGNED";
  const isActive = row.status === "ACTIVE";
  const isExpired = row.status === "EXPIRED";
  const canCreateInvoice = isSigned || isActive || isExpired;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-54">
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
          {canCreateInvoice && onCreateInvoice && (
            <>
              {(onView || onUpdate) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => onCreateInvoice(row.id)}
                className="text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 focus:bg-green-100 focus:text-green-700"
              >
                <Receipt size={20} strokeWidth={1.5} />
                <span>Tạo thanh toán tiền nhà</span>
              </DropdownMenuItem>
            </>
          )}
          {isDraft && (
            <>
              {onUpdate && (
                <>
                  {(onView || onCreateInvoice) && <DropdownMenuSeparator />}
                  <DropdownMenuItem onClick={() => onUpdate(row.id)}>
                    <Edit size={20} strokeWidth={1.5} />
                    <span>Chỉnh sửa</span>
                  </DropdownMenuItem>
                </>
              )}
              {onSend && (
                <>
                  {(onView || onCreateInvoice || onUpdate) && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    onClick={() => setIsSendDialogOpen(true)}
                    disabled={isSending}
                  >
                    <Send size={20} strokeWidth={1.5} />
                    <span>Gửi hợp đồng</span>
                  </DropdownMenuItem>
                </>
              )}
              {onDelete && (
                <>
                  {(onView || onCreateInvoice || onUpdate || onSend) && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 size={20} strokeWidth={1.5} />
                    <span>Xóa</span>
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog xác nhận gửi */}
      {onSend && isDraft && (
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="size-5 text-blue-500" />
                Xác nhận gửi hợp đồng
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Bạn có chắc chắn muốn gửi hợp đồng ID{" "}
              <span className="font-semibold">{row.id}</span>? Sau khi gửi, hợp
              đồng sẽ được chuyển sang trạng thái "Đã gửi" và không thể chỉnh
              sửa.
            </DialogDescription>
            <DialogFooter className="border-t border-dashed pt-4">
              <Button
                variant="outline"
                onClick={() => setIsSendDialogOpen(false)}
                disabled={isSending}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  onSend?.(row.id);
                  setIsSendDialogOpen(false);
                }}
                disabled={isSending}
              >
                {isSending ? "Đang gửi..." : "Xác nhận gửi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
              Bạn có chắc chắn muốn xóa hợp đồng ID{" "}
              <span className="font-semibold">{row.id}</span>? Hành động này
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
                  onDelete?.(row.id);
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
