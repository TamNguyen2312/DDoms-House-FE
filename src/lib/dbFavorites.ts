export interface IFavorite {
  id: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    price: number;
    unit: {
      bedrooms: number;
      area_sq_m: number;
      property: { name: string; district: string };
    };
  };
}

export const dbFavorites: IFavorite[] = [
  {
    id: "fav1",
    created_at: "2024-10-16T11:20:00Z",
    listing: {
      id: "l1",
      title: "Căn hộ 2PN view đẹp Quận 7",
      price: 8500000,
      unit: {
        bedrooms: 2,
        area_sq_m: 65,
        property: { name: "Chung cư Golden Star", district: "Quận 7" },
      },
    },
  },
  {
    id: "fav2",
    created_at: "2024-11-02T09:45:00Z",
    listing: {
      id: "l3",
      title: "Căn hộ cao cấp 3PN Sunrise City",
      price: 12000000,
      unit: {
        bedrooms: 3,
        area_sq_m: 85,
        property: { name: "Căn hộ Sunrise City", district: "Quận 7" },
      },
    },
  },
];
