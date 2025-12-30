import { z } from "zod";

/**
 * Unit Creation Schema
 * Represents a rental unit within a property
 */

export const UnitCreateSchema = z.object({
  property_id: z.string(),
  code: z
    .string()
    .min(1, "Mã phòng không được để trống")
    .max(20, "Mã phòng không được vượt quá 20 ký tự"),
  area_sq_m: z
    .number()
    .min(10, "Diện tích phải ít nhất 10m²")
    .max(500, "Diện tích không được quá 500m²"),
  status: z
    .string()
    .min(1, "Trạng thái không được để trống")
    .max(20, "Trạng thái không được vượt quá 20 ký tự"),
  bedrooms: z.number().int("Số phòng ngủ phải là số nguyên").min(0).max(10),
  bathrooms: z.number().int("Số phòng tắm phải là số nguyên").min(0).max(10),
  base_rent: z
    .number()
    .min(100000, "Giá cho thuê phải ít nhất 100,000 VNĐ")
    .max(100000000, "Giá cho thuê không hợp lệ"),
});

export type UnitCreate = z.infer<typeof UnitCreateSchema>;
