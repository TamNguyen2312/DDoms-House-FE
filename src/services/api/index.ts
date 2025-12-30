// Export admin invoice statistics service
export { adminInvoiceStatisticsService } from './admin-invoice-statistics.service';

// Re-export types
export type {
    LandlordRoom, LandlordStatistics, MonthlyStatisticsData, MonthlyStatisticsRequest,
    MonthlyStatisticsResponse, MonthlyStatisticsSummary, TenantRoom, TenantStatistics
} from '@/types/admin-invoice-statistics.types';

// Re-export hooks
export {
    adminInvoiceStatisticsKeys, useGetAdminMonthlyStatistics
} from '@/hooks/useAdminInvoiceStatistics';
