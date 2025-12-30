import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { IAdminUser } from "./api-types";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";
import { UserProfileDialog } from "./user-profile-dialog";

const UsersPage = () => {
  const navigate = useNavigate();

  // Filters state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users - Always sort by createdAt DESC (newest first)
  const {
    data: usersResponse,
    isLoading,
    error,
  } = useAdminUsers({
    page,
    size,
    sort: "createdAt",
    direction: "DESC", // Mặc định sort mới nhất trước
    ...(roleFilter && { role: roleFilter }),
    ...(debouncedSearchTerm && { searchTerm: debouncedSearchTerm }),
  });

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  // Handle view user
  const handleViewUser = (user: IAdminUser) => {
    setSelectedUserId(user.id);
    setIsProfileDialogOpen(true);
  };

  // Handle update user
  const handleUpdateUser = (id: number) => {
    navigate(`./${id}/update`);
  };

  // Handle delete user
  const handleDeleteUser = (id: number) => {
    // TODO: Implement delete user
    console.log("Delete user:", id);
  };

  // Handle pagination change
  const handlePaginationChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setSize(newSize);
  };

  // Handle role filter change
  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setPage(0); // Reset to first page when filter changes
  };

  const users = usersResponse?.data?.content || [];
  const pagination = usersResponse?.data?.pagination
    ? {
        currentPage: usersResponse.data.pagination.currentPage,
        pageSize: usersResponse.data.pagination.pageSize,
        totalPages: usersResponse.data.pagination.totalPages,
        totalElements: usersResponse.data.pagination.totalElements,
        hasNext: usersResponse.data.pagination.hasNext,
        hasPrevious: usersResponse.data.pagination.hasPrevious,
      }
    : undefined;

  if (isLoading) {
    return (
      <LoadingCard Icon={Loader2} title="Đang tải danh sách người dùng..." />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">
            Có lỗi xảy ra khi tải danh sách người dùng
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "Lỗi không xác định"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Quản lý tài khoản"
          subTitle="Quản lý tập trung các người dùng trong hệ thống"
          hidePrint={true}
          hideImport={true}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ADPView
          data={users}
          actions={(row) => (
            <ADLRowActions
              row={row}
              onView={handleViewUser}
              // onUpdate={handleUpdateUser}
              // onDelete={handleDeleteUser}
            />
          )}
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
        />
      </div>

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={(open) => {
          setIsProfileDialogOpen(open);
          if (!open) {
            setSelectedUserId(null);
          }
        }}
        userId={selectedUserId}
      />
    </div>
  );
};

export default UsersPage;
