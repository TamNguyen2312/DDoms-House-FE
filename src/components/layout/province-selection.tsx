import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

// Mapping từ value sang tên city có dấu (BE nhận dấu tiếng Việt)
const provinceCityMap: Record<string, string> = {
  "ho-chi-minh": "Thành phố Hồ Chí Minh",
  hanoi: "Hà Nội",
  "da-nang": "Thành phố Đà Nẵng",
  "can-tho": "Thành phố Cần Thơ",
  "hai-phong": "Thành phố Hải Phòng",
  hue: "Thành phố Huế",
};

// Reverse mapping: từ city name có dấu về value
const cityToValueMap: Record<string, string> = Object.entries(provinceCityMap).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {} as Record<string, string>
);

export default function ProvinceSelection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityParam = searchParams.get("city");

  // Xác định selectedProvince từ URL params
  const getSelectedProvinceFromUrl = (): string => {
    if (!cityParam) return "all";
    return cityToValueMap[cityParam] || "all";
  };

  const [selectedProvince, setSelectedProvince] = useState(() =>
    getSelectedProvinceFromUrl()
  );

  // Sync selectedProvince với URL params
  useEffect(() => {
    setSelectedProvince(getSelectedProvinceFromUrl());
  }, [cityParam]);

  const provinces = [
    { value: "all", label: "Tất Cả Tỉnh Thành", count: 1250 },
    { value: "ho-chi-minh", label: "TP. Hồ Chí Minh", count: 450 },
    { value: "hanoi", label: "TP. Hà Nội", count: 380 },
    { value: "da-nang", label: "TP. Đà Nẵng", count: 120 },
    { value: "can-tho", label: "TP. Cần Thơ", count: 85 },
    { value: "hai-phong", label: "TP. Hải Phòng", count: 75 },
    { value: "hue", label: "TP.Huế", count: 75 },
  ];

  const handleProvinceClick = (value: string) => {
    setSelectedProvince(value);

    if (value === "all") {
      // Nếu chọn "Tất cả", xóa city param và reset về page 1
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("city");
      newParams.set("page", "1");
      setSearchParams(newParams);
    } else {
      // Lấy tên city có dấu từ mapping
      const cityName = provinceCityMap[value];
      if (cityName) {
        // Update URL params với city parameter và reset về page 1
        const newParams = new URLSearchParams(searchParams);
        newParams.set("city", cityName);
        newParams.set("page", "1");
        setSearchParams(newParams);
      }
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-2xl font-bold mb-4">Chọn Tỉnh Thành</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {provinces.map((province) => (
          <button
            key={province.value}
            onClick={() => handleProvinceClick(province.value)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProvince === province.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold text-sm">{province.label}</div>
            {/* <div className="text-xs text-muted-foreground mt-1">
              {province.count} bất động sản
            </div> */}
          </button>
        ))}
      </div>
    </div>
  );
}
