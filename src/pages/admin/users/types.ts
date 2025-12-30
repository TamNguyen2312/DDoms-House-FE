// Types for User Profile API (by ID)

export interface IUserProfile {
  id: number;
  email: string;
  phone: string;
  active: boolean;
  locked: boolean;
  twoFaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  tenantProfile: ITenantProfile | null;
  landlordProfile: ILandlordProfile | null;
}

export interface ITenantProfile {
  userId: number;
  fullName: string | null;
  dob: string | null;
  idNumber: string | null;
  verified: boolean;
}

export interface ILandlordProfile {
  userId: number;
  displayName: string | null;
  verified: boolean;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
}

export interface IUserProfileResponse {
  success: boolean;
  message: string;
  status: string;
  data: IUserProfile;
}

