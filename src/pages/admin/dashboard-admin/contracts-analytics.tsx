import type { ContractAnalyticsResponse as ContractData } from "@/services/api/admin-analytics.service";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ContractsAnalyticsProps {
  contract: ContractData;
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  SIGNED: "Đã ký",
  DRAFT: "Bản nháp",
  SENT: "Đã gửi",
  TERMINATION_PENDING: "Chờ chấm dứt",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#22c55e",
  SIGNED: "#3b82f6",
  DRAFT: "#94a3b8",
  SENT: "#8b5cf6",
  TERMINATION_PENDING: "#f59e0b",
  CANCELLED: "#ef4444",
  EXPIRED: "#6b7280",
};

const ContractsAnalytics = ({ contract }: ContractsAnalyticsProps) => {
  const chartData = Object.entries(contract.byStatus).map(
    ([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || "#6b7280",
    })
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-2 text-sm">
          <p style={{ color: payload[0].payload.color }}>
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div className="glass-card p-6 h-[350px] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="h-5 w-5 text-[#FB6E00]" />
        <h2 className="text-lg font-semibold text-gray-900">
          Phân Bố Hợp Đồng
        </h2>
      </div>

      <div className="flex-1 flex items-center">
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {item.value}
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Tổng</span>
              <span className="text-lg font-bold text-[#FB6E00]">
                {contract.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContractsAnalytics;
