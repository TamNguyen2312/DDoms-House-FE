import { Badge } from "@/components/ui/badge";
import type { IAppointmentStatus } from "@/pages/landlord/appointments/types";
import { Calendar, Check, Clock, X } from "lucide-react";

// Helper function to get status badge with colors
export const AppointmentBadge = ({
  status,
}: {
  status: IAppointmentStatus;
}) => {
  const statusConfig: Record<
    IAppointmentStatus,
    {
      label: string;
      icon: typeof Clock;
      variant?: "destructive";
      className?: string;
    }
  > = {
    PENDING: {
      label: "Chờ xác nhận",
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      icon: Clock,
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      className:
        "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      icon: Check,
    },
    REJECTED: {
      label: "Đã từ chối",
      variant: "destructive",
      icon: X,
    },
    RESCHEDULED: {
      label: "Đã dời lịch",
      className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      icon: Calendar,
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
