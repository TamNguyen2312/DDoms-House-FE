import type { IGetListingResponse } from "@/services/api/listing.service";
import { formatVietnamMoney } from "@/utils/formatters";
import {
  Bed,
  Building2,
  Calendar,
  DollarSign,
  Hash,
  Home,
  ShowerHead,
  Square,
} from "lucide-react";
interface IPropertyInfoProps {
  property: IGetListingResponse;
}
export default function PropertyInfo({ property }: IPropertyInfoProps) {
  console.log("PropertyInfo", property);
  // const typeLabel =
  //   {
  //     room: "Phòng trọ",
  //     house: "Nhà nguyên căn",
  //     apartment: "Căn hộ",
  //   }[property.type] || "Căn hộ";

  const formattedPrice = formatVietnamMoney(property.listedPrice) + "/ tháng";
  const infoItems = [
    { icon: DollarSign, label: "Giá cho thuê", value: formattedPrice },
    { icon: Square, label: "Diện tích", value: `${property.areaSqM}m²` },
    // { icon: Ruler, label: "Kiểu nhà", value: "Nhà nguyên căn" },
    {
      icon: Building2,
      label: "Dự án/Tòa nhà",
      value: property.property?.name || property.propertyName || "N/A",
    },
    {
      icon: Hash,
      label: "Mã căn/Phòng",
      value: property.unit?.code || "N/A",
    },
    {
      icon: Bed,
      label: "Phòng ngủ",
      value: property.unit?.bedrooms || "N/A",
    },
    {
      icon: ShowerHead,
      label: "Phòng tắm",
      value: property.unit?.bathrooms || "N/A",
    },
    {
      icon: Home,
      label: "Địa chỉ",
      value: property.addressLine + ", " + property.ward + ", " + property.city,
    },
    {
      icon: Calendar,
      label: "Đăng tin",
      value: new Date(property.createdAt).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-card p-6 rounded-lg border">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            <item.icon className="w-5 h-5 text-primary mt-1" />

            <div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div
                className={`font-semibold ${
                  item.icon == DollarSign && "text-green-600"
                }`}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
