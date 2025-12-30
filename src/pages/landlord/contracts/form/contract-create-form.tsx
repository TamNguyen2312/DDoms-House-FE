import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useGetRentalRequestsForLandlord } from "@/hooks/useRentalRequest";
import { useUserProfileById, userProfileKeys } from "@/hooks/useUserProfile";
import { userProfileService } from "@/services/api/user-profile.service";
import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Sparkles, Trash2 } from "lucide-react";

const contractFormSchema = z
  .object({
    unitId: z.number().min(1, "Vui lòng chọn phòng"),
    tenantId: z.number().min(1, "Vui lòng chọn người thuê"),
    startDate: z
      .string()
      .min(1, "Vui lòng chọn ngày bắt đầu")
      .refine(
        (val) => {
          const startDate = new Date(val);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          // Calculate 7 days from today
          const minStartDate = new Date(today);
          minStartDate.setDate(minStartDate.getDate() + 7);
          minStartDate.setHours(0, 0, 0, 0);
          startDate.setHours(0, 0, 0, 0);
          return startDate >= minStartDate;
        },
        { message: "Ngày bắt đầu phải từ 7 ngày sau trở đi" }
      ),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    depositAmount: z
      .number()
      .min(0, "Giá trị hợp đồng phải lớn hơn hoặc bằng 0"),
    templateCode: z.string().min(1, "Vui lòng nhập mã template"),
    content: z.string().min(1, "Vui lòng nhập nội dung hợp đồng"),
    tenantEmail: z.string().email("Email không hợp lệ"),
    feeDetail: z.string().optional(), // Chi tiết phí (ví dụ: "Phí quản lý: 500,000 VND/tháng\nPhí dịch vụ: 200,000 VND/tháng")
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 30;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu ít nhất 30 ngày",
      path: ["endDate"],
    }
  );

export type ContractFormValues = z.infer<typeof contractFormSchema>;

const defaultFormValues: ContractFormValues = {
  unitId: 0,
  tenantId: 0,
  startDate: "",
  endDate: "",
  depositAmount: 0, // Will be handled as empty in UI
  templateCode: "DEFAULT_V1",
  tenantEmail: "",
  content: "Hợp đồng cho thuê",
  feeDetail: undefined,
};

interface ContractCreateFormProps {
  initialData?: ContractFormValues | null;
  onSubmit: (values: ContractFormValues) => void;
  isPending?: boolean;
  onCancel?: () => void;
  preselectedRentalRequestId?: number | null;
}

export const ContractCreateForm = ({
  initialData,
  onSubmit,
  isPending = false,
  onCancel,
  preselectedRentalRequestId,
}: ContractCreateFormProps) => {
  // Track selected rentalRequestId
  // Initialize with preselectedRentalRequestId if provided
  const [selectedRentalRequestId, setSelectedRentalRequestId] = useState<
    number | null
  >(preselectedRentalRequestId || null);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema) as Resolver<
      ContractFormValues,
      Record<string, never>,
      ContractFormValues
    >,
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, reset, watch, setValue } = form;

  // Interface cho section trong feeDetail (mỗi section chỉ có 1 nội dung)
  interface FeeDetailSection {
    id: string;
    number: number;
    title: string;
    content: string; // Chỉ có 1 nội dung thay vì array items
  }

  // Danh sách điều khoản gợi ý (chỉ có title, không có items - người dùng tự nhập)
  const suggestedClauses: Array<{ id: string; title: string }> = [
    {
      id: "suggested-1",
      title: "Giá thuê và phương thức thanh toán",
    },
    {
      id: "suggested-2",
      title: "Chi phí phát sinh",
    },
    {
      id: "suggested-3",
      title: "Quyền và nghĩa vụ bên cho thuê",
    },
    {
      id: "suggested-4",
      title: "Quyền và nghĩa vụ bên thuê",
    },
    {
      id: "suggested-5",
      title: "Các quy định cấm",
    },
    {
      id: "suggested-6",
      title: "Điều kiện chấm dứt hợp đồng",
    },
    {
      id: "suggested-7",
      title: "Điều khoản xử lý tranh chấp",
    },
    {
      id: "suggested-8",
      title: "Điều khoản khác",
    },
  ];

  // Parse feeDetail string thành các sections
  const parseFeeDetailToSections = (feeDetail?: string): FeeDetailSection[] => {
    if (!feeDetail || !feeDetail.trim()) return [];

    const sections: FeeDetailSection[] = [];
    const lines = feeDetail.split("\n");
    let currentSection: FeeDetailSection | null = null;
    let contentLines: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Kiểm tra xem có phải là title section không (format: "số. Title")
      const titleMatch = trimmedLine.match(/^(\d+)\.\s*(.+)$/);
      if (titleMatch) {
        // Lưu section cũ nếu có
        if (currentSection) {
          currentSection.content = contentLines.join("\n");
          sections.push(currentSection);
          contentLines = [];
        }
        // Tạo section mới
        currentSection = {
          id: `section-${Date.now()}-${Math.random()}`,
          number: parseInt(titleMatch[1], 10),
          title: titleMatch[2],
          content: "",
        };
      } else if (currentSection && trimmedLine) {
        // Thêm dòng vào nội dung section hiện tại (giữ nguyên line để giữ spaces)
        contentLines.push(line);
      }
    }

    // Lưu section cuối cùng
    if (currentSection) {
      currentSection.content = contentLines.join("\n");
      sections.push(currentSection);
    }

    return sections;
  };

  // Format sections thành feeDetail string
  const formatSectionsToFeeDetail = (sections: FeeDetailSection[]): string => {
    return sections
      .map((section) => {
        const title = `${section.number}. ${section.title}`;
        const content = section.content.trim();
        return content ? `${title}\n\n${content}` : title;
      })
      .join("\n\n");
  };

  // State để quản lý các sections
  const [feeDetailSections, setFeeDetailSections] = useState<
    FeeDetailSection[]
  >([]);
  // Lưu formatted value hiện tại để tránh parse lại không cần thiết
  const lastFormattedValueRef = useRef<string | undefined>(undefined);
  // Flag để đảm bảo chỉ thêm điều khoản bắt buộc một lần
  const hasInitializedRequiredSections = useRef(false);

  const feeDetailValue = watch("feeDetail");

  // Khởi tạo 2 điều khoản bắt buộc: Giá điện và Giá nước
  useEffect(() => {
    if (
      !hasInitializedRequiredSections.current &&
      feeDetailSections.length === 0 &&
      !feeDetailValue
    ) {
      const requiredSections: FeeDetailSection[] = [
        {
          id: `section-required-1-${Date.now()}`,
          number: 1,
          title: "Giá điện:",
          content: "",
    },
    {
          id: `section-required-2-${Date.now()}`,
          number: 2,
          title: "Giá nước:",
          content: "",
        },
      ];
      setFeeDetailSections(requiredSections);
      updateFeeDetailFromSections(requiredSections);
      hasInitializedRequiredSections.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeDetailSections.length, feeDetailValue]);

  // Helper function để đảm bảo có 2 điều khoản bắt buộc
  const ensureRequiredSections = (
    sections: FeeDetailSection[]
  ): FeeDetailSection[] => {
    const titles = sections.map((s) => s.title.toLowerCase());
    const hasDien = titles.some((t) => t.includes("giá điện"));
    const hasNuoc = titles.some((t) => t.includes("giá nước"));

    const updatedSections = [...sections];

    // Thêm "Giá điện" nếu chưa có
    if (!hasDien) {
      updatedSections.unshift({
        id: `section-required-dien-${Date.now()}`,
        number: 1,
        title: "Giá điện:",
        content: "",
      });
      // Renumber các sections khác
      updatedSections.forEach((s, index) => {
        s.number = index + 1;
      });
    }

    // Thêm "Giá nước" nếu chưa có
    if (!hasNuoc) {
      const dienIndex = updatedSections.findIndex((s) =>
        s.title.toLowerCase().includes("giá điện")
      );
      if (dienIndex >= 0) {
        // Thêm sau "Giá điện"
        updatedSections.splice(dienIndex + 1, 0, {
          id: `section-required-nuoc-${Date.now()}`,
          number: 2,
          title: "Giá nước:",
          content: "",
        });
        // Renumber các sections sau
        updatedSections.forEach((s, index) => {
          s.number = index + 1;
        });
      } else {
        updatedSections.push({
          id: `section-required-nuoc-${Date.now()}`,
          number: updatedSections.length + 1,
          title: "Giá nước:",
          content: "",
        });
      }
    }

    return updatedSections;
  };

  // Sync feeDetail từ form value vào sections state (chỉ khi value thay đổi từ bên ngoài)
  useEffect(() => {
    // Chỉ parse lại nếu value khác với giá trị đã format gần đây nhất
    // Điều này tránh việc parse lại khi chính chúng ta vừa format và set value
    if (
      feeDetailValue !== undefined &&
      feeDetailValue !== lastFormattedValueRef.current
    ) {
      if (feeDetailValue) {
        const parsed = parseFeeDetailToSections(feeDetailValue);
        if (parsed.length > 0) {
          // Đảm bảo có 2 điều khoản bắt buộc
          const sectionsWithRequired = ensureRequiredSections(parsed);
          setFeeDetailSections(sectionsWithRequired);
          // Cập nhật ref với giá trị đã format từ parsed sections
          lastFormattedValueRef.current =
            formatSectionsToFeeDetail(sectionsWithRequired);
          hasInitializedRequiredSections.current = true;
        } else {
          // Nếu parse rỗng, thêm điều khoản bắt buộc
          const requiredSections: FeeDetailSection[] = [
            {
              id: `section-required-1-${Date.now()}`,
              number: 1,
              title: "Giá điện:",
              content: "",
            },
            {
              id: `section-required-2-${Date.now()}`,
              number: 2,
              title: "Giá nước:",
              content: "",
            },
          ];
          setFeeDetailSections(requiredSections);
          updateFeeDetailFromSections(requiredSections);
          hasInitializedRequiredSections.current = true;
        }
      } else {
        // Nếu không có value, thêm điều khoản bắt buộc
        const requiredSections: FeeDetailSection[] = [
          {
            id: `section-required-1-${Date.now()}`,
            number: 1,
            title: "Giá điện:",
            content: "",
          },
          {
            id: `section-required-2-${Date.now()}`,
            number: 2,
            title: "Giá nước:",
            content: "",
          },
        ];
        setFeeDetailSections(requiredSections);
        updateFeeDetailFromSections(requiredSections);
        hasInitializedRequiredSections.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeDetailValue]);

  // Cập nhật form value khi sections thay đổi
  const updateFeeDetailFromSections = (sections: FeeDetailSection[]) => {
    const formatted = formatSectionsToFeeDetail(sections);
    lastFormattedValueRef.current = formatted || undefined;
    setValue("feeDetail", formatted || undefined, { shouldDirty: true });
  };

  // Thêm section mới
  const addSection = () => {
    const nextNumber =
      feeDetailSections.length > 0
        ? Math.max(...feeDetailSections.map((s) => s.number)) + 1
        : 1;
    const newSection: FeeDetailSection = {
      id: `section-${Date.now()}-${Math.random()}`,
      number: nextNumber,
      title: "",
      content: "",
    };
    const updated = [...feeDetailSections, newSection];
    setFeeDetailSections(updated);
    updateFeeDetailFromSections(updated);
  };

  // Xóa section (không cho phép xóa 2 điều khoản bắt buộc)
  const removeSection = (sectionId: string) => {
    const sectionToRemove = feeDetailSections.find((s) => s.id === sectionId);
    if (!sectionToRemove) return;

    // Kiểm tra xem có phải điều khoản bắt buộc không
    const titleLower = sectionToRemove.title.toLowerCase();
    if (titleLower.includes("giá điện") || titleLower.includes("giá nước")) {
      // Không cho phép xóa điều khoản bắt buộc
      return;
    }

    const updated = feeDetailSections.filter((s) => s.id !== sectionId);
    // Renumber sections
    updated.forEach((s, index) => {
      s.number = index + 1;
    });
    setFeeDetailSections(updated);
    updateFeeDetailFromSections(updated);
  };

  // Cập nhật section title
  const updateSectionTitle = (sectionId: string, title: string) => {
    const updated = feeDetailSections.map((s) =>
      s.id === sectionId ? { ...s, title } : s
    );
    setFeeDetailSections(updated);
    updateFeeDetailFromSections(updated);
  };

  // Cập nhật nội dung section
  const updateSectionContent = (sectionId: string, content: string) => {
    const updated = feeDetailSections.map((s) =>
      s.id === sectionId ? { ...s, content } : s
    );
    setFeeDetailSections(updated);
    updateFeeDetailFromSections(updated);
  };

  // Normalize title để so sánh (loại bỏ dấu ":" ở cuối nếu có)
  const normalizeTitleForComparison = (title: string): string => {
    return title.trim().toLowerCase().replace(/:\s*$/, "");
  };

  // Kiểm tra xem suggested clause đã được thêm chưa (dựa vào title, bỏ qua dấu ":")
  const isSuggestedClauseAdded = (suggestedTitle: string): boolean => {
    const normalizedSuggested = normalizeTitleForComparison(suggestedTitle);
    return feeDetailSections.some((s) => {
      const normalizedSection = normalizeTitleForComparison(s.title);
      return normalizedSection === normalizedSuggested;
    });
  };

  // Thêm suggested clause (thêm title với ":" ở cuối, items rỗng để người dùng tự nhập)
  const addSuggestedClause = (suggested: { id: string; title: string }) => {
    // Kiểm tra xem đã có section với title này chưa
    if (isSuggestedClauseAdded(suggested.title)) {
      return;
      }

    // Tìm số thứ tự tiếp theo
    const nextNumber =
      feeDetailSections.length > 0
        ? Math.max(...feeDetailSections.map((s) => s.number)) + 1
        : 1;

    // Tạo section mới với title + ":" ở cuối, content rỗng
    const newSection: FeeDetailSection = {
      id: `section-${Date.now()}-${Math.random()}`,
      number: nextNumber,
      title: `${suggested.title}:`, // Thêm ":" ở cuối để người dùng tiếp tục gõ
      content: "", // Nội dung rỗng để người dùng nhập
    };

    const updated = [...feeDetailSections, newSection];
    setFeeDetailSections(updated);
    updateFeeDetailFromSections(updated);
  };

  // Thêm tất cả suggested clauses
  const addAllSuggestedClauses = () => {
    const newSections: FeeDetailSection[] = [];
    let nextNumber =
      feeDetailSections.length > 0
        ? Math.max(...feeDetailSections.map((s) => s.number)) + 1
        : 1;

    suggestedClauses.forEach((suggested) => {
      // Chỉ thêm nếu chưa có (dựa vào title)
      if (!isSuggestedClauseAdded(suggested.title)) {
        newSections.push({
          id: `section-${Date.now()}-${Math.random()}-${nextNumber}`,
          number: nextNumber++,
          title: `${suggested.title}:`, // Thêm ":" ở cuối để người dùng tiếp tục gõ
          content: "", // Nội dung rỗng để người dùng nhập
        });
      }
    });

    if (newSections.length > 0) {
      const updated = [...feeDetailSections, ...newSections];
      setFeeDetailSections(updated);
      updateFeeDetailFromSections(updated);
    }
  };

  // Fetch rental requests (chỉ ACCEPTED) cho mode rental-requests
  const { data: rentalRequestsData, isLoading: isLoadingRentalRequests } =
    useGetRentalRequestsForLandlord({
      status: "ACCEPTED",
      size: 100, // Get all accepted rental requests
      sort: "createdAt",
      direction: "DESC",
    });

  // Extract accepted rental requests
  const acceptedRentalRequests = useMemo(() => {
    return rentalRequestsData?.content || [];
  }, [rentalRequestsData?.content]);

  // Get unique tenant IDs from rental requests
  const uniqueTenantIds = useMemo(() => {
    const tenantIds = acceptedRentalRequests
      .map((r) => r.tenantId)
      .filter((id) => id > 0);
    return Array.from(new Set(tenantIds));
  }, [acceptedRentalRequests]);

  // Fetch tenant profiles for all rental requests to get emails
  const tenantProfileQueries = useQueries({
    queries: uniqueTenantIds.map((tenantId) => ({
      queryKey: userProfileKeys.detail(tenantId),
      queryFn: async () => {
        const response = await userProfileService.getUserProfileById(tenantId);
        return { tenantId, profile: response.data };
      },
      enabled: tenantId > 0,
    })),
  });

  // Create a map of tenantId -> email for quick lookup
  const tenantEmailMap = useMemo(() => {
    const map = new Map<number, string>();
    tenantProfileQueries.forEach((query) => {
      if (query.data?.profile) {
        map.set(query.data.tenantId, query.data.profile.email);
      }
    });
    return map;
  }, [tenantProfileQueries]);

  // Fetch tenant profile when rental request is selected (for email)
  const selectedRentalRequest = useMemo(() => {
    if (!selectedRentalRequestId) return null;
    return acceptedRentalRequests.find((r) => r.id === selectedRentalRequestId);
  }, [selectedRentalRequestId, acceptedRentalRequests]);

  const selectedTenantIdFromRentalRequest =
    selectedRentalRequest?.tenantId || 0;
  // Fetch tenant profile if needed (for email, phone, displayName)
  const needsTenantProfileFetch =
    selectedTenantIdFromRentalRequest > 0 &&
    (!selectedRentalRequest?.tenant?.email ||
      !selectedRentalRequest?.tenant?.phone ||
      !selectedRentalRequest?.tenant?.displayName);

  const { data: tenantProfile } = useUserProfileById(
    selectedTenantIdFromRentalRequest,
    needsTenantProfileFetch
  );

  // Auto-select preselected rental request when form loads and data is ready
  useEffect(() => {
    if (
      preselectedRentalRequestId &&
      !isLoadingRentalRequests &&
      acceptedRentalRequests.length > 0
    ) {
      const preselected = acceptedRentalRequests.find(
        (r) => r.id === preselectedRentalRequestId
      );
      if (preselected) {
        // Update selected rental request ID
        if (selectedRentalRequestId !== preselectedRentalRequestId) {
          setSelectedRentalRequestId(preselectedRentalRequestId);
        }

        // Always set form values to ensure they're applied (even if reset happened)
        form.setValue("tenantId", preselected.tenantId, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
        form.setValue("unitId", preselected.unitId, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });

        // Try to get email from nested tenant data or from tenantEmailMap
        const email =
          preselected.tenant?.email ||
          tenantEmailMap.get(preselected.tenantId) ||
          "";
        if (email) {
          form.setValue("tenantEmail", email, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      }
    }
  }, [
    preselectedRentalRequestId,
    isLoadingRentalRequests,
    acceptedRentalRequests,
    tenantEmailMap,
    selectedRentalRequestId,
    form,
  ]);

  // Auto-fill tenant email when rental request is selected
  useEffect(() => {
    if (selectedRentalRequest) {
      // Try to get email from nested tenant data first, then from tenantProfile
      const email =
        selectedRentalRequest.tenant?.email || tenantProfile?.email || "";
      if (email) {
        form.setValue("tenantEmail", email);
      }
    }
  }, [selectedRentalRequest, tenantProfile?.email, form]);

  // Reset selections when dialog closes (but preserve preselected rental request)
  useEffect(() => {
    // Reset form when initialData changes (for create mode, initialData is null)
    // But skip reset if we have a preselected rental request to avoid clearing values
    if (!initialData && !preselectedRentalRequestId) {
      reset(defaultFormValues);
    }
  }, [initialData, preselectedRentalRequestId, reset]);

  // Reset form when dialog opens (but preserve preselected rental request)
  // Only reset if there's no preselected rental request
  useEffect(() => {
    if (!initialData && !preselectedRentalRequestId) {
      form.setValue("unitId", 0);
      form.setValue("tenantId", 0);
      form.setValue("tenantEmail", "");
      form.setValue("feeDetail", undefined);
      setSelectedRentalRequestId(null);
    }
  }, [initialData, preselectedRentalRequestId, form]);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mx-0.5">
        {/* Mode Selection Info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
          <div className="flex-1">
            <p className="text-sm font-medium">Chọn yêu cầu thuê</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chọn từ yêu cầu thuê đã được chấp nhận
            </p>
          </div>
          {acceptedRentalRequests.length > 0 && (
            <Badge variant="secondary" className="h-5 px-2">
              {acceptedRentalRequests.length} yêu cầu
            </Badge>
          )}
        </div>

        {/* Rental Requests Selection */}
        <FormField
          control={form.control}
          name="tenantId"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Yêu cầu thuê đã chấp nhận *</FormLabel>
                <Select
                  value={
                    selectedRentalRequestId
                      ? String(selectedRentalRequestId)
                      : ""
                  }
                  onValueChange={(value) => {
                    const rentalRequestId = Number(value);
                    const selected = acceptedRentalRequests.find(
                      (r) => r.id === rentalRequestId
                    );
                    if (selected) {
                      setSelectedRentalRequestId(rentalRequestId);
                      // Auto-fill tenantId
                      field.onChange(selected.tenantId);
                      // Auto-fill unitId
                      form.setValue("unitId", selected.unitId);
                      // tenantEmail will be auto-filled by useEffect when tenantProfileForEmail is loaded
                    }
                  }}
                  disabled={isLoadingRentalRequests}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn yêu cầu thuê đã được chấp nhận" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingRentalRequests ? (
                      <SelectItem value="loading" disabled>
                        Đang tải...
                      </SelectItem>
                    ) : acceptedRentalRequests.length > 0 ? (
                      acceptedRentalRequests.map((request) => {
                        // Get email from tenantEmailMap (fetched via API /api/users/{id})
                        const tenantEmail = tenantEmailMap.get(
                          request.tenantId
                        );
                        return (
                          <SelectItem
                            key={request.id}
                            value={String(request.id)}
                          >
                            <div className="flex flex-col py-1">
                              <span className="font-medium text-sm">
                                {request.unitCode || `Phòng ${request.unitId}`}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {request.propertyName || "Chưa có tên"}
                                {tenantEmail && ` • ${tenantEmail}`}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })
                    ) : (
                      <SelectItem value="no-request" disabled>
                        Không có yêu cầu thuê đã được chấp nhận
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Chọn yêu cầu thuê từ danh sách đã được chấp nhận. Thông tin
                  phòng và người thuê sẽ được điền tự động.
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Display selected rental request info */}
        {selectedRentalRequestId && acceptedRentalRequests.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
            <p className="text-xs text-muted-foreground mb-2">
              Thông tin đã chọn:
            </p>
            <div className="space-y-2">
              {(() => {
                const selected = acceptedRentalRequests.find(
                  (r) => r.id === selectedRentalRequestId
                );
                return selected ? (
                  <>
                    {/* Phòng và Tòa nhà */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Phòng:{" "}
                        <span className="text-primary">
                          {selected.unitCode || `ID: ${selected.unitId}`}
                        </span>
                      </p>
                      {selected.propertyName && (
                        <p className="text-sm">
                          Tòa nhà:{" "}
                          <span className="text-muted-foreground">
                            {selected.propertyName}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Thông tin người yêu cầu */}
                    {(() => {
                      const tenantEmailFromMap = tenantEmailMap.get(
                        selected.tenantId
                      );
                      const tenantEmail =
                        selected.tenant?.email ||
                        tenantEmailFromMap ||
                        tenantProfile?.email;
                      return (
                        (selected.tenant?.displayName ||
                          tenantEmail ||
                          selected.tenant?.phone ||
                          tenantProfile?.displayName ||
                          tenantProfile?.phone ||
                          tenantProfile?.tenantProfile?.fullName) && (
                          <div className="pt-2 border-t space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                              Người yêu cầu:
                            </p>
                            {(selected.tenant?.displayName ||
                              tenantProfile?.displayName ||
                              tenantProfile?.tenantProfile?.fullName) && (
                              <p className="text-sm">
                                Tên:{" "}
                                <span className="text-muted-foreground font-medium">
                                  {selected.tenant?.displayName ||
                                    tenantProfile?.displayName ||
                                    tenantProfile?.tenantProfile?.fullName ||
                                    "Chưa cập nhật"}
                                </span>
                              </p>
                            )}
                            {tenantEmail && (
                              <p className="text-sm">
                                Email:{" "}
                                <span className="text-muted-foreground">
                                  {tenantEmail}
                                </span>
                              </p>
                            )}
                            {(selected.tenant?.phone ||
                              tenantProfile?.phone) && (
                              <p className="text-sm">
                                Số điện thoại:{" "}
                                <span className="text-muted-foreground">
                                  {selected.tenant?.phone ||
                                    tenantProfile?.phone ||
                                    "Chưa cập nhật"}
                                </span>
                              </p>
                            )}
                          </div>
                        )
                      );
                    })()}

                    {selected.message && (
                      <p className="text-xs text-muted-foreground pt-2 border-t">
                        <span className="font-semibold">Tin nhắn:</span>{" "}
                        {selected.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground pt-1 border-t">
                      Tạo ngày:{" "}
                      {format(new Date(selected.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {/* Date Range và Deposit Amount - Layout ngang */}
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => {
              // Get 7 days from today as minimum
              const today = new Date();
              const minDate = new Date(today);
              minDate.setDate(minDate.getDate() + 7);
              const minDateStr = minDate.toISOString().split("T")[0];

              // Calculate max date for end date (startDate + reasonable limit, e.g., 10 years)
              const maxDate = new Date(today);
              maxDate.setFullYear(maxDate.getFullYear() + 10);
              const maxDateStr = maxDate.toISOString().split("T")[0];

              return (
                <FormItem>
                  <FormLabel>Ngày bắt đầu *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={minDateStr}
                      max={maxDateStr}
                      onChange={(e) => {
                        field.onChange(e);
                        // Reset endDate if it becomes invalid
                        const startDate = new Date(e.target.value);
                        const endDateValue = form.getValues("endDate");
                        if (endDateValue) {
                          const endDate = new Date(endDateValue);
                          const diffTime =
                            endDate.getTime() - startDate.getTime();
                          const diffDays = diffTime / (1000 * 60 * 60 * 24);
                          if (diffDays < 30) {
                            // Clear endDate if it's less than 30 days from new startDate
                            form.setValue("endDate", "");
                          }
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Hợp đồng bắt đầu từ 7 ngày sau trở đi
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => {
              const startDateValue = form.watch("startDate");
              let minDateStr = "";
              let maxDateStr = "";

              if (startDateValue) {
                const startDate = new Date(startDateValue);
                // Minimum end date is start date + 30 days
                const minDate = new Date(startDate);
                minDate.setDate(minDate.getDate() + 30);
                minDateStr = minDate.toISOString().split("T")[0];

                // Maximum end date (reasonable limit, e.g., 10 years from start)
                const maxDate = new Date(startDate);
                maxDate.setFullYear(maxDate.getFullYear() + 10);
                maxDateStr = maxDate.toISOString().split("T")[0];
              } else {
                // If no start date, use today + 30 days as minimum
                const today = new Date();
                const minDate = new Date(today);
                minDate.setDate(minDate.getDate() + 30);
                minDateStr = minDate.toISOString().split("T")[0];

                const maxDate = new Date(today);
                maxDate.setFullYear(maxDate.getFullYear() + 10);
                maxDateStr = maxDate.toISOString().split("T")[0];
              }

              return (
                <FormItem>
                  <FormLabel>Ngày kết thúc *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={minDateStr}
                      max={maxDateStr}
                      disabled={!startDateValue}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {startDateValue
                      ? "Phải sau ngày bắt đầu ít nhất 30 ngày (hợp đồng tối thiểu 1 tháng)"
                      : "Vui lòng chọn ngày bắt đầu trước"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Deposit Amount */}
          <FormField
            control={form.control}
            name="depositAmount"
            render={({ field }) => {
              const depositAmount = form.watch("depositAmount") || 0;
              return (
                <FormItem>
                  <FormLabel>Giá trị hợp đồng (VND) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="1000"
                      {...field}
                      value={field.value && field.value > 0 ? field.value : ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (value === "") {
                          field.onChange(0);
                        } else {
                          const parsed = Number(value);
                          field.onChange(Number.isNaN(parsed) ? 0 : parsed);
                        }
                      }}
                      placeholder="Ví dụ: 10000000"
                    />
                  </FormControl>
                  <div className="text-right text-sm text-muted-foreground">
                    Thành tiền:{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(depositAmount)}
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Chi tiết phí và điều khoản (Fee Detail) - Full width */}
        <FormField
          control={form.control}
          name="feeDetail"
          render={() => (
            <FormItem>
              <div className="flex items-center justify-between mb-3">
                <FormLabel>Chi tiết phí và điều khoản</FormLabel>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAllSuggestedClauses}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Thêm tất cả gợi ý
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSection}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm điều khoản
                  </Button>
                </div>
              </div>
              <FormDescription className="text-xs mb-3">
                Thêm các điều khoản và chi tiết phí cho hợp đồng. Mỗi điều khoản
                có số thứ tự, tiêu đề và danh sách các mục.
              </FormDescription>

              {/* Điều khoản gợi ý */}
              <div className="mb-4 p-3 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Điều khoản gợi ý:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {suggestedClauses.map((suggested, index) => {
                    const exists = isSuggestedClauseAdded(suggested.title);
                    return (
                      <Button
                        key={suggested.id}
                        type="button"
                        variant={exists ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => addSuggestedClause(suggested)}
                        disabled={exists}
                        className="justify-start text-left h-auto py-2 px-3 text-xs"
                      >
                        <span className="truncate">
                          {index + 1}. {suggested.title}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {feeDetailSections.length > 0 ? (
                <div className="space-y-4">
                  {feeDetailSections.map((section) => (
                    <div
                      key={section.id}
                      className="p-4 border rounded-lg bg-muted/30 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground w-8 flex-shrink-0">
                              {section.number}.
                            </span>
                        <Input
                              placeholder="Tiêu đề điều khoản (ví dụ: Giá thuê và phương thức thanh toán)"
                              value={section.title}
                          onChange={(e) =>
                                updateSectionTitle(section.id, e.target.value)
                          }
                              className="flex-1"
                        />
                          </div>

                          <div className="flex items-start gap-2">
                            <span className="text-sm font-medium text-muted-foreground w-8 flex-shrink-0"></span>
                        <Textarea
                          placeholder="Nội dung điều khoản..."
                              value={section.content}
                          onChange={(e) =>
                                updateSectionContent(section.id, e.target.value)
                          }
                              className="flex-1 resize-none"
                          rows={4}
                        />
                          </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                          onClick={() => removeSection(section.id)}
                          disabled={
                            section.title.toLowerCase().includes("giá điện") ||
                            section.title.toLowerCase().includes("giá nước")
                          }
                          className="text-destructive hover:text-destructive shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                  Chưa có điều khoản nào. Nhấn "Thêm điều khoản" để bắt đầu.
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Đang xử lý..." : "Tạo hợp đồng"}
          </button>
        </div>
      </form>
    </Form>
  );
};
