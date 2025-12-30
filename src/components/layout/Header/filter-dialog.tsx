import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useDebounce } from "@/hooks/useDebounce";
import { useProvinceDetail, useProvinces } from "@/hooks/useProvinces";
import { formatVietnamMoney } from "@/utils/formatters";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  provinceCode: string;
  ward: string | null;
  bedrooms: number | null;
  amenities: string[];
  furnishingCategories: string[]; // Thêm field mới
}

interface FilterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchTerm: string;
  onSearch: (filters: FilterState, searchTerm: string) => void;
}

// Price range constants
const MIN_PRICE = 0;
const MAX_PRICE = 50000000;
const PRICE_STEP = 100000;

// Furnishing options với labels tiếng Việt
const FURNISHING_OPTIONS = [
  { value: "BED", label: "Giường" },
  { value: "MATTRESS", label: "Nệm" },
  { value: "WARDROBE", label: "Tủ quần áo" },
  { value: "VANITY_TABLE", label: "Bàn trang điểm" },
  { value: "TABLE", label: "Bàn" },
  { value: "CHAIR", label: "Ghế" },
  { value: "DESK", label: "Bàn làm việc" },
  { value: "SOFA", label: "Sofa" },
  { value: "BOOKSHELF", label: "Kệ sách" },
  { value: "FRIDGE", label: "Tủ lạnh" },
  { value: "AIR_CON", label: "Máy lạnh" },
  { value: "FAN", label: "Quạt" },
  { value: "TV", label: "TV" },
  { value: "WIFI", label: "Wifi" },
  { value: "STOVE", label: "Bếp" },
  { value: "WATER_HEATER", label: "Máy nước nóng" },
  { value: "WASHING_MACHINE", label: "Máy giặt" },
];

export default function FilterDialog({
  isOpen,
  onOpenChange,
  searchTerm,
  onSearch,
}: FilterDialogProps) {
  const [filters, setFilters] = useState<FilterState>({
    minPrice: null,
    maxPrice: null,
    provinceCode: "",
    ward: null,
    bedrooms: null,
    amenities: [],
    furnishingCategories: [],
  });

  const [minPriceValue, setMinPriceValue] = useState(MIN_PRICE);
  const [maxPriceValue, setMaxPriceValue] = useState(MAX_PRICE);

  // Separate state for furnishing categories for better management
  const [selectedFurnishings, setSelectedFurnishings] = useState<string[]>([]);

  const [provinceSearchQuery, setProvinceSearchQuery] = useState<string>("");
  const [wardSearchQuery, setWardSearchQuery] = useState<string>("");

  const debouncedProvinceSearch = useDebounce(provinceSearchQuery, 300);
  const debouncedWardSearch = useDebounce(wardSearchQuery, 300);

  const { provinces, isLoadingProvinces } = useProvinces();

  const selectedProvince = provinces.find(
    (p) => p.codename === filters.provinceCode
  );

  const { wards, isLoading: isLoadingWards } = useProvinceDetail({
    provinceCode: selectedProvince?.code ?? null,
    enabled: !!filters.provinceCode && !!selectedProvince?.code,
  });

  useEffect(() => {
    if (!isOpen) {
      setMinPriceValue(MIN_PRICE);
      setMaxPriceValue(MAX_PRICE);
      setProvinceSearchQuery("");
      setWardSearchQuery("");
      setSelectedFurnishings([]);
    } else {
      if (filters.minPrice !== null) {
        setMinPriceValue(filters.minPrice);
      } else {
        setMinPriceValue(MIN_PRICE);
      }
      if (filters.maxPrice !== null) {
        setMaxPriceValue(filters.maxPrice);
      } else {
        setMaxPriceValue(MAX_PRICE);
      }
      // Sync selected furnishings with filters
      setSelectedFurnishings(filters.furnishingCategories);
    }
  }, [
    isOpen,
    filters.minPrice,
    filters.maxPrice,
    filters.furnishingCategories,
  ]);

  const handlePriceChange = (values: number[]) => {
    const [min, max] = values;
    setMinPriceValue(min);
    setMaxPriceValue(max);
    setFilters((prev) => ({
      ...prev,
      minPrice: min !== MIN_PRICE ? min : null,
      maxPrice: max !== MAX_PRICE ? max : null,
    }));
  };

  // Handle furnishing category selection with separate state management
  const toggleFurnishing = (value: string) => {
    setSelectedFurnishings((prev) => {
      const newSelection = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];

      // Update main filters state
      setFilters((prevFilters) => ({
        ...prevFilters,
        furnishingCategories: newSelection,
      }));

      return newSelection;
    });
  };

  // Clear all furnishing selections
  const clearAllFurnishings = () => {
    setSelectedFurnishings([]);
    setFilters((prev) => ({
      ...prev,
      furnishingCategories: [],
    }));
  };

  const handleSearch = () => {
    const selectedProvince = provinces.find(
      (p) => p.codename === filters.provinceCode
    );
    const cityName = selectedProvince?.name || filters.provinceCode;

    const searchFilters: FilterState = {
      ...filters,
      provinceCode: cityName,
      ward: filters.ward || null,
      minPrice: minPriceValue !== MIN_PRICE ? minPriceValue : null,
      maxPrice: maxPriceValue !== MAX_PRICE ? maxPriceValue : null,
    };

    onSearch(searchFilters, searchTerm);
    onOpenChange(false);
  };

  const filteredProvinces = useMemo(() => {
    if (!debouncedProvinceSearch.trim()) {
      return provinces;
    }
    const query = debouncedProvinceSearch.toLowerCase();
    return provinces.filter((province) =>
      province.name.toLowerCase().includes(query)
    );
  }, [provinces, debouncedProvinceSearch]);

  const filteredWards = useMemo(() => {
    if (!debouncedWardSearch.trim()) {
      return wards;
    }
    const query = debouncedWardSearch.toLowerCase();
    return wards.filter((ward) => ward.name.toLowerCase().includes(query));
  }, [wards, debouncedWardSearch]);

  const resetFilters = () => {
    setFilters({
      minPrice: null,
      maxPrice: null,
      provinceCode: "",
      ward: null,
      bedrooms: null,
      amenities: [],
      furnishingCategories: [],
    });
    setMinPriceValue(MIN_PRICE);
    setMaxPriceValue(MAX_PRICE);
    setSelectedFurnishings([]);
    setProvinceSearchQuery("");
    setWardSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-[1600px]">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
          <DialogTitle className="text-lg sm:text-xl">
            Bộ Lọc Tìm Kiếm
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Giá - Range Slider */}
            <div className="lg:col-span-3">
              <h3 className="font-semibold mb-3 text-sm sm:text-base text-foreground">
                Mức Giá
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Từ:</span>
                    <span className="font-medium">
                      {formatVietnamMoney(minPriceValue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Đến:</span>
                    <span className="font-medium">
                      {formatVietnamMoney(maxPriceValue)}
                    </span>
                  </div>
                </div>

                <Slider
                  value={[minPriceValue, maxPriceValue]}
                  onValueChange={handlePriceChange}
                  min={MIN_PRICE}
                  max={MAX_PRICE}
                  step={PRICE_STEP}
                  className="w-full"
                />

                <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                  <span className="truncate">
                    {formatVietnamMoney(MIN_PRICE)}
                  </span>
                  <span className="truncate">
                    {formatVietnamMoney(MAX_PRICE)}
                  </span>
                </div>
              </div>
            </div>

            {/* Khu vực */}
            <div className="md:col-span-1 lg:col-span-2">
              <h3 className="font-semibold mb-3 text-sm sm:text-base text-foreground">
                Khu Vực
              </h3>
              <div className="space-y-3">
                <Select
                  value={filters.provinceCode}
                  onValueChange={(value) => {
                    setFilters((prev) => ({
                      ...prev,
                      provinceCode: value,
                      ward: null,
                    }));
                    setProvinceSearchQuery("");
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <div
                      className="p-2 border-b sticky top-0 bg-background z-10"
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <Input
                        placeholder="Tìm kiếm tỉnh thành..."
                        value={provinceSearchQuery}
                        onChange={(e) => {
                          e.stopPropagation();
                          setProvinceSearchQuery(e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="h-8"
                      />
                    </div>
                    {isLoadingProvinces ? (
                      <SelectItem value="loading" disabled>
                        Đang tải...
                      </SelectItem>
                    ) : filteredProvinces.length > 0 ? (
                      filteredProvinces.map((p) => (
                        <SelectItem key={p.code} value={p.codename}>
                          {p.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                        Không tìm thấy tỉnh thành
                      </div>
                    )}
                  </SelectContent>
                </Select>

                {filters.provinceCode && (
                  <Select
                    value={filters.ward || ""}
                    onValueChange={(value) => {
                      setFilters((prev) => ({ ...prev, ward: value || null }));
                      setWardSearchQuery("");
                    }}
                    disabled={isLoadingWards || !wards.length}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isLoadingWards
                            ? "Đang tải xã/phường..."
                            : !wards.length
                            ? "Không có dữ liệu xã/phường"
                            : "Chọn xã/phường"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <div
                        className="p-2 border-b sticky top-0 bg-background z-10"
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Input
                          placeholder="Tìm kiếm xã/phường..."
                          value={wardSearchQuery}
                          onChange={(e) => {
                            e.stopPropagation();
                            setWardSearchQuery(e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="h-8"
                        />
                      </div>
                      {isLoadingWards ? (
                        <SelectItem value="loading" disabled>
                          Đang tải...
                        </SelectItem>
                      ) : filteredWards.length > 0 ? (
                        filteredWards.map((w) => (
                          <SelectItem key={w.code} value={w.name}>
                            {w.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                          Không tìm thấy xã/phường
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Số phòng ngủ */}
            <div className="md:col-span-1">
              <h3 className="font-semibold mb-3 text-sm sm:text-base text-foreground">
                Số Phòng Ngủ
              </h3>
              <Select
                value={filters.bedrooms?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    bedrooms: value === "all" ? null : parseInt(value, 10),
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn số phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="0">Studio</SelectItem>
                  <SelectItem value="1">1 phòng</SelectItem>
                  <SelectItem value="2">2 phòng</SelectItem>
                  <SelectItem value="3">3 phòng</SelectItem>
                  <SelectItem value="4">4 phòng</SelectItem>
                  <SelectItem value="5">5+ phòng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nội thất */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm sm:text-base text-foreground">
                  Nội Thất
                </h3>
                {selectedFurnishings.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFurnishings}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {FURNISHING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleFurnishing(option.value)}
                    className={`
                      inline-flex items-center
                      px-3 py-2 text-xs sm:text-sm
                      rounded-md border transition-all
                      whitespace-nowrap
                      ${
                        selectedFurnishings.includes(option.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-accent border-input"
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {selectedFurnishings.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Đã chọn: {selectedFurnishings.length} nội thất
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedFurnishings.map((value) => {
                      const option = FURNISHING_OPTIONS.find(
                        (opt) => opt.value === value
                      );
                      return option ? (
                        <span
                          key={value}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                        >
                          {option.label}
                          <button
                            type="button"
                            onClick={() => toggleFurnishing(value)}
                            className="hover:bg-primary/20 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="w-full sm:w-auto"
            >
              Đặt Lại
            </Button>
            <Button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              Tìm Kiếm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
