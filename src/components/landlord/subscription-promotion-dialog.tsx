import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss?: () => void;
}

const STORAGE_KEY = "landlord_subscription_promotion_dismissed";

export function SubscriptionPromotionDialog({
  open,
  onOpenChange,
  onDismiss,
}: SubscriptionPromotionDialogProps) {
  const navigate = useNavigate();

  // Debug log
  console.log("[SubscriptionPromotionDialog] Render - open:", open);

  const handleDismiss = () => {
    // Lưu vào localStorage để không hiển thị lại
    localStorage.setItem(STORAGE_KEY, "true");
    onOpenChange(false);
    onDismiss?.();
  };

  const handleSubscribe = () => {
    onOpenChange(false);
    navigate("/landlord/bang-gia-dich-vu");
  };

  // Debug
  console.log("[SubscriptionPromotionDialog] Rendering with open:", open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px]"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                Mua gói dịch vụ để đăng bài!
              </DialogTitle>
              <DialogDescription className="mt-1">
                Đăng ký gói dịch vụ để bắt đầu đăng bài cho thuê ngay hôm nay
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs font-semibold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium">Đăng bài không giới hạn</p>
                <p className="text-sm text-muted-foreground">
                  Đăng nhiều bài đăng cho thuê với quota cao hơn
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs font-semibold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium">Tiếp cận nhiều khách hàng</p>
                <p className="text-sm text-muted-foreground">
                  Bài đăng của bạn sẽ được hiển thị nổi bật hơn
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <span className="text-xs font-semibold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium">Quản lý chuyên nghiệp</p>
                <p className="text-sm text-muted-foreground">
                  Công cụ quản lý bất động sản và hợp đồng đầy đủ tính năng
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
          >
            Để sau
          </Button>
          <Button
            onClick={handleSubscribe}
            className="w-full sm:w-auto"
          >
            Xem bảng giá dịch vụ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to check if promotion was dismissed
export function isPromotionDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

// Helper function to reset dismissal (for testing or admin purposes)
export function resetPromotionDismissal(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

