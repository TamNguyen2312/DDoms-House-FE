import {
  tenantAnalyticsService,
  type ContractAnalyticsResponse,
  type InvoiceAnalyticsResponse,
  type PaymentAnalyticsResponse,
} from "@/services/api/tenant-analytics.service";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ContractsChart from "./charts/contracts-chart";
import InvoiceChart from "./charts/invoice-chart";
import ContractsAnalytics from "./contracts-analytics";
import InvoiceAnalytics from "./invoice-analytics";
import StatsOverview from "./stats-overview";

// Re-export types for components
export type ContractData = ContractAnalyticsResponse;
export type PaymentData = PaymentAnalyticsResponse;
export type InvoiceData = InvoiceAnalyticsResponse;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

// Initial empty states
const initialContract: ContractData = {
  total: 0,
  active: 0,
  signed: 0,
  terminationPending: 0,
  expired: 0,
  cancelled: 0,
  draft: 0,
  byStatus: {},
  timeSeries: [],
};

const initialPayment: PaymentData = {
  totalCount: 0,
  succeededCount: 0,
  failedCount: 0,
  pendingCount: 0,
  totalAmount: 0,
  succeededAmount: 0,
  avgTicket: 0,
  byType: {},
  byProvider: {},
  timeSeries: [],
};

const initialInvoice: InvoiceData = {
  totalCount: 0,
  paidCount: 0,
  overdueCount: 0,
  cancelledCount: 0,
  totalAmount: 0,
  paidAmount: 0,
  avgInvoiceValue: 0,
  byStatus: {},
  byType: {},
  timeSeries: [],
};

const TenantAnalyticsDashboard = () => {
  const [contract, setContract] = useState<ContractData>(initialContract);
  // const [payment, setPayment] = useState<PaymentData>(initialPayment); // Ẩn tạm thời vì API chưa sẵn sàng
  const payment = initialPayment; // Dùng giá trị mặc định
  const [invoice, setInvoice] = useState<InvoiceData>(initialInvoice);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};

      // Fetch all data in parallel
      const [
        contractData,
        // paymentData, // Ẩn tạm thời vì API chưa sẵn sàng
        invoiceData,
      ] = await Promise.all([
        tenantAnalyticsService.getContractsOverview(params),
        // tenantAnalyticsService.getPaymentsOverview(params), // Ẩn tạm thời vì API chưa sẵn sàng
        tenantAnalyticsService.getInvoicesOverview({
          ...params,
          invoiceType: "ALL",
        }),
      ]);

      setContract(contractData);
      // setPayment(paymentData); // Ẩn tạm thời vì API chưa sẵn sàng
      setInvoice(invoiceData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Không thể tải dữ liệu thống kê", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#FB6E00]" />
          <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0"
        >
          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="col-span-12">
            <StatsOverview
              contract={contract}
              invoice={invoice}
              payment={payment}
            />
          </motion.div>

          {/* Contracts Analytics & Chart */}
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-5"
          >
            <ContractsAnalytics contract={contract} />
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-7"
          >
            <ContractsChart contract={contract} />
          </motion.div>

          {/* Invoice Analytics & Chart */}
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-5"
          >
            <InvoiceAnalytics invoice={invoice} payment={payment} />
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-7"
          >
            <InvoiceChart invoice={invoice} />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default TenantAnalyticsDashboard;
