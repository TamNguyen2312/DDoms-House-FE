import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
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
import type { InvoiceAnalyticsResponse as InvoiceData } from "@/services/api/tenant-analytics.service";

interface InvoiceChartProps {
  invoice: InvoiceData;
}

const InvoiceChart = ({ invoice }: InvoiceChartProps) => {
  const [viewMode, setViewMode] = useState<"count" | "amount">("amount");

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)} tr`;
    }
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const chartData = invoice.timeSeries.map((item) => ({
    date: new Date(item.date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }),
    count: item.count,
    amount: item.amount,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 text-sm">
          <p className="font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}:{" "}
              {entry.dataKey === "amount"
                ? formatCurrency(entry.value) + " đ"
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div className="glass-card p-6 h-[480px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Receipt className="h-5 w-5 text-[#FB6E00]" />
          <h2 className="text-lg font-semibold text-gray-900">
            Hóa Đơn Theo Thời Gian
          </h2>
        </div>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant={viewMode === "amount" ? "default" : "secondary"}
            className="text-xs h-7"
            onClick={() => setViewMode("amount")}
          >
            Giá trị
          </Button>
          <Button
            size="sm"
            variant={viewMode === "count" ? "default" : "secondary"}
            className="text-xs h-7"
            onClick={() => setViewMode("count")}
          >
            Số lượng
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "amount" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorInvoiceTenant"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                <YAxis
                  tick={{ fill: "rgba(0, 0, 0, 0.7)", fontSize: 11 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Giá trị"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInvoiceTenant)"
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
                  name="Số lượng"
                  fill="#3b82f6"
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

export default InvoiceChart;
