// Types for Tenant Profile API

export interface ITenantProfile {
  userId: number;
  fullName: string | null;
  dob: string | null;
  idNumber: string | null;
  verified: boolean;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  occupation?: string;
  emergencyContact?: string;
  nationality?: string;
}

export interface ITenantProfileResponse {
  success: boolean;
  message: string;
  status: string;
  data: ITenantProfile;
}

export interface IUpdateTenantProfileRequest {
  fullName?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  idNumber?: string;
  address?: string;
  occupation?: string;
  emergencyContact?: string;
  nationality?: string;
}

export interface IUpdateTenantProfileResponse {
  success: boolean;
  message: string;
  status: string;
  data: ITenantProfile;
}

