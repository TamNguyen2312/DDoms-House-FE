import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetContractsForTenant } from "@/hooks/useContracts";
import {
  useGetInvoiceDetailForTenant,
  useGetTenantServiceInvoiceDetail,
} from "@/hooks/useInvoices";
import { invoiceService } from "@/services/api/invoice.service";
import type { Invoice } from "@/types/invoice.types";
import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import { CreditCard, Eye, MoreVertical, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContractInvoiceDetailDialog } from "../../landlord/contracts/dialogs/contract-invoice-detail-dialog";

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  ISSUED: "Đã phát hành",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  CANCELLED: "Đã hủy",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  ISSUED: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const TEInvoice = () => {
  const navigate = useNavigate();
  const [selectedContractId, setSelectedContractId] = useState<number | null>(
    null
  );
  const [isInvoiceDetailDialogOpen, setIsInvoiceDetailDialogOpen] =
    useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<
    (Invoice & { contractId: number; isServiceInvoice?: boolean }) | null
  >(null);

  // Get all contracts
  const { data: contractsData, isLoading: isLoadingContracts } =
    useGetContractsForTenant({ page: 0, size: 100 });
  const contracts = useMemo(
    () => contractsData?.content || [],
    [contractsData?.content]
  );

  // Get invoices for selected contract or all contracts
  const contractIds = useMemo(() => {
    if (selectedContractId) {
      return [selectedContractId];
    }
    return contracts.map((c) => c.id);
  }, [contracts, selectedContractId]);

  // Fetch regular invoices for all contracts using useQueries
  const invoiceQueries = useQueries({
    queries: contractIds.map((contractId) => ({
      queryKey: ["invoices", "contract", contractId, "tenant"],
      queryFn: () => invoiceService.getInvoicesByContractForTenant(contractId),
      enabled: contractId > 0,
      select: (response: unknown) => {
        // Handle nested response structure:
        // API Response: { success, message, status, data: { success, message, status, content: [...], pagination: {...} } }
        // Service returns response.data, so response = { success, message, status, content: [...], pagination: {...} }
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

        // Normalize invoice IDs: API có thể trả về invoiceId thay vì id
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
  const allInvoices = useMemo(() => {
    const invoices: (Invoice & {
      contractId: number;
      isServiceInvoice?: boolean;
    })[] = [];

    // Add all invoices from all contracts
    invoiceQueries.forEach((query) => {
      if (query.data?.data && Array.isArray(query.data.data)) {
        query.data.data.forEach((invoice: Invoice) => {
          const isServiceInvoice = invoice.type === "SERVICE";
          invoices.push({
            ...invoice,
            contractId: invoice.contractId || query.data.contractId,
            isServiceInvoice,
          });
        });
      }
    });

    // Sort by date (newest first)
    return invoices.sort(
      (a, b) =>
        new Date(b.createdAt || b.issuedAt || "").getTime() -
        new Date(a.createdAt || a.issuedAt || "").getTime()
    );
  }, [invoiceQueries]);

  const isLoadingInvoices = invoiceQueries.some((q) => q.isLoading);
  const isLoading = isLoadingContracts || isLoadingInvoices;

  // Fetch invoice detail when viewing
  const selectedInvoiceId = selectedInvoice?.id
    ? Number(selectedInvoice.id)
    : 0;
  const selectedContractIdForDetail = selectedInvoice?.contractId
    ? Number(selectedInvoice.contractId)
    : 0;

  const { data: invoiceDetail, isLoading: isLoadingInvoiceDetail } =
    useGetInvoiceDetailForTenant(
      selectedContractIdForDetail,
      selectedInvoiceId,
      isInvoiceDetailDialogOpen &&
        selectedInvoice !== null &&
        selectedInvoice.type !== "SERVICE"
    );

  const {
    data: serviceInvoiceDetail,
    isLoading: isLoadingServiceInvoiceDetail,
  } = useGetTenantServiceInvoiceDetail(
    selectedInvoiceId,
    isInvoiceDetailDialogOpen &&
      selectedInvoice !== null &&
      selectedInvoice.type === "SERVICE"
  );

  const handleViewDetail = (
    invoice: Invoice & { contractId: number; isServiceInvoice?: boolean }
  ) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDetailDialogOpen(true);
  };

  const handlePay = (
    invoice: Invoice & { contractId: number; isServiceInvoice?: boolean }
  ) => {
    navigate(`/tenant/hop-dong/${invoice.contractId}`, {
      state: {
        invoiceId: invoice.type === "SERVICE" ? undefined : invoice.id,
        serviceInvoiceId: invoice.type === "SERVICE" ? invoice.id : undefined,
      },
    });
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="font-bold text-gray-900 mb-2 text-xl">
            Quản lý hóa đơn
          </h1>
          <p className="text-gray-600">
            Danh sách tất cả hóa đơn từ các hợp đồng
          </p>
        </div>

        {/* Filter by Contract */}
        {contracts.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm">Lọc theo hợp đồng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedContractId === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedContractId(null)}
                >
                  Tất cả
                </Button>
                {contracts.map((contract) => (
                  <Button
                    key={contract.id}
                    variant={
                      selectedContractId === contract.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedContractId(contract.id)}
                  >
                    Hợp đồng #{contract.id}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p>Đang tải danh sách hóa đơn...</p>
          </div>
        ) : allInvoices.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {selectedContractId
                    ? "Chưa có hóa đơn nào cho hợp đồng này"
                    : "Chưa có hóa đơn nào"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="size-5" />
                Hóa đơn ({allInvoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hợp đồng</TableHead>

                    <TableHead>Loại</TableHead>
                    <TableHead>Tháng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày đến hạn</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allInvoices.map((invoice) => (
                    <TableRow
                      key={`${
                        invoice.type === "SERVICE" ? "service" : "regular"
                      }-${invoice.contractId}-${invoice.id}`}
                    >
                      <TableCell>
                        {invoice.contractId ? `#${invoice.contractId}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.type === "SERVICE" ? "secondary" : "default"
                          }
                          className={
                            invoice.type === "SERVICE"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {invoice.type === "SERVICE" ? "Dịch vụ" : "Hợp đồng"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {invoice.cycleMonth
                          ? format(new Date(invoice.cycleMonth), "MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            statusColors[invoice.status] || "bg-gray-100"
                          }
                        >
                          {statusLabels[invoice.status] || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.dueAt
                          ? format(new Date(invoice.dueAt), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(invoice.totalAmount || 0)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8 p-0">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => handleViewDetail(invoice)}
                            >
                              <Eye
                                size={16}
                                strokeWidth={1.5}
                                className="mr-2"
                              />
                              Xem
                            </DropdownMenuItem>
                            {(invoice.status === "ISSUED" ||
                              invoice.status === "OVERDUE") && (
                              <DropdownMenuItem
                                onClick={() => handlePay(invoice)}
                              >
                                <CreditCard
                                  size={16}
                                  strokeWidth={1.5}
                                  className="mr-2"
                                />
                                Đến hợp đồng
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Invoice Detail Dialog */}
        <ContractInvoiceDetailDialog
          open={isInvoiceDetailDialogOpen}
          onOpenChange={(open: boolean) => {
            setIsInvoiceDetailDialogOpen(open);
            if (!open) {
              setSelectedInvoice(null);
            }
          }}
          invoice={
            selectedInvoice?.type === "SERVICE" && serviceInvoiceDetail
              ? serviceInvoiceDetail
              : selectedInvoice?.type === "SERVICE"
              ? null
              : invoiceDetail || selectedInvoice
          }
          isLoading={
            selectedInvoice?.type === "SERVICE"
              ? isLoadingServiceInvoiceDetail
              : isLoadingInvoiceDetail
          }
        />
      </div>
    </div>
  );
};

export default TEInvoice;
