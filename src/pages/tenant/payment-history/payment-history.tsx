import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dbPayments } from "@/lib/dbPayments";
import { formatDate } from "date-fns";
import {
  Calendar,
  Check,
  Clock,
  CreditCard,
  Download,
  Eye,
  X,
} from "lucide-react";
import { useState } from "react";

const TEPaymentHistory = () => {
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredPayments =
    filterStatus === "all"
      ? dbPayments
      : dbPayments.filter((p) => p.status === filterStatus);
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Chờ xác nhận", variant: "secondary", icon: Clock },
      confirmed: { label: "Đã xác nhận", variant: "default", icon: Check },
      rejected: { label: "Đã từ chối", variant: "destructive", icon: X },
      rescheduled: { label: "Đã dời lịch", variant: "outline", icon: Calendar },
      active: { label: "Đang hiệu lực", variant: "default", icon: Check },
      succeeded: { label: "Thành công", variant: "default", icon: Check },
      failed: { label: "Thất bại", variant: "destructive", icon: X },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-2">
        <div className="mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Lịch Sử Thanh Toán
              </h1>
              <p className="text-gray-600">
                Theo dõi các giao dịch thanh toán của bạn
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === "succeeded" ? "default" : "outline"}
                onClick={() => setFilterStatus("succeeded")}
              >
                Thành công
              </Button>
              <Button
                variant={filterStatus === "failed" ? "default" : "outline"}
                onClick={() => setFilterStatus("failed")}
              >
                Thất bại
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredPayments.map((payment) => (
              <Card
                key={payment.payment_id}
                className="hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                          payment.status === "succeeded"
                            ? "bg-gradient-to-br from-green-400 to-emerald-400"
                            : "bg-gradient-to-br from-red-400 to-rose-400"
                        }`}
                      >
                        <CreditCard className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">
                            {payment.invoice.items[0]?.description}
                          </h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Mã GD:</span>{" "}
                            {payment.payment_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Nhà cung cấp:</span>
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-medium">
                              {payment.provider.toUpperCase()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-3xl font-bold ${
                          payment.status === "succeeded"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {payment.amount}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(payment.created_at, "dd/mm/yyyy HH:mm")}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl mb-4">
                    <div className="space-y-2">
                      {payment.invoice.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.description}
                          </span>
                          <span className="font-medium">{item.unit_price}</span>
                        </div>
                      ))}
                      <div className="pt-3 mt-3 border-t-2 border-blue-200 flex justify-between">
                        <span className="font-bold text-lg">Tổng cộng</span>
                        <span className="font-bold text-lg text-blue-600">
                          {payment.invoice.total_amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Hạn thanh toán:{" "}
                        {formatDate(payment.invoice.due_at, "dd/mm/yyyy HH:mm")}
                      </span>
                    </div>
                    {payment.succeeded_at && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium">
                          Đã thanh toán:{" "}
                          {formatDate(payment.succeeded_at, "dd/mm/yyyy HH:mm")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {payment.status === "failed" && (
                      <Button className="flex-1">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Thanh toán lại
                      </Button>
                    )}
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Tải hóa đơn
                    </Button>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TEPaymentHistory;
