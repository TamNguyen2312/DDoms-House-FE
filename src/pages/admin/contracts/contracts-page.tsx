import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useGetAdminContracts } from "@/hooks/useContracts";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ContractDetailDialog } from "./dialogs/contract-detail-dialog";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import type { AdminContractItem } from "./types";

const ContractsPage = () => {

  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [statusFilter] = useState<string | "">("");
  const [landlordIdFilter] = useState<number | undefined>(undefined);
  const [tenantIdFilter] = useState<number | undefined>(undefined);
  const [unitIdFilter] = useState<number | undefined>(undefined);

  // Dialog state
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Fetch contracts from API
  const {
    data: contractsResponse,
    isLoading,
    error,
  } = useGetAdminContracts({
    page,
    size,
    status: statusFilter || undefined,
    landlordId: landlordIdFilter,
    tenantId: tenantIdFilter,
    unitId: unitIdFilter,
    sort: "createdAt",
    direction: "DESC",
  });

  const contracts: AdminContractItem[] = contractsResponse?.content || [];
  const pagination = contractsResponse?.pagination
    ? {
        currentPage: contractsResponse.pagination.currentPage,
        pageSize: contractsResponse.pagination.pageSize,
        totalPages: contractsResponse.pagination.totalPages,
        totalElements: contractsResponse.pagination.totalElements,
        hasNext: contractsResponse.pagination.hasNext,
        hasPrevious: contractsResponse.pagination.hasPrevious,
      }
    : undefined;

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Hàm xử lý xem contract
  const handleViewContract = (contractId: number) => {
    setSelectedContractId(contractId);
    setIsDetailDialogOpen(true);
  };


  return (
    <div className="h-full flex flex-col min-h-0">
      <SitePageTitle
        title="Quản lý hợp đồng"
        subTitle="Quản lý tập trung các hợp đồng thuê phòng"
        hideCreate={true}
        hidePrint={true}
        hideImport={true}
      />

      {isLoading ? (
        <LoadingCard Icon={Loader2} title="Đang tải danh sách hợp đồng..." />
      ) : error ? (
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
        </div>
      ) : (
        <div className="flex-1 min-h-0 mt-4">
          <ADPView
            data={contracts}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            actions={(row) => (
              <ADLRowActions
                row={row}
                onView={handleViewContract}
                // onUpdate={handleUpdateContract}
                // onDelete={handleDeleteContract}
              />
            )}
          />
        </div>
      )}

      {/* Dialog xem chi tiết */}
      <ContractDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        contractId={selectedContractId}
      />
    </div>
  );
};

export default ContractsPage;
