import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

// Zod validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login, isLoading, user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log("📝 Login form submitted:", { username: data.username });

      await login(data.username, data.password);

      toast.success("Đăng nhập thành công");

      // Get user from localStorage (set by login function) or from store
      // localStorage is set synchronously in login function, so it's available immediately
      const getUserFromStorage = () => {
        try {
          const userStr = localStorage.getItem("user");
          return userStr ? JSON.parse(userStr) : null;
        } catch {
          return null;
        }
      };

      const currentUser = user || getUserFromStorage();
      
      if (currentUser && currentUser.roles && currentUser.roles.length > 0) {
        const role = currentUser.roles[0].toUpperCase();
        
        // Set flag for showing promotion dialog after login
        if (role === "LANDLORD") {
          sessionStorage.setItem("landlord_just_logged_in", "true");
          console.log("[LoginPage] Set landlord_just_logged_in flag for dialog");
        }
        
        // Redirect based on role
        if (role === "ADMIN") {
          navigate("/admin");
        } else if (role === "LANDLORD") {
          navigate("/landlord");
        } else {
          // Tenant or other roles go to home
          navigate("/");
        }
      } else {
        // Fallback to home if no role found
        navigate("/");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin";

      toast.error(errorMessage);
    }
  };

  const isFormLoading = isSubmitting || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <Card className="border-2 border-border">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl">Đăng nhập</CardTitle>
            <CardDescription>
              Truy cập tài khoản của bạn để tìm phòng trọ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    {...register("username")}
                    className="pl-10"
                    disabled={isFormLoading}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="pl-10 pr-10"
                    disabled={isFormLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isFormLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="w-4 h-4 rounded"
                    disabled={isFormLoading}
                  />
                  <span>Nhớ tôi</span>
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isFormLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isFormLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Chưa có tài khoản? </span>
              <Link
                to="/auth/register"
                className="text-primary hover:underline font-medium"
              >
                Đăng ký ngay
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Bằng cách đăng nhập, bạn đồng ý với các điều khoản dịch vụ</p>
        </div>
      </div>
    </div>
  );
}
