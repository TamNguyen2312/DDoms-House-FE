import { motion } from "framer-motion";
import {
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type {
  InvoiceAnalyticsResponse as InvoiceData,
  PaymentAnalyticsResponse as PaymentData,
} from "@/services/api/tenant-analytics.service";

interface InvoiceAnalyticsProps {
  invoice: InvoiceData;
  payment: PaymentData;
}

const InvoiceAnalytics = ({ invoice, payment }: InvoiceAnalyticsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const invoiceStats = [
    {
      label: "Tổng hóa đơn",
      value: invoice.totalCount,
      amount: formatCurrency(invoice.totalAmount),
      icon: Receipt,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
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
      amount: null,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Đã hủy",
      value: invoice.cancelledCount,
      amount: null,
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  const paymentStats = [
    {
      label: "Thanh toán thành công",
      value: payment.succeededCount,
      amount: formatCurrency(payment.succeededAmount),
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Thanh toán thất bại",
      value: payment.failedCount,
      amount: null,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Đang chờ xử lý",
      value: payment.pendingCount,
      amount: null,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <motion.div className="glass-card p-6 h-[480px] flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <Receipt className="h-5 w-5 text-[#FB6E00]" />
        <h2 className="text-lg font-semibold text-gray-900">
          Hóa Đơn & Thanh Toán
        </h2>
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {/* Invoice Stats */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 mb-2">HÓA ĐƠN</h3>
          <div className="grid grid-cols-2 gap-2">
            {invoiceStats.map((stat, index) => (
              <div key={index} className={`p-3 ${stat.bgColor} rounded-lg`}>
                <div className="flex items-center space-x-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-gray-600">{stat.label}</span>
                </div>
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                {stat.amount && (
                  <p className="text-xs text-gray-500">{stat.amount}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment Stats - Ẩn tạm thời vì API payment chưa sẵn sàng */}
        {/* <div>
          <h3 className="text-xs font-medium text-gray-500 mb-2 flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>THANH TOÁN</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {paymentStats.map((stat, index) => (
              <div
                key={index}
                className={`p-2 ${stat.bgColor} rounded-lg text-center`}
              >
                <p className={`text-lg font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600">{stat.label}</p>
                {stat.amount && (
                  <p className="text-xs text-gray-500 mt-1">{stat.amount}</p>
                )}
              </div>
            ))}
          </div>
        </div> */}

        {/* Average */}
        <div className="p-3 bg-purple-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-700">
            Giá trị hóa đơn trung bình
          </span>
          <span className="text-lg font-bold text-purple-600">
            {formatCurrency(invoice.avgInvoiceValue)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoiceAnalytics;
