import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Calendar, Filter, Loader2 } from "lucide-react";

interface DateRangeFilterProps {
  dateRange: { fromDate: string; toDate: string };
  onDateRangeChange: (range: { fromDate: string; toDate: string }) => void;
  loading?: boolean;
  activeFilter: number | null;
  onActiveFilterChange: (days: number | null) => void;
}

// Helper to get date range for a filter
export const getDateRangeForDays = (days: number) => {
  const toDate = new Date().toISOString().split("T")[0];
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  return { fromDate, toDate };
};

const DateRangeFilter = ({
  dateRange,
  onDateRangeChange,
  loading = false,
  activeFilter,
  onActiveFilterChange,
}: DateRangeFilterProps) => {
  const quickFilters = [
    { label: "7 ngày", days: 7 },
    { label: "30 ngày", days: 30 },
    { label: "90 ngày", days: 90 },
    { label: "Năm nay", days: 365 },
  ];

  const handleQuickFilter = (days: number) => {
    const { fromDate, toDate } = getDateRangeForDays(days);
    onDateRangeChange({ fromDate, toDate });
    onActiveFilterChange(days);
  };

  const handleDateInputChange = (newRange: {
    fromDate: string;
    toDate: string;
  }) => {
    onDateRangeChange(newRange);
    onActiveFilterChange(null); // Clear active filter when manual input
  };

  const handleClearFilter = () => {
    // Reset to default 30 days
    const { fromDate, toDate } = getDateRangeForDays(30);
    onDateRangeChange({ fromDate, toDate });
    onActiveFilterChange(30);
  };

  return (
    <motion.div className="glass-card p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-[#FB6E00]" />
          <span className="text-sm font-medium text-gray-700">
            Lọc theo thời gian:
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Input
            type="date"
            key={`from-${dateRange.fromDate}`}
            value={dateRange.fromDate || ""}
            onChange={(e) =>
              handleDateInputChange({ ...dateRange, fromDate: e.target.value })
            }
            className="w-36 h-8 text-sm text-accent"
          />
          <span className="text-gray-500">đến</span>
          <Input
            type="date"
            key={`to-${dateRange.toDate}`}
            value={dateRange.toDate || ""}
            onChange={(e) =>
              handleDateInputChange({ ...dateRange, toDate: e.target.value })
            }
            className="w-36 h-8 text-sm text-accent"
          />
        </div>

        <div className="flex space-x-2">
          {quickFilters.map((filter) => (
            <Button
              key={filter.days}
              size="sm"
              variant={activeFilter === filter.days ? "default" : "secondary"}
              className={`text-xs h-8 ${
                activeFilter === filter.days
                  ? "bg-[#FB6E00] hover:bg-[#e56300] text-white"
                  : ""
              }`}
              onClick={() => handleQuickFilter(filter.days)}
              disabled={loading}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="text-xs h-8 text-gray-500"
          onClick={handleClearFilter}
          disabled={loading}
        >
          Đặt lại
        </Button>

        {loading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Đang tải...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DateRangeFilter;
