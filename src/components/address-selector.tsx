// import {
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useEffect, useState } from "react";
// import { useFormContext, useWatch, type Control } from "react-hook-form"; // Thêm useFormContext để lấy setValue

// interface Province {
//   name: string;
//   code: number;
//   division_type: string;
//   codename: string;
//   phone_code: number;
//   wards?: Ward[];
// }

// interface Ward {
//   name: string;
//   code: number;
//   division_type: string;
//   codename: string;
//   province_code: number;
// }

// interface AddressSelectorProps {
//   control: Control<any>;
// }

// export default function AddressSelector({ control }: AddressSelectorProps) {
//   const { setValue } = useFormContext(); // Lấy setValue từ context (giả sử bạn wrap form với FormProvider)
//   const city = useWatch({ control, name: "city" });
//   const ward = useWatch({ control, name: "ward" });
//   const [provinces, setProvinces] = useState<Province[]>([]);
//   const [wards, setWards] = useState<Ward[]>([]);

//   useEffect(() => {
//     fetch("https://provinces.open-api.vn/api/v2/p/")
//       .then((res) => res.json())
//       .then((data) => setProvinces(data as Province[]));
//   }, []);

//   useEffect(() => {
//     if (city) {
//       const selectedProvince = provinces.find((p) => p.name === city);
//       if (selectedProvince?.code) {
//         fetch(
//           `https://provinces.open-api.vn/api/v2/p/${selectedProvince.code}?depth=2`
//         )
//           .then((res) => res.json())
//           .then((data) => {
//             setWards((data as Province).wards || []);
//           })
//           .catch((error) => {
//             console.error("Error fetching wards:", error);
//             setWards([]);
//           });
//       } else {
//         setWards([]);
//       }
//     } else {
//       setWards([]);
//     }
//   }, [city, provinces]);

//   // NEW: useEffect để force set ward sau khi wards load (handle init value)
//   useEffect(() => {
//     if (wards.length > 0 && ward && !wards.some((w) => w.name === ward)) {
//       // Nếu ward init không match (do fetch muộn), clear tạm để tránh invalid
//       console.log("Clearing invalid ward:", ward);
//       setValue("ward", "", { shouldValidate: false });
//     } else if (wards.length > 0 && ward && wards.some((w) => w.name === ward)) {
//       // Nếu match, force set lại để trigger Select update (dù hiếm cần)
//       console.log("Re-setting valid ward:", ward);
//       setValue("ward", ward, { shouldValidate: false });
//     }
//   }, [wards, ward, setValue]);

//   const getWardPlaceholder = () => {
//     if (!city) return "Chọn tỉnh/thành phố trước";
//     if (!wards.length) return "Đang tải xã/phường...";
//     return "Chọn xã/phường";
//   };

//   return (
//     <div className="flex gap-4">
//       {/* City Select - Giữ nguyên */}
//       <FormField
//         control={control}
//         name="city"
//         render={({ field }) => (
//           <FormItem className="flex-1">
//             <FormLabel>
//               Tỉnh/Thành phố <span className="text-red-500">*</span>
//             </FormLabel>
//             <Select onValueChange={field.onChange} value={field.value}>
//               <FormControl>
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Chọn tỉnh/thành phố" />{" "}
//                   {/* Giữ SelectValue cho city vì không async dependent */}
//                 </SelectTrigger>
//               </FormControl>
//               <SelectContent>
//                 {provinces.map((province) => (
//                   <SelectItem key={province.code} value={province.name}>
//                     {province.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//       {/* Ward Select - Manual display + disabled logic */}
//       <FormField
//         control={control}
//         name="ward"
//         render={({ field }) => (
//           <FormItem className="flex-1">
//             <FormLabel>
//               Xã/Phường <span className="text-red-500">*</span>
//             </FormLabel>
//             <Select
//               onValueChange={field.onChange}
//               value={field.value}
//               disabled={!wards.length || !city}
//             >
//               <FormControl>
//                 <SelectTrigger className="w-full">
//                   {/* Manual render để force display init value */}
//                   <span className="flex items-center justify-between">
//                     <span className="truncate flex-1">
//                       {field.value || getWardPlaceholder()}
//                     </span>
//                   </span>
//                 </SelectTrigger>
//               </FormControl>
//               <SelectContent>
//                 {wards.map((wardItem) => (
//                   <SelectItem key={wardItem.code} value={wardItem.name}>
//                     {wardItem.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <FormMessage />
//           </FormItem>
//         )}
//       />
//     </div>
//   );
// }
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useProvinceDetail, useProvinces } from "@/hooks/useProvinces";
import type { PropertyCreate } from "@/schemas";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

export default function AddressSelector() {
  const { control, setValue, watch } = useFormContext<PropertyCreate>();
  const city = watch("city");
  const ward = watch("ward");

  const [citySearchQuery, setCitySearchQuery] = useState<string>("");
  const [wardSearchQuery, setWardSearchQuery] = useState<string>("");

  // Debounce search queries to reduce lag
  const debouncedCitySearch = useDebounce(citySearchQuery, 300);
  const debouncedWardSearch = useDebounce(wardSearchQuery, 300);

  // Use provinces hook
  const { provinces } = useProvinces();

  // Find selected province by name
  const selectedProvince = provinces.find((p) => p.name === city);

  // Use province detail hook to get wards
  const { wards, isLoading: isLoadingWards } = useProvinceDetail({
    provinceCode: selectedProvince?.code ?? null,
    enabled: !!city && !!selectedProvince?.code,
  });

  // Reset ward if current ward is not in the new list
  useEffect(() => {
    if (ward && wards.length > 0 && !wards.some((w) => w.name === ward)) {
      setValue("ward", "", { shouldValidate: false });
    }
  }, [ward, wards, setValue]);

  // Filter provinces based on debounced search query using useMemo
  const filteredProvinces = useMemo(() => {
    if (!debouncedCitySearch.trim()) {
      return provinces;
    }
    const query = debouncedCitySearch.toLowerCase();
    return provinces.filter((province) =>
      province.name.toLowerCase().includes(query)
    );
  }, [provinces, debouncedCitySearch]);

  // Filter wards based on debounced search query using useMemo
  const filteredWards = useMemo(() => {
    if (!debouncedWardSearch.trim()) {
      return wards;
    }
    const query = debouncedWardSearch.toLowerCase();
    return wards.filter((ward) => ward.name.toLowerCase().includes(query));
  }, [wards, debouncedWardSearch]);

  const getWardPlaceholder = () => {
    if (!city) return "Chọn tỉnh/thành phố trước";
    if (isLoadingWards) return "Đang tải xã/phường...";
    if (!wards.length) return "Không có dữ liệu xã/phường";
    return "Chọn xã/phường";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* City Select */}
      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Reset ward khi đổi city
                setValue("ward", "", { shouldValidate: false });
                setCitySearchQuery(""); // Clear search when selecting
                setWardSearchQuery(""); // Clear ward search when city changes
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px]">
                {/* Search Input */}
                <div
                  className="p-2 border-b sticky top-0 bg-background z-10"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Input
                    placeholder="Tìm kiếm tỉnh thành..."
                    value={citySearchQuery}
                    onChange={(e) => {
                      e.stopPropagation();
                      setCitySearchQuery(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="h-8"
                  />
                </div>
                {filteredProvinces.length > 0 ? (
                  filteredProvinces.map((province) => (
                    <SelectItem key={province.code} value={province.name}>
                      {province.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                    Không tìm thấy tỉnh thành
                  </div>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Ward Select */}
      <FormField
        control={control}
        name="ward"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Xã/Phường <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                setWardSearchQuery(""); // Clear search when selecting
              }}
              value={field.value}
              disabled={!city || isLoadingWards || !wards.length}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={getWardPlaceholder()} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px]">
                {/* Search Input */}
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
                    disabled={!city || isLoadingWards || !wards.length}
                  />
                </div>
                {isLoadingWards ? (
                  <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                    Đang tải...
                  </div>
                ) : filteredWards.length > 0 ? (
                  filteredWards.map((wardItem) => (
                    <SelectItem key={wardItem.code} value={wardItem.name}>
                      {wardItem.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-6 text-sm text-center text-muted-foreground">
                    {!city
                      ? "Vui lòng chọn tỉnh/thành phố trước"
                      : "Không tìm thấy xã/phường"}
                  </div>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
