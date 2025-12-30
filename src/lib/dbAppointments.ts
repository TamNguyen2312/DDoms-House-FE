export type IAppointmentStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "rescheduled";

export interface ITenantInfo {
  name: string;
  phone: string;
  verified: boolean;
}

export interface IUnitInfo {
  code: string;
  property_name: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
}

export interface ILandlordInfo {
  name: string;
  phone: string;
}

export interface IAppointment {
  id: string;
  unit_id: string;
  tenant_id: string;
  landlord_id: string;
  start_time: string;
  status: IAppointmentStatus;
  note?: string;
  created_at: string;

  tenant_info: ITenantInfo;
  unit_info: IUnitInfo;
  landlord_info: ILandlordInfo;

  // Chỉ xuất hiện khi status === "rejected"
  rejection_reason?: string;

  // Chỉ xuất hiện khi status === "rescheduled"
  original_time?: string;
  reschedule_reason?: string;
}
export const dbAppointments: IAppointment[] = [
  {
    id: "850e8400-e29b-41d4-a716-446655440001",
    unit_id: "750e8400-e29b-41d4-a716-446655440001",
    tenant_id: "550e8400-e29b-41d4-a716-446655440001",
    landlord_id: "550e8400-e29b-41d4-a716-446655440010",
    start_time: "2025-11-20T14:00:00Z",
    status: "pending",
    note: "Muốn xem phòng vào chiều thứ 4. Có thể linh động thời gian nếu chủ nhà bận.",
    created_at: "2025-11-15T09:30:00Z",
    tenant_info: {
      name: "Nguyễn Văn An",
      phone: "0901234567",
      verified: true,
    },
    unit_info: {
      code: "A-1205",
      property_name: "Chung cư Sunrise City",
      address: "123 Nguyễn Hữu Thọ, Tân Hưng, Quận 7",
      rent: 12000000,
      bedrooms: 2,
      bathrooms: 2,
      area: 75,
    },
    landlord_info: {
      name: "Chủ nhà Phạm Văn Đức",
      phone: "0912345678",
    },
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440002",
    unit_id: "750e8400-e29b-41d4-a716-446655440002",
    tenant_id: "550e8400-e29b-41d4-a716-446655440002",
    landlord_id: "550e8400-e29b-41d4-a716-446655440010",
    start_time: "2025-11-18T10:00:00Z",
    status: "confirmed",
    note: "Tôi sẽ đến đúng giờ. Cảm ơn!",
    created_at: "2025-11-12T15:20:00Z",
    tenant_info: {
      name: "Trần Thị Bình",
      phone: "0901234568",
      verified: true,
    },
    unit_info: {
      code: "B-0803",
      property_name: "Chung cư Sunrise City",
      address: "123 Nguyễn Hữu Thọ, Tân Hưng, Quận 7",
      rent: 8500000,
      bedrooms: 1,
      bathrooms: 1,
      area: 55,
    },
    landlord_info: {
      name: "Chủ nhà Phạm Văn Đức",
      phone: "0912345678",
    },
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440003",
    unit_id: "750e8400-e29b-41d4-a716-446655440003",
    tenant_id: "550e8400-e29b-41d4-a716-446655440001",
    landlord_id: "550e8400-e29b-41d4-a716-446655440011",
    start_time: "2025-11-16T16:30:00Z",
    status: "rejected",
    note: "Mình muốn xem phòng vào cuối tuần được không ạ?",
    created_at: "2025-11-10T11:00:00Z",
    rejection_reason: "Phòng đã có người đặt cọc. Xin lỗi bạn!",
    tenant_info: {
      name: "Nguyễn Văn An",
      phone: "0901234567",
      verified: true,
    },
    unit_info: {
      code: "P-201",
      property_name: "Nhà trọ Bình Thạnh",
      address: "456 Điện Biên Phủ, Phường 15, Bình Thạnh",
      rent: 3500000,
      bedrooms: 1,
      bathrooms: 1,
      area: 25,
    },
    landlord_info: {
      name: "Chủ nhà Mai Thu Hương",
      phone: "0912345679",
    },
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440004",
    unit_id: "750e8400-e29b-41d4-a716-446655440001",
    tenant_id: "550e8400-e29b-41d4-a716-446655440003",
    landlord_id: "550e8400-e29b-41d4-a716-446655440010",
    start_time: "2025-11-22T09:00:00Z",
    status: "pending",
    note: "Tôi đang tìm căn hộ 2 phòng ngủ cho gia đình. Có thể xem vào sáng thứ 6 không ạ?",
    created_at: "2025-11-14T13:45:00Z",
    tenant_info: {
      name: "Lê Minh Cường",
      phone: "0901234569",
      verified: false,
    },
    unit_info: {
      code: "A-1205",
      property_name: "Chung cư Sunrise City",
      address: "123 Nguyễn Hữu Thọ, Tân Hưng, Quận 7",
      rent: 12000000,
      bedrooms: 2,
      bathrooms: 2,
      area: 75,
    },
    landlord_info: {
      name: "Chủ nhà Phạm Văn Đức",
      phone: "0912345678",
    },
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440005",
    unit_id: "750e8400-e29b-41d4-a716-446655440002",
    tenant_id: "550e8400-e29b-41d4-a716-446655440001",
    landlord_id: "550e8400-e29b-41d4-a716-446655440010",
    start_time: "2025-11-17T15:00:00Z",
    status: "rescheduled",
    note: "Xin lỗi, tôi có việc đột xuất. Có thể dời sang thứ 7 được không?",
    created_at: "2025-11-11T08:20:00Z",
    original_time: "2025-11-17T10:00:00Z",
    reschedule_reason: "Tenant có việc đột xuất",
    tenant_info: {
      name: "Nguyễn Văn An",
      phone: "0901234567",
      verified: true,
    },
    unit_info: {
      code: "B-0803",
      property_name: "Chung cư Sunrise City",
      address: "123 Nguyễn Hữu Thọ, Tân Hưng, Quận 7",
      rent: 8500000,
      bedrooms: 1,
      bathrooms: 1,
      area: 55,
    },
    landlord_info: {
      name: "Chủ nhà Phạm Văn Đức",
      phone: "0912345678",
    },
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440006",
    unit_id: "750e8400-e29b-41d4-a716-446655440003",
    tenant_id: "550e8400-e29b-41d4-a716-446655440002",
    landlord_id: "550e8400-e29b-41d4-a716-446655440011",
    start_time: "2025-11-19T14:00:00Z",
    status: "confirmed",
    note: "Tôi làm việc gần đó, có thể xem phòng vào giờ nghỉ trưa được không ạ?",
    created_at: "2025-11-13T10:15:00Z",
    tenant_info: {
      name: "Trần Thị Bình",
      phone: "0901234568",
      verified: true,
    },
    unit_info: {
      code: "P-201",
      property_name: "Nhà trọ Bình Thạnh",
      address: "456 Điện Biên Phủ, Phường 15, Bình Thạnh",
      rent: 3500000,
      bedrooms: 1,
      bathrooms: 1,
      area: 25,
    },
    landlord_info: {
      name: "Chủ nhà Mai Thu Hương",
      phone: "0912345679",
    },
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440007",
    unit_id: "750e8400-e29b-41d4-a716-446655440005",
    tenant_id: "550e8400-e29b-41d4-a716-446655440003",
    landlord_id: "550e8400-e29b-41d4-a716-446655440011",
    start_time: "2025-11-25T11:00:00Z",
    status: "rejected",
    note: "Tôi quan tâm đến phòng này. Có thể xem không?",
    created_at: "2025-11-14T16:30:00Z",
    rejection_reason:
      "Phòng đang trong quá trình sửa chữa, chưa thể cho xem. Vui lòng quay lại sau 2 tuần.",
    tenant_info: {
      name: "Lê Minh Cường",
      phone: "0901234569",
      verified: false,
    },
    unit_info: {
      code: "P-305",
      property_name: "Nhà trọ Bình Thạnh",
      address: "456 Điện Biên Phủ, Phường 15, Bình Thạnh",
      rent: 4000000,
      bedrooms: 1,
      bathrooms: 1,
      area: 30,
    },
    landlord_info: {
      name: "Chủ nhà Mai Thu Hương",
      phone: "0912345679",
    },
  },
  {
    id: "850e8400-e29b-41d4-a716-446655440008",
    unit_id: "750e8400-e29b-41d4-a716-446655440001",
    tenant_id: "550e8400-e29b-41d4-a716-446655440002",
    landlord_id: "550e8400-e29b-41d4-a716-446655440010",
    start_time: "2025-11-21T16:00:00Z",
    status: "confirmed",
    note: "Mình đang ở xa, muốn xem căn hộ vào cuối tuần. Có thể không ạ?",
    created_at: "2025-11-13T14:00:00Z",
    tenant_info: {
      name: "Trần Thị Bình",
      phone: "0901234568",
      verified: true,
    },
    unit_info: {
      code: "A-1205",
      property_name: "Chung cư Sunrise City",
      address: "123 Nguyễn Hữu Thọ, Tân Hưng, Quận 7",
      rent: 12000000,
      bedrooms: 2,
      bathrooms: 2,
      area: 75,
    },
    landlord_info: {
      name: "Chủ nhà Phạm Văn Đức",
      phone: "0912345678",
    },
  },
];
