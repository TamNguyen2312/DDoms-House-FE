import { Badge } from "@/components/ui/badge";
import type { IRentalRequestStatus } from "@/pages/landlord/rental/types";
import { AlertCircle, Check, Clock, X } from "lucide-react";

// Helper function to get status badge with colors
export const RentalRequestBadge = ({
  status,
}: {
  status: IRentalRequestStatus;
}) => {
  const statusConfig: Record<
    IRentalRequestStatus,
    {
      label: string;
      icon: typeof Clock;
      variant?: "destructive";
      className?: string;
    }
  > = {
    PENDING: {
      label: "Chờ xử lý",
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      icon: Clock,
    },
    ACCEPTED: {
      label: "Đã chấp nhận",
      className:
        "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      icon: Check,
    },
    DECLINED: {
      label: "Đã từ chối",
      variant: "destructive",
      icon: X,
    },
    EXPIRED: {
      label: "Đã hết hạn",
      className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
      icon: AlertCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center gap-1 w-fit ${
        config.className || ""
      }`.trim()}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};
