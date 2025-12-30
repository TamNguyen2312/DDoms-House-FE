import type { PropertyAnalyticsResponse as PropertyData } from "@/services/api/landlord-analytics.service";
import { motion } from "framer-motion";
import { Building2, Home } from "lucide-react";

interface PropertyAnalyticsProps {
  property: PropertyData;
}

const PropertyAnalytics = ({ property }: PropertyAnalyticsProps) => {
  return (
    <motion.div className="glass-card p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Building2 className="h-5 w-5 text-[#FB6E00]" />
        <h2 className="text-lg font-semibold text-gray-900">
          Căn hộ và phòng con
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Tổng số căn hộ
            </span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {property.totalProperties}
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Home className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Tổng số phòng con
            </span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {property.totalUnits}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyAnalytics;
