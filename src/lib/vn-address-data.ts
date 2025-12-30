// Types for VN address data from JSON file
export interface VNProvinceData {
  Code: string;
  FullName: string;
  Wards: VNWardData[];
}

export interface VNWardData {
  Code: string;
  FullName: string;
  ProvinceCode: string;
}

// Import the JSON data
// @ts-ignore - JSON import is supported by Vite
import vnAddressData from "./vn_generated_units.json";

// Cache the parsed data
let cachedProvinces: VNProvinceData[] | null = null;

/**
 * Get all provinces from JSON file
 */
export function getVNProvinces(): VNProvinceData[] {
  if (cachedProvinces) {
    return cachedProvinces;
  }

  cachedProvinces = vnAddressData as VNProvinceData[];
  return cachedProvinces;
}

/**
 * Get province by code
 */
export function getVNProvinceByCode(code: string): VNProvinceData | undefined {
  const provinces = getVNProvinces();
  return provinces.find((p) => p.Code === code);
}

/**
 * Get wards by province code
 */
export function getVNWardsByProvinceCode(provinceCode: string): VNWardData[] {
  const province = getVNProvinceByCode(provinceCode);
  return province?.Wards || [];
}

/**
 * Convert VN address data format to API-compatible format
 */
export function convertVNProvinceToAPIFormat(vnProvince: VNProvinceData): {
  code: number;
  name: string;
  codename: string;
} {
  // Convert code from string to number (remove leading zeros if any)
  const codeNum = parseInt(vnProvince.Code, 10);

  // Generate codename from name (lowercase, replace spaces with hyphens, remove diacritics)
  const codename = vnProvince.FullName.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return {
    code: codeNum,
    name: vnProvince.FullName,
    codename,
  };
}

/**
 * Convert VN ward data format to API-compatible format
 */
export function convertVNWardToAPIFormat(vnWard: VNWardData): {
  code: number;
  name: string;
  codename: string;
  province_code?: number;
} {
  const codeNum = parseInt(vnWard.Code, 10);
  const provinceCodeNum = parseInt(vnWard.ProvinceCode, 10);

  const codename = vnWard.FullName.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return {
    code: codeNum,
    name: vnWard.FullName,
    codename,
    province_code: provinceCodeNum,
  };
}
