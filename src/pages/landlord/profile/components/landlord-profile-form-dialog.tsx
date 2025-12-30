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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ILandlordProfile } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";

const landlordProfileFormSchema = z.object({
  displayName: z.string().optional(),
  businessLicense: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  taxCode: z.string().optional(),
  businessAddress: z.string().optional(),
});

type LandlordProfileFormValues = z.infer<typeof landlordProfileFormSchema>;

interface LandlordProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ILandlordProfile | null;
  onSubmit: (values: LandlordProfileFormValues) => void;
  isPending?: boolean;
}

export function LandlordProfileFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending = false,
}: LandlordProfileFormDialogProps) {
  const form = useForm<LandlordProfileFormValues>({
    resolver: zodResolver(landlordProfileFormSchema),
    defaultValues: {
      displayName: "",
      businessLicense: "",
      bankName: "",
      bankAccountNumber: "",
      bankAccountName: "",
      taxCode: "",
      businessAddress: "",
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (open && initialData) {
      reset({
        displayName: initialData.displayName || "",
        businessLicense: initialData.businessLicense || "",
        bankName: initialData.bankName || "",
        bankAccountNumber: initialData.bankAccountNumber || "",
        bankAccountName: initialData.bankAccountName || "",
        taxCode: initialData.taxCode || "",
        businessAddress: initialData.businessAddress || "",
      });
    } else if (open) {
      reset({
        displayName: "",
        businessLicense: "",
        bankName: "",
        bankAccountNumber: "",
        bankAccountName: "",
        taxCode: "",
        businessAddress: "",
      });
    }
  }, [initialData, open, reset]);

  const handleFormSubmit = (values: LandlordProfileFormValues) => {
    // Remove empty strings
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== "" && v !== undefined)
    );
    onSubmit(cleanedValues);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin doanh nghiệp</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin profile của bạn
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-3">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên hiển thị</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên hiển thị" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giấy phép kinh doanh</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số giấy phép kinh doanh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã số thuế</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập mã số thuế" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ doanh nghiệp</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập địa chỉ doanh nghiệp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Thông tin ngân hàng</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên ngân hàng</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên ngân hàng" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankAccountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số tài khoản</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số tài khoản" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankAccountName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên chủ tài khoản</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên chủ tài khoản" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

