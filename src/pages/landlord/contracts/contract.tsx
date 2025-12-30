import SitePageTitle from "@/components/site/site-page-title";
import {
  useCreateContract,
  useDeleteContract,
  useGetContractsForLandlord,
  useSendContract,
  useUpdateContract,
} from "@/hooks/useContracts";
import { useCreateInvoiceFromContract } from "@/hooks/useInvoices";
import { useToast } from "@/hooks/useToast";
import type { GetContractsRequest } from "@/pages/admin/contracts/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateInvoiceDialog } from "./dialogs/create-invoice-dialog";
import type { ContractFormValues } from "./form/contract-create-form";
import type { UpdateContractFormValues } from "./form/contract-draft-update-form";
import { ContractFormDialog } from "./form/contract-form-dialog";
import type { IContract } from "./table/adp-columns";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";

const ADContract = () => {
  const toast = useToast();
  const navigate = useNavigate();

  // Pagination state
  const [paginationParams, setPaginationParams] = useState<GetContractsRequest>(
    {
      page: 0,
      size: 30,
      sort: "createdAt",
      direction: "DESC",
    }
  );

  // queries
  const { data: contractsResponse, isLoading } =
    useGetContractsForLandlord(paginationParams);

  // Handle nested response structure: data.data.content or data.content
  const contracts =
    contractsResponse?.data?.content || contractsResponse?.content || [];
  const pagination =
    contractsResponse?.data?.pagination || contractsResponse?.pagination;

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPaginationParams((prev) => ({
      ...prev,
      page,
      size: pageSize,
    }));
  };

  // mutations
  const { mutateAsync: createContract } = useCreateContract();
  const { mutate: sendContract, isPending: isSending } = useSendContract();
  const { mutate: updateContract, isPending: isUpdating } = useUpdateContract();
  const { mutate: deleteContract } = useDeleteContract();

  // Hàm xử lý xem hợp đồng
  const handleViewContract = (contractId: number) => {
    navigate(`/landlord/quan-ly-hop-dong/${contractId}`);
  };

  // Hàm xử lý xóa contract
  const handleDeleteContract = (id: number) => {
    deleteContract(id);
  };

  // Hàm xử lý gửi contract
  const handleSendContract = (id: number) => {
    sendContract(id, {
      onSuccess: () => {
        toast.success("Gửi hợp đồng thành công");
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Gửi hợp đồng thất bại";
        toast.error(errorMessage);
      },
    });
  };

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<IContract | null>(
    null
  );
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] =
    useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null
  );
  const [selectedContract, setSelectedContract] = useState<IContract | null>(
    null
  );

  // Invoice mutation
  const { mutate: createInvoice, isPending: isCreatingInvoice } =
    useCreateInvoiceFromContract();

  const handleCreate = () => {
    setEditingContract(null);
    setFormDialogOpen(true);
  };

  const handleSubmitContract = (
    values: ContractFormValues | UpdateContractFormValues
  ) => {
    // Update contract
    if (editingContract) {
      if (editingContract.status === "DRAFT") {
        const updateData = values as UpdateContractFormValues;
        updateContract(
          {
            contractId: editingContract.id,
            data: updateData,
          },
          {
            onSuccess: () => {
              setEditingContract(null);
              setFormDialogOpen(false);
            },
          }
        );
        return;
      }
    }

    // Create new contract
    const createData = values as ContractFormValues;
    toast.promise(
      createContract({
        ...createData,
        unitId: createData.unitId,
        tenantEmail: createData.tenantEmail,
      }),
      {
        loading: "Đang tạo hợp đồng...",
        success: () => {
          return "Tạo hợp đồng thành công";
        },
        error: (err: Error) => err.message ?? "Tạo hợp đồng thất bại",
      }
    );
    setFormDialogOpen(false);
    setEditingContract(null);
  };

  const handleUpdateContract = (id: number) => {
    const contract = contracts.find((item: IContract) => item.id === id);
    if (!contract) {
      toast.error("Không tìm thấy hợp đồng để chỉnh sửa");
      return;
    }
    setEditingContract(contract);
    setFormDialogOpen(true);
  };

  const handleToggleDialog = (open: boolean) => {
    if (!open) {
      setEditingContract(null);
    }
    setFormDialogOpen(open);
  };

  // Handle create invoice
  const handleCreateInvoice = (contractId: number) => {
    const contract = contracts.find(
      (item: IContract) => item.id === contractId
    );
    setSelectedContractId(contractId);
    setSelectedContract(contract || null);
    setIsCreateInvoiceDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Mục hợp đồng"
          subTitle="Quản lý tập trung các hợp đồng"
          onCreate={handleCreate}
          // onExport={handleExport}
          hidePrint={true}
          hideImport={true}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p>Đang tải danh sách hợp đồng...</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ADPView
            data={contracts}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onRowClick={handleViewContract}
            actions={(row) => (
              <ADLRowActions
                row={row}
                onView={() => handleViewContract(row.id)}
                onUpdate={() => handleUpdateContract(row.id)}
                onDelete={() => handleDeleteContract(row.id)}
                onSend={() => handleSendContract(row.id)}
                onCreateInvoice={() => handleCreateInvoice(row.id)}
                isSending={isSending}
              />
            )}
          />
        </div>
      )}

      <ContractFormDialog
        open={formDialogOpen}
        onOpenChange={handleToggleDialog}
        initialData={
          (editingContract ?? null) as unknown as
            | import("@/pages/admin/contracts/types").IContract
            | null
        }
        onSubmit={handleSubmitContract}
        isPending={isUpdating}
      />

      {selectedContractId && (
        <CreateInvoiceDialog
          open={isCreateInvoiceDialogOpen}
          onOpenChange={(open) => {
            setIsCreateInvoiceDialogOpen(open);
            if (!open) {
              setSelectedContractId(null);
              setSelectedContract(null);
            }
          }}
          onSubmit={(data) => {
            createInvoice(
              { contractId: selectedContractId, data },
              {
                onSuccess: () => {
                  setIsCreateInvoiceDialogOpen(false);
                  setSelectedContractId(null);
                  setSelectedContract(null);
                },
              }
            );
          }}
          isPending={isCreatingInvoice}
          depositAmount={selectedContract?.depositAmount || 0}
          status={selectedContract?.status}
        />
      )}
    </div>
  );
};

export default ADContract;
