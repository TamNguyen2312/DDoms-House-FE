import { Badge } from "@/components/ui/badge";
import { Check, Clock, X } from "lucide-react";
export type TListingStatus = "PENDING" | "APPROVED" | "REJECTED";
// Helper function to get status badge with colors
export const BadgeStatusListing = ({ value }: { value: TListingStatus }) => {
  const statusConfig: Record<
    TListingStatus,
    {
      label: string;
      icon: typeof Clock;
      variant?: "destructive";
      className?: string;
    }
  > = {
    PENDING: {
      label: "Chờ duyệt",
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      icon: Clock,
    },
    APPROVED: {
      label: "Đã duyệt",
      className:
        "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      icon: Check,
    },
    REJECTED: {
      label: "Bị từ chối",
      variant: "destructive",
      icon: X,
    },
  };

  const config = statusConfig[value] || statusConfig.PENDING;
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
