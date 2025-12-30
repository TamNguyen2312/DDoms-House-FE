export type IAppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "RESCHEDULED";
// Types for Appointments API
export interface IAppointment {
  id: number;
  unitId: number;
  propertyId: number;
  tenantId: number;
  landlordId: number;
  startTime: string;
  status: IAppointmentStatus;
  note: string;
  propertyName: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  unitCode: string;
  createdAt: string;
  // New fields from v2.2
  landlordRescheduleTime?: string; // Thời gian landlord đề xuất khi reschedule
  rescheduleCount?: number; // Số lần đàm phán (max 3)
  lastRescheduleBy?: "LANDLORD" | "TENANT"; // Ai đề xuất lần cuối
  rejectionReason?: string; // Lý do từ chối (khi status = REJECTED)
}

export interface GetAppointmentsRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "ASC" | "DESC";
  status?: string;
}

export interface AppointmentsPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

export interface AppointmentsResponse {
  success: boolean;
  message: string;
  status: string;
  content: IAppointment[];
  pagination: AppointmentsPagination;
  contentSize: number;
}

export interface UpdateAppointmentStatusRequest {
  status: IAppointmentStatus;
  startTime?: string; // Required when status is RESCHEDULED
  rejectionReason?: string; // Required when status is REJECTED
}

export interface CreateAppointmentRequest {
  unitId: number;
  startTime: string;
  note: string;
}

export interface ITenantDetailUnit {
  unitId: number;
  unitCode: string;
  appointmentCount: number;
}

export interface ITenantDetail {
  tenantId: number;
  email: string;
  phone: string;
  totalAppointments: number;
  lastAppointmentTime: string;
  units: ITenantDetailUnit[];
}

export interface UnitConfirmedAppointment {
  appointmentId: number;
  landlordDisplayName: string;
  tenantFullName: string;
  status: IAppointmentStatus;
  startTime: string;
}

export interface RespondRescheduleRequest {
  accept: boolean;
  counterProposedTime?: string; // Optional, only when accept is false
}
