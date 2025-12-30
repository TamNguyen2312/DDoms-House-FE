import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateContract } from "@/hooks/useContracts";
import { useToast } from "@/hooks/useToast";
import type { ContractFormValues } from "@/pages/landlord/contracts/form/contract-create-form";
import { ContractCreateForm } from "@/pages/landlord/contracts/form/contract-create-form";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";
import type { IRentalRequest } from "../types";

interface CreateContractFromRentalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalRequest: IRentalRequest | null;
}

export function CreateContractFromRentalDialog({
  open,
  onOpenChange,
  rentalRequest,
}: CreateContractFromRentalDialogProps) {
  const toast = useToast();
  const { mutate: createContract, isPending } = useCreateContract();
  const [selectedRentalRequestId, setSelectedRentalRequestId] = useState<
    number | null
  >(null);

  // Set selected rental request ID when dialog opens
  useEffect(() => {
    if (open && rentalRequest) {
      setSelectedRentalRequestId(rentalRequest.id);
    } else if (!open) {
      setSelectedRentalRequestId(null);
    }
  }, [open, rentalRequest]);

  const handleSubmit = (values: ContractFormValues) => {
    if (!rentalRequest) {
      toast.error("Không tìm thấy thông tin yêu cầu thuê");
      return;
    }

    createContract(
      {
        unitId: values.unitId,
        tenantEmail: values.tenantEmail,
        startDate: values.startDate,
        endDate: values.endDate,
        depositAmount: values.depositAmount,
        templateCode: values.templateCode,
        content: values.content,
        feeDetail: values.feeDetail,
      },
      {
        onSuccess: () => {
          toast.success("Tạo hợp đồng thành công");
          onOpenChange(false);
        },
      }
    );
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl !w-[95vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Tạo hợp đồng từ yêu cầu thuê
          </DialogTitle>
          <DialogDescription>
            {rentalRequest && (
              <span>
                Tạo hợp đồng cho yêu cầu thuê #{rentalRequest.id} -{" "}
                {rentalRequest.unitCode || `Phòng ${rentalRequest.unitId}`}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh] pr-3">
          <ContractCreateForm
            initialData={null}
            onSubmit={handleSubmit}
            isPending={isPending}
            onCancel={handleCancel}
            preselectedRentalRequestId={selectedRentalRequestId}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
