// src/components/auth/ProtectedRoute.tsx

// import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/store"; // bật lại khi dùng thật
import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/common/loading-spinner";

interface ProtectedRouteProps {
  allowedRoles?: Array<"admin" | "landlord" | "tenant">;
  redirectTo?: string;
}

export function ProtectedRoute({
  allowedRoles,
  redirectTo = "/auth/login",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  /** =========================================
   * 1. Đang tải -> show loading
   ========================================== */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  /** =========================================
   * 2. Không đăng nhập → redirect login
   ========================================== */
  if (!user) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  /** =========================================
   * 3. Kiểm tra role → user.role có thể là mảng
   ========================================== */
  if (allowedRoles) {
    const role = user.roles[0].toUpperCase(); // role chính của user
    const allowed = allowedRoles.map((r) => r.toUpperCase()); // chuẩn hóa chữ hoa

    const hasPermission = allowed.includes(role);
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  /** =========================================
   * 4. Đủ điều kiện → render page
   ========================================== */
  return <Outlet />;
}
