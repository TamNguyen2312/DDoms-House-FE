import type { ILandlordRef } from "@/store/types/common";

// PROPERTIES
export interface IProperty {
  id: string;
  name: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  documents_verified: boolean;
  created_at: string;
  landlord: ILandlordRef;
}
export const dbProperties = [
  {
    id: "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
    name: "Chung cư Golden Star",
    address_line: "123 Nguyễn Văn Linh",
    ward: "Tân Phú",
    district: "Quận 7",
    city: "TP. Hồ Chí Minh",
    latitude: 10.7326,
    longitude: 106.7192,
    documents_verified: true,
    created_at: "2024-02-25T10:00:00Z",
    landlord: {
      id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      email: "landlord.nguyen@gmail.com",
      phone: "+84912345678",
      display_name: "Nguyễn Văn Hùng",
      verified: true,
    },
  },
  {
    id: "p2b3c4d5-e6f7-8901-bcde-f12345678901",
    name: "Căn hộ Sunrise City",
    address_line: "456 Nguyễn Hữu Thọ",
    ward: "Tân Hưng",
    district: "Quận 7",
    city: "TP. Hồ Chí Minh",
    latitude: 10.7412,
    longitude: 106.7103,
    documents_verified: true,
    created_at: "2024-03-01T09:30:00Z",
    landlord: {
      id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      display_name: "Nguyễn Văn Hùng",
      verified: true,
    },
  },
  {
    id: "p3c4d5e6-f7a8-9012-cdef-123456789012",
    name: "Nhà trọ An Phú",
    address_line: "789 Lê Văn Việt",
    ward: "Hiệp Phú",
    district: "Quận 9",
    city: "TP. Hồ Chí Minh",
    latitude: 10.8506,
    longitude: 106.7826,
    documents_verified: true,
    created_at: "2024-04-10T11:15:00Z",
    landlord: {
      id: "d4e5f6a7-b8c9-0123-def1-234567890123",
      display_name: "Lê Thị Mai",
      verified: true,
    },
  },
];
