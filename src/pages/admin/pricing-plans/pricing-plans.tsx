import SitePageTitle from "@/components/site/site-page-title";
import {
  useDeletePricingPlan,
  usePricingPlansPageable,
  useSetPlanStatus,
  useUpsertPricingPlan,
} from "@/hooks/usePricingPlan";
import { useToast } from "@/hooks/useToast";
import { AxiosError } from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewPlanFormDialog } from "./components/new-plan-form-dialog";
import {
  PricingPlanFormDialog,
  type PricingPlanFormValues,
} from "./components/pricing-plan-form-dialog";
import { ADPRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import type { IPricingPlan } from "./types";

const PricingPlansPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);

  // Fetch pricing plans from API with pagination
  const { data: pricingPlansResponse, isLoading, error } = usePricingPlansPageable({
    page,
    size,
    direction: "ASC",
  });

  // Filter chỉ hiển thị các plan có id = 1, 2, 3, 4
  const allPricingPlans = pricingPlansResponse?.content || [];
  const pricingPlans = allPricingPlans.filter((plan) => [1, 2, 3, 4].includes(plan.id));
  
  const pagination = pricingPlansResponse?.pagination
    ? {
        currentPage: pricingPlansResponse.pagination.currentPage,
        pageSize: pricingPlansResponse.pagination.pageSize,
        totalPages: pricingPlansResponse.pagination.totalPages,
        totalElements: pricingPlansResponse.pagination.totalElements,
        hasNext: pricingPlansResponse.pagination.hasNext,
        hasPrevious: pricingPlansResponse.pagination.hasPrevious,
      }
    : undefined;

  // Upsert mutation (create or update)
  const { mutate: upsertPricingPlan, isPending: isCreating } =
    useUpsertPricingPlan();

  // Set status mutation
  const { mutate: setPlanStatus } = useSetPlanStatus();

  // Delete mutation
  const { mutate: deletePricingPlan, isPending: isDeleting } =
    useDeletePricingPlan();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [newPlanDialogOpen, setNewPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<IPricingPlan | null>(null);

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Hàm xử lý xem pricing plan
  const handleViewPricingPlan = (id: number) => {
    const plan = pricingPlans?.find((item) => item.id === id);
    if (!plan) {
      toast.error("Không tìm thấy gói dịch vụ để xem");
      return;
    }
    navigate(`./${id}`, { state: { plan } });
  };

  // Hàm xử lý cập nhật pricing plan
  const handleUpdatePricingPlan = (id: number) => {
    const plan = pricingPlans?.find((item) => item.id === id);
    if (!plan) {
      toast.error("Không tìm thấy gói dịch vụ để chỉnh sửa");
      return;
    }
    setEditingPlan(plan);
    setFormDialogOpen(true);
  };

  const handleToggleDialog = (open: boolean) => {
    if (!open) {
      setEditingPlan(null);
    }
    setFormDialogOpen(open);
  };

  // Hàm xử lý xóa pricing plan
  const handleDeletePricingPlan = (id: number) => {
    const plan = pricingPlans?.find((item) => item.id === id);
    if (!plan) {
      toast.error("Không tìm thấy gói dịch vụ để xóa");
      return;
    }

    deletePricingPlan(plan.code, {
      onSuccess: () => {
        toast.success("Đã xóa gói dịch vụ thành công");
      },
      onError: (error: AxiosError<{ message?: string }>) => {
        toast.error(
          error.response?.data?.message || "Có lỗi xảy ra khi xóa gói dịch vụ"
        );
      },
    });
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setNewPlanDialogOpen(true);
  };

  const handleNewPlanSuccess = () => {
    // Refetch plans after successful creation
    // The query will automatically refetch if queryKey changes
  };

  const handleSubmitPlan = (values: PricingPlanFormValues) => {
    // Nếu đang edit, chỉ có thể update status thông qua PATCH endpoint
    if (editingPlan) {
      // Kiểm tra xem status có thay đổi không
      if (editingPlan.status !== values.status) {
        setPlanStatus(
          {
            planCode: editingPlan.code,
            status: values.status,
          },
          {
            onSuccess: () => {
              toast.success("Cập nhật trạng thái gói dịch vụ thành công");
              setFormDialogOpen(false);
              setEditingPlan(null);
            },
            onError: (error: unknown) => {
              const errorMessage =
                (error as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ||
                "Cập nhật trạng thái gói dịch vụ thất bại";
              toast.error(errorMessage);
            },
          }
        );
      } else {
        // Nếu status không thay đổi, chỉ đóng dialog
        toast.info("Không có thay đổi nào để cập nhật");
        setFormDialogOpen(false);
        setEditingPlan(null);
      }
      return;
    }

    // Nếu không phải edit, tạo mới plan
    const requestData = {
      code: values.code.toUpperCase(),
      name: values.name,
      description: values.description,
      listPrice: values.listPrice,
      salePrice: values.salePrice,
      billingCycle: values.billingCycle,
      trialDays: values.trialDays,
      status: values.status,
      features: null,
      isPublic: values.isPublic,
      durationMonths: values.durationMonths,
    };

    upsertPricingPlan(requestData, {
      onSuccess: () => {
        toast.success("Tạo gói dịch vụ thành công");
        setFormDialogOpen(false);
        setEditingPlan(null);
      },
      onError: (error: unknown) => {
        const errorMessage =
          (error as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Tạo gói dịch vụ thất bại";
        toast.error(errorMessage);
      },
    });
  };

  // Hàm xử lý thay đổi trạng thái plan
  const handleTogglePlanStatus = (planCode: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setPlanStatus(
      { planCode, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            `Đã ${
              newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"
            } gói dịch vụ`
          );
        },
        onError: (error: AxiosError<{ message?: string }>) => {
          toast.error(
            error.response?.data?.message ||
              "Có lỗi xảy ra khi thay đổi trạng thái"
          );
        },
      }
    );
  };

  // Show loading or error states if needed
  if (error) {
    console.log("🚀 ~ PricingPlansPage ~ error:", error);
    if (error instanceof AxiosError && error.response?.status === 403) {
      toast.error("Bạn không có quyền truy cập trang này");
    } else {
      toast.error("Có lỗi xảy ra khi tải danh sách gói dịch vụ");
    }
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <SitePageTitle
        title="Bảng giá dịch vụ"
        subTitle="Quản lý tập trung các gói dịch vụ và bảng giá"
        // onCreate={handleCreate}
        hidePrint={true}
        hideImport={true}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p>Đang tải danh sách gói dịch vụ...</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 mt-4">
          <ADPView
            data={pricingPlans || []}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            actions={(row) => (
              <ADPRowActions
                row={row}
                onView={handleViewPricingPlan}
                // onUpdate={handleUpdatePricingPlan}
                // onDelete={handleDeletePricingPlan}
              />
            )}
          />
        </div>
      )}

      {/* Form mới cho tạo gói */}
      <NewPlanFormDialog
        open={newPlanDialogOpen}
        onOpenChange={setNewPlanDialogOpen}
        onSuccess={handleNewPlanSuccess}
      />

      {/* Form cũ cho chỉnh sửa */}
      <PricingPlanFormDialog
        open={formDialogOpen}
        onOpenChange={handleToggleDialog}
        initialData={editingPlan ?? undefined}
        onSubmit={handleSubmitPlan}
        isPending={isCreating}
      />
    </div>
  );
};

export default PricingPlansPage;
