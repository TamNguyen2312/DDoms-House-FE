import SitePageTitle from "@/components/site/site-page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetContractsForLandlord } from "@/hooks/useContracts";
import { invoiceService } from "@/services/api/invoice.service";
import type { Invoice } from "@/types/invoice.types";
import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

interface ContractWithExpiry {
  id: number;
  unitId: number;
  unitName?: string;
  tenantName?: string;
  endDate: string;
  daysUntilExpiry: number;
  status: string;
}

interface InvoiceWithExpiry {
  id: number | string;
  contractId: number;
  contractCode?: string;
  cycleMonth: string;
  dueAt: string;
  totalAmount: number;
  status: string;
  daysUntilDue: number;
}

const ExpiryTrackingPage = () => {
  // Pagination state for each tab
  const [contractsOverduePage, setContractsOverduePage] = useState(0);
  const [contractsOverduePageSize, setContractsOverduePageSize] = useState(10);
  const [contractsExpiringPage, setContractsExpiringPage] = useState(0);
  const [contractsExpiringPageSize, setContractsExpiringPageSize] =
    useState(10);
  const [invoicesOverduePage, setInvoicesOverduePage] = useState(0);
  const [invoicesOverduePageSize, setInvoicesOverduePageSize] = useState(10);
  const [invoicesDuePage, setInvoicesDuePage] = useState(0);
  const [invoicesDuePageSize, setInvoicesDuePageSize] = useState(10);

  // Get all contracts with size 100
  const { data: contractsData, isLoading: isLoadingContracts } =
    useGetContractsForLandlord({ page: 0, size: 100 });

  const contracts = useMemo(
    () => contractsData?.content || contractsData?.data?.content || [],
    [contractsData]
  );

  // Get contract IDs
  const contractIds = useMemo(
    () =>
      contracts.map((c: { id: number }) => c.id).filter((id: number) => id > 0),
    [contracts]
  );

  // Fetch invoices for all contracts using useQueries
  const invoiceQueries = useQueries({
    queries: contractIds.map((contractId: number) => ({
      queryKey: ["invoices", "contract", contractId, "landlord", "expiry"],
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
        } else if (Array.isArray(response)) {
          invoiceArray = response;
        }

        return invoiceArray.map(
          (invoice: Invoice & { invoiceId?: number | string }) => ({
            ...invoice,
            id: invoice.id ?? invoice.invoiceId ?? invoice.id,
            contractId: invoice.contractId ?? contractId,
          })
        );
      },
    })),
  });

  // Flatten all invoices
  const allInvoices = useMemo(() => {
    return invoiceQueries
      .map((query) => query.data || [])
      .flat()
      .filter(
        (invoice): invoice is Invoice =>
          invoice !== null && invoice !== undefined
      );
  }, [invoiceQueries]);

  // Calculate today's date
  const today = useMemo(() => new Date(), []);
  today.setHours(0, 0, 0, 0);

  // Filter contracts: quá hạn (endDate < today)
  const contractsOverdue = useMemo(() => {
    return contracts
      .map((contract: any) => {
        const endDate = new Date(contract.endDate);
        endDate.setHours(0, 0, 0, 0);

        // Only include ACTIVE contracts that are overdue
        if (contract.status !== "ACTIVE") {
          return null;
        }

        // Check if contract is overdue
        if (endDate < today) {
          const daysOverdue = Math.ceil(
            (today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: contract.id,
            unitId: contract.unitId,
            unitName:
              contract.unit?.name ||
              contract.unit?.code ||
              `Phòng #${contract.unitId}`,
            tenantName:
              contract.tenant?.displayName || contract.tenant?.email || "N/A",
            endDate: contract.endDate,
            daysUntilExpiry: -daysOverdue, // Negative to indicate overdue
            status: contract.status,
          } as ContractWithExpiry;
        }

        return null;
      })
      .filter((contract): contract is ContractWithExpiry => contract !== null)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry); // Most overdue first
  }, [contracts, today]);

  // Filter contracts: còn 1 tháng nữa đến hạn (30 days)
  const contractsExpiringSoon = useMemo(() => {
    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);

    return contracts
      .map((contract: any) => {
        const endDate = new Date(contract.endDate);
        endDate.setHours(0, 0, 0, 0);

        // Only include ACTIVE contracts
        if (contract.status !== "ACTIVE") {
          return null;
        }

        // Check if contract expires within 30 days (but not overdue)
        if (endDate > today && endDate <= oneMonthFromNow) {
          const daysUntilExpiry = Math.ceil(
            (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          return {
            id: contract.id,
            unitId: contract.unitId,
            unitName:
              contract.unit?.name ||
              contract.unit?.unitCode ||
              `Phòng #${contract.unitCode}`,
            tenantName:
              contract.tenant?.displayName || contract.tenant?.email || "N/A",
            endDate: contract.endDate,
            daysUntilExpiry,
            status: contract.status,
          } as ContractWithExpiry;
        }

        return null;
      })
      .filter((contract): contract is ContractWithExpiry => contract !== null)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [contracts, today]);

  // Filter invoices: quá hạn (dueAt < today)
  const invoicesOverdue = useMemo(() => {
    return allInvoices
      .map((invoice) => {
        const dueDate = new Date(invoice.dueAt);
        dueDate.setHours(0, 0, 0, 0);

        // Only include ISSUED or OVERDUE invoices
        if (invoice.status !== "ISSUED" && invoice.status !== "OVERDUE") {
          return null;
        }

        // Check if invoice is overdue
        if (dueDate < today) {
          const daysOverdue = Math.ceil(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Find contract for this invoice
          const contract = contracts.find(
            (c: any) => c.id === invoice.contractId
          );

          return {
            id: invoice.id,
            contractId: invoice.contractId,
            contractCode: contract
              ? `#${contract.id}`
              : `#${invoice.contractId}`,
            cycleMonth: invoice.cycleMonth,
            dueAt: invoice.dueAt,
            totalAmount: invoice.totalAmount,
            status: invoice.status,
            daysUntilDue: -daysOverdue, // Negative to indicate overdue
          } as InvoiceWithExpiry;
        }

        return null;
      })
      .filter((invoice): invoice is InvoiceWithExpiry => invoice !== null)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue); // Most overdue first
  }, [allInvoices, today, contracts]);

  // Filter invoices: còn 10 ngày đến hạn
  const invoicesDueSoon = useMemo(() => {
    const tenDaysFromNow = new Date(today);
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

    return allInvoices
      .map((invoice) => {
        const dueDate = new Date(invoice.dueAt);
        dueDate.setHours(0, 0, 0, 0);

        // Only include ISSUED invoices (not paid, not cancelled, not overdue)
        if (invoice.status !== "ISSUED") {
          return null;
        }

        // Check if invoice is due within 10 days (but not overdue)
        if (dueDate > today && dueDate <= tenDaysFromNow) {
          const daysUntilDue = Math.ceil(
            (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Find contract for this invoice
          const contract = contracts.find(
            (c: any) => c.id === invoice.contractId
          );

          return {
            id: invoice.id,
            contractId: invoice.contractId,
            contractCode: contract
              ? `#${contract.id}`
              : `#${invoice.contractId}`,
            cycleMonth: invoice.cycleMonth,
            dueAt: invoice.dueAt,
            totalAmount: invoice.totalAmount,
            status: invoice.status,
            daysUntilDue,
          } as InvoiceWithExpiry;
        }

        return null;
      })
      .filter((invoice): invoice is InvoiceWithExpiry => invoice !== null)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [allInvoices, today, contracts]);

  const isLoadingInvoices = invoiceQueries.some((query) => query.isLoading);
  const isLoading = isLoadingContracts || isLoadingInvoices;

  // Pagination helper function
  const paginateData = <T,>(data: T[], page: number, pageSize: number) => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      paginatedData: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / pageSize),
      totalElements: data.length,
      hasNext: endIndex < data.length,
      hasPrevious: page > 0,
    };
  };

  // Paginated data for each tab
  const contractsOverduePaginated = useMemo(
    () =>
      paginateData(
        contractsOverdue,
        contractsOverduePage,
        contractsOverduePageSize
      ),
    [contractsOverdue, contractsOverduePage, contractsOverduePageSize]
  );

  const contractsExpiringPaginated = useMemo(
    () =>
      paginateData(
        contractsExpiringSoon,
        contractsExpiringPage,
        contractsExpiringPageSize
      ),
    [contractsExpiringSoon, contractsExpiringPage, contractsExpiringPageSize]
  );

  const invoicesOverduePaginated = useMemo(
    () =>
      paginateData(
        invoicesOverdue,
        invoicesOverduePage,
        invoicesOverduePageSize
      ),
    [invoicesOverdue, invoicesOverduePage, invoicesOverduePageSize]
  );

  const invoicesDuePaginated = useMemo(
    () => paginateData(invoicesDueSoon, invoicesDuePage, invoicesDuePageSize),
    [invoicesDueSoon, invoicesDuePage, invoicesDuePageSize]
  );

  // Pagination component
  const PaginationControls = ({
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    hasNext,
    hasPrevious,
    onPageChange,
    onPageSizeChange,
  }: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  }) => (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        Hiển thị {currentPage * pageSize + 1} -{" "}
        {Math.min((currentPage + 1) * pageSize, totalElements)} trong tổng số{" "}
        {totalElements} kết quả
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(0)}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2">
            Trang {currentPage + 1} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={!hasNext}
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SitePageTitle title="Theo dõi đến hạn" />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <Tabs defaultValue="contracts-overdue" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contracts-overdue" className="relative">
              <AlertCircle className="h-4 w-4 mr-2" />
              Hợp đồng quá hạn
              {contractsOverdue.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {contractsOverdue.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contracts-expiring">
              <Calendar className="h-4 w-4 mr-2" />
              Hợp đồng sắp hết hạn
              {contractsExpiringSoon.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {contractsExpiringSoon.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invoices-overdue" className="relative">
              <AlertCircle className="h-4 w-4 mr-2" />
              Hóa đơn quá hạn
              {invoicesOverdue.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {invoicesOverdue.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invoices-due">
              <FileText className="h-4 w-4 mr-2" />
              Hóa đơn sắp đến hạn
              {invoicesDueSoon.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {invoicesDueSoon.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Contracts Overdue Tab */}
          <TabsContent value="contracts-overdue" className="mt-6">
            {contractsOverdue.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Không có hợp đồng nào quá hạn</p>
              </div>
            ) : (
              <div className="space-y-4 h-[calc(100vh-240px)] flex flex-col">
                {/* TABLE AREA */}
                <div className="border rounded-lg overflow-hidden flex-1">
                  <div className="h-full overflow-x-auto overflow-y-auto">
                    <Table className="min-h-full">
                      <TableHeader className="sticky top-0 bg-secondary z-10">
                        <TableRow className="hover:bg-secondary">
                          <TableHead className="w-[100px]">Mã HĐ</TableHead>
                          <TableHead>Phòng</TableHead>
                          <TableHead>Người thuê</TableHead>
                          <TableHead>Ngày hết hạn</TableHead>
                          <TableHead className="text-center">
                            Số ngày quá hạn
                          </TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {contractsOverduePaginated.paginatedData.map(
                          (contract) => (
                            <TableRow
                              key={contract.id}
                              className="hover:bg-destructive/5"
                            >
                              <TableCell className="font-medium">
                                #{contract.id}
                              </TableCell>
                              <TableCell>{contract.unitName}</TableCell>
                              <TableCell>{contract.tenantName}</TableCell>
                              <TableCell>
                                {format(
                                  new Date(contract.endDate),
                                  "dd/MM/yyyy",
                                  {
                                    locale: vi,
                                  }
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="destructive">
                                  {Math.abs(contract.daysUntilExpiry)} ngày
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                  <Link
                                    to={`/landlord/quan-ly-hop-dong/${contract.id}`}
                                  >
                                    Xem chi tiết
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* PAGINATION */}
                <div className="pt-2">
                  <PaginationControls
                    currentPage={contractsOverduePage}
                    pageSize={contractsOverduePageSize}
                    totalPages={contractsOverduePaginated.totalPages}
                    totalElements={contractsOverduePaginated.totalElements}
                    hasNext={contractsOverduePaginated.hasNext}
                    hasPrevious={contractsOverduePaginated.hasPrevious}
                    onPageChange={setContractsOverduePage}
                    onPageSizeChange={(size) => {
                      setContractsOverduePageSize(size);
                      setContractsOverduePage(0);
                    }}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Contracts Expiring Soon Tab */}
          <TabsContent value="contracts-expiring" className="mt-6">
            {contractsExpiringSoon.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  Không có hợp đồng nào sắp hết hạn trong 30 ngày tới
                </p>
              </div>
            ) : (
              <div className="space-y-4 h-[calc(100vh-240px)] flex flex-col">
                {/* TABLE AREA */}
                <div className="border rounded-lg overflow-hidden flex-1">
                  <div className="h-full overflow-x-auto overflow-y-auto">
                    <Table className="min-h-full">
                      <TableHeader className="sticky top-0 bg-secondary z-10">
                        <TableRow className="hover:bg-secondary">
                          <TableHead className="w-[100px]">Mã HĐ</TableHead>
                          <TableHead>Phòng</TableHead>
                          <TableHead>Người thuê</TableHead>
                          <TableHead>Ngày hết hạn</TableHead>
                          <TableHead className="text-center">Còn lại</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {contractsExpiringPaginated.paginatedData.map(
                          (contract) => (
                            <TableRow key={contract.id}>
                              <TableCell className="font-medium">
                                #{contract.id}
                              </TableCell>
                              <TableCell>{contract.unitName}</TableCell>
                              <TableCell>{contract.tenantName}</TableCell>
                              <TableCell>
                                {format(
                                  new Date(contract.endDate),
                                  "dd/MM/yyyy",
                                  {
                                    locale: vi,
                                  }
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={
                                    contract.daysUntilExpiry <= 7
                                      ? "destructive"
                                      : "secondary"
                                  }
                                >
                                  {contract.daysUntilExpiry} ngày
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                  <Link
                                    to={`/landlord/quan-ly-hop-dong/${contract.id}`}
                                  >
                                    Xem chi tiết
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* PAGINATION */}
                <div className="pt-2">
                  <PaginationControls
                    currentPage={contractsExpiringPage}
                    pageSize={contractsExpiringPageSize}
                    totalPages={contractsExpiringPaginated.totalPages}
                    totalElements={contractsExpiringPaginated.totalElements}
                    hasNext={contractsExpiringPaginated.hasNext}
                    hasPrevious={contractsExpiringPaginated.hasPrevious}
                    onPageChange={setContractsExpiringPage}
                    onPageSizeChange={(size) => {
                      setContractsExpiringPageSize(size);
                      setContractsExpiringPage(0);
                    }}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Invoices Overdue Tab */}
          <TabsContent value="invoices-overdue" className="mt-6">
            {invoicesOverdue.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Không có hóa đơn nào quá hạn</p>
              </div>
            ) : (
              <div className="space-y-4 h-[calc(100vh-240px)] flex flex-col">
                {/* TABLE AREA */}
                <div className="border rounded-lg overflow-hidden flex-1">
                  <div className="h-full overflow-x-auto overflow-y-auto">
                    <Table className="min-h-full">
                      <TableHeader className="sticky top-0 bg-secondary z-10">
                        <TableRow className="hover:bg-secondary">
                          <TableHead className="w-[100px]">Mã HĐ</TableHead>
                          <TableHead>Chu kỳ</TableHead>
                          <TableHead>Ngày hết hạn</TableHead>
                          <TableHead className="text-right">
                            Tổng tiền
                          </TableHead>
                          <TableHead className="text-center">
                            Số ngày quá hạn
                          </TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {invoicesOverduePaginated.paginatedData.map(
                          (invoice) => (
                            <TableRow
                              key={invoice.id}
                              className="hover:bg-destructive/5"
                            >
                              <TableCell className="font-medium">
                                {invoice.contractCode}
                              </TableCell>
                              <TableCell>{invoice.cycleMonth}</TableCell>
                              <TableCell>
                                {format(new Date(invoice.dueAt), "dd/MM/yyyy", {
                                  locale: vi,
                                })}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {invoice.totalAmount.toLocaleString("vi-VN")} đ
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge variant="destructive">
                                  {Math.abs(invoice.daysUntilDue)} ngày
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button asChild variant="outline" size="sm">
                                  <Link
                                    to={`/landlord/quan-ly-hop-dong/${invoice.contractId}`}
                                  >
                                    Xem hợp đồng
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* PAGINATION */}
                <div className="pt-2">
                  <PaginationControls
                    currentPage={invoicesOverduePage}
                    pageSize={invoicesOverduePageSize}
                    totalPages={invoicesOverduePaginated.totalPages}
                    totalElements={invoicesOverduePaginated.totalElements}
                    hasNext={invoicesOverduePaginated.hasNext}
                    hasPrevious={invoicesOverduePaginated.hasPrevious}
                    onPageChange={setInvoicesOverduePage}
                    onPageSizeChange={(size) => {
                      setInvoicesOverduePageSize(size);
                      setInvoicesOverduePage(0);
                    }}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Invoices Due Soon Tab */}
          <TabsContent value="invoices-due" className="mt-6">
            {invoicesDueSoon.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  Không có hóa đơn nào sắp đến hạn trong 10 ngày tới
                </p>
              </div>
            ) : (
              <div className="space-y-4 h-[calc(100vh-240px)] flex flex-col">
                {/* TABLE */}
                <div className="border rounded-lg overflow-hidden flex-1">
                  <div className="h-full overflow-x-auto overflow-y-auto">
                    <Table className="min-h-full">
                      <TableHeader className="sticky top-0 bg-secondary z-10">
                        <TableRow className="hover:bg-secondary">
                          <TableHead className="w-[100px]">Mã HĐ</TableHead>
                          <TableHead>Chu kỳ</TableHead>
                          <TableHead>Ngày hết hạn</TableHead>
                          <TableHead className="text-right">
                            Tổng tiền
                          </TableHead>
                          <TableHead className="text-center">Còn lại</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {invoicesDuePaginated.paginatedData.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              {invoice.contractCode}
                            </TableCell>
                            <TableCell>{invoice.cycleMonth}</TableCell>
                            <TableCell>
                              {format(new Date(invoice.dueAt), "dd/MM/yyyy", {
                                locale: vi,
                              })}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {invoice.totalAmount.toLocaleString("vi-VN")} đ
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  invoice.daysUntilDue <= 3
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {invoice.daysUntilDue} ngày
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link
                                  to={`/landlord/quan-ly-hop-dong/${invoice.contractId}`}
                                >
                                  Xem hợp đồng
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* PAGINATION */}
                <div className="pt-2">
                  <PaginationControls
                    currentPage={invoicesDuePage}
                    pageSize={invoicesDuePageSize}
                    totalPages={invoicesDuePaginated.totalPages}
                    totalElements={invoicesDuePaginated.totalElements}
                    hasNext={invoicesDuePaginated.hasNext}
                    hasPrevious={invoicesDuePaginated.hasPrevious}
                    onPageChange={setInvoicesDuePage}
                    onPageSizeChange={(size) => {
                      setInvoicesDuePageSize(size);
                      setInvoicesDuePage(0);
                    }}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ExpiryTrackingPage;
