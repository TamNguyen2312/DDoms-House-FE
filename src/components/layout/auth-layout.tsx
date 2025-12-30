import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

const AuthLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <div className="mx-auto px-4 py-4 absolute top-0 left-0">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 group overflow-visible text-primary font-bold text-xl hover:bg-transparent hover:text-primary "
          aria-label="Quay về trang chủ"
        >
          <Home className="w-6 h-6" />
          <span className="hidden sm:inline">Ddoms House</span>
        </Button>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
