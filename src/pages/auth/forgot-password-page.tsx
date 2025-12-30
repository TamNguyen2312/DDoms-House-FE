import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
// import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Kiểm tra hộp thư của bạn để đặt lại mật khẩu");
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Forgot Password Card */}
        <Card className="border-2 border-border">
          <CardHeader className="space-y-2 text-center">
            {!isSubmitted ? (
              <>
                <CardTitle className="text-3xl">Quên mật khẩu?</CardTitle>
                <CardDescription>
                  Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu
                </CardDescription>
              </>
            ) : (
              <>
                <div className="flex justify-center mb-2">
                  <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-3xl">Kiểm tra email</CardTitle>
                <CardDescription>
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Địa chỉ email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Chúng tôi sẽ gửi liên kết để đặt lại mật khẩu
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? "Đang gửi..." : "Gửi hướng dẫn"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Một email đã được gửi đến{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Vui lòng nhấp vào liên kết trong email để đặt lại mật khẩu của
                  bạn. Liên kết sẽ hết hạn sau 24 giờ.
                </p>
                <div className="bg-secondary p-3 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    Không thấy email? Kiểm tra thư mục spam hoặc{" "}
                    <button
                      onClick={handleReset}
                      className="text-primary hover:underline font-medium"
                    >
                      thử email khác
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Back to Login */}
            <div className="mt-6">
              <Link
                to="/auth/login"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Cần giúp đỡ? Liên hệ với bộ phận hỗ trợ của chúng tôi</p>
        </div>
      </div>
    </div>
  );
}
