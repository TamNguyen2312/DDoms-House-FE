import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useLandlordProfile,
  useUpdateLandlordProfile,
} from "@/hooks/useLandlordProfile";
import { useToast } from "@/hooks/useToast";
import { useUserProfileById } from "@/hooks/useUserProfile";
import { useAuthUser } from "@/store";
import {
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  FileText,
  Hash,
  Info,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { LandlordProfileFormDialog } from "./components/landlord-profile-form-dialog";

const getKycStatusBadge = (status: string) => {
  switch (status) {
    case "APPROVED":
      return (
        <Badge variant="default" className="gap-1 text-sm h-5 px-2">
          <CheckCircle2 className="size-3" />
          Đã duyệt
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="gap-1 text-sm h-5 px-2">
          <XCircle className="size-3" />
          Từ chối
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1 text-sm h-5 px-2">
          <Clock className="size-3" />
          Chờ duyệt
        </Badge>
      );
  }
};

const LandlordProfilePage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: profile, isLoading } = useLandlordProfile();
  const { mutate: updateProfile, isPending } = useUpdateLandlordProfile();

  // Get current user info
  const user = useAuthUser();
  const userId =
    typeof user?.id === "string" ? parseInt(user.id, 10) : user?.id ?? 0;
  const { data: userProfile, isLoading: isLoadingUserProfile } =
    useUserProfileById(userId, !!userId);

  const toast = useToast();
  const handleUpdateProfile = (data: {
    displayName?: string;
    businessLicense?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    taxCode?: string;
    businessAddress?: string;
  }) => {
    updateProfile(data, {
      onSuccess: () => {
        toast.success("Cập nhật profile thành công");
        setIsEditDialogOpen(false);
      },
      onError: () => {
        toast.error("Có lỗi xảy ra khi cập nhật profile");
      },
    });
  };

  if (isLoading || isLoadingUserProfile) {
    return <LoadingCard Icon={Loader2} title="Đang tải thông tin profile..." />;
  }

  if (!profile) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-destructive">
        Có lỗi xảy ra khi tải thông tin profile. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-0">
        <SitePageTitle
          title="Thông tin doanh nghiệp"
          subTitle="Quản lý và cập nhật thông tin profile của bạn"
        />
        <Button
          onClick={() => setIsEditDialogOpen(true)}
          className="gap-2 shrink-0"
        >
          <Edit className="size-4" />
          Chỉnh sửa thông tin
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="border-2">
        <CardContent className="">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center justify-center size-24 rounded-full bg-primary/10 shrink-0">
              <Building2 className="size-12 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <h2 className="text-2xl font-bold">
                {profile.displayName || "Chưa cập nhật tên doanh nghiệp"}
              </h2>
              {/* <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant={profile.verified ? "default" : "outline"}
                  className="gap-1.5"
                >
                  {profile.verified ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      Đã xác thực
                    </>
                  ) : (
                    <>
                      <XCircle className="size-3.5" />
                      Chưa xác thực
                    </>
                  )}
                </Badge>
                {getKycStatusBadge(profile.kycStatus)}
              </div> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="size-5 text-primary" />
              Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="size-4" />
                <span>Tên hiển thị</span>
              </div>
              <p className="text-base font-medium pl-6">
                {profile.displayName || (
                  <span className="text-muted-foreground italic">
                    Chưa cập nhật
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" />
                <span>Email</span>
              </div>
              <div className="pl-6">
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium">
                    {userProfile?.email || (
                      <span className="text-muted-foreground italic">
                        Chưa có thông tin
                      </span>
                    )}
                  </span>
                  {userProfile?.email && (
                    <Badge
                      variant={profile.verified ? "default" : "outline"}
                      className="gap-1.5 text-xs"
                    >
                      {profile.verified ? (
                        <>
                          <CheckCircle2 className="size-3" />
                          Đã xác thực
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3" />
                          Chưa xác thực
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4" />
                <span>Số điện thoại</span>
              </div>
              <p className="text-base font-medium pl-6">
                {userProfile?.phone || (
                  <span className="text-muted-foreground italic">
                    Chưa có thông tin
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="size-4" />
                <span>Trạng thái tài khoản</span>
              </div>
              <div className="pl-6 flex flex-wrap gap-2">
                <Badge
                  variant={userProfile?.active ? "default" : "destructive"}
                  className="gap-1.5 text-xs"
                >
                  {userProfile?.active ? (
                    <>
                      <CheckCircle2 className="size-3" />
                      Hoạt động
                    </>
                  ) : (
                    <>
                      <XCircle className="size-3" />
                      Không hoạt động
                    </>
                  )}
                </Badge>
                {userProfile?.locked && (
                  <Badge variant="destructive" className="gap-1.5 text-xs">
                    <XCircle className="size-3" />
                    Bị khóa
                  </Badge>
                )}
                {userProfile?.twoFaEnabled && (
                  <Badge variant="secondary" className="gap-1.5 text-xs">
                    <CheckCircle2 className="size-3" />
                    2FA
                  </Badge>
                )}
              </div>
            </div>

            {/* <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="size-4" />
                <span>Trạng thái KYC</span>
              </div>
              <div className="pl-6">{getKycStatusBadge(profile.kycStatus)}</div>
            </div> */}
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="size-5 text-primary" />
              Thông tin doanh nghiệp
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {profile.businessLicense ||
            profile.taxCode ||
            profile.businessAddress ? (
              <>
                {profile.businessLicense && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="size-4" />
                      <span>Giấy phép kinh doanh</span>
                    </div>
                    <p className="text-base font-medium pl-6 break-words">
                      {profile.businessLicense}
                    </p>
                  </div>
                )}

                {profile.taxCode && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="size-4" />
                      <span>Mã số thuế</span>
                    </div>
                    <p className="text-base font-medium pl-6">
                      {profile.taxCode}
                    </p>
                  </div>
                )}

                {profile.businessAddress && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4" />
                      <span>Địa chỉ doanh nghiệp</span>
                    </div>
                    <p className="text-base font-medium pl-6 break-words">
                      {profile.businessAddress}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="size-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Chưa có thông tin doanh nghiệp. Nhấn nút "Chỉnh sửa thông tin"
                  để cập nhật.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Information */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="size-5 text-primary" />
              Thông tin ngân hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {profile.bankName ||
            profile.bankAccountNumber ||
            profile.bankAccountName ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {profile.bankName && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="size-4" />
                      <span>Tên ngân hàng</span>
                    </div>
                    <p className="text-base font-medium pl-6">
                      {profile.bankName}
                    </p>
                  </div>
                )}

                {profile.bankAccountNumber && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="size-4" />
                      <span>Số tài khoản</span>
                    </div>
                    <p className="text-base font-medium pl-6 font-mono">
                      {profile.bankAccountNumber}
                    </p>
                  </div>
                )}

                {profile.bankAccountName && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="size-4" />
                      <span>Tên chủ tài khoản</span>
                    </div>
                    <p className="text-base font-medium pl-6">
                      {profile.bankAccountName}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="size-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Chưa có thông tin ngân hàng. Nhấn nút "Chỉnh sửa thông tin" để
                  cập nhật.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <LandlordProfileFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={profile}
        onSubmit={handleUpdateProfile}
        isPending={isPending}
      />
    </div>
  );
};

export default LandlordProfilePage;
