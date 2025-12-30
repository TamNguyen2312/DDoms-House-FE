import { z } from "zod";

// Create Direct Room Schema
export const CreateDirectRoomSchema = z.object({
  otherUserId: z
    .number({
      required_error: "Vui lòng chọn người dùng",
    })
    .positive("ID người dùng không hợp lệ"),
});

export type CreateDirectRoom = z.infer<typeof CreateDirectRoomSchema>;

// Send Message Schema
export const SendMessageSchema = z.object({
  messageType: z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM"], {
    required_error: "Vui lòng chọn loại tin nhắn",
  }),
  content: z
    .string({
      required_error: "Vui lòng nhập nội dung tin nhắn",
    })
    .min(1, "Nội dung tin nhắn không được để trống")
    .max(5000, "Nội dung tin nhắn không được vượt quá 5000 ký tự"),
  fileId: z.number().nullable().optional(),
  replyToMessageId: z.number().nullable().optional(),
});

export type SendMessage = z.infer<typeof SendMessageSchema>;

// Edit Message Schema
export const EditMessageSchema = z.object({
  content: z
    .string({
      required_error: "Vui lòng nhập nội dung tin nhắn",
    })
    .min(1, "Nội dung tin nhắn không được để trống")
    .max(5000, "Nội dung tin nhắn không được vượt quá 5000 ký tự"),
});

export type EditMessage = z.infer<typeof EditMessageSchema>;

