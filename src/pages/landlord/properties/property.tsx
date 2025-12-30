import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useProperties } from "@/hooks/useProperties";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";

const Property = () => {
  const navigate = useNavigate();

  // Query params state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(30);

  // Build query params
  const queryParams = {
    page,
    size,
    sort: "createdAt",
    direction: "DESC" as "ASC" | "DESC",
  };

  const { data: propertiesData, isLoading } = useProperties(queryParams);

  // Extract content and pagination from response
  const properties = propertiesData?.content || [];
  const pagination = propertiesData?.pagination
    ? {
        currentPage: propertiesData.pagination.currentPage,
        pageSize: propertiesData.pagination.pageSize,
        totalPages: propertiesData.pagination.totalPages,
        totalElements: propertiesData.pagination.totalElements,
        hasNext: propertiesData.pagination.hasNext,
        hasPrevious: propertiesData.pagination.hasPrevious,
      }
    : undefined;

  const handleCreate = () => {
    navigate("./tao-moi");
  };

  const handleChild = (id: string) => {
    navigate(`${id}/phong`);
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };
  if (isLoading)
    return (
      <div>
        <LoadingCard />
      </div>
    );
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Địa điểm cho thuê"
          subTitle="Quản lý tập trung các địa điểm cho thuê"
          onCreate={handleCreate}
          hidePrint={true}
          hideImport={true}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ADPView
          data={properties}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          onRowClick={handleChild}
          actions={(row) => (
            <ADLRowActions
              row={row}
              onChild={handleChild}
            />
          )}
        />
      </div>
    </div>
  );
};

export default Property;
