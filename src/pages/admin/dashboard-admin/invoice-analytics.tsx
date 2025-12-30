import type { InvoiceAnalyticsResponse as InvoiceData } from "@/services/api/admin-analytics.service";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Receipt,
  XCircle,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface InvoiceAnalyticsProps {
  invoice: InvoiceData;
}

const STATUS_LABELS: Record<string, string> = {
  ISSUED: "Đã phát hành",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
  PENDING: "Chờ xử lý",
};

const STATUS_COLORS: Record<string, string> = {
  ISSUED: "#3b82f6",
  PAID: "#22c55e",
  OVERDUE: "#ef4444",
  CANCELLED: "#6b7280",
  PENDING: "#f59e0b",
};

const TYPE_LABELS: Record<string, string> = {
  CONTRACT: "Hợp đồng",
  SERVICE: "Dịch vụ",
  SUBSCRIPTION: "Mua gói",
};

const InvoiceAnalytics = ({ invoice }: InvoiceAnalyticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusChartData = Object.entries(invoice.byStatus).map(
    ([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || "#6b7280",
    })
  );

  const typeChartData = Object.entries(invoice.byType).map(([type, count]) => ({
    name: TYPE_LABELS[type] || type,
    value: count,
  }));

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

  const stats = [
    {
      label: "Đã thanh toán",
      value: invoice.paidCount,
      amount: formatCurrency(invoice.paidAmount),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Quá hạn",
      value: invoice.overdueCount,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Đã hủy",
      value: invoice.cancelledCount,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      label: "Chờ thanh toán",
      value: invoice.totalCount - invoice.paidCount - invoice.cancelledCount,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <motion.div className="glass-card p-6 h-[350px] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Receipt className="h-5 w-5 text-[#FB6E00]" />
        <h2 className="text-lg font-semibold text-gray-900">
          Phân Tích Hóa Đơn
        </h2>
      </div>

      <div className="flex-1 flex">
        <div className="w-2/5 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-3/5 flex flex-col justify-center space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {stats.map((stat, index) => (
              <div key={index} className={`p-2 ${stat.bgColor} rounded-lg`}>
                <div className="flex items-center space-x-1 mb-1">
                  <stat.icon className={`h-3 w-3 ${stat.color}`} />
                  <span className="text-xs text-gray-600">{stat.label}</span>
                </div>
                <p className={`text-sm font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs mb-1">Theo loại:</p>
            <div className="flex flex-wrap gap-2">
              {typeChartData.map((item, index) => (
                <span
                  key={index}
                  className="text-xs text-black bg-gray-100 px-2 py-1 rounded"
                >
                  {item.name}: <strong>{item.value}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="p-2 bg-orange-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Tổng giá trị</span>
              <span className="text-sm font-bold text-orange-600">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoiceAnalytics;
