import { motion } from "framer-motion";
import {
  FileText,
  Receipt,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type {
  ContractAnalyticsResponse as ContractData,
  InvoiceAnalyticsResponse as InvoiceData,
  PaymentAnalyticsResponse as PaymentData,
} from "@/services/api/tenant-analytics.service";

interface StatsOverviewProps {
  contract: ContractData;
  invoice: InvoiceData;
  payment: PaymentData;
}

const StatsOverview = ({ contract, invoice, payment }: StatsOverviewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Hợp đồng hoạt động",
      value: contract.active,
      subtitle: `${contract.total} tổng hợp đồng`,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      title: "Chờ xử lý",
      value: contract.signed + contract.terminationPending,
      subtitle: "Cần xác nhận",
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
    },
    {
      title: "Tổng hóa đơn",
      value: invoice.totalCount,
      subtitle: formatCurrency(invoice.totalAmount),
      icon: Receipt,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
    },
    {
      title: "Hóa đơn đã thanh toán",
      value: invoice.paidCount,
      subtitle: formatCurrency(invoice.paidAmount),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
    },
    {
      title: "Hóa đơn chưa TT",
      value: invoice.totalCount - invoice.paidCount - invoice.cancelledCount,
      subtitle: formatCurrency(invoice.totalAmount - invoice.paidAmount),
      icon: CreditCard,
      color: "text-red-600",
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
    },
    // Ẩn tạm thời vì API payment chưa sẵn sàng
    // {
    //   title: "Thanh toán thành công",
    //   value: payment.succeededCount,
    //   subtitle: formatCurrency(payment.succeededAmount),
    //   icon: TrendingUp,
    //   color: "text-teal-600",
    //   bgColor: "bg-teal-50",
    //   iconBg: "bg-teal-100",
    // },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.02 }}
          className={`glass-card p-4 ${stat.bgColor} border-none`}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className={`p-2 rounded-lg ${stat.iconBg} bg-linear-to-bl from-white/50`}
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-sm font-medium text-gray-700 mt-1">{stat.title}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;
