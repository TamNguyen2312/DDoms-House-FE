// // src/services/api/statistics.service.ts
// import axios, { ApiResponse } from './axios.config';

// export interface DashboardStats {
//   properties: {
//     total: number;
//     available: number;
//     rented: number;
//     maintenance: number;
//   };
//   contracts: {
//     total: number;
//     active: number;
//     expired: number;
//     expiringThisMonth: number;
//   };
//   invoices: {
//     totalRevenue: number;
//     paidInvoices: number;
//     unpaidInvoices: number;
//     overdueInvoices: number;
//   };
//   tenants: {
//     total: number;
//     active: number;
//   };
// }

// export interface RevenueStats {
//   monthly: Array<{
//     month: number;
//     year: number;
//     revenue: number;
//     paidInvoices: number;
//     unpaidInvoices: number;
//   }>;
//   yearly: Array<{
//     year: number;
//     revenue: number;
//   }>;
//   total: number;
// }

// export interface OccupancyStats {
//   total: number;
//   occupied: number;
//   vacant: number;
//   occupancyRate: number;
//   history: Array<{
//     month: number;
//     year: number;
//     occupancyRate: number;
//   }>;
// }

// export interface PaymentStats {
//   onTime: number;
//   late: number;
//   unpaid: number;
//   averagePaymentTime: number;
// }

// class StatisticsService {
//   private readonly BASE_PATH = '/statistics';

//   /**
//    * Get dashboard statistics
//    */
//   async getDashboard(landlordId?: string) {
//     return axios.get<ApiResponse<DashboardStats>>(
//       `${this.BASE_PATH}/dashboard`,
//       {
//         params: { landlordId },
//       }
//     );
//   }

//   /**
//    * Get revenue statistics
//    */
//   async getRevenue(
//     landlordId?: string,
//     startDate?: string,
//     endDate?: string
//   ) {
//     return axios.get<ApiResponse<RevenueStats>>(
//       `${this.BASE_PATH}/revenue`,
//       {
//         params: { landlordId, startDate, endDate },
//       }
//     );
//   }

//   /**
//    * Get occupancy statistics
//    */
//   async getOccupancy(landlordId?: string, months?: number) {
//     return axios.get<ApiResponse<OccupancyStats>>(
//       `${this.BASE_PATH}/occupancy`,
//       {
//         params: { landlordId, months },
//       }
//     );
//   }

//   /**
//    * Get payment statistics
//    */
//   async getPayment(landlordId?: string, year?: number) {
//     return axios.get<ApiResponse<PaymentStats>>(
//       `${this.BASE_PATH}/payment`,
//       {
//         params: { landlordId, year },
//       }
//     );
//   }

//   /**
//    * Get property performance
//    */
//   async getPropertyPerformance(propertyId: string) {
//     return axios.get<
//       ApiResponse<{
//         totalRevenue: number;
//         averageOccupancyRate: number;
//         totalContracts: number;
//         averageRentDuration: number;
//         monthlyRevenue: Array<{
//           month: number;
//           year: number;
//           revenue: number;
//         }>;
//       }>
//     >(`${this.BASE_PATH}/property/${propertyId}`);
//   }

//   /**
//    * Get tenant statistics
//    */
//   async getTenantStats(tenantId: string) {
//     return axios.get<
//       ApiResponse<{
//         totalPaid: number;
//         totalUnpaid: number;
//         onTimePayments: number;
//         latePayments: number;
//         averagePaymentTime: number;
//         paymentHistory: Array<{
//           month: number;
//           year: number;
//           amount: number;
//           status: string;
//         }>;
//       }>
//     >(`${this.BASE_PATH}/tenant/${tenantId}`);
//   }

//   /**
//    * Export statistics to Excel
//    */
//   async exportToExcel(
//     type: 'revenue' | 'occupancy' | 'payment',
//     params?: any
//   ) {
//     return axios.get<Blob>(`${this.BASE_PATH}/export/${type}`, {
//       params,
//       responseType: 'blob',
//     });
//   }

//   /**
//    * Get comparison statistics
//    */
//   async getComparison(
//     landlordId?: string,
//     currentYear?: number,
//     previousYear?: number
//   ) {
//     return axios.get<
//       ApiResponse<{
//         revenue: {
//           current: number;
//           previous: number;
//           growth: number;
//         };
//         properties: {
//           current: number;
//           previous: number;
//           growth: number;
//         };
//         occupancy: {
//           current: number;
//           previous: number;
//           change: number;
//         };
//       }>
//     >(`${this.BASE_PATH}/comparison`, {
//       params: { landlordId, currentYear, previousYear },
//     });
//   }

//   /**
//    * Get top performing properties
//    */
//   async getTopProperties(landlordId?: string, limit: number = 5) {
//     return axios.get<
//       ApiResponse<
//         Array<{
//           propertyId: string;
//           propertyName: string;
//           revenue: number;
//           occupancyRate: number;
//         }>
//       >
//     >(`${this.BASE_PATH}/top-properties`, {
//       params: { landlordId, limit },
//     });
//   }

//   // Admin statistics
//   /**
//    * Get system statistics (Admin only)
//    */
//   async getSystemStats() {
//     return axios.get<
//       ApiResponse<{
//         users: {
//           total: number;
//           landlords: number;
//           tenants: number;
//           newThisMonth: number;
//         };
//         properties: {
//           total: number;
//           pending: number;
//           approved: number;
//           rejected: number;
//         };
//         contracts: {
//           total: number;
//           active: number;
//           expiringThisMonth: number;
//         };
//         revenue: {
//           total: number;
//           thisMonth: number;
//           growth: number;
//         };
//       }>
//     >(`${this.BASE_PATH}/system`);
//   }

//   /**
//    * Get activity logs (Admin only)
//    */
//   async getActivityLogs(
//     startDate?: string,
//     endDate?: string,
//     limit?: number
//   ) {
//     return axios.get<
//       ApiResponse<
//         Array<{
//           id: string;
//           userId: string;
//           userName: string;
//           action: string;
//           resource: string;
//           timestamp: string;
//         }>
//       >
//     >(`${this.BASE_PATH}/activity-logs`, {
//       params: { startDate, endDate, limit },
//     });
//   }
// }

// export const statisticsService = new StatisticsService();
