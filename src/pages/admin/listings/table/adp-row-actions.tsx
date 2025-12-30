import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateStatusListing } from "@/hooks/useListing";
import { useToast } from "@/hooks/useToast";
import type { ListingUpdateRequest } from "@/services/api/listing.service";
import { CheckCircle, Download, Eye, MoreVertical, Trash2 } from "lucide-react";
import type { IListing } from "../types";

// Zod schema cho update status
const updateStatusSchema = z.object({
  action: z.enum(["approve", "reject"], {
    required_error: "Vui lòng chọn hành động",
  }),
  reason: z
    .string()
    .min(10, "Lý do phải có ít nhất 10 ký tự")
    .max(500, "Lý do không được quá 500 ký tự"),
});

type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

interface ADLRowActionsProps {
  row: IListing;
  onView?: (id: number) => void;
  onUpdate?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function ADLRowActions({
  row,
  onView,
  onUpdate,
  onDelete,
}: ADLRowActionsProps) {
  const toast = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: updateListing, isPending } = useUpdateStatusListing();

  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      action: undefined,
      reason: "",
    },
  });

  // Cập nhật trạng thái - xử lý trong component
  const handleUpdateStatus = async (data: ListingUpdateRequest) => {
    setIsLoading(true);
    try {
      updateListing(
        { id: row.id, data },
        {
          onSuccess: () => {},
        }
      );
      toast.success("Cập nhật thành công");

      setIsStatusDialogOpen(false);
      form.reset();
    } catch (err: unknown) {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {onView && (
            <DropdownMenuItem
              onClick={() => {
                onView(row.id);
              }}
            >
              <Eye size={20} strokeWidth={1.5} />
              <span>Xem</span>
            </DropdownMenuItem>
          )}
          {onUpdate && (
            <DropdownMenuItem onClick={() => onUpdate(row.id)}>
              <Download size={20} strokeWidth={1.5} />
              <span>Chỉnh sửa</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setIsStatusDialogOpen(true)}>
            <CheckCircle size={20} strokeWidth={1.5} />
            <span>Cập nhật trạng thái</span>
          </DropdownMenuItem>
          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 size={20} strokeWidth={1.5} />
                <span>Xóa</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog cập nhật trạng thái */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-primary" />
              Cập nhật trạng thái
            </DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái cho listing
              <span className="font-semibold"> {row.title}</span>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateStatus)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hành động</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hành động" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="approve">Chấp nhận</SelectItem>
                        <SelectItem value="reject">Từ chối</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập lý do cho quyết định của bạn..."
                        className="min-h-[100px] resize-none"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="border-t border-dashed pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsStatusDialogOpen(false);
                    form.reset();
                  }}
                  disabled={isLoading}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Xác nhận"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xoá */}
      {onDelete && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="size-5 text-red-500" />
                Xác nhận xóa
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa listing
              <span className="font-semibold"> {row.title}</span>? Hành động này
              không thể hoàn tác.
            </DialogDescription>
            <DialogFooter className="border-t border-dashed pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(row.id);
                  setIsDeleteDialogOpen(false);
                }}
              >
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
