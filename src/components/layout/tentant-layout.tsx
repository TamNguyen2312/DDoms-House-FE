// UserLayout.tsx

import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/store";
import type { IChatMessage } from "@/types/chat.types";
import { useQueryClient } from "@tanstack/react-query";
import {
  ClipboardClock,
  FileSignature,
  Handshake,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  ReceiptText,
  User,
  Wrench,
} from "lucide-react";
import { useMemo } from "react";
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
  { id: "overview", title: "Tổng quan", url: "./", icon: LayoutDashboard },
  {
    id: "rented-rooms",
    title: "Phòng đã thuê",
    url: "./phong-da-thue",
    icon: Key,
  },
  {
    id: "appointments",
    title: "Lịch hẹn",
    url: "./lich-hen",
    icon: ClipboardClock,
  },
  {
    id: "rental-requests",
    title: "Yêu Cầu Thuê",
    url: "./yeu-cau-thue",
    icon: Handshake,
  },
  { id: "contracts", title: "Hợp đồng", url: "./hop-dong", icon: ReceiptText },
  {
    id: "invoices",
    title: "Hóa đơn",
    url: "./quan-ly-hoa-don",
    icon: FileSignature,
  },
  {
    id: "repair-requests",
    title: "Yêu Cầu Sửa Chữa",
    url: "./yeu-cau-sua-chua",
    icon: Wrench,
  },
  { id: "messages", title: "Tin Nhắn", url: "./tin-nhan", icon: MessageCircle },
];

// Menu items cá nhân
const userItems = [{ title: "Tài Khoản", url: "./tai-khoan", icon: User }];
export default function TenantLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Fetch rooms data to get unread count
  const { data: roomsData } = useGetRooms({
    page: 0,
    size: 50,
  });

  // Calculate total unread count
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
        location.pathname === "/tenant" || location.pathname === "/tenant/"
      );
    const fullPath = url.startsWith("./") ? `/tenant/${url.slice(2)}` : url;
    return (
      location.pathname === fullPath ||
      location.pathname.startsWith(`${fullPath}/`)
    );
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon">
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
                  {categoryItems.map((item) => {
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

            {/* Cá Nhân */}
            <SidebarGroup>
              <SidebarGroupLabel>Cá Nhân</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userItems.map((item) => (
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
          </SidebarContent>

          {/* Footer */}
          {/* <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="text-destructive hover:text-destructive w-full"
                  >
                    <LogOut />
                    <span>Đăng Xuất</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter> */}
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header with Sidebar Trigger */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
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
    </SidebarProvider>
  );
}
