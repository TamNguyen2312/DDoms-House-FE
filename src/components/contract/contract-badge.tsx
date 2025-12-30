import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  FilePenLine,
  FileText,
  XCircle,
} from "lucide-react";

export type IContractStatus =
  | "SENT"
  | "DRAFT"
  | "SIGNED"
  | "ACTIVE"
  | "TERMINATION_PENDING"
  | "CANCELLED"
  | "EXPIRED";

export const ContractBadge = ({ status }: { status: IContractStatus }) => {
  const statusConfig: Record<
    IContractStatus,
    {
      label: string;
      icon: typeof FileText;
      variant?: "destructive" | "secondary" | "default" | "outline";
      className?: string;
    }
  > = {
    SENT: {
      label: "Chờ ký",
      className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
      icon: FilePenLine,
    },
    DRAFT: {
      label: "Bản nháp",
      className: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200",
      icon: FileText,
    },
    SIGNED: {
      label: "Đã ký",
      className:
        "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
      icon: CheckCircle,
    },
    ACTIVE: {
      label: "Đang hoạt động",
      className:
        "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
      icon: CheckCircle,
    },
    TERMINATION_PENDING: {
      label: "Chờ hủy",
      className:
        "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200",
      icon: AlertTriangle, // icon phù hợp hơn Trash2
    },
    CANCELLED: {
      label: "Đã hủy",
      className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
      icon: XCircle,
    },
    EXPIRED: {
      label: "Hết hạn",
      className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200",
      icon: XCircle,
    },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;
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
