# Admin Invoice Statistics

## 📊 Trang Thống Kê Hóa Đơn Hàng Tháng

Trang này cung cấp báo cáo chi tiết về doanh thu và hoạt động hàng tháng của hệ thống.

## 🚀 Truy cập

**URL:** `/admin/thong-ke`

**Menu:** Admin Layout → "Thống kê" (icon TrendingUp)

## 📋 Tính năng

### 1. **Tổng quan doanh thu**
- Tổng doanh thu tháng
- Số khách thuê và chủ nhà
- Breakdown theo tiền thuê, dịch vụ, cọc

### 2. **Thống kê chi tiết**
- Thông tin tháng và đơn vị tiền tệ
- Tổng số phòng trong hệ thống

### 3. **Xuất Excel** 📊
- **Button "Xuất Excel"** ở header trang
- **5 sheets** trong file Excel:
  1. **Tổng quan** - Summary statistics (không bao gồm hóa đơn và hợp đồng)
  2. **Chi tiết khách thuê** - Detailed tenant data với từng phòng
  3. **Tóm tắt khách thuê** - Tenant summary
  4. **Chi tiết chủ nhà** - Detailed landlord data với từng phòng
  5. **Tóm tắt chủ nhà** - Landlord summary
- **Filename format:** `Thong-ke-hoa-don-{month}-{timestamp}.xlsx`
- **Loading state** khi đang xuất
- **Error handling** nếu xuất thất bại

### 4. **Tương tác**
- Chọn tháng (month picker)
- Xuất Excel với 1 click
- Responsive design
- Loading và error states

## 🔧 Technical Details

### **API Endpoint:**
```
GET /api/admin/invoices/monthly-statistics?month=2025-12
```

### **Hook sử dụng:**
```tsx
import { useGetAdminMonthlyStatistics } from '@/hooks/useAdminInvoiceStatistics';

const { data, isLoading, error } = useGetAdminMonthlyStatistics({
  month: "2025-12"
});
```

### **Fields được loại bỏ:**
- `totalActiveContracts` - Không hiển thị trong UI và Excel
- `totalContractInvoicesPaid` - Không hiển thị trong UI và Excel  
- `totalServiceInvoicesPaid` - Không hiển thị trong UI và Excel

### **Excel Export Improvements:**
- **Fixed empty cells issue:** Tất cả thông tin tổng kết (tổng số phòng, tổng doanh thu, etc.) bây giờ hiển thị trên mọi dòng trong sheets "Chi tiết khách thuê" và "Chi tiết chủ nhà"
- **No more blank cells:** Trước đây chỉ dòng đầu tiên của mỗi người có thông tin tổng kết, bây giờ tất cả các dòng đều có đầy đủ thông tin
- **Better readability:** Dễ đọc và phân tích hơn khi mọi dòng đều có context đầy đủ

## 📁 File Structure

```
src/pages/admin/invoice-statistics/
├── monthly-statistics-page.tsx    # Main page với Excel export
└── README.md                      # This file

src/hooks/
└── useAdminInvoiceStatistics.ts   # React Query hook

src/services/api/
└── admin-invoice-statistics.service.ts  # API service

src/types/
└── admin-invoice-statistics.types.ts    # TypeScript types

src/components/admin/
├── monthly-statistics-demo.tsx    # Demo component
└── excel-export-demo.tsx         # Excel export demo
```

## 📊 Excel File Structure

Khi xuất Excel, file sẽ có 5 sheets:

### **Sheet 1: Tổng quan**
- Tháng báo cáo, đơn vị tiền tệ
- Tổng doanh thu, tiền thuê, phí dịch vụ, tiền cọc
- Số khách thuê, chủ nhà, phòng
- **Không bao gồm:** Hợp đồng hoạt động, hóa đơn đã thanh toán

### **Sheet 2: Chi tiết khách thuê**
- Thông tin từng khách thuê (đầy đủ trên mọi dòng)
- Chi tiết từng phòng họ thuê
- Tiền cọc, thuê, dịch vụ cho từng phòng
- Thông tin tổng kết hiển thị trên tất cả các dòng (không còn ô trống)

### **Sheet 3: Tóm tắt khách thuê**
- Summary data cho từng khách thuê
- Tổng số phòng, tổng thanh toán

### **Sheet 4: Chi tiết chủ nhà**
- Thông tin từng chủ nhà (đầy đủ trên mọi dòng)
- Chi tiết từng phòng họ cho thuê
- Thông tin ngân hàng
- Doanh thu từng phòng
- Thông tin tổng kết hiển thị trên tất cả các dòng (không còn ô trống)

### **Sheet 5: Tóm tắt chủ nhà**
- Summary data cho từng chủ nhà
- Tổng số phòng, tổng doanh thu

## 🎯 Usage Examples

### **Excel Export:**
```tsx
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const handleExportExcel = () => {
  const workbook = XLSX.utils.book_new();
  
  // Create summary sheet (simplified - no invoice/contract data)
  const summaryData = [
    { "Chỉ số": "Tháng báo cáo", "Giá trị": data.month },
    { "Chỉ số": "Tổng doanh thu", "Giá trị": data.summary.totalRevenue },
    { "Chỉ số": "Số khách thuê", "Giá trị": data.summary.totalTenants },
    { "Chỉ số": "Số chủ nhà", "Giá trị": data.summary.totalLandlords },
    // ... more data (excluding contract/invoice fields)
  ];
  
  const sheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, sheet, "Tổng quan");
  
  const fileName = `Thong-ke-hoa-don-${data.month}-${format(new Date(), "yyyy-MM-dd-HHmmss")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
```

### **Basic Usage:**
```tsx
import MonthlyStatisticsPage from '@/pages/admin/invoice-statistics/monthly-statistics-page';

// Route: /admin/thong-ke
<Route path="thong-ke" element={<MonthlyStatisticsPage />} />
```

## 🔐 Permissions

- **Required Role:** Admin only
- **Protected Route:** Yes (`allowedRoles={["admin"]}`)
- **Authentication:** Required

## 📱 Responsive Design

- **Desktop:** 3-column grid layout cho summary cards
- **Tablet:** Responsive grid layout
- **Mobile:** Stacked layout, optimized cho touch

## 🚀 Performance

- **Caching:** 5 minutes stale time, 10 minutes garbage collection
- **Query Keys:** Proper invalidation và refetch
- **Loading States:** Skeleton loading và error boundaries

## 🔄 Data Flow

1. User selects month từ month picker
2. Hook calls API với month parameter
3. React Query caches response
4. UI updates với new data (excluding contract/invoice fields)
5. Error handling nếu API fails

## 🎨 UI Components

- **Cards:** Summary statistics (3 cards: Revenue, Tenants, Landlords)
- **Charts:** Revenue breakdown (Rent, Service, Deposit)
- **Controls:** Month picker, Excel export button
- **States:** Loading, error, empty states

---

**Created:** December 2024  
**Last Updated:** December 2024  
**Version:** 2.0.0 (Removed contract/invoice fields)