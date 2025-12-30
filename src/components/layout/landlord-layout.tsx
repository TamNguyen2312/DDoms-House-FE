// LandlordLayout.tsx
import { SubscriptionPromotionDialog } from "@/components/landlord/subscription-promotion-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { chatKeys, useGetRooms } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useLandlordCurrentSubscription } from "@/hooks/useLandlordSubscription";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/store";
import type { IChatMessage } from "@/types/chat.types";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarClock,
  FileSignature,
  Handshake,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Newspaper,
  Package,
  ReceiptText,
  User,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
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
  { title: "Bảng giá dịch vụ", url: "./bang-gia-dich-vu", icon: Users },
];

const categoryLandlord = [
  { id: "overview", title: "Tổng Quan", icon: LayoutDashboard, url: "" },
  {
    id: "properties",
    title: "Địa điểm cho thuê",
    icon: Building2,
    url: "./dia-diem-cho-thue",
  },
  {
    id: "listing",
    title: "Quản Lý Bài Đăng",
    icon: Newspaper,
    url: "./quan-ly-bai-dang",
  },
  {
    id: "appointments",
    title: "Quản Lý Cuộc Hẹn",
    icon: CalendarClock,
    url: "./quan-ly-cuoc-hen",
  },
  {
    id: "rental-requests",
    title: "Yêu Cầu Thuê",
    icon: Handshake,
    url: "./yeu-cau-thue",
  },

  {
    id: "contracts",
    title: "Quản Lý Hợp Đồng",
    icon: ReceiptText,
    url: "./quan-ly-hop-dong",
  },
  {
    id: "invoices",
    title: "Quản Lý Hóa đơn",
    icon: FileSignature,
    url: "./quan-ly-hoa-don",
  },
  {
    id: "expiry-tracking",
    title: "Theo dõi đến hạn",
    icon: CalendarClock,
    url: "./theo-doi-den-han",
  },
  {
    id: "rented-units",
    title: "Phòng đã cho thuê",
    icon: Key,
    url: "./phong-da-cho-thue",
  },
  {
    id: "repair-requests",
    title: "Yêu Cầu Sửa Chữa",
    icon: Wrench,
    url: "./yeu-cau-sua-chua",
  },
  {
    id: "messages",
    title: "Tin Nhắn",
    icon: MessageCircle,
    url: "./tin-nhan",
  },
];
export default function LandlordLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Check subscription status for promotion popup
  // Note: Subscription data is used in SubscriptionPromotionDialog component
  useLandlordCurrentSubscription(); // Keep hook call for data fetching
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

  // Show promotion dialog when landlord first enters after login
  useEffect(() => {
    // Only check when authenticated
    if (!isAuthenticated) {
      return;
    }

    // Check if landlord just logged in (set in login page)
    const justLoggedIn =
      sessionStorage.getItem("landlord_just_logged_in") === "true";

    // Only show dialog if just logged in (ignore dismissed status for new login)
    if (justLoggedIn) {
      // Reset dismissed status when new login (so dialog shows again)
      if (typeof window !== "undefined") {
        localStorage.removeItem("landlord_subscription_promotion_dismissed");
      }

      // Set dialog immediately first
      setShowPromotionDialog(true);

      // Then clear the login flag after a short delay to prevent re-trigger
      // This ensures dialog is set before flag is cleared
      const timer = setTimeout(() => {
        sessionStorage.removeItem("landlord_just_logged_in");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // Get rooms to calculate unread message count
  const { data: roomsData } = useGetRooms({
    page: 0,
    size: 50,
  });

  // Calculate total unread messages count
  // Exclude unread count when user is on messages page (actively viewing messages)
  const totalUnreadCount = useMemo(() => {
    if (!roomsData?.content) return 0;

    // Check if user is on messages page
    const isOnMessagesPage = location.pathname.includes("/tin-nhan");

    return roomsData.content.reduce((total, room) => {
      // If on messages page, don't count unread messages (user is viewing messages)
      // This ensures badge doesn't show when user is actively in the messages page
      if (isOnMessagesPage) {
        return total; // Don't count any unread when on messages page
      }
      return total + (room.unreadCount || 0);
    }, 0);
  }, [roomsData?.content, location.pathname]);

  // Listen to WebSocket messages to update unread count in real-time
  useChatSocket({
    onPersonalMessage: (message: IChatMessage) => {
      // When receiving a new message, invalidate rooms query to update unread count
      // This ensures the badge updates immediately without polling
      if (message.senderId !== Number(user?.id)) {
        queryClient.invalidateQueries({
          queryKey: chatKeys.rooms(),
          exact: false,
        });
      }
    },
    autoConnect: true,
  });

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất");
    navigate("/");
  };

  // Helper function to check if a path is active
  const isActive = (url: string) => {
    if (!url)
      return (
        location.pathname === "/landlord" || location.pathname === "/landlord/"
      );
    const fullPath = url.startsWith("./") ? `/landlord/${url.slice(2)}` : url;
    return (
      location.pathname === fullPath ||
      location.pathname.startsWith(`${fullPath}/`)
    );
  };
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon" className="z-[60]">
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
            {/* Cho thuê */}
            <SidebarGroup>
              <SidebarGroupLabel>Quản lý cho thuê</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {categoryLandlord.map((item) => {
                    // Show unread badge only for messages tab
                    const showUnreadBadge =
                      item.id === "messages" && totalUnreadCount > 0;

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                        >
                          <Link to={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                            {showUnreadBadge && (
                              <SidebarMenuBadge className="bg-primary text-primary-foreground">
                                {totalUnreadCount > 99
                                  ? "99+"
                                  : totalUnreadCount}
                              </SidebarMenuBadge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarSeparator />
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
          {/* <SidebarFooter>By Ddoms-2025.</SidebarFooter> */}
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header with Sidebar Trigger */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
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
                    <DropdownMenuItem asChild>
                      <Link to="./tai-khoan" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Hồ sơ</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Quản lý</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="./goi-dich-vu" className="cursor-pointer">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Gói dịch vụ</span>
                      </Link>
                    </DropdownMenuItem>
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
          <main className="flex-1 min-h-0 overflow-y-auto">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0 w-full px-2 sm:px-4 pt-2 sm:pt-4 pb-4">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Subscription Promotion Dialog */}
      <SubscriptionPromotionDialog
        open={showPromotionDialog}
        onOpenChange={(open) => {
          console.log("Dialog open state changed:", open);
          setShowPromotionDialog(open);
        }}
      />
    </SidebarProvider>
  );
}
