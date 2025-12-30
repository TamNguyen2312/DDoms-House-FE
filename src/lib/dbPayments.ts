import type { ITenantRef } from "@/store/types/common";

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface IPaymentInvoice {
  cycle_month: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  due_at: string;
  items: IInvoiceItem[];
}

export interface IPayment {
  payment_id: string;
  invoice_id: string;
  tenant_id: string;
  provider: string;
  provider_txn_id: string;
  amount: number;
  status: string;
  created_at: string;
  succeeded_at: string | null;
  invoice: IPaymentInvoice;
}

export const dbPayments: IPayment[] = [
  {
    payment_id: "pay_01",
    invoice_id: "inv_01",
    tenant_id: "tenant_123",
    provider: "momo",
    provider_txn_id: "momo_984351",
    amount: 5200000,
    status: "succeeded",
    created_at: "2025-01-05T10:14:00Z",
    succeeded_at: "2025-01-05T10:14:32Z",
    invoice: {
      cycle_month: "2025-01-01",
      subtotal: 5000000,
      tax_amount: 200000,
      total_amount: 5200000,
      due_at: "2025-01-10T00:00:00Z",
      items: [
        {
          description: "Tiền thuê phòng tháng 1",
          quantity: 1,
          unit_price: 5000000,
        },
        {
          description: "Thuế VAT 4%",
          quantity: 1,
          unit_price: 200000,
        },
      ],
    },
  },
  {
    payment_id: "pay_02",
    invoice_id: "inv_02",
    tenant_id: "tenant_123",
    provider: "vnpay",
    provider_txn_id: "vnpay_0021983",
    amount: 5200000,
    status: "failed",
    created_at: "2025-02-05T10:14:00Z",
    succeeded_at: null,
    invoice: {
      cycle_month: "2025-02-01",
      subtotal: 5000000,
      tax_amount: 200000,
      total_amount: 5200000,
      due_at: "2025-02-10T00:00:00Z",
      items: [
        {
          description: "Tiền thuê phòng tháng 2",
          quantity: 1,
          unit_price: 5000000,
        },
        {
          description: "Thuế VAT 4%",
          quantity: 1,
          unit_price: 200000,
        },
      ],
    },
  },
  {
    payment_id: "pay_03",
    invoice_id: "inv_03",
    tenant_id: "tenant_123",
    provider: "zalopay",
    provider_txn_id: "zlp_018232",
    amount: 5300000,
    status: "succeeded",
    created_at: "2025-03-05T12:05:00Z",
    succeeded_at: "2025-03-05T12:05:30Z",
    invoice: {
      cycle_month: "2025-03-01",
      subtotal: 5100000,
      tax_amount: 200000,
      total_amount: 5300000,
      due_at: "2025-03-10T00:00:00Z",
      items: [
        {
          description: "Tiền thuê phòng tháng 3",
          quantity: 1,
          unit_price: 5100000,
        },
        {
          description: "Thuế VAT 4%",
          quantity: 1,
          unit_price: 200000,
        },
      ],
    },
  },
];
