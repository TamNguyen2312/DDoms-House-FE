import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/store";
import { amenityToUtilityCode } from "@/utils/constants";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FilterDialog, { type FilterState } from "./filter-dialog";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const logoutMutation = useLogout();
  const toast = useToast();

  // Handle keyword search
  const handleKeywordSearch = () => {
    if (keyword.trim()) {
      const params = new URLSearchParams();
      params.set("keyword", keyword.trim());
      params.set("page", "1");
      navigate(`/tim-kiem?${params.toString()}`);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleKeywordSearch();
    }
  };

  const handleSearch = (filters: FilterState) => {
    const params = new URLSearchParams();

    // --- City (đã được map từ codename sang name trong filter-dialog) ---
    if (filters.provinceCode) {
      params.set("city", filters.provinceCode);
    }

    // --- Ward ---
    if (filters.ward) {
      params.set("ward", filters.ward);
    }

    // --- Price Range ---
    if (filters.minPrice != null) {
      params.set("minPrice", filters.minPrice.toString());
    }
    if (filters.maxPrice != null) {
      params.set("maxPrice", filters.maxPrice.toString());
    }

    // --- Bedrooms ---
    if (filters.bedrooms != null) {
      params.set("bedrooms", filters.bedrooms.toString());
    }

    // --- Utility Codes (từ amenities slugs) ---
    if (filters.amenities?.length) {
      const utilityCodes = filters.amenities
        .map((slug) => amenityToUtilityCode[slug])
        .filter((code): code is string => code !== undefined && code !== null);

      if (utilityCodes.length > 0) {
        params.set("utilityCodes", utilityCodes.join(","));
      }
    }

    // --- Furnishing Categories ---
    if (filters.furnishingCategories?.length) {
      filters.furnishingCategories.forEach((category) => {
        params.append("furnishingCategories", category);
      });
    }

    // --- Pagination (mặc định) ---
    params.set("page", "0");
    params.set("size", "10");
    params.set("sort", "createdAt");
    params.set("direction", "DESC");

    // Convert to query string
    const query = params.toString();

    // Navigate to search page
    navigate(`/tim-kiem?${query}`);

    return query;
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      logout(); // Clear Zustand state
      toast.success("Đăng xuất thành công");
      navigate("/");
    } catch {
      // Even if API fails, clear local state
      logout();
      toast.success("Đã đăng xuất");
      navigate("/");
    }
  };
  const roleRouteMap: Record<string, string> = {
    ADMIN: "/admin",
    TENANT: "/tenant",
    LANDLORD: "/landlord",
  };

  const role = user?.roles[0]?.toUpperCase() || "GUEST";
  const path = roleRouteMap[role] || "/";
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-4">
          <Link
            to="/"
            className="flex items-center gap-1 sm:gap-2 font-bold text-lg sm:text-xl text-primary flex-shrink-0"
          >
            <img
              src="/images/logo.jpg"
              alt="BARS Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
            <span className="hidden sm:inline">BARS</span>
          </Link>

          <div className="flex items-center flex-1 max-w-md space-x-1 sm:space-x-2">
            <div className="relative w-full">
              <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none z-10" />
              <Input
                type="text"
                placeholder="Tìm từ khóa..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 h-8 sm:h-10 text-xs sm:text-sm"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  aria-label="Xóa tìm kiếm"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            {/* Button bộ lọc */}
            <Button
              onClick={() => setIsFilterOpen(true)}
              className="h-8 sm:h-10 text-xs sm:text-sm px-2 sm:px-4"
            >
              <span className="hidden sm:inline">Bộ lọc</span>
              <span className="sm:hidden">Lọc</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-1 sm:gap-2 h-8 sm:h-10 px-2 sm:px-4"
                  >
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="max-w-[80px] sm:max-w-[150px] truncate text-xs sm:text-sm">
                      {user.email || user.name || "Tài khoản"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] sm:w-56">
                  <DropdownMenuLabel className="px-2 sm:px-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-xs sm:text-sm font-medium leading-none break-words">
                        {user.name || "Người dùng"}
                      </p>
                      <p className="text-[10px] sm:text-xs leading-none text-muted-foreground break-all">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {role !== "ADMIN" ? (
                    <>
                      <DropdownMenuItem asChild className="px-2 sm:px-2">
                        <Link
                          to={path + "/tai-khoan"}
                          className="cursor-pointer flex items-center"
                        >
                          <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Hồ sơ</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="px-2 sm:px-2">
                        <Link
                          to={path}
                          className="cursor-pointer flex items-center"
                        >
                          <LayoutDashboard className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Quản lý</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild className="px-2 sm:px-2">
                      <Link
                        to={path}
                        className="cursor-pointer flex items-center"
                      >
                        <LayoutDashboard className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">Quản lý</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {role === "LANDLORD" && (
                    <>
                      <DropdownMenuItem asChild className="px-2 sm:px-2">
                        <Link
                          to={path + "/goi-dich-vu"}
                          className="cursor-pointer flex items-center"
                        >
                          <Package className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">
                            Gói dịch vụ
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive px-2 sm:px-2"
                  >
                    <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/auth/login" className="hidden sm:block">
                  <Button
                    variant="outline"
                    className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4"
                  >
                    Đăng Nhập
                  </Button>
                </Link>
                {/* <Button>Đăng Tin</Button> */}
              </>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden h-8 w-8 sm:h-10 sm:w-10"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background p-3 sm:p-4">
            <nav className="flex flex-col gap-3 sm:gap-4">
              {/* {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))} */}
              <Link
                to="/bang-gia-dich-vu"
                className="text-sm sm:text-base text-foreground hover:text-primary transition-colors"
              >
                Bảng giá dịch vụ
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium break-words">
                        {user.name || "Người dùng"}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">
                        {user.email}
                      </p>
                    </div>
                    <Link to={path + "/tai-khoan"} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start text-xs sm:text-sm"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Hồ sơ
                      </Button>
                    </Link>
                    {role === "LANDLORD" && (
                      <>
                        <Link to={path} className="w-full">
                          <Button
                            variant="outline"
                            className="w-full justify-start text-xs sm:text-sm"
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Quản lý
                          </Button>
                        </Link>
                        <Link to={path + "/goi-dich-vu"} className="w-full">
                          <Button
                            variant="outline"
                            className="w-full justify-start text-xs sm:text-sm"
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Gói dịch vụ
                          </Button>
                        </Link>
                      </>
                    )}
                    <Button
                      variant="outline"
                      className="w-full justify-start text-xs sm:text-sm text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng Xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/login" className="w-full">
                      <Button
                        variant="outline"
                        className="w-full text-xs sm:text-sm"
                      >
                        Đăng Nhập
                      </Button>
                    </Link>
                    <Button className="w-full text-xs sm:text-sm">
                      Đăng Tin
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      {/* UI bộ lọc */}
      <FilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        searchTerm=""
        onSearch={handleSearch}
      />
    </>
  );
}
