import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { TerminateContractRequest } from "../types";
import { useState } from "react";

interface TerminateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TerminateContractRequest) => void;
  isPending: boolean;
}

export const TerminateContractDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: TerminateContractDialogProps) => {
  const [formData, setFormData] = useState<TerminateContractRequest>({
    type: "early_terminate",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      return;
    }
    onSubmit(formData);
  };

  const handleTypeChange = (value: "normal_expire" | "early_terminate") => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      reason: value === "normal_expire" ? "Hợp đồng đã hết hạn" : "",
    }));
  };

  const handleReasonChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      reason: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Hủy hợp đồng</DialogTitle>
          <DialogDescription>
            Chọn loại hủy hợp đồng và cung cấp lý do. Hành động này không thể
            hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Loại hủy hợp đồng</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={handleTypeChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal_expire" id="normal_expire" />
                  <Label htmlFor="normal_expire" className="font-normal">
                    Hết hạn tự nhiên
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="early_terminate"
                    id="early_terminate"
                  />
                  <Label htmlFor="early_terminate" className="font-normal">
                    Hủy sớm
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {formData.type === "normal_expire"
                  ? "Chỉ hoàn tất khi hợp đồng đã hết hạn"
                  : "Khi hợp đồng được ký xong"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do hủy hợp đồng</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do hủy hợp đồng..."
                value={formData.reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                disabled={formData.type === "normal_expire"}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !formData.reason.trim()}
            >
              {isPending ? "Đang xử lý..." : "Xác nhận hủy hợp đồng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
