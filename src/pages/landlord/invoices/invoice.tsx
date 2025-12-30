import SitePageTitle from "@/components/site/site-page-title";
import { useGetContractsForLandlord } from "@/hooks/useContracts";
import { invoiceService } from "@/services/api/invoice.service";
import type { Invoice } from "@/types/invoice.types";
import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { InvoiceDetailDialog } from "./dialogs/invoice-detail-dialog";
import type { IInvoice } from "./table/adp-columns";
import { ADLRowActions } from "./table/adp-row-actions";
import { ADPView } from "./table/adp-view";

const ADInvoice = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Get all contracts
  const { data: contractsData, isLoading: isLoadingContracts } =
    useGetContractsForLandlord({ page: 0, size: 100 });
  const contracts = useMemo(
    () => contractsData?.content || [],
    [contractsData?.content]
  );

  // Get invoices for all contracts
  const contractIds = useMemo(
    () => contracts.map((c: { id: number }) => c.id),
    [contracts]
  );

  // Fetch invoices for all contracts using useQueries
  const invoiceQueries = useQueries({
    queries: contractIds.map((contractId: number) => ({
      queryKey: ["invoices", "contract", contractId, "landlord"],
      queryFn: () => invoiceService.getInvoicesByContract(contractId),
      enabled: contractId > 0,
      select: (response: unknown) => {
        // Handle nested response structure
        let invoiceArray: Invoice[] = [];

        const responseData = response as {
          content?: Invoice[];
          data?:
            | Invoice[]
            | { content?: Invoice[]; data?: { content?: Invoice[] } };
        };

        // Priority: Check for content array first (paginated response from nested structure)
        if (Array.isArray(responseData?.content)) {
          invoiceArray = responseData.content;
        } else if (Array.isArray(responseData?.data)) {
          invoiceArray = responseData.data;
        } else if (
          responseData?.data &&
          typeof responseData.data === "object" &&
          "content" in responseData.data &&
          Array.isArray(responseData.data.content)
        ) {
          invoiceArray = responseData.data.content;
        } else if (
          responseData?.data &&
          typeof responseData.data === "object" &&
          "data" in responseData.data &&
          responseData.data.data &&
          typeof responseData.data.data === "object" &&
          "content" in responseData.data.data &&
          Array.isArray(responseData.data.data.content)
        ) {
          invoiceArray = responseData.data.data.content;
        } else if (Array.isArray(response)) {
          // Direct array response
          invoiceArray = response;
        }

        // Normalize invoice IDs and ensure type field
        invoiceArray = invoiceArray.map(
          (invoice: Invoice & { invoiceId?: number | string }) => {
            const normalized: Invoice = {
              ...invoice,
              id: invoice.id ?? invoice.invoiceId ?? invoice.id,
              contractId: invoice.contractId ?? contractId,
              type: invoice.type || "CONTRACT", // Đảm bảo có type field
            };
            return normalized;
          }
        );

        return {
          data: invoiceArray,
          contractId,
        };
      },
    })),
  });

  // Combine all invoices from all contracts
  const invoices = useMemo(() => {
    const allInvoices: IInvoice[] = [];

    invoiceQueries.forEach((query) => {
      const queryData = query.data as
        | { data: Invoice[]; contractId: number }
        | undefined;
      if (queryData?.data && Array.isArray(queryData.data)) {
        queryData.data.forEach((invoice: Invoice) => {
          allInvoices.push({
            ...invoice,
            contractId: invoice.contractId || queryData.contractId,
          } as IInvoice);
        });
      }
    });

    // Sort by date (newest first)
    return allInvoices.sort(
      (a, b) =>
        new Date(b.createdAt || b.issuedAt || "").getTime() -
        new Date(a.createdAt || a.issuedAt || "").getTime()
    );
  }, [invoiceQueries]);

  const isLoadingInvoices = invoiceQueries.some((q) => q.isLoading);
  const isLoading = isLoadingContracts || isLoadingInvoices;

  const handleViewDetail = (invoice: IInvoice) => {
    setSelectedInvoice(invoice);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="shrink-0 mb-2 sm:mb-4">
        <SitePageTitle
          title="Quản lý hóa đơn"
          subTitle="Danh sách tất cả hóa đơn"
          hideCreate={true}
          hidePrint={true}
          hideImport={true}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p>Đang tải danh sách hóa đơn...</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ADPView
            data={invoices}
            onRowClick={handleViewDetail}
            actions={(row) => (
              <ADLRowActions row={row} onView={handleViewDetail} />
            )}
          />
        </div>
      )}

      {selectedInvoice && (
        <InvoiceDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
};

export default ADInvoice;
