import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useGetAdminPayments } from "@/hooks/usePayments";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { PaymentDetailDialog } from "./dialogs/payment-detail-dialog";
import { ADPRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import type { AdminPaymentItem } from "./types";

const PaymentsPage = () => {
  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [statusFilter, setStatusFilter] = useState<string | "">("");
  const [providerFilter, setProviderFilter] = useState<string | "">("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("ALL");
  const [tenantIdFilter, setTenantIdFilter] = useState<number | undefined>(
    undefined
  );
  const [invoiceIdFilter, setInvoiceIdFilter] = useState<number | undefined>(
    undefined
  );
  const [serviceInvoiceIdFilter, setServiceInvoiceIdFilter] = useState<
    number | undefined
  >(undefined);

  // Fetch payments from API
  const {
    data: paymentsResponse,
    isLoading,
    error,
  } = useGetAdminPayments({
    page,
    size,
    status: statusFilter || undefined,
    provider: providerFilter || undefined,
    paymentType: paymentTypeFilter,
    tenantId: tenantIdFilter,
    invoiceId: invoiceIdFilter,
    serviceInvoiceId: serviceInvoiceIdFilter,
  });

  const payments: AdminPaymentItem[] = paymentsResponse?.content || [];
  const pagination = paymentsResponse?.pagination
    ? {
        currentPage: paymentsResponse.pagination.currentPage,
        pageSize: paymentsResponse.pagination.pageSize,
        totalPages: paymentsResponse.pagination.totalPages,
        totalElements: paymentsResponse.pagination.totalElements,
        hasNext: paymentsResponse.pagination.hasNext,
        hasPrevious: paymentsResponse.pagination.hasPrevious,
      }
    : undefined;

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // State for payment detail dialog
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Hàm xử lý xem payment
  const handleViewPayment = (paymentId: number | string) => {
    const id =
      typeof paymentId === "string" ? parseInt(paymentId, 10) : paymentId;
    setSelectedPaymentId(id);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <SitePageTitle
        title="Lịch sử thanh toán"
        subTitle="Quản lý tập trung các giao dịch thanh toán"
        hideCreate={true}
        hidePrint={true}
        hideImport={true}
      />

      {isLoading ? (
        <LoadingCard Icon={Loader2} title="Đang tải danh sách thanh toán..." />
      ) : error ? (
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="flex-1 min-h-0 mt-4">
          <ADPView
            data={payments}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            actions={(row) => (
              <ADPRowActions row={row} onView={handleViewPayment} />
            )}
          />
        </div>
      )}

      {/* Payment Detail Dialog */}
      <PaymentDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        paymentId={selectedPaymentId}
        paymentType={paymentTypeFilter}
      />
    </div>
  );
};

export default PaymentsPage;
