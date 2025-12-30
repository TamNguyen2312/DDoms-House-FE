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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateFurnishing,
  useDeleteFurnishing,
  useFurnishings,
  useUnitContracts,
  useUnitInvoices,
  useUpdateFurnishing,
} from "@/hooks/useUnit";
import type {
  FurnishingCategory,
  IFurnishing,
  IUnit,
  ItemCondition,
} from "@/services/api/unit.service";
import { formatVietnamMoney } from "@/utils/formatters";
import {
  Bath,
  Bed,
  Code,
  DollarSign,
  Edit,
  FileText,
  Home,
  Loader,
  Plus,
  Square,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { FurnishingFormDialog } from "./furnishing-form-dialog";

interface ViewUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: IUnit | null;
}

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

export function ViewUnitDialog({
  open,
  onOpenChange,
  unit,
}: ViewUnitDialogProps) {
  const [isFurnishingFormOpen, setIsFurnishingFormOpen] = useState(false);
  const [selectedFurnishing, setSelectedFurnishing] =
    useState<IFurnishing | null>(null);
  const [furnishingToDelete, setFurnishingToDelete] =
    useState<IFurnishing | null>(null);

  if (!unit || !unit.id) return null;

  const unitId = String(unit.id);
  const unitIdNumber = unit.id;
  const { data: furnishings = [], isLoading: isLoadingFurnishings } =
    useFurnishings(unitId);
  const createMutation = useCreateFurnishing(unitId);
  const updateMutation = useUpdateFurnishing(unitId);
  const deleteMutation = useDeleteFurnishing(unitId);

  // Fetch invoices and contracts when dialog is open
  const { data: invoicesData, isLoading: isLoadingInvoices } = useUnitInvoices(
    unitIdNumber,
    {
      page: 0,
      size: 5,
      sort: "issuedAt",
      direction: "DESC",
    },
    open
  );

  const { data: contractsData, isLoading: isLoadingContracts } =
    useUnitContracts(
      unitIdNumber,
      {
        page: 0,
        size: 5,
        sort: "createdAt",
        direction: "DESC",
      },
      open
    );

  const invoices = invoicesData?.content || [];
  const contracts = contractsData?.content || [];

  const handleAddFurnishing = () => {
    setSelectedFurnishing(null);
    setIsFurnishingFormOpen(true);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="size-5 text-primary" />
            Chi tiết phòng
          </DialogTitle>
          <DialogDescription>Thông tin chi tiết về phòng con</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mã phòng */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Code className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Mã phòng:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {unit.code || "Chưa có mã"}
            </p>
          </div>

          {/* Diện tích */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Square className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Diện tích:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {unit.areaSqM} m²
            </p>
          </div>

          {/* Grid 2 cột cho phòng ngủ và phòng tắm */}
          <div className="grid grid-cols-2 gap-4">
            {/* Phòng ngủ */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bed className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Số phòng ngủ:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {unit.bedrooms} phòng
              </p>
            </div>

            {/* Phòng tắm */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bath className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Số phòng tắm:</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {unit.bathrooms} phòng
              </p>
            </div>
          </div>

          {/* Giá thuê */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="size-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Giá thuê cơ bản:</span>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              {formatVietnamMoney(unit.baseRent)}
            </p>
          </div>

          {/* Vật dụng */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Danh sách vật dụng</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddFurnishing}
                className="h-8"
              >
                <Plus className="size-4 mr-1" />
                Thêm vật dụng
              </Button>
            </div>

            {isLoadingFurnishings ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : furnishings.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Chưa có vật dụng nào
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {furnishings.map((furnishing) => (
                  <div
                    key={furnishing.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {furnishing.name}
                        </span>
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
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          Số lượng:{" "}
                          <span className="font-medium">
                            {furnishing.quantity}
                          </span>
                        </p>
                        {furnishing.note && <p>Ghi chú: {furnishing.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
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
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteFurnishing(furnishing)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grid 2 cột cho Invoices và Contracts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border-t pt-4 mt-4">
            {/* Hóa đơn */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="size-4 text-primary" />
                <span className="text-sm font-semibold">Hóa đơn gần đây</span>
              </div>
              {isLoadingInvoices ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Chưa có hóa đơn
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.invoiceId}
                      className="p-2 border rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          #{invoice.invoiceId}
                        </span>
                        <Badge
                          variant={
                            invoice.status === "PAID"
                              ? "default"
                              : invoice.status === "OVERDUE"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        <p>
                          Loại:{" "}
                          {invoice.type === "CONTRACT" ? "Hợp đồng" : "Dịch vụ"}
                        </p>
                        <p>
                          Tổng:{" "}
                          <span className="font-medium text-primary">
                            {formatVietnamMoney(invoice.totalAmount)}
                          </span>
                        </p>
                        {invoice.issuedAt && (
                          <p>
                            Ngày phát hành:{" "}
                            {new Date(invoice.issuedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hợp đồng */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="size-4 text-primary" />
                <span className="text-sm font-semibold">Hợp đồng gần đây</span>
              </div>
              {isLoadingContracts ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Chưa có hợp đồng
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {contracts.map((contract) => (
                    <div
                      key={contract.contractId}
                      className="p-2 border rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          #{contract.contractId}
                        </span>
                        <Badge
                          variant={
                            contract.status === "ACTIVE"
                              ? "default"
                              : contract.status === "TERMINATED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {contract.status}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        <p>
                          Người thuê:{" "}
                          <span className="font-medium">
                            {contract.tenant.displayName}
                          </span>
                        </p>
                        <p>
                          Đặt cọc:{" "}
                          <span className="font-medium text-primary">
                            {formatVietnamMoney(contract.depositAmount)}
                          </span>
                        </p>
                        <p>
                          {new Date(contract.startDate).toLocaleDateString(
                            "vi-VN"
                          )}{" "}
                          -{" "}
                          {new Date(contract.endDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>

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
    </Dialog>
  );
}
