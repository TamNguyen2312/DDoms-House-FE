import type {
  ILandlordRef,
  IPropertyRef,
  ITenantRef,
} from "@/store/types/common";

export interface IContractUnit {
  id: string;
  code: string;
  property: IPropertyRef;
}

export interface IContract {
  id: string;
  name: string; // 👉 Thêm tên hợp đồng
  start_date: string;
  end_date: string;
  status: string;
  deposit_amount: number;
  monthly_rent: number;
  created_at: string;
  unit: IContractUnit;
  landlord: ILandlordRef;
  tenant: ITenantRef;
}
export const dbContracts: IContract[] = [
  {
    id: "ct1",
    name: "Hợp đồng thuê căn hộ A-102", // 👉 Thêm
    start_date: "2024-08-01",
    end_date: "2025-07-31",
    status: "active",
    deposit_amount: 1400000,
    monthly_rent: 7000000,
    created_at: "2024-07-20T10:00:00Z",
    unit: {
      id: "u2",
      code: "A-102",
      property: {
        name: "Chung cư Golden Star",
        address: "123 Nguyễn Văn Linh, Q7",
      },
    },
    landlord: {
      id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      display_name: "Nguyễn Văn Hùng",
      phone: "+84912345678",
    },
    tenant: {
      id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
      full_name: "Trần Minh Anh",
      phone: "+84923456789",
    },
  },
  {
    id: "ct2",
    name: "Hợp đồng thuê phòng P-01", // 👉 Thêm
    start_date: "2024-09-01",
    end_date: "2025-08-31",
    status: "active",
    deposit_amount: 700000,
    monthly_rent: 3500000,
    created_at: "2024-08-25T11:30:00Z",
    unit: {
      id: "u5",
      code: "P-01",
      property: {
        name: "Nhà trọ An Phú",
        address: "789 Lê Văn Việt, Q9",
      },
    },
    landlord: {
      id: "d4e5f6a7-b8c9-0123-def1-234567890123",
      display_name: "Lê Thị Mai",
      phone: "+84934567890",
    },
    tenant: {
      id: "e5f6a7b8-c9d0-1234-ef12-345678901234",
      full_name: "Phạm Quốc Bảo",
      phone: "+84945678901",
    },
  },
];
