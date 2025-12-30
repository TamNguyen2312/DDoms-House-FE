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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/useToast";
import type { ITenantProfile } from "../types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import type { AxiosError } from "axios";

const tenantProfileFormSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên").optional().or(z.literal("")),
  dob: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  emergencyContact: z.string().optional(),
  nationality: z.string().optional(),
});

type TenantProfileFormValues = z.infer<typeof tenantProfileFormSchema>;

interface TenantProfileFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ITenantProfile | null;
  onSubmit: (values: TenantProfileFormValues) => void;
  isPending?: boolean;
}

export function TenantProfileFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isPending = false,
}: TenantProfileFormDialogProps) {
  const toast = useToast();
  const form = useForm<TenantProfileFormValues>({
    resolver: zodResolver(tenantProfileFormSchema),
    defaultValues: {
      fullName: "",
      dob: "",
      gender: undefined,
      idNumber: "",
      address: "",
      occupation: "",
      emergencyContact: "",
      nationality: "",
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (open && initialData) {
      reset({
        fullName: initialData.fullName || "",
        dob: initialData.dob || "",
        gender: initialData.gender || undefined,
        idNumber: initialData.idNumber || "",
        address: initialData.address || "",
        occupation: initialData.occupation || "",
        emergencyContact: initialData.emergencyContact || "",
        nationality: initialData.nationality || "",
      });
    } else if (open) {
      reset({
        fullName: "",
        dob: "",
        gender: undefined,
        idNumber: "",
        address: "",
        occupation: "",
        emergencyContact: "",
        nationality: "",
      });
    }
  }, [initialData, open, reset]);

  const handleFormSubmit = (values: TenantProfileFormValues) => {
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
          <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ và tên" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày sinh</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới tính</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Nam</SelectItem>
                        <SelectItem value="FEMALE">Nữ</SelectItem>
                        <SelectItem value="OTHER">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CMND/CCCD</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số CMND/CCCD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập địa chỉ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nghề nghiệp</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập nghề nghiệp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liên hệ khẩn cấp</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập số điện thoại liên hệ khẩn cấp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quốc tịch</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập quốc tịch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

