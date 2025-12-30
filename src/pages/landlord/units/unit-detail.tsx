import LoadingCard from "@/components/common/loading-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDetailAppointmentForLandlord } from "@/hooks/useAppointment";
import { useProperty } from "@/hooks/useProperties";
import {
  useCreateFurnishing,
  useDeleteFurnishing,
  useFurnishings,
  useUnit,
  useUpdateFurnishing,
} from "@/hooks/useUnit";
import type {
  FurnishingCategory,
  IFurnishing,
  ItemCondition,
} from "@/services/api/unit.service";
import { formatVietnamMoney } from "@/utils/formatters";
import { format } from "date-fns";
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar,
  Code,
  DollarSign,
  Edit,
  Loader,
  Mail,
  Package,
  Phone,
  Plus,
  Square,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContractSection } from "./components/contract-section";
import { InvoiceSection } from "./components/invoice-section";
import { FurnishingFormDialog } from "./dialogs/furnishing-form-dialog";
import { FurnishingTodoDialog } from "./dialogs/furnishing-todo-dialog";

const categoryLabels: Record<FurnishingCategory, string> = {
  BED: "Giường",
  WARDROBE: "Tủ quần áo",
  TABLE: "Bàn",
  CHAIR: "Ghế",
  DESK: "Bàn làm việc",
  SOFA: "Sofa",
  FRIDGE: "Tủ lạnh",
  AIR_CON: "Điều hòa",
  FAN: "Quạt",
  WASHING_MACHINE: "Máy giặt",
  OTHER: "Khác",
};

const conditionLabels: Record<ItemCondition, string> = {
  GOOD: "Tốt",
  FAIR: "Khá",
  POOR: "Kém",
  NEW: "Mới",
  OLD: "Cũ",
};

const conditionColors: Record<ItemCondition, string> = {
  GOOD: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  FAIR: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  POOR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  OLD: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const UnitDetail = () => {
  const { id, unitid } = useParams<{ id: string; unitid: string }>();
  const navigate = useNavigate();

  const [isFurnishingFormOpen, setIsFurnishingFormOpen] = useState(false);
  const [isFurnishingTodoListOpen, setIsFurnishingTodoListOpen] =
    useState(false);
  const [selectedFurnishing, setSelectedFurnishing] =
    useState<IFurnishing | null>(null);
  const [furnishingToDelete, setFurnishingToDelete] =
    useState<IFurnishing | null>(null);

  // Fetch unit detail by ID
  const { data: unit, isLoading } = useUnit(unitid || "");

  // Fetch property detail by ID
  const { data: property } = useProperty(id || "", {
    enabled: !!id,
  });

  const unitId = unitid || "";
  const unitIdNumber = unit?.id ? Number(unit.id) : 0;
  const { data: furnishings = [], isLoading: isLoadingFurnishings } =
    useFurnishings(unitId);
  const createMutation = useCreateFurnishing(unitId);
  const updateMutation = useUpdateFurnishing(unitId);
  const deleteMutation = useDeleteFurnishing(unitId);

  // Fetch appointment tenants for this unit
  const {
    data: appointmentTenants = [],
    isLoading: isLoadingAppointments,
  } = useDetailAppointmentForLandlord(unitIdNumber);

  const handleAddFurnishing = () => {
    setIsFurnishingTodoListOpen(true);
  };

  const handleEditFurnishing = (furnishing: IFurnishing) => {
    setSelectedFurnishing(furnishing);
    setIsFurnishingFormOpen(true);
  };

  const handleDeleteFurnishing = (furnishing: IFurnishing) => {
    setFurnishingToDelete(furnishing);
  };

  const confirmDelete = () => {
    if (furnishingToDelete) {
      deleteMutation.mutate(furnishingToDelete.id, {
        onSuccess: () => {
          setFurnishingToDelete(null);
        },
      });
    }
  };

  const handleFurnishingSubmit = (data: {
    name: string;
    category: FurnishingCategory;
    quantity: number;
    itemCondition: ItemCondition;
    note?: string;
  }) => {
    if (selectedFurnishing) {
      // Update
      updateMutation.mutate(
        {
          furnishingId: selectedFurnishing.id,
          data,
        },
        {
          onSuccess: () => {
            setIsFurnishingFormOpen(false);
            setSelectedFurnishing(null);
          },
        }
      );
    } else {
      // Create
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsFurnishingFormOpen(false);
        },
      });
    }
  };

  const handleBatchCreateFurnishings = async (
    items: Array<{
      name: string;
      category: FurnishingCategory;
      quantity: number;
      itemCondition: ItemCondition;
      note?: string;
    }>
  ) => {
    try {
      // Call API for each item sequentially
      for (const item of items) {
        await new Promise<void>((resolve, reject) => {
          createMutation.mutate(item, {
            onSuccess: () => {
              resolve();
            },
            onError: (error) => {
              reject(error);
            },
          });
        });
      }
      setIsFurnishingTodoListOpen(false);
    } catch (error) {
      console.error("Error creating furnishings:", error);
    }
  };

  if (isLoading) {
    return (
      <div>
        <LoadingCard />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Không tìm thấy thông tin phòng
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/landlord/dia-diem-cho-thue/${id}/phong`)}
          className="hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Phòng {unit?.code || ""}
              {property?.data?.name && ` | ${property.data.name}`}
            </h1>
          </div>
        </div>
      </div>

      {/* Unit Information and Furnishings - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-6">
        {/* Unit Information Card - 3/10 */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Thông tin phòng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Code className="size-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Mã phòng</p>
                </div>
                <p className="text-base font-semibold">
                  {unit.code || "Chưa có mã"}
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Square className="size-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Diện tích</p>
                </div>
                <p className="text-base font-semibold">{unit.areaSqM} m²</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="size-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Giá thuê</p>
                </div>
                <p className="text-base font-semibold text-primary">
                  {formatVietnamMoney(unit.baseRent)}
                </p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bed className="size-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Phòng ngủ</p>
                </div>
                <p className="text-base font-semibold">{unit.bedrooms} phòng</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bath className="size-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Phòng tắm</p>
                </div>
                <p className="text-base font-semibold">
                  {unit.bathrooms} phòng
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Furnishings Card - 7/10 */}
        <div className="lg:col-span-7">
          <Card className="shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <Package className="size-4 text-primary" />
                  </div>
                  Danh sách vật dụng
                  {furnishings.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {furnishings.length}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  size="sm"
                  onClick={handleAddFurnishing}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  Thêm vật dụng
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingFurnishings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : furnishings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Package className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Chưa có vật dụng nào
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Bấm "Thêm vật dụng" để bắt đầu
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddFurnishing}
                  >
                    <Plus className="size-4 mr-2" />
                    Thêm vật dụng đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {furnishings.map((furnishing) => (
                    <Card
                      key={furnishing.id}
                      className="border-2 hover:border-primary/50 transition-all hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base mb-2">
                              {furnishing.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {categoryLabels[furnishing.category]}
                              </Badge>
                              <Badge
                                className={`text-xs ${
                                  conditionColors[furnishing.itemCondition]
                                }`}
                              >
                                {conditionLabels[furnishing.itemCondition]}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8"
                              onClick={() => handleEditFurnishing(furnishing)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteFurnishing(furnishing)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Số lượng:
                            </span>
                            <span className="font-semibold">
                              {furnishing.quantity}
                            </span>
                          </div>
                          {furnishing.note && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-1">
                                Ghi chú:
                              </p>
                              <p className="text-sm">{furnishing.note}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoices Section */}
      {unitIdNumber > 0 && <InvoiceSection unitId={unitIdNumber} />}

      {/* Contracts Section */}
      {unitIdNumber > 0 && <ContractSection unitId={unitIdNumber} />}

      {/* Appointments Section */}
      {unitIdNumber > 0 && (
        <Card className="shadow-sm mb-6">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="rounded-lg bg-primary/10 p-1.5">
                <Calendar className="size-4 text-primary" />
              </div>
              Lịch hẹn xem phòng
              {appointmentTenants.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {appointmentTenants.length} người
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoadingAppointments ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : appointmentTenants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Calendar className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Chưa có lịch hẹn nào
                </p>
                <p className="text-xs text-muted-foreground">
                  Chưa có ai đặt lịch hẹn xem phòng này
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointmentTenants.map((tenant) => {
                  // Find the unit info for this specific unit
                  const unitInfo = tenant.units.find(
                    (u) => u.unitId === unitIdNumber
                  );

                  return (
                    <Card
                      key={tenant.tenantId}
                      className="border-2 hover:border-primary/50 transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 space-y-3">
                            {/* Tenant Info */}
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="size-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold">
                                  Tenant ID: {tenant.tenantId}
                                </p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Mail className="size-3" />
                                    {tenant.email}
                                  </div>
                                  {tenant.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="size-3" />
                                      {tenant.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Separator />

                            {/* Appointment Statistics */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Tổng số lịch hẹn
                                </p>
                                <p className="text-sm font-semibold">
                                  {tenant.totalAppointments} lịch hẹn
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Lịch hẹn gần nhất
                                </p>
                                <p className="text-sm font-semibold">
                                  {format(
                                    new Date(tenant.lastAppointmentTime),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Unit-specific info */}
                            {unitInfo && (
                              <>
                                <Separator />
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Lịch hẹn cho phòng này
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {unitInfo.unitCode}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {unitInfo.appointmentCount} lịch hẹn
                                    </span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Furnishing Todo Dialog */}
      <FurnishingTodoDialog
        open={isFurnishingTodoListOpen}
        onOpenChange={(open) => setIsFurnishingTodoListOpen(open)}
        unitId={unitId}
        onSubmit={handleBatchCreateFurnishings}
        isPending={createMutation.isPending}
      />

      {/* Furnishing Form Dialog */}
      <FurnishingFormDialog
        open={isFurnishingFormOpen}
        onOpenChange={(open) => {
          setIsFurnishingFormOpen(open);
          if (!open) setSelectedFurnishing(null);
        }}
        unitId={unitId}
        furnishing={selectedFurnishing}
        onSubmit={handleFurnishingSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!furnishingToDelete}
        onOpenChange={(open) => {
          if (!open) setFurnishingToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vật dụng{" "}
              <span className="font-semibold">{furnishingToDelete?.name}</span>?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader className="mr-2 size-4 animate-spin" />
              )}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UnitDetail;
