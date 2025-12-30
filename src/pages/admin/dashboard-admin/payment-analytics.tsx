import { motion } from "framer-motion";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { PaymentAnalyticsResponse as PaymentData } from "@/services/api/admin-analytics.service";

interface PaymentAnalyticsProps {
  payment: PaymentData;
}

const TYPE_LABELS: Record<string, string> = {
  CONTRACT: "Hợp đồng",
  SERVICE: "Dịch vụ",
  SUBSCRIPTION: "Subscription",
};

const PROVIDER_COLORS: Record<string, string> = {
  PAYOS: "#6366f1",
  VNPAY: "#ef4444",
  MOMO: "#ec4899",
  ZALOPAY: "#3b82f6",
};

const PaymentAnalytics = ({ payment }: PaymentAnalyticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const providerChartData = Object.entries(payment.byProvider).map(
    ([provider, count]) => ({
      name: provider,
      value: count,
      color: PROVIDER_COLORS[provider] || "#6b7280",
    })
  );

  const typeData = Object.entries(payment.byType).map(([type, count]) => ({
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
      label: "Thành công",
      value: payment.succeededCount,
      amount: formatCurrency(payment.succeededAmount),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Thất bại",
      value: payment.failedCount,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Đang chờ",
      value: payment.pendingCount,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const successRate =
    payment.totalCount > 0
      ? ((payment.succeededCount / payment.totalCount) * 100).toFixed(1)
      : "0";

  return (
    <motion.div className="glass-card p-6 h-[350px] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <CreditCard className="h-5 w-5 text-[#FB6E00]" />
        <h2 className="text-lg font-semibold text-gray-900">
          Phân Tích Thanh Toán
        </h2>
      </div>

      <div className="flex-1 flex">
        <div className="w-2/5 h-full flex flex-col">
          <ResponsiveContainer width="100%" height="70%">
            <PieChart>
              <Pie
                data={providerChartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {providerChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2">
            {providerChartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-3/5 flex flex-col justify-center space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`p-2 ${stat.bgColor} rounded-lg text-center`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color} mx-auto mb-1`} />
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Tỷ lệ thành công</span>
              <span className="text-sm font-bold text-blue-600">
                {successRate}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Theo loại:</p>
            <div className="flex flex-wrap gap-2">
              {typeData.map((item, index) => (
                <span
                  key={index}
                  className="text-xs text-black bg-gray-100 px-2 py-1 rounded"
                >
                  {item.name}: <strong>{item.value}</strong>
                </span>
              ))}
            </div>
          </div>

          <div className="p-2 bg-emerald-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Tổng thu</span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(payment.succeededAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentAnalytics;
