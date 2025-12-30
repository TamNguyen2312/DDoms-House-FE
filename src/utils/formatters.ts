import DOMPurify from "dompurify";

export function formatVietnamMoney(value: number): string {
  // Dưới 1 triệu -> format bình thường
  if (value < 1_000_000) {
    return value.toLocaleString("vi-VN");
  }

  const millions = Math.floor(value / 1_000_000);
  let remainder = (value % 1_000_000).toString();

  // Bỏ các số 0 liên tiếp từ bên phải
  remainder = remainder.replace(/0+$/, "");

  // Nếu bỏ hết -> chỉ còn "triệu"
  if (!remainder) {
    return `${millions} triệu`;
  }

  // Nếu còn số -> ghép
  return `${millions} triệu ${parseInt(remainder, 10)} vnd`;
}

/**
 * Chuyển đổi tiếng Việt có dấu sang không dấu
 * Ví dụ: "Hồ Chí Minh" => "Ho Chi Minh"
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return str;

  // Mapping các ký tự có dấu sang không dấu
  const accentsMap: Record<string, string> = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  return str
    .split("")
    .map((char) => accentsMap[char] || char)
    .join("")
    .trim();
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    return html;
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ],
    ALLOWED_ATTR: [],
  });
}

/**
 * Check if a string contains HTML tags
 */
export function isHtml(html: string): boolean {
  return /<[a-z][\s\S]*>/i.test(html);
}
/**
 * Format datetime to Vietnamese format
 * @param dateString ISO date string
 * @returns Formatted Vietnamese datetime string
 */
export function formatVietnamDateTime(dateString: string): string {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "-";
    
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
}

/**
 * Format date to Vietnamese format (date only)
 * @param dateString ISO date string
 * @returns Formatted Vietnamese date string
 */
export function formatVietnamDate(dateString: string): string {
  if (!dateString) return "-";
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "-";
    
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
}