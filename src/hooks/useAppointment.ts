import type { GetAdminAppointmentsRequest } from "@/pages/admin/appointments/types";
import type {
  CreateAppointmentRequest,
  GetAppointmentsRequest,
  ITenantDetail,
  RespondRescheduleRequest,
  UpdateAppointmentStatusRequest,
} from "@/pages/landlord/appointments/types";
import { appointmentService } from "@/services/api/appointment.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const appointmentKeys = {
  all: ["appointments"] as const,
  list: (params?: GetAppointmentsRequest) =>
    [...appointmentKeys.all, "list", params] as const,
  listTenant: () => [...appointmentKeys.all, "list-tenant"] as const,
  listTenantParams: (params?: GetAppointmentsRequest) =>
    [...appointmentKeys.all, "list-tenant", params] as const,
  detail: (unitId: number) =>
    [...appointmentKeys.all, "detail", unitId] as const,
  // Admin Query Keys
  allForAdmin: () => [...appointmentKeys.all, "admin"] as const,
  allForAdminParams: (params?: GetAdminAppointmentsRequest) =>
    [...appointmentKeys.all, "admin", params] as const,
  adminDetail: (id: number) =>
    [...appointmentKeys.all, "admin", "detail", id] as const,
};

// Queries
export const useAppointments = (params?: GetAppointmentsRequest) => {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: async () => {
      const response = await appointmentService.getAppointments(params);
      // response is AppointmentsResponse with content and pagination
      return response;
    },
  });
};

/**
 * Get tenant details for appointments of a specific unit (Landlord)
 * GET /api/landlord/appointments/tenants?unitId={unitId}
 * Returns list of tenants who have appointments for the unit with their appointment statistics
 */
export const useDetailAppointmentForLandlord = (unitId: number) => {
  return useQuery<ITenantDetail[]>({
    queryKey: appointmentKeys.detail(unitId),
    queryFn: async () => {
      const response = await appointmentService.getDetailAppointmentForLandlord(
        unitId
      );
      // Response is already ITenantDetail[] array
      return response || [];
    },
    enabled: !!unitId && unitId > 0,
  });
};

// Mutations
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: number;
      data: UpdateAppointmentStatusRequest;
    }) => appointmentService.updateStatus(appointmentId, data),
    onSuccess: () => {
      // Invalidate appointments list to refetch
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: number) =>
      appointmentService.delete(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
  });
};

export const useDeleteAppointmentTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: number) => appointmentService.deleteTenant(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.listTenant(),
      });
    },
  });
};

export function useCreateAppointment() {
  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) =>
      appointmentService.createAppointment(data),
  });
}
// Queries
export const useAppointmentsTenant = (params?: GetAppointmentsRequest) => {
  return useQuery({
    queryKey: appointmentKeys.listTenantParams(params),
    queryFn: async () => {
      const response = await appointmentService.getAppointmentsTenant(params);
      return response;
    },
  });
};

// ============================================
// ADMIN API Hooks
// ============================================

export const useGetAdminAppointments = (
  params?: GetAdminAppointmentsRequest
) => {
  return useQuery({
    queryKey: appointmentKeys.allForAdminParams(params),
    queryFn: async () => {
      const res = await appointmentService.getAdminAppointments(params);
      return res;
    },
  });
};

export const useGetAdminAppointmentDetail = (
  appointmentId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: appointmentKeys.adminDetail(appointmentId),
    queryFn: async () => {
      const res = await appointmentService.getAdminAppointmentDetail(
        appointmentId
      );
      return res;
    },
    enabled: enabled && appointmentId > 0,
  });
};

// ============================================
// UNIT CONFIRMED APPOINTMENTS
// ============================================

export const useUnitConfirmedAppointments = (unitId: number) => {
  return useQuery({
    queryKey: [...appointmentKeys.all, "unit-confirmed", unitId],
    queryFn: async () => {
      const res = await appointmentService.getUnitConfirmedAppointments(unitId);
      return res || [];
    },
    enabled: !!unitId && unitId > 0,
  });
};

// ============================================
// TENANT APPOINTMENT MUTATIONS
// ============================================

/**
 * Tenant respond to reschedule proposal
 * POST /api/tenant/appointments/{appointment_id}/respond-reschedule
 */
export const useRespondReschedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: number;
      data: RespondRescheduleRequest;
    }) => appointmentService.respondReschedule(appointmentId, data),
    onSuccess: () => {
      // Invalidate tenant appointments list to refetch
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.listTenant(),
      });
      // Also invalidate all appointments to update any related queries
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
  });
};
