import LoadingCard from "@/components/common/loading-card";
// import SitePageTitle from "@/components/site/site-page-title";
import { Button } from "@/components/ui/button";
import { useProperty } from "@/hooks/useProperties";
import { useUnits } from "@/hooks/useUnit";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";

const LLUnit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Query params state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(30);

  // Build query params
  const queryParams = {
    page,
    size,
  };

  // Hooks
  const { data: unitsData, isLoading: isLoadingUnits } = useUnits(
    id || "",
    queryParams
  );
  const { data: property, isLoading: isLoadingProperty } = useProperty(
    id || ""
  );

  // Extract content and pagination from response
  const units = unitsData?.content || [];
  const pagination = unitsData?.pagination
    ? {
        currentPage: unitsData.pagination.currentPage,
        pageSize: unitsData.pagination.pageSize,
        totalPages: unitsData.pagination.totalPages,
        totalElements: unitsData.pagination.totalElements,
        hasNext: unitsData.pagination.hasNext,
        hasPrevious: unitsData.pagination.hasPrevious,
      }
    : undefined;
  // Hàm xử lý xem dự án
  const handleViewUnit = (unitId: number | undefined) => {
    if (!unitId || !id) return;
    navigate(`/landlord/dia-diem-cho-thue/${id}/phong/${unitId}`);
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Hàm xử lý cập nhật dự án
  // const handleUpdateUnit = (id: number) => {
  //   navigate(`./${id}/cap-nhat`);
  // };

  // Hàm xử lý xóa dự án
  // const handleDeleteUnit = (id: number) => {
  //   // toast.promise(deleteP({ id: projectId }), {
  //   //   loading: "Đang xóa dự án...",
  //   //   success: (data: IProjectDetails) => {
  //   //     setUnits(units.filter((p) => p.id !== projectId));
  //   //     return `Đã xóa dự án "${data?.name}" thành công`;
  //   //   },
  //   //   error: (err: Error) => err.message ?? "Xóa dự án thất bại",
  //   // });
  // };
  const handleCreate = () => {
    navigate("./tao-moi");
  };
  if (isLoadingUnits || isLoadingProperty)
    return (
      <div>
        <LoadingCard />
      </div>
    );

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="mx-auto w-full h-full flex flex-col">
        <div className="shrink-0 border-b border-dashed pb-2 md:mb-3 md:pb-3 lg:mb-4 lg:pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                className="hover:bg-transparent dark:hover:bg-transparent hover:text-muted-foreground cursor-pointer"
                variant="ghost"
                size="icon"
                onClick={() => navigate("/landlord/dia-diem-cho-thue")}
              >
                <ArrowLeft size={20} />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Mục phòng con | {property?.data.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Quản lý tập trung các phòng con
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCreate}>
              Tạo mới
            </Button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ADPView
            data={units}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onRowClick={handleViewUnit}
            actions={(row) => (
              <ADLRowActions
                row={row}
                onView={handleViewUnit}
                // onUpdate={handleUpdateUnit}
                // onDelete={handleDeleteUnit}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default LLUnit;
