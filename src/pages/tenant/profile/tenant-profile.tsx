import LoadingCard from "@/components/common/loading-card";
import SitePageTitle from "@/components/site/site-page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useTenantProfile,
  useUpdateTenantProfile,
} from "@/hooks/useTenantProfile";
import { useToast } from "@/hooks/useToast";
import type { AxiosError } from "axios";
import {
  Briefcase,
  Calendar,
  Edit,
  Globe,
  IdCard,
  Info,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import { TenantProfileFormDialog } from "./components/tenant-profile-form-dialog";

const TenantProfilePage = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: profile, isLoading, error } = useTenantProfile();
  const { mutate: updateProfile, isPending } = useUpdateTenantProfile();

  const toast = useToast();
  const handleUpdateProfile = (data: {
    fullName?: string;
    dob?: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    idNumber?: string;
    address?: string;
    occupation?: string;
    emergencyContact?: string;
    nationality?: string;
  }) => {
    updateProfile(data, {
      onSuccess: () => {
        toast.success("Cập nhật profile thành công");
        setIsEditDialogOpen(false);
      },
      onError: (error: AxiosError<{ message?: string }>) => {
        toast.error(
          error.response?.data?.message || "Có lỗi xảy ra khi cập nhật profile"
        );
      },
    });
  };

  if (isLoading) {
    return <LoadingCard Icon={Loader2} title="Đang tải thông tin profile..." />;
  }

  if (error || !profile) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-destructive">
        Có lỗi xảy ra khi tải thông tin profile. Vui lòng thử lại sau.
      </div>
    );
  }

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case "MALE":
        return "Nam";
      case "FEMALE":
        return "Nữ";
      case "OTHER":
        return "Khác";
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-0">
        <SitePageTitle
          title="Thông tin cá nhân"
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
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center justify-center size-24 rounded-full bg-primary/10 shrink-0">
              <User className="size-12 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold">
                {profile.fullName || "Chưa cập nhật tên"}
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
                {profile.occupation && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Briefcase className="size-3.5" />
                    {profile.occupation}
                  </Badge>
                )}
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-4" />
                <span>Họ và tên</span>
              </div>
              <p className="text-base font-medium pl-6">
                {profile.fullName || (
                  <span className="text-muted-foreground italic">
                    Chưa cập nhật
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                <span>Ngày sinh</span>
              </div>
              <p className="text-base font-medium pl-6">
                {profile.dob ? (
                  new Date(profile.dob).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                ) : (
                  <span className="text-muted-foreground italic">
                    Chưa cập nhật
                  </span>
                )}
              </p>
            </div>

            {profile.gender && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="size-4" />
                  <span>Giới tính</span>
                </div>
                <p className="text-base font-medium pl-6">
                  {getGenderLabel(profile.gender)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <IdCard className="size-4" />
                <span>CMND/CCCD</span>
              </div>
              <p className="text-base font-medium pl-6">
                {profile.idNumber || (
                  <span className="text-muted-foreground italic">
                    Chưa cập nhật
                  </span>
                )}
              </p>
            </div>

            {profile.nationality && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="size-4" />
                  <span>Quốc tịch</span>
                </div>
                <p className="text-base font-medium pl-6">
                  {profile.nationality}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="size-5 text-primary" />
              Thông tin bổ sung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.occupation ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="size-4" />
                  <span>Nghề nghiệp</span>
                </div>
                <p className="text-base font-medium pl-6">
                  {profile.occupation}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="size-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Chưa có thông tin nghề nghiệp</p>
              </div>
            )}

            {profile.address && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>Địa chỉ</span>
                </div>
                <p className="text-base font-medium pl-6 break-words">
                  {profile.address}
                </p>
              </div>
            )}

            {profile.emergencyContact && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-4" />
                  <span>Liên hệ khẩn cấp</span>
                </div>
                <p className="text-base font-medium pl-6">
                  {profile.emergencyContact}
                </p>
              </div>
            )}

            {!profile.occupation &&
              !profile.address &&
              !profile.emergencyContact && (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="size-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Chưa có thông tin bổ sung. Nhấn nút "Chỉnh sửa thông tin" để
                    cập nhật.
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <TenantProfileFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={profile}
        onSubmit={handleUpdateProfile}
        isPending={isPending}
      />
    </div>
  );
};

export default TenantProfilePage;
