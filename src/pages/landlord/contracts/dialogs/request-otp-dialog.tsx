import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Loader } from "lucide-react";

interface RequestOTPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  email?: string;
}

export function RequestOTPDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  email,
}: RequestOTPDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-5 text-blue-500" />
            Yêu cầu OTP
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {email ? (
            <>
              Mã OTP sẽ được gửi đến email{" "}
              <span className="font-semibold">{email}</span>. Vui lòng kiểm tra
              hộp thư của bạn.
            </>
          ) : (
            "Mã OTP sẽ được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
          )}
        </DialogDescription>
        <DialogFooter className="border-t border-dashed pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
          <Button onClick={onConfirm} disabled={isPending}>
            {isPending ? (
              <>
                <Loader className="mr-2 size-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi OTP"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
