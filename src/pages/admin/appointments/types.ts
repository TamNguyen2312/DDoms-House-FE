// Types for Admin Appointments API

export interface AdminAppointmentUnit {
  unitId: number;
  unitCode: string;
  propertyId: number;
  propertyName: string;
  addressLine: string;
  ward: string;
  district: string | null;
  city: string;
}

export interface AdminAppointmentUser {
  userId: number;
  displayName: string | null;
  email: string;
  phone: string;
}

export interface AdminAppointmentItem {
  id: number;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "RESCHEDULED";
  startTime: string;
  note: string | null;
  createdAt: string;
  unit: AdminAppointmentUnit;
  landlord: AdminAppointmentUser;
  tenant: AdminAppointmentUser;
}

export interface GetAdminAppointmentsRequest {
  status?: string;
  landlordId?: number;
  tenantId?: number;
  unitId?: number;
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
}

export interface AdminAppointmentsPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface AdminAppointmentsResponse {
  success: boolean;
  message: string;
  status: string;
  content: AdminAppointmentItem[];
  pagination: AdminAppointmentsPagination;
  contentSize: number;
}

export interface AdminAppointmentDetailResponse {
  success: boolean;
  message: string;
  status: string;
  data: AdminAppointmentItem;
}


