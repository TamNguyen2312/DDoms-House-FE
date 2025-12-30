import {
  convertVNProvinceToAPIFormat,
  convertVNWardToAPIFormat,
  getVNProvinces,
  getVNWardsByProvinceCode,
} from "@/lib/vn-address-data";
import { useEffect, useState } from "react";

// Types
export interface Province {
  code: number;
  name: string;
  codename: string;
  division_type?: string;
  phone_code?: number;
  districts?: District[];
  wards?: Ward[];
}

export interface District {
  code: number;
  name: string;
  codename: string;
  division_type?: string;
  province_code?: number;
  wards?: Ward[];
}

export interface Ward {
  code: number;
  name: string;
  codename: string;
  division_type?: string;
  province_code?: number;
  district_code?: number;
}

interface UseProvincesOptions {
  autoFetch?: boolean;
}

interface UseProvincesReturn {
  provinces: Province[];
  isLoadingProvinces: boolean;
  error: Error | null;
  refetchProvinces: () => Promise<void>;
}

/**
 * Hook để fetch danh sách tỉnh/thành phố
 */
export const useProvinces = (
  options: UseProvincesOptions = { autoFetch: true }
): UseProvincesReturn => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProvinces = async () => {
    setIsLoadingProvinces(true);
    setError(null);
    try {
      // Read from local JSON file instead of API
      const vnProvinces = getVNProvinces();
      const convertedProvinces = vnProvinces.map(convertVNProvinceToAPIFormat);
      setProvinces(convertedProvinces);
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Unknown error");
      setError(error);
      console.error("Error fetching provinces:", error);
    } finally {
      setIsLoadingProvinces(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch) {
      fetchProvinces();
    }
  }, [options.autoFetch]);

  return {
    provinces,
    isLoadingProvinces,
    error,
    refetchProvinces: fetchProvinces,
  };
};

interface UseProvinceDetailOptions {
  provinceCode: number | null;
  enabled?: boolean;
}

interface UseProvinceDetailReturn {
  province: Province | null;
  districts: District[];
  wards: Ward[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook để fetch chi tiết tỉnh/thành phố (bao gồm districts và wards)
 */
export const useProvinceDetail = (
  options: UseProvinceDetailOptions
): UseProvinceDetailReturn => {
  const { provinceCode, enabled = true } = options;
  const [province, setProvince] = useState<Province | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProvinceDetail = async () => {
    if (!provinceCode || !enabled) {
      setProvince(null);
      setDistricts([]);
      setWards([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Read from local JSON file instead of API
      // Convert provinceCode (number) to string format (with leading zero if needed)
      const provinceCodeStr = provinceCode.toString().padStart(2, "0");

      // Get province data
      const vnProvinces = getVNProvinces();
      const vnProvince = vnProvinces.find((p) => p.Code === provinceCodeStr);

      if (!vnProvince) {
        throw new Error(`Province with code ${provinceCode} not found`);
      }

      // Convert province to API format
      const convertedProvince = convertVNProvinceToAPIFormat(vnProvince);
      setProvince(convertedProvince);

      // Districts are not in the JSON file, so we set empty array
      setDistricts([]);

      // Get wards from JSON file
      const vnWards = getVNWardsByProvinceCode(provinceCodeStr);
      const convertedWards = vnWards.map(convertVNWardToAPIFormat);
      setWards(convertedWards);
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Unknown error");
      setError(error);
      console.error("Error fetching province detail:", error);
      setProvince(null);
      setDistricts([]);
      setWards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinceDetail();
  }, [provinceCode, enabled]);

  return {
    province,
    districts,
    wards,
    isLoading,
    error,
    refetch: fetchProvinceDetail,
  };
};

interface UseDistrictDetailOptions {
  districtCode: number | null;
  enabled?: boolean;
}

interface UseDistrictDetailReturn {
  district: District | null;
  wards: Ward[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook để fetch chi tiết quận/huyện (bao gồm wards)
 */
export const useDistrictDetail = (
  options: UseDistrictDetailOptions
): UseDistrictDetailReturn => {
  const { districtCode, enabled = true } = options;
  const [district, setDistrict] = useState<District | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDistrictDetail = async () => {
    if (!districtCode || !enabled) {
      setDistrict(null);
      setWards([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://provinces.open-api.vn/api/v2/d/${districtCode}?depth=2`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch district detail: ${res.statusText}`);
      }
      const data: District = await res.json();
      setDistrict(data);
      setWards(data.wards || []);
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Unknown error");
      setError(error);
      console.error("Error fetching district detail:", error);
      setDistrict(null);
      setWards([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistrictDetail();
  }, [districtCode, enabled]);

  return {
    district,
    wards,
    isLoading,
    error,
    refetch: fetchDistrictDetail,
  };
};
