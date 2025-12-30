export interface ICategory {
  label: string;
  slug: string;
  value: string;
}
export const dbCategory = [
  { label: "Phòng Trọ", slug: "/phong-tro", value: "phong-tro" },
  { label: "Nhà Nguyên Căn", slug: "/nha-nguyen-can", value: "nha-nguyen-can" },
  { label: "Căn Hộ", slug: "/can-ho", value: "can-ho" },
  { label: "Chung Cư Mini", slug: "/chung-cu-mini", value: "chung-cu-mini" },
  { label: "Phòng Ở Ghép", slug: "/phong-o-ghep", value: "phong-o-ghep" },
  { label: "Ký Túc Xá", slug: "/ky-tuc-xa", value: "ky-tuc-xa" },
  { label: "Căn Hộ Dịch Vụ", slug: "/can-ho-dich-vu", value: "can-ho-dich-vu" },
];
