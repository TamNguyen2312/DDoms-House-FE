import type {
  AdminAppointmentDetailResponse,
  AdminAppointmentsResponse,
  GetAdminAppointmentsRequest,
} from "@/pages/admin/appointments/types";
import type {
  AppointmentsResponse,
  CreateAppointmentRequest,
  GetAppointmentsRequest,
  IAppointment,
  ITenantDetail,
  RespondRescheduleRequest,
  UnitConfirmedAppointment,
  UpdateAppointmentStatusRequest,
} from "@/pages/landlord/appointments/types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class AppointmentService {
  private readonly BASE_PATH_TENANT = "/tenant/appointments";
  private readonly BASE_PATH_LANDLORD = "/landlord/appointments";
  async createAppointment(data: CreateAppointmentRequest) {
    const res = await axiosInstance.post(this.BASE_PATH_TENANT, data);
    return res.data;
  }
  async getAppointmentsTenant(params?: GetAppointmentsRequest) {
    // API returns AppointmentsResponse directly (not wrapped in ApiResponse)
    const response = await axiosInstance.get<AppointmentsResponse>(
      `${this.BASE_PATH_TENANT}`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 10,
          sort: params?.sort ?? "createdAt",
          direction: params?.direction ?? "DESC",
          ...(params?.status && { status: params.status }),
        },
      }
    );
    return response.data?.data;
  }
  /**
   * Get all appointments with filters and pagination
   */
  async getAppointments(params?: GetAppointmentsRequest) {
    // API returns nested structure: ApiResponse<AppointmentsResponse>
    const response = await axiosInstance.get<ApiResponse<AppointmentsResponse>>(
      `${this.BASE_PATH_LANDLORD}`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 15,
          sort: params?.sort ?? "createdAt",
          direction: params?.direction ?? "DESC",
          ...(params?.status && { status: params.status }),
        },
      }
    );

    // Return the nested data.data which contains content and pagination
    return response.data.data;
  }

  /**
   * Get tenant details for appointments of a specific unit
   * GET /api/landlord/appointments/tenants?unitId={unitId}
   * Returns list of tenants who have appointments for the unit
   */
  async getDetailAppointmentForLandlord(unitId: number) {
    // API returns array of ITenantDetail wrapped in ApiResponse
    const response = await axiosInstance.get<ApiResponse<ITenantDetail[]>>(
      `${this.BASE_PATH_LANDLORD}/tenants?unitId=${unitId}`
    );

    // response.data is ApiResponse<ITenantDetail[]>, so response.data.data is ITenantDetail[]
    return response.data?.data || [];
  }

  /**
   * Update appointment status
   */
  async updateStatus(
    appointmentId: number,
    data: UpdateAppointmentStatusRequest
  ) {
    return axiosInstance.patch<ApiResponse<IAppointment>>(
      `${this.BASE_PATH_LANDLORD}/${appointmentId}`,
      data
    );
  }

  /**
   * Delete appointment landlord
   */
  async delete(appointmentId: number) {
    return axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH_LANDLORD}/${appointmentId}`
    );
  }

  /**
   * Delete appointment landlord
   */
  async deleteTenant(tenantId: number) {
    return axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH_TENANT}/${tenantId}`
    );
  }

  // ============================================
  // ADMIN APIs
  // ============================================

  /**
   * Get all appointments for admin with filters
   * GET /api/admin/appointments?status=&landlordId=&tenantId=&unitId=&page=0&size=20
   */
  async getAdminAppointments(params?: GetAdminAppointmentsRequest) {
    const response = await axiosInstance.get<AdminAppointmentsResponse>(
      "/admin/appointments",
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          ...(params?.status && { status: params.status }),
          ...(params?.landlordId && { landlordId: params.landlordId }),
          ...(params?.tenantId && { tenantId: params.tenantId }),
          ...(params?.unitId && { unitId: params.unitId }),
          ...(params?.sort && { sort: params.sort }),
          ...(params?.direction && { direction: params.direction }),
        },
      }
    );
    return response.data;
  }

  /**
   * Get appointment detail for admin
   * GET /api/admin/appointments/{appointment_id}
   */
  async getAdminAppointmentDetail(appointmentId: number) {
    const response = await axiosInstance.get<AdminAppointmentDetailResponse>(
      `/admin/appointments/${appointmentId}`
    );
    return response.data;
  }

  /**
   * Get confirmed appointments for a unit
   * GET /api/units/{unit_id}/appointments/confirmed
   */
  async getUnitConfirmedAppointments(unitId: number) {
    const response = await axiosInstance.get<
      ApiResponse<UnitConfirmedAppointment[]>
    >(`/units/${unitId}/appointments/confirmed`);
    return response.data.data;
  }

  /**
   * Tenant respond to reschedule proposal
   * POST /api/tenant/appointments/{appointment_id}/respond-reschedule
   */
  async respondReschedule(
    appointmentId: number,
    data: RespondRescheduleRequest
  ) {
    const response = await axiosInstance.post<ApiResponse<IAppointment>>(
      `${this.BASE_PATH_TENANT}/${appointmentId}/respond-reschedule`,
      data
    );
    return response.data;
  }
}

export const appointmentService = new AppointmentService();
