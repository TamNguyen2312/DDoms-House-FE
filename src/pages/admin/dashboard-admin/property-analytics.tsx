import { motion } from "framer-motion";
import {
  Building2,
  Home,
  CheckCircle,
  Clock,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  Wrench,
} from "lucide-react";
import type { PropertyAnalyticsResponse as PropertyData } from "@/services/api/admin-analytics.service";

interface PropertyAnalyticsProps {
  property: PropertyData;
}

const PropertyAnalytics = ({ property }: PropertyAnalyticsProps) => {
  const unitStats = [
    {
      label: "Tổng phòng",
      value: property.totalUnits,
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Phòng trống",
      value: property.availableUnits,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Đang thuê",
      value: property.occupiedUnits,
      icon: Home,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Bảo trì",
      value: property.maintenanceUnits,
      icon: Wrench,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const listingStats = [
    {
      label: "Chờ duyệt",
      value: property.listingsPending,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Đã duyệt",
      value: property.listingsApproved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Từ chối",
      value: property.listingsRejected,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: "Đã rút",
      value: property.listingsWithdrawn,
      icon: ArrowDownRight,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <motion.div className="glass-card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Building2 className="h-5 w-5 text-[#FB6E00]" />
        <h2 className="text-lg font-semibold text-gray-900">
          Thống Kê Bất Động Sản & Phòng
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Property Summary */}
        <div className="col-span-12 lg:col-span-3">
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {property.totalProperties}
            </p>
            <p className="text-sm text-gray-600">Tổng bất động sản</p>
            <p className="text-xs text-gray-500 mt-1">
              +{property.propertiesCreatedInRange} mới trong kỳ
            </p>
          </div>
        </div>

        {/* Unit Stats */}
        <div className="col-span-12 lg:col-span-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Trạng thái phòng
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {unitStats.map((stat, index) => (
              <div
                key={index}
                className={`p-3 ${stat.bgColor} rounded-lg flex items-center space-x-3`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listing Stats */}
        <div className="col-span-12 lg:col-span-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Trạng thái tin đăng
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {listingStats.map((stat, index) => (
              <div
                key={index}
                className={`p-3 ${stat.bgColor} rounded-lg flex items-center space-x-3`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Move In/Out */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Hoạt động dọn vào/ra
        </h3>
        <div className="flex gap-6">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <ArrowUpRight className="h-6 w-6 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                {property.moveInOut.moveIn}
              </p>
              <p className="text-xs text-gray-600">Dọn vào</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
            <ArrowDownRight className="h-6 w-6 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">
                {property.moveInOut.moveOut}
              </p>
              <p className="text-xs text-gray-600">Dọn ra</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyAnalytics;
