export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>; // nếu API trả về field errors, tuỳ chọn
}
