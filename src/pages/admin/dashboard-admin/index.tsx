import {
  adminAnalyticsService,
  type ContractAnalyticsResponse,
  type InvoiceAnalyticsResponse,
  type PaymentAnalyticsResponse,
  type PropertyAnalyticsResponse,
} from "@/services/api/admin-analytics.service";
import { useGetRepairRequestStatisticsForAdmin } from "@/hooks/useRepairRequest";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ContractsChart from "./charts/contracts-chart";
import InvoiceChart from "./charts/invoice-chart";
import PaymentChart from "./charts/payment-chart";
import ContractsAnalytics from "./contracts-analytics";
import DateRangeFilter, { getDateRangeForDays } from "./date-range-filter";
import InvoiceAnalytics from "./invoice-analytics";
import PaymentAnalytics from "./payment-analytics";
import PropertyAnalytics from "./property-analytics";
import RepairRequestAnalytics from "./repair-request-analytics";
import StatsOverview from "./stats-overview";

// Re-export types for components
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

const initialProperty: PropertyData = {
  totalProperties: 0,
  totalUnits: 0,
  availableUnits: 0,
  occupiedUnits: 0,
  maintenanceUnits: 0,
  listingsPending: 0,
  listingsApproved: 0,
  listingsRejected: 0,
  listingsWithdrawn: 0,
  propertiesCreatedInRange: 0,
  moveInOut: { moveOut: 0, moveIn: 0 },
  timeSeries: [],
};

// Default to last 30 days
const DEFAULT_FILTER_DAYS = 30;
const defaultDateRange = getDateRangeForDays(DEFAULT_FILTER_DAYS);

const AdminAnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [activeFilter, setActiveFilter] = useState<number | null>(
    DEFAULT_FILTER_DAYS
  );
  const [contract, setContract] = useState<ContractData>(initialContract);
  const [payment, setPayment] = useState<PaymentData>(initialPayment);
  const [invoice, setInvoice] = useState<InvoiceData>(initialInvoice);
  const [property, setProperty] = useState<PropertyData>(initialProperty);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchKeyRef = useRef<string>("");

  // Fetch repair request statistics
  const { data: repairRequestStats, isLoading: isLoadingRepairStats } =
    useGetRepairRequestStatisticsForAdmin();

  useEffect(() => {
    // Create a unique key for this fetch based on dateRange
    const fetchKey = `${dateRange.fromDate}-${dateRange.toDate}`;

    // Prevent double fetch with the same key (StrictMode protection)
    if (fetchKeyRef.current === fetchKey) {
      return;
    }

    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    fetchKeyRef.current = fetchKey;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          fromDate: dateRange.fromDate || undefined,
          toDate: dateRange.toDate || undefined,
        };

        // Fetch all data in parallel
        const [contractData, paymentData, invoiceData, propertyData] =
          await Promise.all([
            adminAnalyticsService.getContractsOverview(params),
            adminAnalyticsService.getPaymentsOverview({
              ...params,
              paymentType: "ALL",
            }),
            adminAnalyticsService.getInvoicesOverview({
              ...params,
              invoiceType: "ALL",
            }),
            adminAnalyticsService.getPropertiesUnitsOverview(params),
          ]);

        // Check if request was aborted or fetch key changed
        if (
          abortController.signal.aborted ||
          fetchKeyRef.current !== fetchKey
        ) {
          return;
        }

        setContract(contractData);
        setPayment(paymentData);
        setInvoice(invoiceData);
        setProperty(propertyData);
      } catch (error) {
        // Don't show error if request was aborted or fetch key changed
        if (
          abortController.signal.aborted ||
          fetchKeyRef.current !== fetchKey
        ) {
          return;
        }
        console.error("Error fetching analytics data:", error);
        toast.error("Không thể tải dữ liệu thống kê", {
          description: "Vui lòng thử lại sau",
        });
      } finally {
        if (
          !abortController.signal.aborted &&
          fetchKeyRef.current === fetchKey
        ) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
      // Only reset fetchKey if this is the current fetch
      if (fetchKeyRef.current === fetchKey) {
        fetchKeyRef.current = "";
      }
    };
  }, [dateRange]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#FB6E00]" />
          <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
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
              contract={contract}
              invoice={invoice}
              property={property}
              payment={payment}
            />
          </motion.div>

          {/* Property Analytics */}
          <motion.div variants={itemVariants} className="col-span-12">
            <PropertyAnalytics property={property} />
          </motion.div>

          {/* Repair Request Analytics */}
          <motion.div variants={itemVariants} className="col-span-12">
            <RepairRequestAnalytics repairRequestStats={repairRequestStats} />
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
            <InvoiceAnalytics invoice={invoice} />
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-7"
          >
            <InvoiceChart invoice={invoice} />
          </motion.div>

          {/* Payment Analytics & Chart */}
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-5"
          >
            <PaymentAnalytics payment={payment} />
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-7"
          >
            <PaymentChart payment={payment} />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminAnalyticsDashboard;
