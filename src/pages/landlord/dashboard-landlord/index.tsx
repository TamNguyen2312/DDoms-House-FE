import {
  SubscriptionPromotionDialog,
  isPromotionDismissed,
} from "@/components/landlord/subscription-promotion-dialog";
import { useLandlordCurrentSubscription } from "@/hooks/useLandlordSubscription";
import {
  landlordAnalyticsService,
  type ContractAnalyticsResponse,
  type InvoiceAnalyticsResponse,
  type PaymentAnalyticsResponse,
  type PropertyAnalyticsResponse,
  type SubscriptionAnalyticsResponse,
} from "@/services/api/landlord-analytics.service";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import ContractsChart from "./charts/contracts-chart";
import InvoiceChart from "./charts/invoice-chart";
import ContractsAnalytics from "./contracts-analytics";
import DateRangeFilter, { getDateRangeForDays } from "./date-range-filter";
import InvoiceAnalytics from "./invoice-analytics";
import PropertyAnalytics from "./property-analytics";
import StatsOverview from "./stats-overview";
// import SubscriptionAnalytics from "./subscription-analytics"; // Ẩn tạm thời vì API chưa sẵn sàng

// Re-export types for components
export type SubscriptionData = SubscriptionAnalyticsResponse;
export type ContractData = ContractAnalyticsResponse;
export type PaymentData = PaymentAnalyticsResponse;
export type InvoiceData = InvoiceAnalyticsResponse;
export type PropertyData = PropertyAnalyticsResponse;

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
const initialSubscription: SubscriptionData = {
  totalSubscriptions: 0,
  activeCount: 0,
  revenue: 0,
  byStatus: {},
};

const initialContract: ContractData = {
  total: 0,
  active: 0,
  expired: 0,
  signed: 0,
  draft: 0,
  byStatus: {},
  timeSeries: [],
};

const initialPayment: PaymentData = {
  totalCount: 0,
  succeededCount: 0,
  pendingCount: 0,
  failedCount: 0,
  totalAmount: 0,
  succeededAmount: 0,
  avgTicket: 0,
  byType: {},
  byProvider: {},
};

const initialInvoice: InvoiceData = {
  totalCount: 0,
  totalAmount: 0,
  paidAmount: 0,
  avgInvoiceValue: 0,
  byType: {},
  timeSeries: [],
};

const initialProperty: PropertyData = {
  totalProperties: 0,
  totalUnits: 0,
};

// Default to last 30 days
const DEFAULT_FILTER_DAYS = 30;
const defaultDateRange = getDateRangeForDays(DEFAULT_FILTER_DAYS);

const LandlordAnalyticsDashboard = () => {
  // const [subscription, setSubscription] = // Ẩn tạm thời vì API chưa sẵn sàng
  //   useState<SubscriptionData>(initialSubscription);
  const subscription = initialSubscription; // Dùng giá trị mặc định
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [activeFilter, setActiveFilter] = useState<number | null>(
    DEFAULT_FILTER_DAYS
  );
  const [contract, setContract] = useState<ContractData>(initialContract);
  const [payment, setPayment] = useState<PaymentData>(initialPayment);
  const [invoice, setInvoice] = useState<InvoiceData>(initialInvoice);
  const [property, setProperty] = useState<PropertyData>(initialProperty);
  const [loading, setLoading] = useState(true);
  
  // Check subscription status for promotion popup
  const { data: currentSubscription, isLoading: isLoadingSubscription } =
    useLandlordCurrentSubscription();
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  // Show promotion dialog if landlord doesn't have active subscription
  useEffect(() => {
    if (!isLoadingSubscription) {
      // Check if landlord has active subscription
      // If currentSubscription is null/undefined, it means no subscription exists
      const hasActiveSubscription =
        currentSubscription?.status === "ACTIVE" && currentSubscription?.isActive === true;

      // Show promotion if:
      // 1. No active subscription (no subscription or not active)
      // 2. Promotion hasn't been dismissed
      if (!hasActiveSubscription && !isPromotionDismissed()) {
        // Delay showing dialog slightly for better UX
        const timer = setTimeout(() => {
          setShowPromotionDialog(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentSubscription, isLoadingSubscription]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        fromDate: dateRange.fromDate || undefined,
        toDate: dateRange.toDate || undefined,
      };

      // Fetch all data in parallel
      const [
        // subscriptionData, // Ẩn tạm thời vì API chưa sẵn sàng
        contractData,
        paymentData,
        invoiceData,
        propertyData,
      ] = await Promise.all([
        // landlordAnalyticsService.getSubscriptionsOverview(params), // Ẩn tạm thời vì API chưa sẵn sàng
        landlordAnalyticsService.getContractsOverview(params),
        landlordAnalyticsService.getPaymentsOverview(params),
        landlordAnalyticsService.getInvoicesOverview({
          ...params,
          invoiceType: "ALL",
        }),
        landlordAnalyticsService.getPropertiesUnitsOverview(params),
      ]);

      // setSubscription(subscriptionData); // Ẩn tạm thời vì API chưa sẵn sàng
      setContract(contractData);
      setPayment(paymentData);
      setInvoice(invoiceData);
      setProperty(propertyData);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Không thể tải dữ liệu thống kê", {
        description: "Vui lòng thử lại sau",
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

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
    <div className="h-full text-white">
      <main className="mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-0"
        >
          {/* Date Range Filter */}
          <motion.div variants={itemVariants} className="col-span-12">
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              loading={loading}
              activeFilter={activeFilter}
              onActiveFilterChange={setActiveFilter}
            />
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="col-span-12">
            <StatsOverview
              subscription={subscription} // Vẫn truyền vào nhưng component sẽ xử lý khi subscription rỗng
              contract={contract}
              invoice={invoice}
              property={property}
            />
          </motion.div>

          {/* Property Analytics */}
          <motion.div variants={itemVariants} className="col-span-12">
            <PropertyAnalytics property={property} />
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

          {/* Subscription Analytics - Ẩn tạm thời vì API chưa sẵn sàng */}
          {/* <motion.div variants={itemVariants} className="col-span-12">
            <SubscriptionAnalytics subscription={subscription} />
          </motion.div> */}
        </motion.div>
      </main>

      {/* Subscription Promotion Dialog */}
      <SubscriptionPromotionDialog
        open={showPromotionDialog}
        onOpenChange={setShowPromotionDialog}
      />
    </div>
  );
};

export default LandlordAnalyticsDashboard;
