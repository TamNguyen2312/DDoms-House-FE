// Types for Landlord Profile API

export type IKycStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ILandlordProfile {
  userId: number;
  displayName: string | null;
  verified: boolean;
  kycStatus: IKycStatus;
  businessLicense?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  taxCode?: string;
  businessAddress?: string;
}

export interface ILandlordProfileResponse {
  success: boolean;
  message: string;
  status: string;
  data: ILandlordProfile;
}

export interface IUpdateLandlordProfileRequest {
  displayName?: string;
  businessLicense?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  taxCode?: string;
  businessAddress?: string;
}

export interface IUpdateLandlordProfileResponse {
  success: boolean;
  message: string;
  status: string;
  data: ILandlordProfile;
}

