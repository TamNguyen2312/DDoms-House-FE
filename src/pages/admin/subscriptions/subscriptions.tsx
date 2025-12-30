import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { usePricingPlans } from "@/hooks/usePricingPlan";
import { useSubscriptions } from "@/hooks/useSubscriptionManagement";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADPRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import type { ISubscriptionStatus } from "./types";

const SubscriptionsPage = () => {
  const navigate = useNavigate();

  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [statusFilter, setStatusFilter] = useState<ISubscriptionStatus | "all">(
    "all"
  );
  const [planIdFilter, setPlanIdFilter] = useState<number | "all">("all");

  // Fetch subscriptions
  const {
    data: subscriptionsData,
    isLoading,
    error,
  } = useSubscriptions({
    page,
    size,
    sort: "startedAt",
    direction: "DESC",
    status: statusFilter !== "all" ? statusFilter : undefined,
    planId: planIdFilter !== "all" ? planIdFilter : undefined,
  });

  // Fetch plans for filter
  const { data: plans } = usePricingPlans();

  // Handle view subscription detail
  const handleViewSubscription = (id: number) => {
    const subscription = subscriptionsData?.content?.find(
      (item) => item.subscriptionId === id
    );
    if (subscription) {
      navigate(`/admin/quan-ly-dang-ky/${id}`, {
        state: { subscription },
      });
    }
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: ISubscriptionStatus | "all") => {
    setStatusFilter(status);
    setPage(0); // Reset to first page when filter changes
  };

  // Handle plan filter change
  const handlePlanFilterChange = (planId: number | "all") => {
    setPlanIdFilter(planId);
    setPage(0); // Reset to first page when filter changes
  };

  const subscriptions = subscriptionsData?.content || [];
  const pagination = subscriptionsData?.pagination
    ? {
        currentPage: subscriptionsData.pagination.currentPage,
        pageSize: subscriptionsData.pagination.pageSize,
        totalPages: subscriptionsData.pagination.totalPages,
        totalElements: subscriptionsData.pagination.totalElements,
        hasNext: subscriptionsData.pagination.hasNext,
        hasPrevious: subscriptionsData.pagination.hasPrevious,
      }
    : undefined;

  return (
    <div className="h-full flex flex-col min-h-0">
      <SitePageTitle
        title="Quản lý Subscriptions"
        subTitle="Theo dõi và quản lý tất cả subscriptions của landlords"
      />

      {/* Subscriptions Table */}
      {isLoading ? (
        <LoadingCard
          Icon={Loader2}
          title="Đang tải danh sách subscriptions..."
        />
      ) : error ? (
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="flex-1 min-h-0 mt-2">
          <ADPView
          data={subscriptions}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          actions={(row) => (
            <ADPRowActions row={row} onView={handleViewSubscription} />
          )}
          onStatusFilterChange={handleStatusFilterChange}
          onPlanFilterChange={handlePlanFilterChange}
          statusFilter={statusFilter}
          planIdFilter={planIdFilter}
          plans={plans?.map((plan) => ({
            id: plan.id,
            code: plan.code,
            name: plan.name,
          }))}
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
