import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useMemo } from "react";
import type { IContract } from "../../../admin/contracts/types";
import type { ContractFormValues } from "./contract-create-form";
import { ContractCreateForm } from "./contract-create-form";
import {
  ContractDraftUpdateForm,
  type UpdateContractFormValues,
} from "./contract-draft-update-form";

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IContract | null;
  onSubmit: (values: ContractFormValues | UpdateContractFormValues) => void;
  isPending?: boolean;
}

export const ContractFormDialog = ({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending = false,
}: ContractFormDialogProps) => {
  // Check if this is an update mode for a DRAFT contract
  const isDraftContract = initialData?.status === "DRAFT";

  const dialogTitle = useMemo(() => {
    if (!initialData) return "Tạo hợp đồng mới";
    if (isDraftContract) return "Chỉnh sửa hợp đồng nháp";
    return "Xem thông tin hợp đồng";
  }, [initialData, isDraftContract]);

  const dialogDescription = useMemo(() => {
    if (!initialData)
      return "Điền thông tin chi tiết để tạo hợp đồng thuê phòng mới.";
    if (isDraftContract)
      return "Chỉnh sửa đầy đủ thông tin hợp đồng ở trạng thái nháp.";
    return "Chỉ có thể xem thông tin cơ bản của hợp đồng đã gửi.";
  }, [initialData, isDraftContract]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      // Form components will handle their own reset
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl !w-[95vw]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-3">
          {!initialData ? (
            // Create Form
            <ContractCreateForm
              initialData={null}
              onSubmit={onSubmit as (values: ContractFormValues) => void}
              isPending={isPending}
              onCancel={() => onOpenChange(false)}
            />
          ) : (
            // Draft Update Form (full edit)
            <ContractDraftUpdateForm
              initialData={initialData}
              onSubmit={onSubmit as (values: UpdateContractFormValues) => void}
              isPending={isPending}
              onCancel={() => onOpenChange(false)}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
