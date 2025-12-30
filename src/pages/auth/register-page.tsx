import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

// Zod validation schema
const registerSchema = z
  .object({
    // fullName: z
    //   .string()
    //   .min(1, "Họ và tên là bắt buộc")
    //   .min(2, "Họ và tên phải có ít nhất 2 ký tự"),
    email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
    phone: z
      .string()
      .min(1, "Số điện thoại là bắt buộc")
      .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
    password: z
      .string()
      .min(1, "Mật khẩu là bắt buộc")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu là bắt buộc"),
    roleCode: z.enum(["TENANT", "LANDLORD"], {
      required_error: "Vui lòng chọn loại tài khoản",
    }),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "Bạn phải đồng ý với điều khoản dịch vụ",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      // fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      roleCode: undefined,
      agreeTerms: false,
    },
  });

  const roleCode = watch("roleCode");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log("register", data);
      await registerUser({
        email: data.email,
        password: data.password,
        // name: data.fullName,
        phone: data.phone,
        roleCode: data.roleCode,
      });

      toast.success("Đăng ký thành công");
      navigate("/");
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
          : "Đăng ký thất bại. Vui lòng thử lại";

      toast.error(errorMessage);
    }
  };

  const isFormLoading = isSubmitting || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Signup Card */}
        <Card className="border-2 border-border">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl">Tạo tài khoản</CardTitle>
            <CardDescription>Đăng ký để tìm phòng trọ phù hợp</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Full Name */}
              {/* <div className="space-y-2">
                <label className="text-sm font-medium">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    {...register("fullName")}
                    className="pl-10"
                    disabled={isFormLoading}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div> */}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    {...register("email")}
                    className="pl-10"
                    disabled={isFormLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="0912345678"
                    {...register("phone")}
                    className="pl-10"
                    disabled={isFormLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Role Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Loại tài khoản</label>
                <Select
                  value={roleCode}
                  onValueChange={(value: "TENANT" | "LANDLORD") =>
                    setValue("roleCode", value)
                  }
                  disabled={isFormLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại tài khoản" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TENANT">Người thuê</SelectItem>
                    <SelectItem value="LANDLORD">Chủ nhà</SelectItem>
                  </SelectContent>
                </Select>
                {errors.roleCode && (
                  <p className="text-sm text-destructive">
                    {errors.roleCode.message}
                  </p>
                )}
              </div>

              {/* Password */}
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className="pl-10 pr-10"
                    disabled={isFormLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isFormLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    {...register("agreeTerms")}
                    className="w-5 h-5 rounded mt-0.5"
                    disabled={isFormLoading}
                  />
                  <span className="text-sm text-muted-foreground">
                    Tôi đồng ý với{" "}
                    <Link to="#" className="text-primary hover:underline">
                      điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link to="#" className="text-primary hover:underline">
                      chính sách bảo mật
                    </Link>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-sm text-destructive">
                    {errors.agreeTerms.message}
                  </p>
                )}
              </div>

              {/* Signup Button */}
              <Button
                type="submit"
                disabled={isFormLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
              >
                {isFormLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Đã có tài khoản? </span>
              <Link
                to="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Thông tin của bạn được bảo vệ và không bao giờ được chia sẻ</p>
        </div>
      </div>
    </div>
  );
}
