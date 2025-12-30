import type { RepairRequestStatistics } from "@/types/repair-request.types";
import { motion } from "framer-motion";
import {
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface RepairRequestAnalyticsProps {
  repairRequestStats?: RepairRequestStatistics;
}

const RepairRequestAnalytics = ({
  repairRequestStats,
}: RepairRequestAnalyticsProps) => {
  if (!repairRequestStats) {
    return null;
  }

  const statusStats = [
    {
      label: "Chờ xử lý",
      value: repairRequestStats.pendingRequests,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      label: "Đang xử lý",
      value: repairRequestStats.inProgressRequests,
      icon: AlertCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Hoàn thành",
      value: repairRequestStats.doneRequests,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Đã hủy",
      value: repairRequestStats.cancelledRequests,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const formatTime = (hours: number) => {
    if (hours === 0) return "N/A";
    if (hours < 24) {
      return `${hours.toFixed(1)} giờ`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days} ngày`;
    }
    return `${days} ngày ${remainingHours.toFixed(1)} giờ`;
  };

  return (
    <motion.div className="glass-card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Wrench className="h-5 w-5 text-[#FB6E00]" />
        <h2 className="text-lg font-semibold text-gray-900">
          Thống Kê Yêu Cầu Sửa Chữa
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Total Summary */}
        <div className="col-span-12 lg:col-span-3">
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <Wrench className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {repairRequestStats.totalRequests}
            </p>
            <p className="text-sm text-gray-600">Tổng yêu cầu</p>
            {repairRequestStats.mostCommonIssue && (
              <p className="text-xs text-gray-500 mt-1">
                Vấn đề phổ biến: {repairRequestStats.mostCommonIssue}
              </p>
            )}
          </div>
        </div>

        {/* Status Stats */}
        <div className="col-span-12 lg:col-span-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Trạng thái yêu cầu
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {statusStats.map((stat, index) => (
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

        {/* Performance Stats */}
        <div className="col-span-12 lg:col-span-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Hiệu suất xử lý
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-cyan-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-cyan-600" />
                  <p className="text-sm text-gray-600">Thời gian xử lý TB</p>
                </div>
                <p className="text-lg font-bold text-cyan-600">
                  {formatTime(repairRequestStats.averageResolutionTimeHours)}
                </p>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                  <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
                </div>
                <p className="text-lg font-bold text-indigo-600">
                  {repairRequestStats.totalRequests > 0
                    ? (
                        (repairRequestStats.doneRequests /
                          repairRequestStats.totalRequests) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RepairRequestAnalytics;

