import type {
  ContractAnalyticsResponse as ContractData,
  InvoiceAnalyticsResponse as InvoiceData,
  PaymentAnalyticsResponse as PaymentData,
  PropertyAnalyticsResponse as PropertyData,
} from "@/services/api/admin-analytics.service";
import { motion } from "framer-motion";
import { Building2, CreditCard, FileText, Home, Receipt } from "lucide-react";

interface StatsOverviewProps {
  contract: ContractData;
  invoice: InvoiceData;
  property: PropertyData;
  payment: PaymentData;
}

const StatsOverview = ({
  contract,
  invoice,
  property,
  payment,
}: StatsOverviewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      title: "Tổng Bất động sản",
      value: property.totalProperties,
      subtitle: `${property.totalUnits} phòng`,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      title: "Phòng trống",
      value: property.availableUnits,
      subtitle: `${property.occupiedUnits} đang thuê`,
      icon: Home,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      iconBg: "bg-teal-100",
    },
    {
      title: "Tổng Hợp đồng",
      value: contract.total,
      subtitle: `${contract.active} đang hoạt động`,
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      iconBg: "bg-indigo-100",
    },
    {
      title: "Tổng Hóa đơn",
      value: invoice.totalCount,
      subtitle: formatCurrency(invoice.totalAmount),
      icon: Receipt,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
    },
    {
      title: "Thanh toán thành công",
      value: payment.succeededCount,
      subtitle: formatCurrency(payment.succeededAmount),
      icon: CreditCard,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
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
          <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs font-medium text-gray-700 mt-1">{stat.title}</p>
          <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;
