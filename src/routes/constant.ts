// src/routes/routes.constants.ts

export const ROUTES = {
  // Public Routes
  HOME: "/",
  PROPERTIES: "/properties",
  PROPERTY_DETAIL: (id: string) => `/properties/${id}`,
  SEARCH: "/search",
  ABOUT: "/about",
  CONTACT: "/contact",

  // Auth Routes
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",

  // Landlord Routes
  LANDLORD: {
    DASHBOARD: "/landlord",
    PROPERTIES: "/landlord/properties",
    CREATE_PROPERTY: "/landlord/properties/create",
    PROPERTY_DETAIL: (id: string) => `/landlord/properties/${id}`,
    EDIT_PROPERTY: (id: string) => `/landlord/properties/${id}/edit`,
    CONTRACTS: "/landlord/contracts",
    CREATE_CONTRACT: "/landlord/contracts/create",
    CONTRACT_DETAIL: (id: string) => `/landlord/contracts/${id}`,
    INVOICES: "/landlord/invoices",
    CREATE_INVOICE: "/landlord/invoices/create",
    INVOICE_DETAIL: (id: string) => `/landlord/invoices/${id}`,
    TENANTS: "/landlord/tenants",
    TENANT_DETAIL: (id: string) => `/landlord/tenants/${id}`,
    STATISTICS: "/landlord/statistics",
    MESSAGES: "/landlord/messages",
    SETTINGS: "/landlord/settings",
  },

  // Tenant Routes
  TENANT: {
    DASHBOARD: "/tenant",
    CONTRACT: "/tenant/contract",
    CONTRACT_DETAIL: (id: string) => `/tenant/contract/${id}`,
    INVOICES: "/tenant/invoices",
    PAYMENT_HISTORY: "/tenant/payment-history",
    FAVORITES: "/tenant/favorites",
    MESSAGES: "/tenant/messages",
    PROFILE: "/tenant/profile",
  },

  // Admin Routes
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    PROPERTIES: "/admin/properties",
    PROPERTY_DETAIL: (id: string) => `/admin/properties/${id}`,
    REPORTS: "/admin/reports",
    REPORT_DETAIL: (id: string) => `/admin/reports/${id}`,
    CATEGORIES: "/admin/categories",
    STATISTICS: "/admin/statistics",
  },

  // Error Routes
  UNAUTHORIZED: "/unauthorized",
  SERVER_ERROR: "/server-error",
  NOT_FOUND: "/404",
} as const;

// Route titles for breadcrumbs
export const ROUTE_TITLES: Record<string, string> = {
  // Public
  "/": "Trang chủ",
  "/properties": "Danh sách phòng",
  "/search": "Tìm kiếm",
  "/about": "Giới thiệu",
  "/contact": "Liên hệ",

  // Auth
  "/auth/login": "Đăng nhập",
  "/auth/register": "Đăng ký",
  "/auth/forgot-password": "Quên mật khẩu",

  // Landlord
  "/landlord": "Tổng quan",
  "/landlord/properties": "Quản lý phòng",
  "/landlord/properties/create": "Đăng tin mới",
  "/landlord/contracts": "Quản lý hợp đồng",
  "/landlord/contracts/create": "Tạo hợp đồng",
  "/landlord/invoices": "Quản lý hóa đơn",
  "/landlord/invoices/create": "Tạo thanh toán",
  "/landlord/tenants": "Người thuê",
  "/landlord/statistics": "Thống kê",
  "/landlord/messages": "Tin nhắn",
  "/landlord/settings": "Cài đặt",

  // Tenant
  "/tenant": "Tổng quan",
  "/tenant/contract": "Hợp đồng của tôi",
  "/tenant/invoices": "Hóa đơn",
  "/tenant/payment-history": "Lịch sử thanh toán",
  "/tenant/favorites": "Yêu thích",
  "/tenant/messages": "Tin nhắn",
  "/tenant/profile": "Hồ sơ",

  // Admin
  "/admin": "Quản trị",
  "/admin/users": "Quản lý người dùng",
  "/admin/properties": "Duyệt bài đăng",
  "/admin/reports": "Báo cáo vi phạm",
  "/admin/categories": "Danh mục",
  "/admin/statistics": "Thống kê hệ thống",

  // Errors
  "/unauthorized": "Không có quyền truy cập",
  "/server-error": "Lỗi máy chủ",
  "/404": "Không tìm thấy trang",
};

// Get default route based on user role
export function getDefaultRouteByRole(
  role: "admin" | "landlord" | "tenant"
): string {
  switch (role) {
    case "admin":
      return ROUTES.ADMIN.DASHBOARD;
    case "landlord":
      return ROUTES.LANDLORD.DASHBOARD;
    case "tenant":
      return ROUTES.TENANT.DASHBOARD;
    default:
      return ROUTES.HOME;
  }
}
