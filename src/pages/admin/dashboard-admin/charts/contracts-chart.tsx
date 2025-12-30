import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ContractAnalyticsResponse as ContractData } from "@/services/api/admin-analytics.service";

interface ContractsChartProps {
  contract: ContractData;
}

const ContractsChart = ({ contract }: ContractsChartProps) => {
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  const chartData = contract.timeSeries.map((item) => ({
    date: new Date(item.date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }),
    count: item.count,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div className="glass-card p-6 h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-[#FB6E00]" />
          <h2 className="text-lg font-semibold text-gray-900">
            Hợp Đồng Theo Thời Gian
          </h2>
        </div>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant={chartType === "area" ? "default" : "secondary"}
            className="text-xs h-7"
            onClick={() => setChartType("area")}
          >
            Area
          </Button>
          <Button
            size="sm"
            variant={chartType === "bar" ? "default" : "secondary"}
            className="text-xs h-7"
            onClick={() => setChartType("bar")}
          >
            Bar
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorContractAdmin"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0, 0, 0, 0.1)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(0, 0, 0, 0.7)", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "rgba(0, 0, 0, 0.7)", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Số hợp đồng"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorContractAdmin)"
                />
              </AreaChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(0, 0, 0, 0.1)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(0, 0, 0, 0.7)", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "rgba(0, 0, 0, 0.7)", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Số hợp đồng"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Không có dữ liệu trong khoảng thời gian này
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ContractsChart;
