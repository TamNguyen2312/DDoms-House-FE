import { z } from "zod";

/**
 * Create Repair Request Schema
 */
export const CreateRepairRequestSchema = z.object({
  unitId: z.number().int().positive("ID phòng phải là số dương"),
  title: z
    .string()
    .min(3, "Tiêu đề phải có ít nhất 3 ký tự")
    .max(200, "Tiêu đề không được vượt quá 200 ký tự"),
  description: z
    .string()
    .min(10, "Mô tả phải có ít nhất 10 ký tự")
    .max(2000, "Mô tả không được vượt quá 2000 ký tự"),
  occurredAt: z.string().datetime("Thời gian xảy ra không hợp lệ"),
  fileIds: z.array(z.number().int().positive()).optional().default([]),
});

export type CreateRepairRequest = z.infer<typeof CreateRepairRequestSchema>;

/**
 * Cancel Repair Request Schema
 */
export const CancelRepairRequestSchema = z.object({
  cancelReason: z
    .string()
    .min(5, "Lý do hủy phải có ít nhất 5 ký tự")
    .max(500, "Lý do hủy không được vượt quá 500 ký tự"),
});

export type CancelRepairRequest = z.infer<typeof CancelRepairRequestSchema>;

/**
 * Update Repair Request Status Schema
 */
export const UpdateRepairRequestStatusSchema = z
  .object({
    status: z.enum(["PENDING", "IN_PROGRESS", "DONE", "CANCEL"], {
      errorMap: () => ({ message: "Trạng thái không hợp lệ" }),
    }),
    cancelReason: z.string().optional(),
  })
  .refine(
    (data) => {
      // Nếu status là CANCEL, cancelReason là bắt buộc và phải có ít nhất 5 ký tự
      if (data.status === "CANCEL") {
        return (
          data.cancelReason &&
          data.cancelReason.trim().length >= 5 &&
          data.cancelReason.trim().length <= 500
        );
      }
      // Nếu status không phải CANCEL, cancelReason không cần thiết
      return true;
    },
    {
      message: "Lý do hủy phải có ít nhất 5 ký tự và không quá 500 ký tự",
      path: ["cancelReason"],
    }
  );

export type UpdateRepairRequestStatus = z.infer<
  typeof UpdateRepairRequestStatusSchema
>;

