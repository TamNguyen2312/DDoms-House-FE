import { Badge } from "@/components/ui/badge";
import type { IRepairRequestStatus } from "@/types/repair-request.types";
import { AlertCircle, Check, Clock, X } from "lucide-react";

// Helper function to get status badge with colors
export const RepairRequestBadge = ({
  status,
}: {
  status: IRepairRequestStatus;
}) => {
  const statusConfig: Record<
    IRepairRequestStatus,
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
    IN_PROGRESS: {
      label: "Đang xử lý",
      className:
        "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      icon: AlertCircle,
    },
    DONE: {
      label: "Hoàn thành",
      className:
        "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      icon: Check,
    },
    CANCEL: {
      label: "Đã hủy",
      variant: "destructive",
      icon: X,
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

