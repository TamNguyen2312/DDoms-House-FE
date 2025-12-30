import { ContractBadge } from "@/components/contract/contract-badge";
import { InvoiceList } from "@/components/invoices/InvoiceList";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAddContractMedia,
  useAddContractPartyMedia,
  useAddContractVersionMedia,
  useExtendDecision,
  useGetContractDetail,
  useGetContractMedia,
  useGetContractPartyMedia,
  useGetContractVersionMedia,
  useGetExtensionRequests,
  useGetTerminationRequest,
  useRemoveContractMedia,
  useRemoveContractPartyMedia,
  useRemoveContractVersionMedia,
  useRequestContractOTP,
  useRequestTerminationOTP,
  useSignContract,
  useSubmitTerminationConsent,
  useTerminateContract,
} from "@/hooks/useContracts";
import {
  useCreateInvoiceFromContract,
  useCreateServiceInvoice,
  useGetInvoiceDetail,
  useGetInvoicesByContract,
  useGetServiceInvoiceDetail,
} from "@/hooks/useInvoices";
import { useToast } from "@/hooks/useToast";
import { useUserProfileById } from "@/hooks/useUserProfile";
import { InvoiceDetailDialog } from "@/pages/landlord/invoices/dialogs/invoice-detail-dialog";
import { uploadService } from "@/services/api/upload.service";
import { useAuth } from "@/store";
import type { ContractMediaItem } from "@/types/contract.types";
import { generateContractPDF } from "@/utils/contract-pdf-generator";
import { getBestImageUrl, handleImageError } from "@/utils/image-handler";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  Download,
  Eye,
  FileCheck,
  FileSignature,
  FileText,
  Folder,
  Image,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PartyMediaItem } from "./components/party-media-item";
import { ContractInvoiceDetailDialog } from "./dialogs/contract-invoice-detail-dialog";
import { ContractMediaDialog } from "./dialogs/contract-media-dialog";
import { CreateInvoiceDialog } from "./dialogs/create-invoice-dialog";
import { CreateServiceInvoiceDialog } from "./dialogs/create-service-invoice-dialog";
import { ExtendDecisionDialog } from "./dialogs/extend-decision-dialog";
import { OtpDialog } from "./dialogs/otp-dialog";
import { RequestOTPDialog } from "./dialogs/request-otp-dialog";
import { TerminateContractDialog } from "./dialogs/terminate-contract-dialog";

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const contractId = id ? Number(id) : 0;

  // Fetch contract detail
  const {
    data: contractDetail,
    isLoading,
    error,
  } = useGetContractDetail(contractId);

  // Fetch termination request if contract is in termination pending status
  const { data: terminationRequest, isLoading: isTerminationRequestLoading } =
    useGetTerminationRequest(
      contractDetail?.contract.status === "TERMINATION_PENDING" ? contractId : 0
    );

  // Fetch extension requests
  const { data: extensionRequestsData, isLoading: isLoadingExtensionRequests } =
    useGetExtensionRequests(
      contractId,
      {
        page: 0,
        size: 10,
        sort: "createdAt",
        direction: "DESC",
      },
      !!contractId
    );

  // Mutations
  const { mutate: requestOTP, isPending: isRequestingOTP } =
    useRequestContractOTP();
  const { mutate: signContract, isPending: isSigning } = useSignContract();
  const { mutate: extendDecision, isPending: isExtendingDecision } =
    useExtendDecision();
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
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] =
    useState(false);
  const [
    isCreateServiceInvoiceDialogOpen,
    setIsCreateServiceInvoiceDialogOpen,
  ] = useState(false);
  const [selectedServiceInvoiceId, setSelectedServiceInvoiceId] = useState<
    number | null
  >(null);
  const [
    isServiceInvoiceDetailDialogOpen,
    setIsServiceInvoiceDetailDialogOpen,
  ] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null
  );
  const [isInvoiceDetailDialogOpen, setIsInvoiceDetailDialogOpen] =
    useState(false);

  // Contract Media Dialog states
  const [isContractMediaDialogOpen, setIsContractMediaDialogOpen] =
    useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
    null
  );
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    fileName: string;
    fileId?: number; // Lưu fileId để có thể download qua API download-url
    mimeType?: string; // Lưu mimeType để biết loại file (image/pdf)
  } | null>(null);

  // Invoice queries and mutations
  const { data: invoices = [], isLoading: isLoadingInvoices } =
    useGetInvoicesByContract(contractId);
  const { mutate: createInvoice, isPending: isCreatingInvoice } =
    useCreateInvoiceFromContract();

  // Invoice detail query
  const { data: invoiceDetail, isLoading: isLoadingInvoiceDetail } =
    useGetInvoiceDetail(
      contractId,
      selectedInvoiceId || 0,
      isInvoiceDetailDialogOpen && !!selectedInvoiceId
    );

  const { mutate: createServiceInvoice, isPending: isCreatingServiceInvoice } =
    useCreateServiceInvoice();

  // Service invoice detail query
  const {
    data: serviceInvoiceDetail,
    isLoading: isLoadingServiceInvoiceDetail,
  } = useGetServiceInvoiceDetail(
    selectedServiceInvoiceId || 0,
    isServiceInvoiceDetailDialogOpen && !!selectedServiceInvoiceId
  );

  // Contract Media hooks - Always enabled for files tab
  const { data: contractMedia = [], isLoading: isLoadingContractMedia } =
    useGetContractMedia(contractId, true);
  const { mutate: addContractMedia, isPending: isAddingContractMedia } =
    useAddContractMedia();
  const { mutate: removeContractMedia, isPending: isRemovingContractMedia } =
    useRemoveContractMedia();

  // Contract Version Media hooks
  const { data: versionMedia = [], isLoading: isLoadingVersionMedia } =
    useGetContractVersionMedia(
      selectedVersionId || 0,
      isContractMediaDialogOpen && !!selectedVersionId
    );
  const { mutate: addVersionMedia, isPending: isAddingVersionMedia } =
    useAddContractVersionMedia();
  const { mutate: removeVersionMedia, isPending: isRemovingVersionMedia } =
    useRemoveContractVersionMedia();

  // Contract Party Media hooks
  const { data: partyMedia = [], isLoading: isLoadingPartyMedia } =
    useGetContractPartyMedia(
      selectedPartyId || 0,
      isContractMediaDialogOpen && !!selectedPartyId
    );
  const { mutate: addPartyMedia, isPending: isAddingPartyMedia } =
    useAddContractPartyMedia();
  const { mutate: removePartyMedia, isPending: isRemovingPartyMedia } =
    useRemoveContractPartyMedia();

  // Get current user's party info
  const currentUserParty = contractDetail?.parties.find(
    (party) => party.userId === Number(user?.id)
  );

  // Check if user is landlord or tenant
  const isLandlord = currentUserParty?.role === "LANDLORD";
  const isTenant = currentUserParty?.role === "TENANT";

  // Get email for OTP request (from current user party or user object)
  const otpEmail = currentUserParty?.email || user?.email || "";

  // File download - sử dụng API download-url để lấy URL và trigger download

  // Helper functions for media viewing and downloading
  const isImage = (mimeType?: string) => {
    return mimeType?.startsWith("image/") ?? false;
  };

  const isPdf = (mimeType?: string) => {
    return mimeType === "application/pdf" || mimeType?.includes("pdf");
  };

  const handleViewImage = (item: ContractMediaItem) => {
    // Sử dụng fileUrl/filePath có sẵn để hiển thị
    const fileUrl = item.fileUrl || item.filePath;
    if (fileUrl) {
      setPreviewImage({
        url: fileUrl,
        fileName:
          item.fileName ||
          item.filePath?.split("/").pop() ||
          `file-${item.fileId}`,
        fileId: item.fileId, // Lưu fileId để có thể download qua API
        mimeType: item.mimeType, // Lưu mimeType để biết loại file
      });
    } else if (item.fileId) {
      toast.error("Không tìm thấy URL file");
    }
  };

  const handleDownloadFile = async (item: ContractMediaItem) => {
    // Sử dụng API download-url để lấy URL và trigger download
    // API: GET /api/files/{file_id}/download-url
    if (!item.fileId) {
      toast.error("Không tìm thấy ID file");
      return;
    }

    const fileName =
      item.fileName || item.filePath?.split("/").pop() || `file-${item.fileId}`;

    try {
      // Gọi API để lấy download URL
      const response = await uploadService.getDownloadUrl(item.fileId);
      const downloadUrl = response.data?.downloadUrl;

      if (!downloadUrl) {
        toast.error("Không thể lấy URL tải xuống");
        return;
      }

      // Fetch file về dưới dạng blob để tránh browser navigate đến URL Cloudinary
      const fileResponse = await fetch(downloadUrl);
      if (!fileResponse.ok) {
        throw new Error("Failed to fetch file");
      }
      const blob = await fileResponse.blob();

      // Tạo blob URL và trigger download - không chuyển trang
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL sau một khoảng thời gian
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 200);

      toast.success("Đang tải xuống file...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Không thể tải xuống file");
    }
  };

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
        role: isLandlord ? "landlord" : "tenant",
      },
      {
        onSuccess: () => {
          toast.success("Ký hợp đồng thành công");
          setIsSignOtpDialogOpen(false);
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

  // Handle extend decision (accept/decline extension request)
  const handleExtendDecision = (data: {
    action: "accept" | "decline";
    note: string;
  }) => {
    extendDecision(
      { contractId, data },
      {
        onSuccess: () => {
          setIsExtendDialogOpen(false);
          // Extension requests và contract detail sẽ được tự động refresh
          // thông qua query invalidation trong useExtendDecision hook
        },
        onError: (error: unknown) => {
          const errorMessage =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Xử lý yêu cầu gia hạn hợp đồng thất bại";
          toast.error(errorMessage);
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

  if (error || !contractDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <FileText className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Không tìm thấy hợp đồng</p>
          <p className="text-sm text-muted-foreground">
            Hợp đồng không tồn tại hoặc bạn không có quyền truy cập
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    );
  }

  const { contract, versions, parties, signatures } = contractDetail;
  const landlord = parties.find((p) => p.role === "LANDLORD");
  const tenant = parties.find((p) => p.role === "TENANT");

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
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          className="hover:bg-transparent dark:hover:bg-transparent hover:text-muted-foreground cursor-pointer"
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Hợp đồng #{contract.id}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Chi tiết hợp đồng thuê phòng
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p>Đang tải thông tin hợp đồng...</p>
        </div>
      ) : (
        <>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
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
            {contract.status === "SENT" && !hasUserSigned && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsRequestOTPDialogOpen(true)}
                disabled={isRequestingOTP}
                className="bg-primary hover:bg-primary/90"
              >
                <FileSignature className="mr-2 size-4" />
                Ký hợp đồng
              </Button>
            )}
          </div>

          {/* Grid layout: Contract Info và Tabs cùng 1 hàng trên desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Contract Info Card - 1/3 width trên desktop */}
            <Card className="shadow-sm lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="rounded-lg bg-primary/10 p-1.5">
                      <FileText className="size-4 text-primary" />
                    </div>
                    Thông tin hợp đồng
                  </CardTitle>
                  <ContractBadge status={contract.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contract Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Ngày bắt đầu
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-primary" />
                      <p className="text-sm font-semibold">
                        {format(new Date(contract.startDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Ngày kết thúc
                    </p>
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
                      {format(new Date(contract.createdAt), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Tiền thuê phòng
                    </p>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      }).format(contract.depositAmount)}
                    </p>
                  </div>
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
                          <p className="text-xs text-muted-foreground">
                            Mã phòng
                          </p>
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
                          <p className="text-xs text-muted-foreground">
                            Địa chỉ
                          </p>
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

                {/* Parties Info với Signature Status - Compact */}
                <div className="space-y-2">
                  {landlord &&
                    (() => {
                      const landlordSignature = signatures.find(
                        (sig) => sig.partyId === landlord.id
                      );
                      const hasLandlordSigned = !!landlordSignature;
                      const isCurrentUser =
                        landlord.id === currentUserParty?.id;

                      return (
                        <div
                          className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                            isCurrentUser && hasLandlordSigned
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
                              {hasLandlordSigned ? (
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
                              )}
                            </div>
                            <div className="space-y-1">
                              {landlordProfile?.landlordProfile
                                ?.displayName && (
                                <div className="flex items-center gap-1.5">
                                  <User className="size-3 text-muted-foreground shrink-0" />
                                  <span className="text-xs font-medium truncate">
                                    {
                                      landlordProfile.landlordProfile
                                        .displayName
                                    }
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Mail className="size-3 text-muted-foreground shrink-0" />
                                <span className="text-xs truncate">
                                  {landlord.email}
                                </span>
                              </div>
                              {landlord.phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="size-3 text-muted-foreground shrink-0" />
                                  <span className="text-xs">
                                    {landlord.phone}
                                  </span>
                                </div>
                              )}
                              {landlordProfile?.landlordProfile?.verified && (
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle className="size-3 text-green-600 shrink-0" />
                                  <span className="text-xs text-green-600">
                                    Đã xác thực
                                  </span>
                                </div>
                              )}
                              {hasLandlordSigned &&
                                landlordSignature?.signedAt && (
                                  <div className="text-[10px] text-muted-foreground pt-0.5">
                                    Đã ký:{" "}
                                    {format(
                                      new Date(landlordSignature.signedAt),
                                      "dd/MM/yyyy HH:mm"
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  {tenant &&
                    (() => {
                      const tenantSignature = signatures.find(
                        (sig) => sig.partyId === tenant.id
                      );
                      const hasTenantSigned = !!tenantSignature;
                      const isCurrentUser = tenant.id === currentUserParty?.id;

                      return (
                        <div
                          className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                            isCurrentUser && hasTenantSigned
                              ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800"
                              : "bg-green-50/50 dark:bg-green-950/10"
                          }`}
                        >
                          <div className="rounded-full bg-green-100 dark:bg-green-900 p-1 mt-0.5 shrink-0">
                            <User className="size-3.5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold">
                                Người thuê
                              </p>
                              {hasTenantSigned ? (
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
                              )}
                            </div>
                            <div className="space-y-1">
                              {tenantProfile?.tenantProfile?.fullName && (
                                <div className="flex items-center gap-1.5">
                                  <User className="size-3 text-muted-foreground shrink-0" />
                                  <span className="text-xs font-medium truncate">
                                    {tenantProfile.tenantProfile.fullName}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Mail className="size-3 text-muted-foreground shrink-0" />
                                <span className="text-xs truncate">
                                  {tenant.email}
                                </span>
                              </div>
                              {tenant.phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="size-3 text-muted-foreground shrink-0" />
                                  <span className="text-xs">
                                    {tenant.phone}
                                  </span>
                                </div>
                              )}
                              {tenantProfile?.tenantProfile?.verified && (
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle className="size-3 text-green-600 shrink-0" />
                                  <span className="text-xs text-green-600">
                                    Đã xác thực
                                  </span>
                                </div>
                              )}
                              {hasTenantSigned && tenantSignature?.signedAt && (
                                <div className="text-[10px] text-muted-foreground pt-0.5">
                                  Đã ký:{" "}
                                  {format(
                                    new Date(tenantSignature.signedAt),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>

                {/* Signature Actions - Chỉ hiển thị khi cần ký */}
                {(isLandlord || isTenant) &&
                  contract.status === "SENT" &&
                  !hasUserSigned && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-xs font-semibold">Ký hợp đồng:</p>
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={() => setIsRequestOTPDialogOpen(true)}
                            disabled={isRequestingOTP}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Send className="mr-2 size-3.5" />
                            Yêu cầu OTP
                          </Button>
                          <Button
                            onClick={() => setIsSignOtpDialogOpen(true)}
                            variant="default"
                            size="sm"
                            className="w-full bg-primary hover:bg-primary/90"
                          >
                            <FileSignature className="mr-2 size-3.5" />
                            Nhập OTP đã có
                          </Button>
                        </div>
                      </div>
                    </>
                  )}

                {/* Signature Progress */}
                {parties.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Tiến độ ký:{" "}
                          <span className="font-semibold text-foreground">
                            {signatures.length}/{parties.length}
                          </span>
                        </span>
                        {allPartiesSigned && (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800 text-[10px]"
                          >
                            <CheckCircle className="mr-0.5 size-2.5" />
                            Hoàn tất
                          </Badge>
                        )}
                      </div>
                      {!allPartiesSigned && (
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{
                              width: `${
                                (signatures.length / parties.length) * 100
                              }%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Extension Requests Section */}
                {(contract.status === "SIGNED" ||
                  contract.status === "ACTIVE" ||
                  contract.status === "EXPIRED") && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="size-3.5 text-primary" />
                        <p className="text-xs font-semibold">
                          Yêu cầu gia hạn hợp đồng
                        </p>
                      </div>
                      {isLoadingExtensionRequests ? (
                        <div className="flex items-center justify-center py-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="ml-2 text-xs text-muted-foreground">
                            Đang tải...
                          </span>
                        </div>
                      ) : extensionRequestsData?.data?.content &&
                        extensionRequestsData.data.content.length > 0 ? (
                        <div className="space-y-2">
                          {extensionRequestsData.data.content
                            .filter((req) => req.status === "PENDING")
                            .map((request) => (
                              <div
                                key={request.id}
                                className="p-3 rounded-lg border-2 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-300 dark:border-blue-700 shadow-sm"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-blue-500/20 p-1.5">
                                      <Calendar className="size-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-xs font-bold text-blue-900 dark:text-blue-100">
                                      Yêu cầu gia hạn
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 text-[10px] font-semibold animate-pulse"
                                    >
                                      Chờ duyệt
                                    </Badge>
                                  </div>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                      Ngày kết thúc hiện tại:
                                    </span>
                                    <span className="font-medium">
                                      {format(
                                        new Date(request.currentEndDate),
                                        "dd/MM/yyyy"
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">
                                      Yêu cầu gia hạn đến:
                                    </span>
                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                      {format(
                                        new Date(request.requestedEndDate),
                                        "dd/MM/yyyy"
                                      )}
                                    </span>
                                  </div>
                                  {request.note && (
                                    <div className="mt-1.5 bg-white/50 dark:bg-black/20 p-1.5 rounded border">
                                      <p className="text-[10px] text-muted-foreground mb-0.5">
                                        Ghi chú:
                                      </p>
                                      <p className="text-xs leading-relaxed line-clamp-2">
                                        {request.note}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <Calendar className="size-3 text-muted-foreground shrink-0" />
                                    <p className="text-[10px] text-muted-foreground">
                                      {format(
                                        new Date(request.createdAt),
                                        "dd/MM/yyyy HH:mm"
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setIsExtendDialogOpen(true)}
                                  disabled={isExtendingDecision}
                                  className="w-full mt-2 h-7 text-xs"
                                >
                                  <Calendar className="mr-1.5 size-3" />
                                  Xử lý yêu cầu
                                </Button>
                              </div>
                            ))}
                          {extensionRequestsData.data.content.filter(
                            (req) => req.status === "PENDING"
                          ).length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Không có yêu cầu gia hạn đang chờ
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          Chưa có yêu cầu gia hạn nào
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Hủy hợp đồng button và termination info */}
                {(contract.status === "TERMINATION_PENDING" ||
                  contract.status === "SIGNED" ||
                  contract.status === "ACTIVE") && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {/* Terminate contract button - only show for active contracts */}
                      {(contract.status === "SIGNED" ||
                        contract.status === "ACTIVE") && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setIsTerminateDialogOpen(true)}
                          disabled={isTerminating}
                          className="w-full bg-destructive hover:bg-destructive/90"
                        >
                          <Trash2 className="mr-2 size-3.5" />
                          Hủy hợp đồng
                        </Button>
                      )}

                      {/* Show termination request details when status is TERMINATION_PENDING */}
                      {contract.status === "TERMINATION_PENDING" && (
                        <div className="space-y-2">
                          {isTerminationRequestLoading ? (
                            <div className="flex flex-col items-center justify-center py-4 space-y-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                              <p className="text-xs text-muted-foreground">
                                Đang tải...
                              </p>
                            </div>
                          ) : terminationRequest ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <AlertTriangle className="size-3.5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold">
                                    Yêu cầu hủy
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className="mt-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700 text-[10px]"
                                  >
                                    {terminationRequest.type ===
                                    "EARLY_TERMINATE"
                                      ? "Hủy sớm"
                                      : "Hết hạn"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <p className="text-xs font-semibold">Lý do:</p>
                                <div className="bg-muted/50 p-2 rounded-lg border">
                                  <p className="text-xs leading-relaxed line-clamp-3">
                                    {terminationRequest.reason}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-lg">
                                <Calendar className="size-3 text-muted-foreground shrink-0" />
                                <div>
                                  <p className="text-[10px] text-muted-foreground">
                                    Ngày yêu cầu
                                  </p>
                                  <p className="text-xs font-medium">
                                    {format(
                                      new Date(terminationRequest.createdAt),
                                      "dd/MM/yyyy"
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Consents status - compact */}
                              <div className="space-y-1.5">
                                <p className="text-xs font-semibold">Đồng ý:</p>
                                <div className="space-y-1">
                                  {terminationRequest.consents.map(
                                    (consent) => {
                                      const party = parties.find(
                                        (p) => p.id === consent.partyId
                                      );
                                      const isCurrentUserConsent =
                                        consent.userId === Number(user?.id);

                                      return (
                                        <div
                                          key={consent.id}
                                          className={`flex items-center justify-between p-1.5 rounded border text-xs ${
                                            isCurrentUserConsent
                                              ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                                              : "bg-muted/50 border-border"
                                          }`}
                                        >
                                          <span className="font-medium">
                                            {party?.role === "LANDLORD"
                                              ? "Chủ nhà"
                                              : "Người thuê"}
                                            {isCurrentUserConsent && (
                                              <span className="text-blue-600 dark:text-blue-400 ml-1">
                                                (Bạn)
                                              </span>
                                            )}
                                          </span>
                                          <div className="flex items-center gap-1.5">
                                            {isCurrentUserConsent &&
                                              consent.status === "PENDING" && (
                                                <div className="flex gap-1">
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={
                                                      handleRequestTerminationOTP
                                                    }
                                                    disabled={
                                                      isRequestingTerminationOTP
                                                    }
                                                    className="h-6 text-[10px] px-1.5"
                                                  >
                                                    {isRequestingTerminationOTP
                                                      ? "..."
                                                      : "OTP"}
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() =>
                                                      setIsTerminationOtpDialogOpen(
                                                        true
                                                      )
                                                    }
                                                    className="bg-primary hover:bg-primary/90 h-6 text-[10px] px-1.5"
                                                  >
                                                    Nhập
                                                  </Button>
                                                </div>
                                              )}
                                            <Badge
                                              variant={
                                                consent.status === "SIGNED"
                                                  ? "default"
                                                  : "secondary"
                                              }
                                              className={
                                                consent.status === "SIGNED"
                                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800 text-[10px]"
                                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 text-[10px]"
                                              }
                                            >
                                              {consent.status === "SIGNED" ? (
                                                <>
                                                  <CheckCircle className="mr-0.5 size-2.5" />
                                                  Đã đồng ý
                                                </>
                                              ) : (
                                                "Chờ"
                                              )}
                                            </Badge>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tabs - 2/3 width trên desktop */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="versions" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger
                    value="versions"
                    className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm transition-all"
                  >
                    <FileText className="size-3.5 mr-1.5" />
                    Phiên bản
                  </TabsTrigger>
                  <TabsTrigger
                    value="invoices"
                    className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm transition-all"
                  >
                    <Receipt className="size-3.5 mr-1.5" />
                    Hóa đơn
                  </TabsTrigger>
                  <TabsTrigger
                    value="terms"
                    className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm transition-all"
                  >
                    <FileCheck className="size-3.5 mr-1.5" />
                    Điều khoản
                  </TabsTrigger>
                  <TabsTrigger
                    value="files"
                    className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold data-[state=active]:shadow-sm transition-all"
                  >
                    <Folder className="size-3.5 mr-1.5" />
                    Tệp tin
                  </TabsTrigger>
                </TabsList>

                {/* Versions Tab */}
                <TabsContent value="versions" className="mt-4">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-lg bg-primary/10 p-1.5">
                          <FileText className="size-4 text-primary" />
                        </div>
                        Phiên bản hợp đồng
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {versions.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            <FileText className="size-10 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">
                              Chưa có phiên bản hợp đồng
                            </p>
                          </div>
                        ) : (
                          versions.map((version) => (
                            <div
                              key={version.id}
                              className="border rounded-lg p-3 space-y-2 hover:shadow-sm transition-shadow bg-card"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                    v{version.versionNo}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">
                                      Phiên bản {version.versionNo}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {version.templateCode}
                                    </p>
                                  </div>
                                </div>
                                {version.createdAt && (
                                  <p className="text-xs text-muted-foreground">
                                    {format(
                                      new Date(version.createdAt),
                                      "dd/MM/yyyy HH:mm"
                                    )}
                                  </p>
                                )}
                              </div>
                              <div className="bg-muted/50 rounded-lg p-3 border max-h-48 overflow-y-auto">
                                <p className="text-xs whitespace-pre-wrap leading-relaxed">
                                  {version.content}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Invoices Tab (Hóa đơn) - Combined tab for both CONTRACT and SERVICE invoices */}
                <TabsContent value="invoices" className="mt-4">
                  <InvoiceList
                    invoices={invoices}
                    isLoading={isLoadingInvoices}
                    showPayButton={false}
                    showViewButton={true}
                    title="Hóa đơn"
                    headerAction={
                      (contract.status === "SIGNED" ||
                        contract.status === "ACTIVE") && (
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => setIsCreateInvoiceDialogOpen(true)}
                            disabled={isCreatingInvoice}
                            className="text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 focus:bg-green-100 focus:text-green-700"
                          >
                            <Receipt className="mr-2 size-4" />
                            Tạo thanh toán tiền nhà
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              setIsCreateServiceInvoiceDialogOpen(true)
                            }
                            disabled={isCreatingServiceInvoice}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Receipt className="mr-2 size-4" />
                            Tạo hóa đơn dịch vụ
                          </Button>
                        </div>
                      )
                    }
                    onView={(invoice) => {
                      // Check invoice type to determine which API to call
                      if (invoice.type === "SERVICE") {
                        setSelectedServiceInvoiceId(Number(invoice.id));
                        setIsServiceInvoiceDetailDialogOpen(true);
                      } else {
                        setSelectedInvoiceId(Number(invoice.id));
                        setIsInvoiceDetailDialogOpen(true);
                      }
                    }}
                  />
                </TabsContent>

                {/* Terms Tab (Điều khoản) */}
                <TabsContent value="terms" className="mt-4">
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
                      {contract.feeDetail ? (
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
                              <div
                                key={index}
                                className="border rounded-lg p-4 bg-card"
                              >
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
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileCheck className="size-10 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">
                            Chưa có điều khoản và chi phí
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Files Tab (Tệp tin) */}
                <TabsContent value="files" className="mt-4">
                  <div className="space-y-4">
                    {/* Contract Media Section */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <div className="rounded-lg bg-primary/10 p-1.5">
                              <Folder className="size-4 text-primary" />
                            </div>
                            Hợp Đồng ({contractMedia.length})
                          </CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVersionId(null);
                              setSelectedPartyId(null);
                              setIsContractMediaDialogOpen(true);
                            }}
                            className="h-7 text-xs"
                          >
                            <Image className="size-3 mr-1" />
                            Quản lý
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isLoadingContractMedia ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            <p className="ml-2 text-sm text-muted-foreground">
                              Đang tải...
                            </p>
                          </div>
                        ) : contractMedia.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Folder className="size-10 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Chưa có file media nào</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {contractMedia.slice(0, 8).map((item) => (
                              <div
                                key={item.id}
                                className="relative group border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow"
                              >
                                {(item.fileUrl || item.filePath) &&
                                (isImage(item.mimeType) ||
                                  isPdf(item.mimeType)) ? (
                                  <div className="relative">
                                    {isImage(item.mimeType) ? (
                                      <img
                                        src={
                                          getBestImageUrl(
                                            item.thumbnailUrl,
                                            item.filePath,
                                            item.fileUrl,
                                            true
                                          ) ||
                                          item.fileUrl ||
                                          item.filePath
                                        }
                                        alt={
                                          item.fileName || `file-${item.fileId}`
                                        }
                                        className="w-full h-24 object-cover cursor-pointer"
                                        onClick={() => handleViewImage(item)}
                                        onError={(e) => {
                                          const fallbackUrl =
                                            item.thumbnailUrl && item.filePath
                                              ? e.currentTarget.src ===
                                                item.thumbnailUrl
                                                ? item.filePath
                                                : item.thumbnailUrl
                                              : null;
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
                                          isPdf(item.mimeType)
                                            ? "Xem PDF"
                                            : "Xem ảnh"
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
                                  <div className="relative w-full h-24 flex flex-col items-center justify-center bg-muted group">
                                    <FileText className="size-6 text-muted-foreground mb-1" />
                                    <span className="text-[10px] text-muted-foreground text-center px-1 truncate w-full">
                                      {item.fileName ||
                                        item.filePath?.split("/").pop() ||
                                        `file-${item.fileId}`}
                                    </span>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
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
                                )}
                                <div className="p-2">
                                  <p className="text-xs font-medium truncate">
                                    {item.fileName ||
                                      item.filePath?.split("/").pop() ||
                                      `file-${item.fileId}`}
                                  </p>
                                  {(item.fileSize || item.sizeBytes) && (
                                    <p className="text-xs text-muted-foreground">
                                      {(
                                        (item.fileSize || item.sizeBytes || 0) /
                                        1024
                                      ).toFixed(1)}{" "}
                                      KB
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {contractMedia.length > 8 && (
                              <div className="flex items-center justify-center border rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">
                                  +{contractMedia.length - 8} file khác
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Version Media Section - Hidden */}
                    {/* <Card className="shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="rounded-lg bg-primary/10 p-1.5">
                            <FileText className="size-4 text-primary" />
                          </div>
                          Phiên Bản
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {versions.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <FileText className="size-10 mx-auto mb-2 opacity-50" />
                              <p className="text-xs">
                                Chưa có phiên bản hợp đồng
                              </p>
                            </div>
                          ) : (
                            versions.map((version) => (
                              <VersionMediaItem
                                key={version.id}
                                version={version}
                                onManageClick={(versionId) => {
                                  setSelectedVersionId(versionId);
                                  setSelectedPartyId(null);
                                  setIsContractMediaDialogOpen(true);
                                }}
                                onViewImage={handleViewImage}
                                onDownloadFile={handleDownloadFile}
                              />
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card> */}

                    {/* Party Media Section */}
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <div className="rounded-lg bg-primary/10 p-1.5">
                            <User className="size-4 text-primary" />
                          </div>
                          CMND/CCCD Các Bên
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {parties.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                              <User className="size-10 mx-auto mb-2 opacity-50" />
                              <p className="text-xs">Chưa có bên tham gia</p>
                            </div>
                          ) : (
                            parties.map((party) => (
                              <PartyMediaItem
                                key={party.id}
                                party={party}
                                onManageClick={(partyId) => {
                                  setSelectedPartyId(partyId);
                                  setSelectedVersionId(null);
                                  setIsContractMediaDialogOpen(true);
                                }}
                                onViewImage={handleViewImage}
                                onDownloadFile={handleDownloadFile}
                              />
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

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
            <ExtendDecisionDialog
              open={isExtendDialogOpen}
              onOpenChange={setIsExtendDialogOpen}
              currentEndDate={contract.endDate}
              requestedEndDate={
                extensionRequestsData?.data?.content?.find(
                  (req) => req.status === "PENDING"
                )?.requestedEndDate
              }
              onSubmit={handleExtendDecision}
              isPending={isExtendingDecision}
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

          <CreateInvoiceDialog
            open={isCreateInvoiceDialogOpen}
            onOpenChange={setIsCreateInvoiceDialogOpen}
            onSubmit={(data) => {
              createInvoice(
                { contractId, data },
                {
                  onSuccess: () => {
                    setIsCreateInvoiceDialogOpen(false);
                  },
                }
              );
            }}
            isPending={isCreatingInvoice}
            status={contractDetail?.contract?.status}
            depositAmount={contractDetail?.contract?.depositAmount}
          />

          {/* Service Invoice Detail Dialog */}
          <InvoiceDetailDialog
            open={isServiceInvoiceDetailDialogOpen}
            onOpenChange={(open) => {
              setIsServiceInvoiceDetailDialogOpen(open);
              if (!open) {
                setSelectedServiceInvoiceId(null);
              }
            }}
            invoice={serviceInvoiceDetail || null}
            isLoading={isLoadingServiceInvoiceDetail}
          />

          {/* Contract Invoice Detail Dialog */}
          <ContractInvoiceDetailDialog
            open={isInvoiceDetailDialogOpen}
            onOpenChange={(open) => {
              setIsInvoiceDetailDialogOpen(open);
              if (!open) {
                setSelectedInvoiceId(null);
              }
            }}
            invoice={invoiceDetail || null}
            isLoading={isLoadingInvoiceDetail}
          />

          {/* Create Service Invoice Dialog */}
          <CreateServiceInvoiceDialog
            open={isCreateServiceInvoiceDialogOpen}
            onOpenChange={setIsCreateServiceInvoiceDialogOpen}
            contractId={contractId}
            feeDetail={contract.feeDetail}
            onSubmit={(data: {
              cycleMonth: string;
              dueAt: string;
              taxAmount: number;
              items: Array<{
                itemType: string;
                description: string;
                quantity: number;
                unitPrice: number;
              }>;
            }) => {
              createServiceInvoice(
                {
                  contractId,
                  ...data,
                },
                {
                  onSuccess: () => {
                    setIsCreateServiceInvoiceDialogOpen(false);
                  },
                }
              );
            }}
            isPending={isCreatingServiceInvoice}
          />

          {/* Contract Media Dialog */}
          <ContractMediaDialog
            open={isContractMediaDialogOpen}
            onOpenChange={(open) => {
              setIsContractMediaDialogOpen(open);
              if (!open) {
                setSelectedVersionId(null);
                setSelectedPartyId(null);
              }
            }}
            contractId={contractId}
            mediaItems={
              selectedVersionId
                ? versionMedia
                : selectedPartyId
                ? partyMedia
                : contractMedia
            }
            isLoading={
              selectedVersionId
                ? isLoadingVersionMedia
                : selectedPartyId
                ? isLoadingPartyMedia
                : isLoadingContractMedia
            }
            onAddMedia={(fileId) => {
              if (selectedVersionId) {
                addVersionMedia(
                  { versionId: selectedVersionId, fileId },
                  {
                    onSuccess: () => {
                      // Dialog will automatically refresh via query invalidation
                    },
                  }
                );
              } else if (selectedPartyId) {
                addPartyMedia(
                  { partyId: selectedPartyId, fileId },
                  {
                    onSuccess: () => {
                      // Dialog will automatically refresh via query invalidation
                    },
                  }
                );
              } else {
                addContractMedia(
                  { contractId, fileId },
                  {
                    onSuccess: () => {
                      // Dialog will automatically refresh via query invalidation
                    },
                  }
                );
              }
            }}
            onRemoveMedia={(mediaId) => {
              if (selectedVersionId) {
                removeVersionMedia(
                  { versionId: selectedVersionId, mediaId },
                  {
                    onSuccess: () => {
                      // Dialog will automatically refresh via query invalidation
                    },
                  }
                );
              } else if (selectedPartyId) {
                removePartyMedia(
                  { partyId: selectedPartyId, mediaId },
                  {
                    onSuccess: () => {
                      // Dialog will automatically refresh via query invalidation
                    },
                  }
                );
              } else {
                removeContractMedia(
                  { contractId, mediaId },
                  {
                    onSuccess: () => {
                      // Dialog will automatically refresh via query invalidation
                    },
                  }
                );
              }
            }}
            isAddingMedia={
              selectedVersionId
                ? isAddingVersionMedia
                : selectedPartyId
                ? isAddingPartyMedia
                : isAddingContractMedia
            }
            isRemovingMedia={
              selectedVersionId
                ? isRemovingVersionMedia
                : selectedPartyId
                ? isRemovingPartyMedia
                : isRemovingContractMedia
            }
            title={
              selectedVersionId
                ? "Quản lý Media Phiên Bản"
                : selectedPartyId
                ? "Quản lý Media Bên Tham Gia"
                : "Quản lý Media Hợp Đồng"
            }
            description={
              selectedVersionId
                ? "Thêm hoặc xóa file media cho phiên bản hợp đồng"
                : selectedPartyId
                ? "Thêm hoặc xóa file CMND/CCCD cho bên tham gia"
                : "Thêm hoặc xóa file media cho hợp đồng"
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
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      title={previewImage.fileName}
                    />
                  ) : (
                    <img
                      src={previewImage.url}
                      alt={previewImage.fileName}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  )}
                </div>
                <DialogFooter className="px-6 py-4 flex-shrink-0 border-t">
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
                      // Sử dụng API download-url để lấy URL và trigger download
                      if (previewImage.fileId) {
                        try {
                          // Gọi API để lấy download URL
                          const response = await uploadService.getDownloadUrl(
                            previewImage.fileId
                          );
                          const downloadUrl = response.data?.downloadUrl;

                          if (!downloadUrl) {
                            toast.error("Không thể lấy URL tải xuống");
                            return;
                          }

                          // Fetch file về dưới dạng blob để tránh browser navigate đến URL Cloudinary
                          const fileResponse = await fetch(downloadUrl);
                          if (!fileResponse.ok) {
                            throw new Error("Failed to fetch file");
                          }
                          const blob = await fileResponse.blob();

                          // Tạo blob URL và trigger download - không chuyển trang
                          const blobUrl = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = blobUrl;
                          link.download = previewImage.fileName;
                          link.style.display = "none";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);

                          // Clean up blob URL sau một khoảng thời gian
                          setTimeout(() => {
                            URL.revokeObjectURL(blobUrl);
                          }, 200);

                          toast.success("Đang tải xuống file...");
                        } catch (error) {
                          console.error("Download error:", error);
                          toast.error("Không thể tải xuống file");
                        }
                      } else if (previewImage.url) {
                        // Fallback: download trực tiếp từ URL nếu không có fileId
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
        </>
      )}
    </div>
  );
};

export default ContractDetail;
