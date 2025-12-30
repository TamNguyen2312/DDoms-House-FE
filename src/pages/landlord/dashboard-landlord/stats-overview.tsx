import type {
  ContractAnalyticsResponse as ContractData,
  InvoiceAnalyticsResponse as InvoiceData,
  PropertyAnalyticsResponse as PropertyData,
  SubscriptionAnalyticsResponse as SubscriptionData,
} from "@/services/api/landlord-analytics.service";
import { motion } from "framer-motion";
import { Building2, FileText, Receipt } from "lucide-react";

interface StatsOverviewProps {
  subscription: SubscriptionData;
  contract: ContractData;
  invoice: InvoiceData;
  property: PropertyData;
}

const StatsOverview = ({
  subscription,
  contract,
  invoice,
  property,
}: StatsOverviewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const cards = [
    {
      title: "Tổng Bất Động Sản",
      value: property.totalProperties.toString(),
      subtitle: `${property.totalUnits} đơn vị`,
      icon: Building2,
      color: "from-blue-500 to-blue-400",
    },
    {
      title: "Hợp Đồng Đang Hoạt Động",
      value: contract.active.toString(),
      subtitle: `${contract.total} tổng hợp đồng`,
      icon: FileText,
      color: "from-purple-500 to-purple-400",
    },
    {
      title: "Hóa Đơn Chưa Thanh Toán",
      value: invoice.totalCount.toString(),
      subtitle: formatCurrency(invoice.totalAmount - invoice.paidAmount),
      icon: Receipt,
      color: "from-red-500 to-red-400",
    },
    // Ẩn tạm thời vì API subscription chưa sẵn sàng
    // {
    //   title: "Subscription Hoạt Động",
    //   value: subscription.activeCount.toString(),
    //   subtitle: `${subscription.expiringSoon} sắp hết hạn`,
    //   icon: CreditCard,
    //   color: "from-indigo-500 to-indigo-400",
    // },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="glass-card p-4 overflow-hidden relative"
        >
          <div
            className={`absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-bl ${card.color} rounded-full opacity-20 blur-xl`}
          ></div>
          <div className="z-10 relative">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-1.5 rounded-lg bg-black/10">
                <card.icon className="h-4 w-4 text-[#FB6E00]" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-600 mt-1">{card.title}</p>
            <p className="text-xs text-gray-500">{card.subtitle}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsOverview;
