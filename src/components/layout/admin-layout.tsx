// AdminLayout.tsx
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/store";
import {
  Building,
  Building2,
  ClipboardClock,
  CreditCard,
  Download,
  Home,
  Key,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  ReceiptText,
  TrendingUp,
  User,
  Users,
  Wrench
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// Menu items danh mục
const categoryItems = [
  { title: "Tổng quan", url: "./", icon: LayoutDashboard },
  { title: "Bài đăng", url: "./bai-dang", icon: Building2 },
  { title: "Quản lý tài khoản", url: "./quan-ly-tai-khoan", icon: Users },
  { title: "Địa điểm cho thuê", url: "./dia-diem-cho-thue", icon: MapPin },
  { title: "Phòng cho thuê", url: "./phong-cho-thue", icon: Home },
  { title: "Lịch hẹn", url: "./lich-hen", icon: ClipboardClock },
  { title: "Hợp đồng", url: "./hop-dong", icon: ReceiptText },
  { title: "Yêu cầu sửa chữa", url: "./yeu-cau-sua-chua", icon: Wrench },
  {
    title: "Lịch sử thanh toán",
    url: "./lich-su-thanh-toan",
    icon: Building,
  },
 
  { title: "Bảng giá dịch vụ", url: "./bang-gia-dich-vu", icon: Users },
  {
    title: "Quản lý đăng ký",
    url: "./quan-ly-dang-ky",
    icon: CreditCard,
  },
  {
    title: "Phòng đã cho thuê",
    url: "./phong-da-cho-thue",
    icon: Key,
  },
  {
    title: "Xuất hóa đơn",
    url: "./xuat-hoa-don",
    icon: Download,
  },
  {
    title: "Xuất thanh toán",
    url: "./xuat-thanh-toan",
    icon: TrendingUp,
  },
];
export default function AdminLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
    navigate("/");
  };

  // Helper function to check if a path is active
  const isActive = (url: string) => {
    if (!url)
      return location.pathname === "/admin" || location.pathname === "/admin/";
    const fullPath = url.startsWith("./")
      ? `/admin/${url.slice(2)}`
      : `/admin/${url}`;
    return (
      location.pathname === fullPath ||
      location.pathname.startsWith(`${fullPath}/`)
    );
  };
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar collapsible="icon" className="z-11">
          {/* Header */}
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-primary font-bold text-2xl hover:bg-transparent hover:text-primary "
                >
                  <Link to={"/"} className="flex items-center gap-2">
                    <img
                      src="/images/logo.jpg"
                      alt="BARS Logo"
                      className="w-8 h-8 object-contain"
                    />
                    <span>BARS</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            {/* Chung */}
            <SidebarGroup>
              <SidebarGroupLabel>Danh Mục</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {categoryItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)}>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />
          </SidebarContent>

          {/* Footer */}
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header with Sidebar Trigger */}
          <header className="shrink-0 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="flex-1" />
              {isAuthenticated && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-[150px] truncate">
                        {user.email || user.name || "Tài khoản"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || "Người dùng"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0 px-2 sm:px-4 pt-2 sm:pt-4 pb-4">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
