import { Check, Crown, Shield, Star, X, Zap } from "lucide-react";
import { useState } from "react";

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      code: "BASE",
      name: "Miễn Phí",
      icon: Shield,
      color: "gray",
      price: 0,
      duration: 0,
      description: "Dành cho chủ trọ mới bắt đầu",
      features: [
        { name: "Đăng tối đa 3 tin", included: true, value: "3 tin" },
        { name: "Upload 5 ảnh/tin", included: true, value: "5 ảnh" },
        { name: "Hiển thị trên trang tìm kiếm", included: true },
        { name: "Nhận yêu cầu thuê từ khách", included: true },
        { name: "Tin nổi bật", included: false },
        { name: "Phân tích chi tiết", included: false },
        { name: "Quản lý nhiều dãy trọ", included: false },
        { name: "Hỗ trợ ưu tiên", included: false },
      ],
    },
    {
      code: "PLAN_3M",
      name: "Gói Cơ Bản",
      icon: Star,
      color: "blue",
      price: {
        monthly: 99000,
        quarterly: 249000,
        biannual: 449000,
        yearly: 799000,
      },
      duration: 3,
      description: "Phù hợp cho chủ trọ có 1-2 dãy",
      popular: false,
      features: [
        { name: "Đăng tối đa 15 tin", included: true, value: "15 tin" },
        { name: "Upload 12 ảnh/tin", included: true, value: "12 ảnh" },
        { name: "Hiển thị trên trang tìm kiếm", included: true },
        { name: "Nhận yêu cầu thuê từ khách", included: true },
        { name: "2 tin nổi bật đồng thời", included: true, value: "2 slot" },
        { name: "Phân tích cơ bản", included: true },
        { name: "Quản lý nhiều dãy trọ", included: true },
        { name: "Hỗ trợ ưu tiên", included: false },
      ],
    },
    {
      code: "PLAN_6M",
      name: "Gói Chuyên Nghiệp",
      icon: Zap,
      color: "purple",
      price: {
        monthly: 199000,
        quarterly: 499000,
        biannual: 899000,
        yearly: 1599000,
      },
      duration: 6,
      description: "Dành cho chủ trọ kinh doanh",
      popular: true,
      features: [
        { name: "Đăng không giới hạn tin", included: true, value: "Unlimited" },
        { name: "Upload 20 ảnh/tin", included: true, value: "20 ảnh" },
        { name: "Hiển thị trên trang tìm kiếm", included: true },
        { name: "Nhận yêu cầu thuê từ khách", included: true },
        { name: "5 tin nổi bật đồng thời", included: true, value: "5 slot" },
        { name: "Phân tích chi tiết + xuất báo cáo", included: true },
        { name: "Quản lý nhiều dãy trọ", included: true },
        {
          name: "Thêm 2 thành viên quản lý",
          included: true,
          value: "2 members",
        },
      ],
    },
    {
      code: "PLAN_12M",
      name: "Gói Doanh Nghiệp",
      icon: Crown,
      color: "amber",
      price: {
        monthly: 349000,
        quarterly: 899000,
        biannual: 1699000,
        yearly: 2999000,
      },
      duration: 12,
      description: "Giải pháp toàn diện cho doanh nghiệp",
      popular: false,
      features: [
        { name: "Đăng không giới hạn tin", included: true, value: "Unlimited" },
        {
          name: "Upload không giới hạn ảnh",
          included: true,
          value: "Unlimited",
        },
        { name: "Ưu tiên hiển thị cao nhất", included: true },
        { name: "Nhận yêu cầu thuê từ khách", included: true },
        { name: "10 tin nổi bật đồng thời", included: true, value: "10 slot" },
        { name: "Phân tích nâng cao + AI insights", included: true },
        { name: "Quản lý không giới hạn dãy trọ", included: true },
        {
          name: "Thêm 5 thành viên quản lý",
          included: true,
          value: "5 members",
        },
        { name: "Hỗ trợ ưu tiên 24/7", included: true },
        { name: "Account Manager riêng", included: true },
      ],
    },
  ];

  const billingOptions = [
    { value: "monthly", label: "Hàng tháng", discount: 0 },
    { value: "quarterly", label: "3 tháng", discount: 15 },
    { value: "biannual", label: "6 tháng", discount: 25 },
    { value: "yearly", label: "12 tháng", discount: 35 },
  ];

  const getPrice = (plan) => {
    if (plan.price === 0) return "0đ";
    const price =
      typeof plan.price === "object" ? plan.price[billingCycle] : plan.price;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const colorStyles = {
    gray: "from-gray-50 to-gray-100 border-gray-200",
    blue: "from-blue-50 to-blue-100 border-blue-200",
    purple:
      "from-purple-50 to-purple-100 border-purple-300 shadow-lg shadow-purple-200/50",
    amber: "from-amber-50 to-amber-100 border-amber-200",
  };

  const iconColorStyles = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
  };

  const buttonStyles = {
    gray: "bg-gray-600 hover:bg-gray-700 text-white",
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
    amber: "bg-amber-600 hover:bg-amber-700 text-white",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Bảng Giá Dịch Vụ
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Chọn gói phù hợp với quy mô quản lý trọ của bạn
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mt-8">
            <div className="inline-flex bg-slate-100 rounded-lg p-1">
              {billingOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setBillingCycle(option.value)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all relative ${
                    billingCycle === option.value
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {option.label}
                  {option.discount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      -{option.discount}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.code}
                className={`relative bg-gradient-to-br ${
                  colorStyles[plan.color]
                } border-2 rounded-2xl p-6 transition-all hover:scale-105 ${
                  plan.popular ? "ring-2 ring-purple-400 ring-offset-2" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Phổ biến nhất
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={`inline-flex p-3 rounded-full ${
                      iconColorStyles[plan.color]
                    } mb-4`}
                  >
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">
                      {getPrice(plan)}
                    </span>
                    {plan.price !== 0 && (
                      <span className="text-slate-600">
                        /
                        {
                          billingOptions.find((o) => o.value === billingCycle)
                            ?.label
                        }
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {feature.name}
                        {feature.value && (
                          <span className="font-semibold ml-1">
                            ({feature.value})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    buttonStyles[plan.color]
                  }`}
                >
                  {plan.price === 0 ? "Bắt đầu ngay" : "Chọn gói này"}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Câu hỏi thường gặp
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Tôi có thể nâng cấp gói bất cứ lúc nào không?
              </h3>
              <p className="text-slate-600 text-sm">
                Có, bạn có thể nâng cấp gói bất cứ lúc nào. Số tiền chênh lệch
                sẽ được tính theo tỷ lệ thời gian còn lại.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Tin nổi bật là gì?
              </h3>
              <p className="text-slate-600 text-sm">
                Tin nổi bật sẽ được hiển thị ở vị trí ưu tiên trên trang tìm
                kiếm, giúp tăng tỷ lệ xem và thuê phòng.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Tôi có thể hủy gói đã đăng ký không?
              </h3>
              <p className="text-slate-600 text-sm">
                Có, bạn có thể hủy bất cứ lúc nào. Gói sẽ vẫn hoạt động đến hết
                thời hạn đã thanh toán.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">
                Có hỗ trợ thanh toán qua ngân hàng không?
              </h3>
              <p className="text-slate-600 text-sm">
                Có, chúng tôi hỗ trợ thanh toán qua MoMo, ZaloPay, VNPay, và
                chuyển khoản ngân hàng.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
