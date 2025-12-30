import { Badge } from "@/components/ui/badge";
import { Clock, Eye, EyeOff } from "lucide-react";
export type TListingStatus = "true" | "false";
// Helper function to get status badge with colors
export const BadgePublicListing = ({ value }: { value: TListingStatus }) => {
  const statusConfig: Record<
    TListingStatus,
    {
      label: string;
      icon: typeof Clock;
      variant?: "destructive";
      className?: string;
    }
  > = {
    true: {
      label: "Hiện",
      className:
        "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      icon: Eye,
    },
    false: {
      label: "Ẩn",
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      variant: "destructive",
      icon: EyeOff,
    },
  };

  const config = statusConfig[value] || statusConfig.true;
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
