import { Info } from "lucide-react";

interface EmptyDataProps {
  Icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  description?: string;
  onClick?: () => void;
}

const EmptyData = ({
  Icon = Info,
  title = "Không có dữ liệu",
  description = "Vui lòng thử lại sau!",
  onClick,
}: EmptyDataProps) => {
  return (
    <div className="bg-muted/50 rounded-lg py-8 text-center">
      <div className="flex justify-center">
        <Icon className="w-16 h-16 text-muted-foreground" />
      </div>

      <p className="text-muted-foreground text-xl mt-4">{title}</p>

      <p className="text-muted-foreground mt-2 text-sm">{description}</p>

      {onClick && (
        <div className="mt-4">
          <button
            onClick={onClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyData;
