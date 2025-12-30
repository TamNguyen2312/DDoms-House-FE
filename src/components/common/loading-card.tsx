import type { LucideIcon } from "lucide-react";

type Props = {
  Icon?: LucideIcon;
  title?: string;
  description?: string;
};

const LoadingCard = ({
  Icon = () => <div></div>, // fallback icon
  title = "Đang tải...",
  description = "Vui lòng chờ trong giây lát.",
}: Props) => {
  return (
    <div className="bg-muted/50 rounded-lg py-8 text-center">
      <Icon className="text-muted-foreground/30 mx-auto mb-4 size-12 animate-spin" />
      <p className="text-muted-foreground">{title}</p>
      <p className="text-muted-foreground mt-2 text-sm">{description}</p>
    </div>
  );
};

export default LoadingCard;
