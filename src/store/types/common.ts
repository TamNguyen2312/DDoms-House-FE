export interface IdName {
  id: string;
  name: string;
}

export interface ILandlordRef {
  id: string;
  email?: string;
  phone?: string;
  display_name: string;
  verified?: boolean;
  rating?: number;
}

export interface ITenantRef {
  id?: string;
  full_name: string;
  phone?: string;
}

export interface IPropertyRef {
  name: string;
  address: string;
  district?: string;
}

// USERS
export interface IRole {
  id: string;
  code: string;
  name: string;
}

export interface ILandlordProfile {
  display_name: string;
  verified: boolean;
  kyc_status: string;
}

export interface ITenantProfile {
  full_name: string;
  dob: string;
  id_number: string;
  verified: boolean;
}
