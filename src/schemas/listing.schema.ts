// schemas/listing.ts
import { z } from "zod";

export const ListingCreateSchema = z.object({
  title: z.string().min(10, "Tiêu đề phải có ít nhất 10 ký tự"),
  description: z.string().optional(),
  listedPrice: z.number().min(200000, "Giá phải lớn hơn hoặc bằng 200.000"),
});

export type ListingCreate = z.infer<typeof ListingCreateSchema>;
