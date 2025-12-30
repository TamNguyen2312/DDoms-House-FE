import { ContractBadge } from "@/components/contract/contract-badge";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import SitePageTitle from "@/components/site/site-page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  contractKeys,
  useExtendContractForTenant,
  useGetContractDetailForTenant,
  useGetTerminationRequest,
  useRequestContractOTP,
  useRequestTerminationOTP,
  useSignContract,
  useSubmitTerminationConsent,
  useTerminateContract,
} from "@/hooks/useContracts";
import {
  useGetInvoicesByContractForTenant,
  useGetTenantServiceInvoiceDetail,
  useInitiateInvoicePayment,
  useInitiateTenantServiceInvoicePayment,
  useSendInvoiceOTP,
  useSendTenantServiceInvoiceOTP,
} from "@/hooks/useInvoices";
import { useToast } from "@/hooks/useToast";
import { useUserProfileById } from "@/hooks/useUserProfile";
import { uploadService } from "@/services/api/upload.service";
import { useAuth } from "@/store";
import type { ContractMediaItem } from "@/types/contract.types";
import type { Invoice } from "@/types/invoice.types";
import { generateContractPDF } from "@/utils/contract-pdf-generator";
import { getBestImageUrl, handleImageError } from "@/utils/image-handler";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertTriangle,
  Building,
  Calendar,
  CalendarClock,
  CheckCircle,
  Download,
  Eye,
  FileCheck,
  FileSignature,
  FileText,
  Mail,
  MapPin,
  Phone,
  Send,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContractInvoiceDetailDialog } from "../../landlord/contracts/dialogs/contract-invoice-detail-dialog";
import { ExtendContractDialog } from "../../landlord/contracts/dialogs/extend-contract-dialog";
import { OtpDialog } from "../../landlord/contracts/dialogs/otp-dialog";
import { RequestOTPDialog } from "../../landlord/contracts/dialogs/request-otp-dialog";
import { TerminateContractDialog } from "../../landlord/contracts/dialogs/terminate-contract-dialog";
import { PayInvoiceDialog } from "./dialogs/pay-invoice-dialog";
import { PaymentResultDialog } from "./dialogs/payment-result-dialog";

const TenantContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const contractId = id ? Number(id) : 0;

  // Fetch contract detail
  const {
    data: contractDetail,
    isLoading,
    error,
  } = useGetContractDetailForTenant(contractId);

  // Fetch termination request if contract is in termination pending status
  const { data: terminationRequest, isLoading: isTerminationRequestLoading } =
    useGetTerminationRequest(
      contractDetail?.contract.status === "TERMINATION_PENDING" ? contractId : 0
    );

  // Mutations
  const { mutate: requestOTP, isPending: isRequestingOTP } =
    useRequestContractOTP();
  const { mutate: signContract, isPending: isSigning } = useSignContract();
  const { mutate: extendContract, isPending: isExtending } =
    useExtendContractForTenant();
  const { mutate: terminateContract, isPending: isTerminating } =
    useTerminateContract();
  const {
    mutate: requestTerminationOTP,
    isPending: isRequestingTerminationOTP,
  } = useRequestTerminationOTP();
  const {
    mutate: submitTerminationConsent,
    isPending: isSubmittingTerminationConsent,
  } = useSubmitTerminationConsent();

  // Dialog states
  const [isRequestOTPDialogOpen, setIsRequestOTPDialogOpen] = useState(false);
  const [isSignOtpDialogOpen, setIsSignOtpDialogOpen] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [isTerminationOtpDialogOpen, setIsTerminationOtpDialogOpen] =
    useState(false);
  const [isPayInvoiceDialogOpen, setIsPayInvoiceDialogOpen] = useState(false);
  const [isPaymentResultDialogOpen, setIsPaymentResultDialogOpen] =
    useState(false);
  const [isInvoiceDetailDialogOpen, setIsInvoiceDetailDialogOpen] =
    useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedServiceInvoiceId, setSelectedServiceInvoiceId] = useState<
    number | null
  >(null);
  const [paymentId, setPaymentId] = useState<string | number | undefined>(
    undefined
  );
  const [paymentUrl, setPaymentUrl] = useState<string | undefined>(undefined);
  const [isServicePayment, setIsServicePayment] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName: string;
    fileId?: number;
    mimeType?: string;
  } | null>(null);

  // Invoice queries and mutations - single query returns both CONTRACT and SERVICE invoices
  const { data: invoices = [], isLoading: isLoadingInvoices } =
    useGetInvoicesByContractForTenant(contractId);

  // Mutations for regular invoices (CONTRACT)
  const { mutate: sendInvoiceOTP, isPending: isSendingOTP } =
    useSendInvoiceOTP();
  const { mutate: initiatePayment, isPending: isPaying } =
    useInitiateInvoicePayment();
  // Mutations for service invoices (SERVICE)
  const { mutate: sendServiceInvoiceOTP, isPending: isSendingServiceOTP } =
    useSendTenantServiceInvoiceOTP();
  const { mutate: initiateServicePayment, isPending: isPayingService } =
    useInitiateTenantServiceInvoicePayment();
  // Fetch service invoice detail when viewing
  const {
    data: serviceInvoiceDetail,
    isLoading: isLoadingServiceInvoiceDetail,
  } = useGetTenantServiceInvoiceDetail(
    selectedServiceInvoiceId || 0,
    isInvoiceDetailDialogOpen && !!selectedServiceInvoiceId
  );

  // Get current user's party info
  const currentUserParty = contractDetail?.parties.find(
    (party) => party.userId === Number(user?.id)
  );

  // Check if user is tenant
  const isTenant = currentUserParty?.role === "TENANT";

  // Helper functions for media viewing and downloading
  const isImage = (mimeType?: string) => {
    return mimeType?.startsWith("image/") ?? false;
  };

  const isPdf = (mimeType?: string) => {
    return mimeType === "application/pdf" || mimeType?.includes("pdf");
  };

  const handleViewImage = (item: ContractMediaItem) => {
    // Try to get URL from multiple sources, prioritizing thumbnailUrl for images
    let fileUrl = item.fileUrl || item.filePath;

    // For images, prefer thumbnailUrl if available, otherwise use filePath
    if (isImage(item.mimeType) && item.thumbnailUrl) {
      fileUrl = item.thumbnailUrl;
    } else if (!fileUrl && item.thumbnailUrl) {
      fileUrl = item.thumbnailUrl;
    }

    if (fileUrl) {
      // Ensure URL is properly encoded (Firebase URLs may have special characters in query params)
      // The URL should already be properly encoded from the API, but we'll use it as-is
      // If needed, we can decode and re-encode, but usually the API provides correct URLs
      setPreviewImage({
        url: fileUrl.trim(), // Trim any whitespace
        fileName:
          item.fileName ||
          item.filePath?.split("/").pop()?.split("?")[0] || // Remove query params from filename
          `file-${item.fileId}`,
        fileId: item.fileId,
        mimeType: item.mimeType,
      });
    } else if (item.fileId) {
      toast.error("Không tìm thấy URL file");
    }
  };

  const handleDownloadFile = async (item: ContractMediaItem) => {
    if (!item.fileId) {
      toast.error("Không tìm thấy ID file");
      return;
    }

    const fileName =
      item.fileName || item.filePath?.split("/").pop() || `file-${item.fileId}`;

    try {
      const response = await uploadService.getDownloadUrl(item.fileId);
      const downloadUrl = response.data?.downloadUrl;

      if (!downloadUrl) {
        toast.error("Không thể lấy URL tải xuống");
        return;
      }

      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) {
        throw new Error("Failed to fetch file");
      }
      const blob = await fileResponse.blob();

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 200);

      toast.success("Đang tải xuống file...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Không thể tải xuống file");
    }
  };

  // Get email for OTP request (from current user party or user object)
  const otpEmail = currentUserParty?.email || user?.email || "";

  // Handle request OTP
  const handleRequestOTP = () => {
    requestOTP(
      { contractId, partyId: currentUserParty?.id || 0 },
      {
        onSuccess: () => {
          toast.success("OTP đã được gửi đến email của bạn");
          setIsRequestOTPDialogOpen(false);
          setIsSignOtpDialogOpen(true);
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Gửi OTP thất bại";
          toast.error(errorMessage);
        },
      }
    );
  };

  // Handle sign contract
  const handleSignContract = (otp: string) => {
    signContract(
      {
        contractId,
        otp,
        partyId: currentUserParty?.id || 0,
        role: "tenant",
      },
      {
        onSuccess: () => {
          toast.success("Ký hợp đồng thành công");
          setIsSignOtpDialogOpen(false);
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: contractKeys.detail(contractId),
          });
          queryClient.invalidateQueries({
            queryKey: contractKeys.allForTenant(),
          });
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Ký hợp đồng thất bại";
          toast.error(errorMessage);
        },
      }
    );
  };

  // Handle extend contract
  const handleExtendContract = (data: { newEndDate: string; note: string }) => {
    // Ensure date format is correct (YYYY-MM-DD)
    const formattedData = {
      newEndDate: data.newEndDate.split("T")[0], // Remove time component if present
      note: data.note.trim(),
    };

    extendContract(
      { contractId, data: formattedData },
      {
        onSuccess: () => {
          setIsExtendDialogOpen(false);
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: contractKeys.detail(contractId),
          });
          queryClient.invalidateQueries({
            queryKey: contractKeys.allForTenant(),
          });
        },
        onError: (error: unknown) => {
          console.error("Extend contract error:", error);
          const errorResponse = error as {
            response?: { data?: { message?: string; code?: string } };
          };
          const errorMessage =
            errorResponse?.response?.data?.message ||
            "Gửi yêu cầu gia hạn hợp đồng thất bại. Vui lòng thử lại.";

          // Show specific error message if available
          if (errorResponse?.response?.data?.code) {
            const code = errorResponse.response.data.code;
            if (code === "CONTRACT_EXTENSION_PENDING") {
              toast.error(
                "Đã có yêu cầu gia hạn đang chờ duyệt. Vui lòng chờ phản hồi từ chủ nhà."
              );
            } else {
              toast.error(errorMessage);
            }
          } else {
            toast.error(errorMessage);
          }
        },
      }
    );
  };

  // Handle terminate contract
  const handleTerminateContract = (data: {
    type: "normal_expire" | "early_terminate";
    reason: string;
  }) => {
    terminateContract(
      { contractId, data },
      {
        onSuccess: () => {
          toast.success("Hủy hợp đồng thành công");
          setIsTerminateDialogOpen(false);
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Hủy hợp đồng thất bại";
          toast.error(errorMessage);
        },
      }
    );
  };

  // Handle request termination OTP
  const handleRequestTerminationOTP = () => {
    if (!terminationRequest) return;

    requestTerminationOTP(
      {
        contractId,
        terminationRequestId: terminationRequest.id,
        data: { partyId: currentUserParty?.id || 0 },
      },
      {
        onSuccess: () => {
          toast.success("OTP đã được gửi đến email của bạn");
          setIsTerminationOtpDialogOpen(true);
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Gửi OTP thất bại";
          toast.error(errorMessage);
        },
      }
    );
  };

  // Handle submit termination consent
  const handleSubmitTerminationConsent = (otp: string) => {
    if (!terminationRequest) return;

    submitTerminationConsent(
      {
        contractId,
        terminationRequestId: terminationRequest.id,
        otp,
        partyId: currentUserParty?.id || 0,
      },
      {
        onSuccess: () => {
          setIsTerminationOtpDialogOpen(false);
        },
      }
    );
  };

  // Handle view invoice detail - works for both CONTRACT and SERVICE invoices
  const handleViewInvoice = (invoice: Invoice) => {
    if (!invoice) {
      toast.error("Hóa đơn không hợp lệ");
      return;
    }

    // Normalize invoice ID
    let invoiceId: number | string | undefined = invoice.id;
    const invoiceWithId = invoice as Invoice & { invoiceId?: number | string };
    if (!invoiceId && invoiceWithId.invoiceId) {
      invoiceId = invoiceWithId.invoiceId;
    }

    if (!invoiceId || invoiceId === 0) {
      toast.error("Hóa đơn không hợp lệ: thiếu mã hóa đơn");
      return;
    }

    const normalizedInvoiceId =
      typeof invoiceId === "string" ? parseInt(invoiceId, 10) : invoiceId;

    if (isNaN(normalizedInvoiceId) || normalizedInvoiceId <= 0) {
      toast.error("Mã hóa đơn không hợp lệ");
      return;
    }

    // If it's a service invoice, we need to fetch detail from API
    if (invoice.type === "SERVICE") {
      setSelectedServiceInvoiceId(normalizedInvoiceId);
      setSelectedInvoice(null); // Clear regular invoice
    } else {
      // For regular invoices, use the invoice data directly
      setSelectedInvoice(invoice);
      setSelectedServiceInvoiceId(null); // Clear service invoice ID
    }
    setIsInvoiceDetailDialogOpen(true);
  };

  // Handle pay invoice - works for both CONTRACT and SERVICE invoices
  const handlePayInvoice = (invoice: Invoice) => {
    if (!invoice) {
      toast.error("Hóa đơn không hợp lệ");
      return;
    }

    // Normalize invoice ID - handle different possible formats
    let invoiceId: number | string | undefined = invoice.id;

    // Try alternative field names
    const invoiceWithId = invoice as Invoice & { invoiceId?: number | string };
    if (!invoiceId && invoiceWithId.invoiceId) {
      invoiceId = invoiceWithId.invoiceId;
    }

    // Validate invoiceId
    if (!invoiceId && invoiceId !== 0) {
      console.error("Invalid invoice - missing ID:", invoice);
      toast.error("Hóa đơn không hợp lệ: thiếu mã hóa đơn");
      return;
    }

    // Create normalized invoice object with guaranteed id
    const normalizedInvoice: Invoice = {
      ...invoice,
      id: invoiceId,
    };

    setSelectedInvoice(normalizedInvoice);
    setIsPayInvoiceDialogOpen(true);
  };

  // Handle send invoice OTP - handles both CONTRACT and SERVICE invoices
  const handleSendInvoiceOTP = () => {
    if (!selectedInvoice) {
      toast.error("Không tìm thấy hóa đơn được chọn");
      return;
    }

    // Check invoice status
    if (selectedInvoice.status === "PAID") {
      toast.error("Hóa đơn này đã được thanh toán.");
      return;
    }
    if (
      selectedInvoice.status !== "ISSUED" &&
      selectedInvoice.status !== "OVERDUE"
    ) {
      toast.error(
        `Hóa đơn không ở trạng thái phù hợp để thanh toán. Trạng thái hiện tại: ${selectedInvoice.status}`
      );
      return;
    }

    // Validate invoice contractId matches current contract
    if (
      selectedInvoice.contractId &&
      String(selectedInvoice.contractId) !== String(contractId)
    ) {
      toast.error("Hóa đơn không thuộc hợp đồng này.");
      console.error("Invoice contractId mismatch:", {
        invoiceContractId: selectedInvoice.contractId,
        currentContractId: contractId,
      });
      return;
    }

    // Validate invoice ID - handle both string and number
    let invoiceId: number;
    if (typeof selectedInvoice.id === "string") {
      invoiceId = parseInt(selectedInvoice.id, 10);
    } else if (typeof selectedInvoice.id === "number") {
      invoiceId = selectedInvoice.id;
    } else {
      toast.error("Không tìm thấy mã hóa đơn hợp lệ");
      console.error(
        "Invalid invoice ID type:",
        typeof selectedInvoice.id,
        selectedInvoice
      );
      return;
    }

    if (isNaN(invoiceId) || invoiceId <= 0) {
      toast.error("Mã hóa đơn không hợp lệ");
      console.error(
        "Invalid invoice ID value:",
        invoiceId,
        "from:",
        selectedInvoice.id
      );
      return;
    }

    // Check invoice type and call appropriate API
    const isServiceInvoice = selectedInvoice.type === "SERVICE";

    if (isServiceInvoice) {
      // Service invoice OTP API
      sendServiceInvoiceOTP(invoiceId, {
        onSuccess: () => {
          // OTP sent successfully, form will show OTP input
        },
        onError: (error: unknown) => {
          const errorData = (
            error as {
              response?: { data?: { code?: string; message?: string } };
            }
          )?.response?.data;
          console.error("sendServiceInvoiceOTP error in handler:", {
            error,
            errorCode: errorData?.code,
            errorMessage: errorData?.message,
          });
        },
      });
    } else {
      // Regular invoice OTP API
      sendInvoiceOTP(
        { contractId, invoiceId },
        {
          onSuccess: () => {
            // OTP sent successfully, form will show OTP input
          },
          onError: (error: unknown) => {
            const errorData = (
              error as {
                response?: { data?: { code?: string; message?: string } };
              }
            )?.response?.data;
            console.error("sendInvoiceOTP error in handler:", {
              error,
              errorCode: errorData?.code,
              errorMessage: errorData?.message,
            });
          },
        }
      );
    }
  };

  // Handle initiate payment - handles both CONTRACT and SERVICE invoices
  const handleInitiatePayment = (data: {
    provider: string;
    otpCode: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
  }) => {
    if (!selectedInvoice) {
      toast.error("Không tìm thấy hóa đơn được chọn");
      return;
    }

    // Validate invoice ID - handle both string and number
    let invoiceId: number;
    if (typeof selectedInvoice.id === "string") {
      invoiceId = parseInt(selectedInvoice.id, 10);
    } else if (typeof selectedInvoice.id === "number") {
      invoiceId = selectedInvoice.id;
    } else {
      toast.error("Không tìm thấy mã hóa đơn hợp lệ");
      console.error(
        "Invalid invoice ID type:",
        typeof selectedInvoice.id,
        selectedInvoice
      );
      return;
    }

    if (isNaN(invoiceId) || invoiceId <= 0) {
      toast.error("Mã hóa đơn không hợp lệ");
      console.error(
        "Invalid invoice ID value:",
        invoiceId,
        "from:",
        selectedInvoice.id
      );
      return;
    }

    const returnUrl = `${window.location.origin}/tenant/payments/result/success`;
    const cancelUrl = `${window.location.origin}/tenant/payments/result/cancel`;

    // Check invoice type and call appropriate API
    const isServiceInvoice = selectedInvoice.type === "SERVICE";

    if (isServiceInvoice) {
      // Service invoice payment API
      initiateServicePayment(
        {
          serviceInvoiceId: invoiceId,
          data: {
            provider: data.provider as "PAYOS" | "VNPAY" | "MOMO",
            otpCode: data.otpCode,
            returnUrl,
            cancelUrl,
            metadata: {
              buyerName: data.buyerName,
              buyerEmail: data.buyerEmail,
              buyerPhone: data.buyerPhone,
            },
          },
        },
        {
          onSuccess: (response) => {
            setIsPayInvoiceDialogOpen(false);
            setSelectedInvoice(null);

            const responseData = response.data;

            if (responseData?.paymentId) {
              setPaymentId(responseData.paymentId);
            }

            if (responseData?.paymentUrl) {
              setPaymentUrl(responseData.paymentUrl);
            }

            setIsServicePayment(true);
            setIsPaymentResultDialogOpen(true);
          },
          onError: (error: unknown) => {
            const errorMessage =
              (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || "Thanh toán thất bại";
            toast.error(errorMessage);
          },
        }
      );
    } else {
      // Regular invoice payment API
      initiatePayment(
        {
          contractId,
          invoiceId,
          data: {
            provider: data.provider as "PAYOS" | "VNPAY" | "MOMO",
            otpCode: data.otpCode,
            returnUrl,
            cancelUrl,
            metadata: {
              buyerName: data.buyerName,
              buyerEmail: data.buyerEmail,
              buyerPhone: data.buyerPhone,
            },
          },
        },
        {
          onSuccess: (response) => {
            setIsPayInvoiceDialogOpen(false);
            setSelectedInvoice(null);

            const responseData = response.data;

            if (responseData?.paymentId) {
              setPaymentId(responseData.paymentId);
            }

            if (responseData?.paymentUrl) {
              setPaymentUrl(responseData.paymentUrl);
            }

            setIsServicePayment(false);
            setIsPaymentResultDialogOpen(true);
          },
          onError: (error: unknown) => {
            const errorMessage =
              (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || "Thanh toán thất bại";
            toast.error(errorMessage);
          },
        }
      );
    }
  };

  // Handle dialog close - reload data when dialog is closed
  const handlePayInvoiceDialogClose = (open: boolean) => {
    setIsPayInvoiceDialogOpen(open);
    if (!open) {
      setSelectedInvoice(null);
      // Reload data when dialog is closed
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(contractId),
      });
      queryClient.invalidateQueries({
        queryKey: [...contractKeys.detail(contractId), "tenant"],
      });
      queryClient.invalidateQueries({
        queryKey: ["invoices", "contract", contractId, "tenant"],
      });
    }
  };

  // Get landlord and tenant userIds for fetching profiles (BEFORE early return)
  // Must extract userIds before early return to ensure hooks are always called
  const landlordUserId = contractDetail?.parties.find(
    (p) => p.role === "LANDLORD"
  )?.userId;
  const tenantUserId = contractDetail?.parties.find(
    (p) => p.role === "TENANT"
  )?.userId;

  // Fetch user profiles for additional information (MUST be before early return)
  // Hooks must always be called in the same order, so we use 0 as fallback
  const { data: landlordProfile } = useUserProfileById(
    landlordUserId || 0,
    !!landlordUserId && !!contractDetail
  );
  const { data: tenantProfile } = useUserProfileById(
    tenantUserId || 0,
    !!tenantUserId && !!contractDetail
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>Đang tải thông tin hợp đồng...</p>
      </div>
    );
  }

  if (error || !contractDetail) {
    return (
      <div className="flex items-center justify-center py-8">
        <p>Không tìm thấy hợp đồng hoặc có lỗi xảy ra</p>
      </div>
    );
  }

  const { contract, versions, parties, signatures } = contractDetail;
  console.log("🚀 ~ TenantContractDetail ~ contract:", contract);
  const landlord = parties.find((p) => p.role === "LANDLORD");
  const tenant = parties.find((p) => p.role === "TENANT");

  // Calculate days remaining until contract end date
  const calculateDaysRemaining = () => {
    const endDate = new Date(contract.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();
  const shouldShowExtendButton =
    contract.status === "SIGNED" || contract.status === "ACTIVE";

  // Check if current user has signed
  const userSignature = signatures.find(
    (sig) => sig.partyId === currentUserParty?.id
  );
  const hasUserSigned = !!userSignature;

  // Check if all parties have signed
  const allPartiesSigned =
    parties.length > 0 && signatures.length >= parties.length;

  return (
    <div className="mx-auto space-y-4">
      <div className="">
        <SitePageTitle
          title={`Hợp đồng #${contract.id}`}
          subTitle="Chi tiết hợp đồng thuê phòng"
          hideCreate={true}
          hidePrint={true}
          hideImport={true}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Quay lại
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            if (contractDetail) {
              generateContractPDF(
                contractDetail,
                landlordProfile,
                tenantProfile
              );
              toast.success("Đang tải file PDF...");
            }
          }}
        >
          <Download className="mr-2 size-4" />
          Tải PDF
        </Button>

        {isTenant && (
          <Badge
            variant={hasUserSigned ? "default" : "secondary"}
            className={`flex items-center gap-2 ${
              hasUserSigned
                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
            }`}
          >
            {hasUserSigned ? (
              <>
                <CheckCircle className="size-4" />
                <span>Đã ký</span>
              </>
            ) : (
              <>
                <XCircle className="size-4" />
                <span>Chưa ký</span>
              </>
            )}
          </Badge>
        )}
      </div>

      {/* Grid layout: Chi tiết hợp đồng và Phiên bản hợp đồng */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
        {/* Chi tiết hợp đồng - 7 phần */}
        <Card className="shadow-sm lg:col-span-7">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <FileText className="size-4 text-primary" />
                </div>
                Chi tiết hợp đồng
              </CardTitle>
              <ContractBadge status={contract.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contract Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ngày bắt đầu</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  <p className="text-sm font-semibold">
                    {format(new Date(contract.startDate), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ngày kết thúc</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  <p className="text-sm font-semibold">
                    {format(new Date(contract.endDate), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Ngày tạo</p>
                <p className="text-sm font-medium">
                  {format(new Date(contract.createdAt), "dd/MM/yyyy HH:mm")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tiền thuê phòng</p>
                <p className="text-sm font-semibold text-green-700">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0,
                  }).format(contract.depositAmount)}
                </p>
              </div>
              {contract.pendingEndDate && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Ngày kết thúc dự kiến
                  </p>
                  <div className="flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 text-primary" />
                    <p className="text-sm font-semibold">
                      {format(new Date(contract.pendingEndDate), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Unit Information */}
            {contract.unit && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Thông tin phòng
                </p>
                <div className="space-y-2 p-2.5 rounded-lg border bg-muted/30">
                  <div className="flex items-start gap-2">
                    <Building className="size-3.5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Mã phòng</p>
                      <p className="text-sm font-semibold">
                        {contract.unit.unitCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="size-3.5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Tên tòa nhà
                      </p>
                      <p className="text-sm font-medium">
                        {contract.unit.propertyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="size-3.5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Địa chỉ</p>
                      <p className="text-sm">
                        {contract.unit.addressLine}
                        {contract.unit.ward && `, ${contract.unit.ward}`}
                        {contract.unit.district &&
                          `, ${contract.unit.district}`}
                        {contract.unit.city && `, ${contract.unit.city}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Parties Info với Signature Status */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Các bên liên quan
              </p>
              {landlord && (
                <div
                  className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                    currentUserParty?.id === landlord.id && hasUserSigned
                      ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800"
                      : "bg-blue-50/50 dark:bg-blue-950/10"
                  }`}
                >
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-1 mt-0.5 shrink-0">
                    <User className="size-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">Chủ nhà</p>
                      {(() => {
                        const landlordSignature = signatures.find(
                          (sig) => sig.partyId === landlord.id
                        );
                        const hasLandlordSigned = !!landlordSignature;
                        return hasLandlordSigned ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800 text-[10px]"
                          >
                            <CheckCircle className="mr-0.5 size-2.5" />
                            Đã ký
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-[10px]"
                          >
                            Chờ ký
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="space-y-1">
                      {(landlordProfile?.landlordProfile?.displayName ||
                        contract.landlord?.displayName) && (
                        <div className="flex items-center gap-1.5">
                          <User className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-xs font-medium truncate">
                            {landlordProfile?.landlordProfile?.displayName ||
                              contract.landlord?.displayName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-xs truncate">
                          {landlord.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-xs">{landlord.phone}</span>
                      </div>
                      {landlordProfile?.landlordProfile?.verified && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="size-3 text-green-600 shrink-0" />
                          <span className="text-xs text-green-600">
                            Đã xác thực
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {tenant && (
                <div
                  className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                    currentUserParty?.id === tenant.id && hasUserSigned
                      ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800"
                      : "bg-green-50/50 dark:bg-green-950/10"
                  }`}
                >
                  <div className="rounded-full bg-green-100 dark:bg-green-900 p-1 mt-0.5 shrink-0">
                    <User className="size-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold">Người thuê</p>
                      {(() => {
                        const tenantSignature = signatures.find(
                          (sig) => sig.partyId === tenant.id
                        );
                        const hasTenantSigned = !!tenantSignature;
                        return hasTenantSigned ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800 text-[10px]"
                          >
                            <CheckCircle className="mr-0.5 size-2.5" />
                            Đã ký
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-[10px]"
                          >
                            Chờ ký
                          </Badge>
                        );
                      })()}
                    </div>
                    <div className="space-y-1">
                      {contract.tenant?.displayName && (
                        <div className="flex items-center gap-1.5">
                          <User className="size-3 text-muted-foreground shrink-0" />
                          <span className="text-xs truncate">
                            {contract.tenant.displayName}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Mail className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-xs truncate">{tenant.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="size-3 text-muted-foreground shrink-0" />
                        <span className="text-xs">{tenant.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Contract Media */}
            {contract.media && contract.media.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Tệp tin hợp đồng
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {contract.media
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((item) => {
                      // Get best URL using utility function
                      const fileUrl = getBestImageUrl(
                        item.thumbnailUrl,
                        item.filePath,
                        item.fileUrl,
                        isImage(item.mimeType)
                      );
                      // Get fallback URL
                      const fallbackUrl =
                        item.thumbnailUrl && item.filePath
                          ? fileUrl === item.thumbnailUrl
                            ? item.filePath
                            : item.thumbnailUrl
                          : null;
                      return (
                        <div
                          key={item.id}
                          className="relative group border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
                        >
                          {fileUrl &&
                          (isImage(item.mimeType) || isPdf(item.mimeType)) ? (
                            <div className="relative">
                              {isImage(item.mimeType) && fileUrl ? (
                                <img
                                  src={fileUrl}
                                  alt={item.fileName || `file-${item.fileId}`}
                                  className="w-full h-24 object-cover cursor-pointer"
                                  onClick={() => handleViewImage(item)}
                                  onError={(e) => {
                                    handleImageError(e, fallbackUrl);
                                  }}
                                />
                              ) : (
                                <div
                                  className="w-full h-24 flex flex-col items-center justify-center bg-red-50 dark:bg-red-950/20 cursor-pointer"
                                  onClick={() => handleViewImage(item)}
                                >
                                  <FileText className="size-8 text-red-600 dark:text-red-400 mb-1" />
                                  <span className="text-[10px] text-red-700 dark:text-red-300 font-medium">
                                    PDF
                                  </span>
                                </div>
                              )}
                              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="h-7 w-7 bg-white/90 hover:bg-white text-black"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewImage(item);
                                  }}
                                  title={
                                    isPdf(item.mimeType) ? "Xem PDF" : "Xem ảnh"
                                  }
                                >
                                  <Eye className="size-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  className="h-7 w-7 bg-white/90 hover:bg-white text-black"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadFile(item);
                                  }}
                                  title="Tải xuống"
                                >
                                  <Download className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-24 flex items-center justify-center bg-muted">
                              <FileText className="size-6 text-muted-foreground" />
                            </div>
                          )}
                          {item.fileName && (
                            <div className="p-2 bg-muted/50">
                              <p
                                className="text-xs truncate"
                                title={item.fileName}
                              >
                                {item.fileName}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phiên bản hợp đồng - 3 phần */}
        <Card className="shadow-sm lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <FileText className="size-4 text-primary" />
              </div>
              Phiên bản hợp đồng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-3 space-y-2"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      {version.versionNo === 1
                        ? "Hợp đồng thuê nhà lần đầu"
                        : `Hợp đồng gia hạn - Phiên bản ${version.versionNo}`}
                    </p>
                    {version.createdAt && (
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(version.createdAt),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                    )}
                  </div>
                  <div className="bg-muted rounded p-2">
                    <p className="text-xs whitespace-pre-wrap line-clamp-6">
                      {version.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Điều khoản và chi phí */}
      {contract.feeDetail && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <FileCheck className="size-4 text-primary" />
              </div>
              Điều khoản và chi phí
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                // Parse sections: format "NUMBER. Title\n\nContent\n\nNUMBER. Title..."
                const sections: Array<{
                  number: string;
                  title: string;
                  content: string;
                }> = [];
                const parts = contract.feeDetail.split(/\n\n+/);

                for (let i = 0; i < parts.length; i++) {
                  const part = parts[i].trim();
                  if (!part) continue;

                  // Check if this part starts with "NUMBER. " pattern
                  const match = part.match(/^(\d+)\.\s*(.+)$/s);
                  if (match) {
                    const number = match[1];
                    const rest = match[2];

                    // Check if there's content in the next part (not starting with number)
                    let content = "";
                    if (i + 1 < parts.length) {
                      const nextPart = parts[i + 1].trim();
                      // If next part doesn't start with number, it's content
                      if (nextPart && !/^\d+\./.test(nextPart)) {
                        content = nextPart;
                        i++; // Skip the next part as we've used it
                      }
                    }

                    // Remove trailing colon from title if present
                    const title = rest.replace(/:\s*$/, "");

                    sections.push({ number, title, content });
                  }
                }

                return sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                        {section.number}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h4 className="text-sm font-semibold text-foreground">
                          {section.title}
                        </h4>
                        {section.content && (
                          <div className="bg-muted/50 rounded-md p-3">
                            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                              {section.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signatures */}
      <Card>
        <CardHeader>
          <CardTitle>Xác nhận hợp đồng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Request OTP Button - Only show if not signed and status is SENT */}
          {isTenant && contract.status === "SENT" && !hasUserSigned && (
            <div className="flex justify-center py-4 gap-2">
              <Button
                onClick={() => setIsRequestOTPDialogOpen(true)}
                disabled={isRequestingOTP}
                variant="outline"
              >
                <Send className="mr-2 size-4" />
                Yêu cầu OTP để ký
              </Button>
              <Button
                onClick={() => setIsSignOtpDialogOpen(true)}
                variant="default"
              >
                <FileSignature className="mr-2 size-4" />
                Nhập OTP đã có
              </Button>
            </div>
          )}

          {/* Signatures List */}
          {signatures.length > 0 ? (
            <div className="space-y-3">
              {signatures.map((signature, index) => {
                const party = parties.find((p) => p.id === signature.partyId);
                const isCurrentUserSignature =
                  signature.partyId === currentUserParty?.id;
                return (
                  <div
                    key={signature.id || index}
                    className={`border rounded-lg p-3 bg-green-50 border-green-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {party?.role === "LANDLORD"
                            ? "Chủ nhà"
                            : "Người thuê"}
                          {isCurrentUserSignature && (
                            <span className="ml-2 text-green-600">(Bạn)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {party?.email}
                        </p>
                      </div>
                      {signature.signedAt && (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          <CheckCircle className="mr-1 size-3" />
                          Đã ký
                        </Badge>
                      )}
                    </div>
                    {signature.signedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Đã ký lúc:{" "}
                        {format(
                          new Date(signature.signedAt),
                          "dd/MM/yyyy HH:mm"
                        )}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Chưa có chữ ký nào</p>
            </div>
          )}

          {/* All Parties Status */}
          {parties.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Tổng số bên: {parties.length}
                </span>
                <span className="text-muted-foreground">
                  Đã ký: {signatures.length}/{parties.length}
                </span>
              </div>
              {allPartiesSigned && (
                <Badge
                  variant="default"
                  className="mt-2 bg-green-100 text-green-800 border-green-200"
                >
                  <CheckCircle className="mr-1 size-3" />
                  Tất cả các bên đã ký
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extend & Terminate Contract Section - Side by Side */}
      {(shouldShowExtendButton ||
        contract.status === "TERMINATION_PENDING" ||
        contract.status === "SIGNED") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Extend Contract Card */}
          {shouldShowExtendButton && (
            <Card className="relative overflow-hidden border-2 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-orange-50/30 to-transparent dark:from-orange-950/20 dark:via-orange-950/10 dark:to-transparent pointer-events-none" />

              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                    <CalendarClock className="size-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                    Gia hạn hợp đồng
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4 flex flex-col h-full">
                {/* Status Alert */}
                {daysRemaining < 0 ? (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 shadow-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-200/20 dark:bg-red-800/20 rounded-full blur-xl -mr-12 -mt-12" />
                    <div className="relative flex items-start gap-3">
                      <div className="shrink-0 p-2 rounded-lg bg-red-500/10 dark:bg-red-500/20">
                        <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                          Hợp đồng đã hết hạn
                        </h4>
                        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                          Hết hạn:{" "}
                          <span className="font-semibold">
                            {format(new Date(contract.endDate), "dd/MM/yyyy")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : daysRemaining <= 7 ? (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50/50 dark:from-amber-950/30 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-800 p-4 shadow-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/20 dark:bg-amber-800/20 rounded-full blur-xl -mr-12 -mt-12" />
                    <div className="relative flex items-start gap-3">
                      <div className="shrink-0 p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                        <CalendarClock className="size-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                          Sắp hết hạn
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                          Còn{" "}
                          <span className="font-bold text-amber-900 dark:text-amber-100">
                            {daysRemaining} ngày
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 p-4 shadow-md">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-xl -mr-12 -mt-12" />
                    <div className="relative flex items-start gap-3">
                      <div className="shrink-0 p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                        <CalendarClock className="size-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Thông tin gia hạn
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          Hết hạn:{" "}
                          <span className="font-semibold">
                            {format(new Date(contract.endDate), "dd/MM/yyyy")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex-1 flex items-end pt-2">
                  <Button
                    onClick={() => setIsExtendDialogOpen(true)}
                    disabled={isExtending}
                    size="lg"
                    className="w-full relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-base font-semibold"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center justify-center gap-3">
                      <CalendarClock className="size-5" />
                      <span>Gia hạn hợp đồng</span>
                    </div>
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-center text-muted-foreground">
                    Yêu cầu sẽ được gửi đến chủ nhà để xem xét
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terminate Contract Card */}
          {(contract.status === "TERMINATION_PENDING" ||
            contract.status === "SIGNED" ||
            contract.status === "ACTIVE") && (
            <Card className="relative overflow-hidden border-2 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-red-50/30 to-transparent dark:from-red-950/20 dark:via-red-950/10 dark:to-transparent pointer-events-none" />

              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-md">
                    <Trash2 className="size-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                    Hủy hợp đồng
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4 flex flex-col h-full">
                {/* Terminate contract button - only show for active contracts */}
                {(contract.status === "SIGNED" ||
                  contract.status === "ACTIVE") && (
                  <>
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 shadow-md">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-red-200/20 dark:bg-red-800/20 rounded-full blur-xl -mr-12 -mt-12" />
                      <div className="relative flex items-start gap-3">
                        <div className="shrink-0 p-2 rounded-lg bg-red-500/10 dark:bg-red-500/20">
                          <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                            Hủy hợp đồng
                          </h4>
                          <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
                            Hủy hợp đồng sẽ chấm dứt việc thuê phòng. Vui lòng
                            cân nhắc kỹ trước khi thực hiện.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex items-end pt-2">
                      <Button
                        variant="destructive"
                        onClick={() => setIsTerminateDialogOpen(true)}
                        disabled={isTerminating}
                        size="lg"
                        className="w-full relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-base font-semibold"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center justify-center gap-3">
                          <Trash2 className="size-5" />
                          <span>Hủy hợp đồng</span>
                        </div>
                      </Button>
                    </div>

                    <div className="pt-2 border-t border-red-200 dark:border-red-800">
                      <p className="text-xs text-center text-muted-foreground">
                        Hành động này không thể hoàn tác
                      </p>
                    </div>
                  </>
                )}

                {/* Show termination request details when status is TERMINATION_PENDING */}
                {contract.status === "TERMINATION_PENDING" && (
                  <div className="space-y-4 flex-1">
                    {isTerminationRequestLoading ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                          Đang tải thông tin hủy hợp đồng...
                        </p>
                      </div>
                    ) : terminationRequest ? (
                      <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800 p-4 shadow-md">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-red-200/20 dark:bg-red-800/20 rounded-full blur-xl -mr-12 -mt-12" />
                          <div className="relative space-y-3">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-red-900 dark:text-red-100">
                                Trạng thái:{" "}
                              </p>
                              <Badge
                                variant="outline"
                                className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 text-[10px]"
                              >
                                {terminationRequest.type === "EARLY_TERMINATE"
                                  ? "Hủy sớm"
                                  : "Hết hạn"}
                              </Badge>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-red-900 dark:text-red-100 mb-1.5">
                                Lý do hủy:
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg leading-relaxed">
                                {terminationRequest.reason}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-red-900 dark:text-red-100 mb-1">
                                Ngày yêu cầu:
                              </p>
                              <p className="text-xs text-red-700 dark:text-red-300">
                                {format(
                                  new Date(terminationRequest.createdAt),
                                  "dd/MM/yyyy HH:mm"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-red-900 dark:text-red-100">
                            Trạng thái đồng ý:
                          </p>
                          <div className="space-y-2">
                            {terminationRequest.consents.map((consent) => {
                              const party = parties.find(
                                (p) => p.id === consent.partyId
                              );
                              const isCurrentUserConsent =
                                consent.userId === Number(user?.id);

                              return (
                                <div
                                  key={consent.id}
                                  className={`flex items-center justify-between p-2.5 rounded-lg border ${
                                    isCurrentUserConsent
                                      ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                                      : "bg-muted border-border"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">
                                      {party?.role === "LANDLORD"
                                        ? "Chủ nhà"
                                        : "Người thuê"}
                                      {isCurrentUserConsent && (
                                        <span className="ml-1 text-blue-600 dark:text-blue-400">
                                          (Bạn)
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isCurrentUserConsent &&
                                      consent.status === "PENDING" && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={
                                              handleRequestTerminationOTP
                                            }
                                            disabled={
                                              isRequestingTerminationOTP
                                            }
                                            className="h-7 text-xs px-2"
                                          >
                                            {isRequestingTerminationOTP
                                              ? "Đang gửi..."
                                              : "Yêu cầu OTP"}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() =>
                                              setIsTerminationOtpDialogOpen(
                                                true
                                              )
                                            }
                                            className="h-7 text-xs px-2"
                                          >
                                            Nhập OTP
                                          </Button>
                                        </>
                                      )}
                                    <Badge
                                      variant={
                                        consent.status === "SIGNED"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={
                                        consent.status === "SIGNED"
                                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800 text-[10px]"
                                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-[10px]"
                                      }
                                    >
                                      {consent.status === "SIGNED"
                                        ? "Đã đồng ý"
                                        : "Chờ đồng ý"}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Không tìm thấy thông tin yêu cầu hủy hợp đồng
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Invoices Section - includes both CONTRACT and SERVICE invoices */}
      <InvoiceList
        invoices={invoices}
        isLoading={isLoadingInvoices}
        showViewButton={true}
        showPayButton={true}
        onView={handleViewInvoice}
        onPay={handlePayInvoice}
      />

      {/* Dialogs */}
      <RequestOTPDialog
        open={isRequestOTPDialogOpen}
        onOpenChange={setIsRequestOTPDialogOpen}
        onConfirm={handleRequestOTP}
        isPending={isRequestingOTP}
        email={otpEmail}
      />

      <OtpDialog
        open={isSignOtpDialogOpen}
        onOpenChange={setIsSignOtpDialogOpen}
        onSubmit={handleSignContract}
        isPending={isSigning}
        title="Ký hợp đồng"
        description="Nhập mã OTP 6 số đã được gửi đến email của bạn để ký hợp đồng."
        submitText="Xác nhận ký"
        icon="sign"
      />

      {contract && (
        <ExtendContractDialog
          open={isExtendDialogOpen}
          onOpenChange={setIsExtendDialogOpen}
          currentEndDate={contract.endDate}
          onSubmit={handleExtendContract}
          isPending={isExtending}
        />
      )}

      <TerminateContractDialog
        open={isTerminateDialogOpen}
        onOpenChange={setIsTerminateDialogOpen}
        onSubmit={handleTerminateContract}
        isPending={isTerminating}
      />

      <OtpDialog
        open={isTerminationOtpDialogOpen}
        onOpenChange={setIsTerminationOtpDialogOpen}
        onSubmit={handleSubmitTerminationConsent}
        isPending={isSubmittingTerminationConsent}
        title="Xác nhận hủy hợp đồng"
        description="Nhập mã 6 số đã được gửi đến email của bạn để xác nhận hủy hợp đồng."
        submitText="Xác nhận hủy hợp đồng"
        icon="terminate"
      />

      <PayInvoiceDialog
        open={isPayInvoiceDialogOpen}
        onOpenChange={handlePayInvoiceDialogClose}
        invoice={selectedInvoice}
        onSendOTP={handleSendInvoiceOTP}
        onPay={handleInitiatePayment}
        isSendingOTP={isSendingOTP || isSendingServiceOTP}
        isPaying={isPaying || isPayingService}
      />

      <PaymentResultDialog
        open={isPaymentResultDialogOpen}
        onOpenChange={(open) => {
          setIsPaymentResultDialogOpen(open);
          setIsServicePayment(false);
          if (!open) {
            setPaymentId(undefined);
            setPaymentUrl(undefined);
            // Reload contract detail and invoices data when dialog closes
            queryClient.invalidateQueries({
              queryKey: contractKeys.detail(contractId),
            });
            queryClient.invalidateQueries({
              queryKey: [...contractKeys.detail(contractId), "tenant"],
            });
            queryClient.invalidateQueries({
              queryKey: ["invoices", "contract", contractId, "tenant"],
            });
            queryClient.invalidateQueries({
              queryKey: contractKeys.allForTenant(),
            });
          }
        }}
        paymentId={paymentId}
        paymentUrl={paymentUrl}
        isServicePayment={isServicePayment}
        onSuccess={() => {
          // Additional success handling if needed
          setIsPaymentResultDialogOpen(false);
        }}
      />

      {/* Invoice Detail Dialog */}
      <ContractInvoiceDetailDialog
        open={isInvoiceDetailDialogOpen}
        onOpenChange={(open) => {
          setIsInvoiceDetailDialogOpen(open);
          if (!open) {
            // Reset states when dialog closes
            setSelectedInvoice(null);
            setSelectedServiceInvoiceId(null);
          }
        }}
        invoice={
          selectedServiceInvoiceId && serviceInvoiceDetail
            ? serviceInvoiceDetail
            : selectedInvoice
        }
        isLoading={
          selectedServiceInvoiceId ? isLoadingServiceInvoiceDetail : false
        }
      />

      {/* File Preview Dialog (Image & PDF) */}
      {previewImage && (
        <Dialog
          open={!!previewImage}
          onOpenChange={() => setPreviewImage(null)}
        >
          <DialogContent className="!max-w-[100vw] !w-screen !h-screen !max-h-screen !p-0 !m-0 !rounded-none flex flex-col overflow-hidden">
            <DialogHeader className="px-6 pt-4 pb-2 flex-shrink-0 border-b">
              <DialogTitle className="text-base font-medium truncate">
                {previewImage.fileName}
              </DialogTitle>
            </DialogHeader>
            <div className="relative flex items-center justify-center flex-1 min-h-0 bg-black/5 overflow-hidden">
              {isPdf(previewImage.mimeType) ? (
                <iframe
                  src={previewImage.url}
                  className="w-full h-full border-0"
                  style={{ width: "100%", height: "100%" }}
                  title={previewImage.fileName}
                  onError={(e) => {
                    console.error("Error loading PDF:", e);
                    toast.error(
                      "Không thể tải file PDF. Vui lòng thử tải xuống."
                    );
                  }}
                />
              ) : (
                <img
                  src={previewImage.url}
                  alt={previewImage.fileName}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                  onError={(e) => {
                    console.error("Error loading image:", e);
                    const target = e.target as HTMLImageElement;
                    toast.error(
                      "Không thể tải hình ảnh. URL có thể đã hết hạn."
                    );
                    // Optionally set a fallback or hide the image
                    target.style.display = "none";
                  }}
                />
              )}
            </div>
            <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewImage(null)}
              >
                Đóng
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (previewImage.fileId) {
                    try {
                      const response = await uploadService.getDownloadUrl(
                        previewImage.fileId
                      );
                      const downloadUrl = response.data?.downloadUrl;

                      if (!downloadUrl) {
                        toast.error("Không thể lấy URL tải xuống");
                        return;
                      }

                      const fileResponse = await fetch(downloadUrl);
                      if (!fileResponse.ok) {
                        throw new Error("Failed to fetch file");
                      }
                      const blob = await fileResponse.blob();

                      const blobUrl = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = previewImage.fileName;
                      link.style.display = "none";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                      }, 200);

                      toast.success("Đang tải xuống file...");
                    } catch (error) {
                      console.error("Download error:", error);
                      toast.error("Không thể tải xuống file");
                    }
                  } else if (previewImage.url) {
                    const link = document.createElement("a");
                    link.href = previewImage.url;
                    link.download = previewImage.fileName;
                    link.style.display = "none";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }}
              >
                <Download className="mr-2 size-4" />
                Tải xuống
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TenantContractDetail;
