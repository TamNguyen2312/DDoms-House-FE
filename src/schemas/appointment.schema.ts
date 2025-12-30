import { z } from "zod";

export const PropertyCreateSchema = z.object({
  name: z
    .string()
    .min(3, "Tên phòng/căn hộ phải có ít nhất 3 ký tự")
    .max(100, "Tên không được vượt quá 100 ký tự"),
  addressLine: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  ward: z.string().min(1, "Vui lòng chọn xã/phường"),
  city: z.string().min(1, "Vui lòng chọn thành phố/tỉnh"),

  // ✅ Đặt .optional() ở ngoài -> TypeScript hiểu đúng là optional
  latitude: z
    .preprocess((val) =>
      val === undefined || val === null || val === "" ? undefined : Number(val)
    )
    .pipe(z.number())
    .optional(),

  longitude: z
    .preprocess((val) =>
      val === undefined || val === null || val === "" ? undefined : Number(val)
    )
    .pipe(z.number())
    .optional(),
});

export type PropertyCreate = z.infer<typeof PropertyCreateSchema>;

/**
 * Property Update Schema
 * Used when landlord edits property details
 */
export const PropertyUpdateSchema = PropertyCreateSchema.partial();

export type PropertyUpdate = z.infer<typeof PropertyUpdateSchema>;

/**
 * Unit Creation Schema
 * Represents a rental unit within a property
 */
export const UnitCreateSchema = z.object({
  code: z
    .string()
    .min(1, "Mã phòng không được để trống")
    .max(20, "Mã phòng không được vượt quá 20 ký tự"),
  areaSqM: z
    .number()
    .min(10, "Diện tích phải ít nhất 10m²")
    .max(500, "Diện tích không được quá 500m²"),
  bedrooms: z.number().int("Số phòng ngủ phải là số nguyên").min(0).max(10),
  bathrooms: z.number().int("Số phòng tắm phải là số nguyên").min(0).max(10),
  baseRent: z
    .number()
    .min(100000, "Giá cho thuê phải ít nhất 100,000 VNĐ")
    .max(100000000, "Giá cho thuê không hợp lệ"),
});

export type UnitCreate = z.infer<typeof UnitCreateSchema>;

/**
 * Unit Update Schema
 * All fields are optional for partial updates
 */
export const UnitUpdateSchema = UnitCreateSchema.partial();

export type UnitUpdate = z.infer<typeof UnitUpdateSchema>;

/**
 * Listing Creation Schema
 * Used when creating a public listing for a unit
 */
export const ListingCreateSchema = z.object({
  unitId: z.string().uuid("ID đơn vị không hợp lệ"),
  title: z
    .string()
    .min(10, "Tiêu đề phải có ít nhất 10 ký tự")
    .max(150, "Tiêu đề không được vượt quá 150 ký tự"),
  description: z
    .string()
    .min(20, "Mô tả phải có ít nhất 20 ký tự")
    .max(2000, "Mô tả không được vượt quá 2000 ký tự"),
  listedPrice: z
    .number()
    .min(100000, "Giá phải ít nhất 100,000 VNĐ")
    .max(100000000, "Giá không hợp lệ"),
  isPublic: z.boolean().default(false),
});

export type ListingCreate = z.infer<typeof ListingCreateSchema>;

/**
 * Listing Update Schema
 */
export const ListingUpdateSchema = ListingCreateSchema.omit({
  unitId: true,
}).partial();

export type ListingUpdate = z.infer<typeof ListingUpdateSchema>;

/**
 * Amenities Schema
 * List of amenities for a property/unit
 */
export const AmenitiesSchema = z.array(
  z.enum([
    "ac",
    "private",
    "flexible",
    "security",
    "kitchen",
    "elevator",
    "loft",
    "wifi",
    "hotwater",
    "washing",
    "parking",
    "nearmarket",
  ])
);

export type Amenities = z.infer<typeof AmenitiesSchema>;

/**
 * Image Upload Schema
 * For validating image uploads
 */
export const ImageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "Kích thước ảnh không được vượt quá 5MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Định dạng ảnh không hợp lệ"
    ),
});

export type ImageUpload = z.infer<typeof ImageUploadSchema>;

/**
 * Complete Listing Form Schema
 * Combines listing, unit details, and amenities
 */
export const CompleteListingFormSchema = z.object({
  // Unit details
  unitCode: z.string().min(1, "Mã phòng không được để trống"),
  areaSqM: z.number().min(10, "Diện tích phải ít nhất 10m²"),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  baseRent: z.number().min(100000, "Giá cho thuê phải ít nhất 100,000 VNĐ"),

  // Listing details
  title: z.string().min(10, "Tiêu đề phải có ít nhất 10 ký tự"),
  description: z.string().min(20, "Mô tả phải có ít nhất 20 ký tự"),
  listedPrice: z.number().min(100000, "Giá phải ít nhất 100,000 VNĐ"),

  addressLine: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  ward: z.string().min(1, "Vui lòng chọn xã/phường"),
  city: z.string().min(1, "Vui lòng chọn thành phố/tỉnh"),

  // Amenities
  amenities: AmenitiesSchema.default([]),

  // Contact info (optional)
  phoneContact: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .optional(),
  emailContact: z.string().email("Email không hợp lệ").optional(),
});

export type CompleteListingForm = z.infer<typeof CompleteListingFormSchema>;

/**
 * Form submission schema with validation
 * includes runtime parsing with error handling
 */
export function validatePropertyForm(data: unknown) {
  return PropertyCreateSchema.safeParse(data);
}

export function validateUnitForm(data: unknown) {
  return UnitCreateSchema.safeParse(data);
}

export function validateListingForm(data: unknown) {
  return CompleteListingFormSchema.safeParse(data);
}
