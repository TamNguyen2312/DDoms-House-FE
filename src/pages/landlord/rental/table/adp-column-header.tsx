import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";

/**
 * Props cho component tiêu đề cột của bảng hoạt động
 * @template TData Kiểu dữ liệu của hàng
 * @template TValue Kiểu dữ liệu của giá trị cột
 */
interface ADOColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>; // Cột từ thư viện TanStack Table
  title: string; // Tiêu đề hiển thị của cột
}

/**
 * Component hiển thị tiêu đề cột với khả năng sắp xếp và tùy chỉnh
 * @template TData Kiểu dữ liệu của hàng
 * @template TValue Kiểu dữ liệu của giá trị cột
 */
export function ADLColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: ADOColumnHeaderProps<TData, TValue>) {
  // Nếu cột không hỗ trợ sắp xếp, chỉ hiển thị tiêu đề thông thường
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  // Hiển thị tiêu đề với menu tùy chọn sắp xếp
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-accent p-0 px-2"
          >
            <span className="mr-2 capitalize">{title}</span>
            {/* Hiển thị biểu tượng theo trạng thái sắp xếp hiện tại */}
            {column.getIsSorted() === "desc" ? (
              <ArrowDown />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp />
            ) : (
              <ChevronsUpDown />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {/* Tùy chọn sắp xếp tăng dần */}
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="text-muted-foreground/70 size-3.5" />
            Tăng dần
          </DropdownMenuItem>
          {/* Tùy chọn sắp xếp giảm dần */}
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="text-muted-foreground/70 size-3.5" />
            Giảm dần
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Tùy chọn ẩn cột */}
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="text-muted-foreground/70 size-3.5" />
            Ẩn cột
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
