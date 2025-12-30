// Contract Detail Types
export interface IContractUnit {
  unitId: number;
  unitCode: string;
  propertyId: number;
  propertyName: string;
  addressLine: string;
  ward: string;
  district: string | null;
  city: string;
}

export interface IContractDetail {
  id: number;
  unitId: number;
  landlordId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  pendingEndDate: string | null;
  status:
    | "SENT"
    | "DRAFT"
    | "SIGNED"
    | "ACTIVE"
    | "TERMINATION_PENDING"
    | "CANCELLED"
    | "EXPIRED"
    | "ACTIVE";
  depositAmount: number;
  createdAt: string;
  feeDetail?: string; // Chi tiết phí (ví dụ: "1. Giá điện:\n\n4000đ/kWh\n\n2. Giá nước:\n\n15000đ/m3")
  unit?: IContractUnit;
  landlord?: {
    userId: number;
    displayName: string | null;
    email: string;
    phone: string;
  };
  tenant?: {
    userId: number;
    displayName: string | null;
    email: string;
    phone: string;
  };
}

export interface IContractVersion {
  id: number;
  versionNo: number;
  templateCode: string;
  content: string;
  createdAt: string | null;
}

export interface IContractParty {
  id: number;
  userId: number;
  role: "LANDLORD" | "TENANT";
  email: string;
  phone: string;
}

export interface IContractSignature {
  id?: number;
  partyId?: number;
  signedAt?: string;
  signatureData?: string;
}

export interface IContractDetailResponse {
  contract: IContractDetail;
  versions: IContractVersion[];
  parties: IContractParty[];
  signatures: IContractSignature[];
}

export interface RequestOTPRequest {
  contractId: number;
}

export interface RequestOTPResponse {
  success: boolean;
  message: string;
  otpSent: boolean;
}

export interface SignContractRequest {
  contractId: number;
  otp: string;
  role: "landlord" | "tenant";
  partyId: number;
}

export interface ExtendContractRequest {
  newEndDate: string;
  note: string;
}

export interface TerminateContractRequest {
  type: "normal_expire" | "early_terminate";
  reason: string;
}

export interface TerminationRequestConsent {
  id: number;
  partyId: number;
  userId: number;
  status: "PENDING" | "SIGNED";
  method: string | null;
  signedAt: string | null;
}

export interface TerminationRequest {
  id: number;
  contractId: number;
  initiatorPartyId: number;
  type: "EARLY_TERMINATE" | "NORMAL_EXPIRE";
  reason: string;
  status: "SIGNING" | "APPROVED" | "REJECTED" | "COMPLETED";
  previousStatus: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  consents: TerminationRequestConsent[];
}

export interface ConfirmedTenant {
  tenantId: number;
  email: string;
  phone: string;
  appointmentId: number;
  appointmentTime: string;
  unitId: number;
  unitCode: string;
}
