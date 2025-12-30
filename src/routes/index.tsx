// src/routes/index.tsx
import { ProtectedRoute } from "@/routes/protected-route";
import { PublicRoute } from "@/routes/public-route";
import { createBrowserRouter } from "react-router-dom";

// Layouts
import AuthLayout from "@/components/layout/auth-layout";
import PublicLayout from "@/components/layout/public-layout";

// Public Pages
// import  AboutPage  from "@/pages/public/AboutPage";
import WebSocketDebugPage from "@/pages/debug/websocket-debug";
import ContactPage from "@/pages/public/contact-page";
import HomePage from "@/pages/public/home-page";
import { default as PublicPropertyDetailPage } from "@/pages/public/listing-detail-page";
import SubscriptionPlansPage from "@/pages/public/subscription-plans-page";

// Auth Pages
import ForgotPasswordPage from "@/pages/auth/forgot-password-page";
import LoginPage from "@/pages/auth/login-page";
import RegisterPage from "@/pages/auth/register-page";

// Landlord Pages
// import ContractDetailPage from "@/pages/landlord/contracts/ContractDetailPage";
// import ContractsPage from "@/pages/landlord/contracts/ContractsPage";
// import CreateContractPage from "@/pages/landlord/contracts/CreateContractPage";
import ADInvoice from "@/pages/landlord/invoices/invoice";
import TEInvoice from "@/pages/tenant/invoices/invoice";
import PaymentResult from "@/pages/tenant/payments/payment-result";

// Tenant Pages
// import TenantDashboardPage from "@/pages/tenant/DashboardPage";
// import FavoritesPage from "@/pages/tenant/FavoritesPage";
// import { default as TenantMessagesPage } from "@/pages/tenant/MessagesPage";
// import PaymentHistoryPage from "@/pages/tenant/PaymentHistoryPage";
// import ProfilePage from "@/pages/tenant/ProfilePage";

// Admin Pages
import AppointmentsPage from "@/pages/admin/appointments/appointments";
import CategoriesPage from "@/pages/admin/categories/categories-page";
import ContractsPage from "@/pages/admin/contracts/contracts-page";
import WebhookSimulatePage from "@/pages/admin/payments/webhook-simulate";
import PropertiesPage from "@/pages/admin/properties/properties";
import { default as AdminPropertyDetailPage } from "@/pages/admin/properties/property-detail-page";
import RentedUnitsPage from "@/pages/admin/rented-units/rented-units";
import ReportDetailPage from "@/pages/admin/reports/report-detail-page";
import ReportsPage from "@/pages/admin/reports/reports";
import SubscriptionDetailPage from "@/pages/admin/subscriptions/subscription-detail";
import SubscriptionsPage from "@/pages/admin/subscriptions/subscriptions";
import UnitsPage from "@/pages/admin/units/units";
import UsersPage from "@/pages/admin/users/users";
import LandlordProfilePage from "@/pages/landlord/profile/landlord-profile";
import LandlordRentedUnitsPage from "@/pages/landlord/rented-units/rented-units";
import LandlordSubscriptionsPage from "@/pages/landlord/subscriptions/subscriptions";
import TenantProfilePage from "@/pages/tenant/profile/tenant-profile";
import TenantRentedUnitsPage from "@/pages/tenant/rented-units/rented-units";
import TenantUnitDetailPage from "@/pages/tenant/rented-units/unit-detail";

// Error Pages
import AdminLayout from "@/components/layout/admin-layout";
import LandlordLayout from "@/components/layout/landlord-layout";
import { default as TentantLayout } from "@/components/layout/tentant-layout";
import { SidebarProvider } from "@/components/ui/sidebar";
import ADUpdateListing from "@/pages/admin/listings/form/update-listing";
import ListingsPage from "@/pages/admin/listings/listings-page";
import ExportPaymentsPage from "@/pages/admin/payments/export-payments";
import PaymentsPage from "@/pages/admin/payments/payments";
import PricingPlanDetailPage from "@/pages/admin/pricing-plans/pricing-plan-detail";
import PricingPlansPage from "@/pages/admin/pricing-plans/pricing-plans";
// Temporarily disabled
// import FeaturesPage from "@/pages/admin/subscription-features/features-page";
// import VersionsPage from "@/pages/admin/subscription-versions/versions-page";
// import SubscriptionCatalogPage from "@/pages/admin/subscription-catalog/subscription-catalog";
import AdminAnalyticsDashboard from "@/pages/admin/dashboard-admin";
import MonthlyStatisticsPage from "@/pages/admin/invoice-statistics/monthly-statistics-page";
import RepairRequestsPage from "@/pages/admin/repair-requests/repair-requests";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import ServerErrorPage from "@/pages/errors/ServerErrorPage";
import UnauthorizedPage from "@/pages/errors/UnauthorizedPage";
import ADAppointment from "@/pages/landlord/appointments/appointment";
import ADContract from "@/pages/landlord/contracts/contract";
import ContractDetail from "@/pages/landlord/contracts/contract-detail";
import CreateContract from "@/pages/landlord/contracts/form/create-contract";
import UpdateContract from "@/pages/landlord/contracts/form/update-contract";
import LandlordAnalyticsDashboard from "@/pages/landlord/dashboard-landlord";
import ExpiryTrackingPage from "@/pages/landlord/expiry-tracking/expiry-tracking";
import CreateListing from "@/pages/landlord/listing/form/create-listing";
import UpdateListing from "@/pages/landlord/listing/form/update-listing";
import ADListing from "@/pages/landlord/listing/listing";
import LandlordMessagesPage from "@/pages/landlord/messages/MessagesPage";
import CreateProperty from "@/pages/landlord/properties/form/create-property";
import UpdateProperty from "@/pages/landlord/properties/form/update-property";
import Property from "@/pages/landlord/properties/property";
import LDRental from "@/pages/landlord/rental/rental";
import LDRepairRequests from "@/pages/landlord/repair-requests/repair-requests";
import CreateUnit from "@/pages/landlord/units/form/create-unit";
import UpdateUnit from "@/pages/landlord/units/form/update-unit";
import LLUnit from "@/pages/landlord/units/unit";
import UnitDetail from "@/pages/landlord/units/unit-detail";
import SearchPage from "@/pages/public/search";
import Appointment from "@/pages/tenant/appointment/appointment";
import TEContract from "@/pages/tenant/contracts/contract";
import TenantContractDetail from "@/pages/tenant/contracts/contract-detail";
import TenantAnalyticsDashboard from "@/pages/tenant/dashboard-tenant";
import Favourite from "@/pages/tenant/favourite/favourite";
import Message from "@/pages/tenant/messages/message";
import {
  default as PaymentHistory,
  default as TEPaymentHistory,
} from "@/pages/tenant/payment-history/payment-history";
import TERentalRequests from "@/pages/tenant/rental-requests/rental-requests";
import TERepairRequests from "@/pages/tenant/repair-requests/repair-requests";
// Định nghĩa danh sách các loại phòng
const PROPERTY_TYPES = [
  "phong-tro",
  "nha-nguyen-can",
  "can-ho",
  "chung-cu-mini",
  "phong-o-ghep",
  "ky-tuc-xa",
  "can-ho-dich-vu",
  "mat-bang",
] as const;

// Tạo routes tự động cho các loại phòng
const propertyTypeRoutes = PROPERTY_TYPES.map((type) => ({
  path: type,
  element: <HomePage />,
}));
export const router = createBrowserRouter([
  // ============================================
  // PUBLIC ROUTES
  // ============================================
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      // Spread các property type routes
      ...propertyTypeRoutes,
      {
        path: "phong/:id",
        element: <PublicPropertyDetailPage />,
      },
      {
        path: "bang-gia-dich-vu",
        element: <SubscriptionPlansPage />,
      },
      {
        path: "tim-kiem",
        element: <SearchPage />,
      },
      {
        path: "lien-he",
        element: <ContactPage />,
      },
      {
        path: "123",
        element: <AdminAnalyticsDashboard />,
      },
      {
        path: "debug/websocket",
        element: <WebSocketDebugPage />,
      },
    ],
  },

  // ============================================
  // AUTH ROUTES (Only for non-authenticated users)
  // ============================================
  {
    path: "/auth",
    // element: <PublicRoute restrictedForAuthenticated={true} />,
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "register",
            element: <RegisterPage />,
          },
          {
            path: "forgot-password",
            element: <ForgotPasswordPage />,
          },
        ],
      },
    ],
  },

  // ============================================
  // LANDLORD ROUTES (Protected)
  // ============================================
  {
    path: "/landlord",
    element: (
      <SidebarProvider>
        <ProtectedRoute allowedRoles={["landlord"]} />
      </SidebarProvider>
    ),
    children: [
      {
        element: <LandlordLayout />,
        children: [
          // {
          //   index: true,
          //   element: <LandlordOverview />,
          // },LandlordAnalyticsDashboard
          // {
          //   index: true,
          //   element: <LandlordDashboard />,
          // },
          {
            index: true,
            element: <LandlordAnalyticsDashboard />,
          },
          // Listing
          {
            path: "quan-ly-bai-dang",
            element: <ADListing />,
          },
          {
            path: "quan-ly-bai-dang/tao-moi",
            element: <CreateListing />,
          },
          {
            path: "quan-ly-bai-dang/:id/cap-nhat",
            element: <UpdateListing />,
          },
          // Contract
          {
            path: "quan-ly-hop-dong",
            element: <ADContract />,
          },
          {
            path: "quan-ly-hop-dong/:id",
            element: <ContractDetail />,
          },
          {
            path: "theo-doi-den-han",
            element: <ExpiryTrackingPage />,
          },
          {
            path: "quan-ly-hop-dong/tao-moi",
            element: <CreateContract />,
          },
          {
            path: "quan-ly-hop-dong/:id/cap-nhat",
            element: <UpdateContract />,
          },
          // Properties
          {
            path: "dia-diem-cho-thue",
            element: <Property />,
          },
          {
            path: "dia-diem-cho-thue/tao-moi",
            element: <CreateProperty />,
          },
          {
            path: "dia-diem-cho-thue/:id/phong/tao-moi",
            element: <CreateUnit />,
          },
          {
            path: "dia-diem-cho-thue/:id/cap-nhat",
            element: <UpdateProperty />,
          },
          {
            path: "dia-diem-cho-thue/:id/phong",
            element: <LLUnit />,
          },
          // unit
          {
            path: "dia-diem-cho-thue/:id/phong/:unitid",
            element: <UnitDetail />,
          },
          {
            path: "dia-diem-cho-thue/:id/phong/:unitid/cap-nhat",
            element: <UpdateUnit />,
          },
          // Rented Units
          {
            path: "phong-da-cho-thue",
            element: <LandlordRentedUnitsPage />,
          },
          {
            path: "tai-khoan",
            element: <LandlordProfilePage />,
          },
          // Subscriptions
          {
            path: "goi-dich-vu",
            element: <LandlordSubscriptionsPage />,
          },
          // Appointments
          {
            path: "quan-ly-cuoc-hen",
            // element: <AppointmentsPage />,
            element: <ADAppointment />,
          },
          // Invoices
          {
            path: "quan-ly-hoa-don",
            element: <ADInvoice />,
          },
          {
            path: "lich-hen",
            element: <ADInvoice />,
          },
          // Rental Requests
          {
            path: "yeu-cau-thue",
            element: <LDRental />,
          },
          // Repair Requests
          {
            path: "yeu-cau-sua-chua",
            element: <LDRepairRequests />,
          },
          {
            path: "lich-su-thanh-toan",
            element: <PaymentHistory />,
          },
          // {
          //   path: "yeu-thich",
          //   element: <Favourite />,
          // },
          {
            path: "hop-dong",
            element: <Favourite />,
          },
          {
            path: "tin-nhan",
            element: <LandlordMessagesPage />,
          },
          {
            path: "tai-khoan",
            element: <LandlordProfilePage />,
          },
          {
            path: "bang-gia-dich-vu",
            element: <SubscriptionPlansPage />,
          },
        ],
      },
    ],
  },

  // ============================================
  // TENANT ROUTES (Protected)
  // ============================================
  {
    path: "/tenant",
    // element: <ProtectedRoute allowedRoles={["tenant"]} />,
    element: <ProtectedRoute />,
    children: [
      {
        element: <TentantLayout />,
        children: [
          // {
          //   element: <DashboardTenant />,
          // },
          // {
          //   index: true,
          //   element: <TenantDashboard />,
          // },
          {
            index: true,
            element: <TenantAnalyticsDashboard />,
          },
          {
            path: "phong-da-thue",
            element: <TenantRentedUnitsPage />,
          },
          {
            path: "phong-da-thue/:unitId",
            element: <TenantUnitDetailPage />,
          },
          {
            path: "lich-hen",
            element: <Appointment />,
          },

          {
            path: "lich-su-thanh-toan",
            element: <TEPaymentHistory />,
          },
          // {
          //   path: "yeu-thich",
          //   element: <Favourite />,
          // },
          {
            path: "hop-dong",
            element: <TEContract />,
          },
          {
            path: "hop-dong/:id",
            element: <TenantContractDetail />,
          },
          {
            path: "quan-ly-hoa-don",
            element: <TEInvoice />,
          },
          // Rental Requests
          {
            path: "yeu-cau-thue",
            element: <TERentalRequests />,
          },
          // Repair Requests
          {
            path: "yeu-cau-sua-chua",
            element: <TERepairRequests />,
          },
          {
            path: "payments/result/success",
            element: <PaymentResult />,
          },
          {
            path: "payments/result/cancel",
            element: <PaymentResult />,
          },
          {
            path: "tin-nhan",
            element: <Message />,
          },
          {
            path: "tai-khoan",
            element: <TenantProfilePage />,
          },
        ],
      },
    ],
  },

  // ============================================
  // ADMIN ROUTES (Protected)
  // ============================================
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    // element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminAnalyticsDashboard />,
          },
          // Users
          {
            // path: "users",
            path: "quan-ly-tai-khoan",
            element: <UsersPage />,
          },
          // Listing
          {
            path: "bai-dang",
            element: <ListingsPage />,
          },
          {
            path: "bai-dang/:id/cap-nhat",
            element: <ADUpdateListing />,
          },
          // Appointments
          {
            path: "lich-hen",
            element: <AppointmentsPage />,
          },
          // Payments
          {
            path: "payments/webhook/simulate",
            element: <WebhookSimulatePage />,
          },
          // Contracts
          {
            path: "hop-dong",
            element: <ContractsPage />,
          },
          // Repair Requests
          {
            path: "yeu-cau-sua-chua",
            element: <RepairRequestsPage />,
          },
          // Properties
          {
            path: "dia-diem-cho-thue",
            element: <PropertiesPage />,
          },
          {
            path: "properties/:id",
            element: <AdminPropertyDetailPage />,
          },
          // Units
          {
            path: "phong-cho-thue",
            element: <UnitsPage />,
          },
          {
            path: "lich-su-thanh-toan",
            element: <PaymentsPage />,
          },
          {
            path: "xuat-hoa-don",
            element: <ExportPaymentsPage />,
          },
          {
            path: "bang-gia-dich-vu",
            element: <PricingPlansPage />,
          },
          {
            path: "bang-gia-dich-vu/:id",
            element: <PricingPlanDetailPage />,
          },
          // Reports
          {
            path: "reports",
            element: <ReportsPage />,
          },
          {
            path: "reports/:id",
            element: <ReportDetailPage />,
          },
          // Categories
          {
            path: "categories",
            element: <CategoriesPage />,
          },
          // Subscriptions
          {
            path: "quan-ly-dang-ky",
            element: <SubscriptionsPage />,
          },
          {
            path: "quan-ly-dang-ky/:id",
            element: <SubscriptionDetailPage />,
          },
          // Rented Units
          {
            path: "phong-da-cho-thue",
            element: <RentedUnitsPage />,
          },
          // Monthly Invoice Statistics
          {
            path: "xuat-thanh-toan",
            element: <MonthlyStatisticsPage />,
          },
        ],
      },
    ],
  },

  // ============================================
  // ERROR ROUTES
  // ============================================
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    path: "/server-error",
    element: <ServerErrorPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
