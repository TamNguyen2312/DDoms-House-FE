/**
 * Types for Admin Invoice Monthly Statistics API
 * GET /api/admin/invoices/monthly-statistics?month=2025-12
 */

export interface MonthlyStatisticsRequest {
  month: string; // Format: YYYY-MM (e.g., "2025-12")
}

export interface TenantRoom {
  unitId: number;
  roomCode: string;
  contractId: number;
  depositAmount: number;
  rentAmount: number;
  serviceAmount: number;
}

export interface TenantStatistics {
  userId: number;
  fullName: string | null;
  phone: string;
  email: string;
  rooms: TenantRoom[];
  totalRooms: number;
  totalDepositPaid: number;
  totalRentPaid: number;
  totalServicePaid: number;
  totalAmount: number;
}

export interface LandlordRoom {
  unitId: number;
  roomCode: string;
  contractId: number;
  tenantId: number;
  rentAmount: number;
  serviceAmount: number;
}

export interface LandlordStatistics {
  userId: number;
  displayName: string | null;
  phone: string;
  email: string;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  rooms: LandlordRoom[];
  totalRooms: number;
  totalDepositReceived: number;
  totalRentReceived: number;
  totalServiceReceived: number;
  totalAmount: number;
}

export interface MonthlyStatisticsSummary {
  totalTenants: number;
  totalLandlords: number;
  totalRooms: number;
  totalActiveContracts: number;
  totalDepositCollected: number;
  totalRentCollected: number;
  totalServiceCollected: number;
  totalRevenue: number;
  totalContractInvoicesPaid: number;
  totalServiceInvoicesPaid: number;
}

export interface MonthlyStatisticsData {
  month: string;
  currency: string;
  summary: MonthlyStatisticsSummary;
  tenants: TenantStatistics[];
  landlords: LandlordStatistics[];
}

export interface MonthlyStatisticsResponse {
  success: boolean;
  message: string;
  status: string;
  data: MonthlyStatisticsData;
}