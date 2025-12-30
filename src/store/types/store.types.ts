// src/store/types/store.types.ts

export interface User {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  avatar?: string;
  roles: Array<"ADMIN" | "LANDLORD" | "TENANT">;
  verified: boolean;
  status?: "active" | "inactive" | "banned";
  createdAt?: string;
  updatedAt?: string;
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    fullAddress: string;
  };
  price: number;
  area: number;
  roomType: string;
  images: string[];
  utilities: string[];
  status: "available" | "rented" | "maintenance" | "pending";
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  electricityPrice: number;
  waterPrice: number;
  status: "active" | "expired" | "cancelled" | "pending";
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  contractId: string;
  month: number;
  year: number;
  roomPrice: number;
  electricityUsage: number;
  waterUsage: number;
  electricityCost: number;
  waterCost: number;
  otherFees: number;
  totalAmount: number;
  paidAmount: number;
  status: "unpaid" | "partial" | "paid" | "overdue";
  paymentDate?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  propertyId?: string;
  content: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

// Store States
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  favorites: string[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  filters: {
    search?: string;
    city?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    roomType?: string;
    utilities?: string[];
  };
}

export interface ContractState {
  contracts: Contract[];
  selectedContract: Contract | null;
  isLoading: boolean;
  error: string | null;
}

export interface InvoiceState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  statistics: {
    totalRevenue: number;
    paidInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;
  };
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversation: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isSidebarOpen: boolean;
  theme: "light" | "dark";
  notifications: Notification[];
  isLoading: boolean;
}

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Store Actions
export interface AuthActions {
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  initializeAuth: (user: User | null, accessToken: string | null) => void;
  clearError: () => void;
}

export interface PropertyActions {
  fetchProperties: (filters?: PropertyState["filters"]) => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  createProperty: (data: Partial<Property>) => Promise<void>;
  updateProperty: (id: string, data: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  toggleFavorite: (propertyId: string) => void;
  setFilters: (filters: Partial<PropertyState["filters"]>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
}

export interface ContractActions {
  fetchContracts: () => Promise<void>;
  fetchContractById: (id: string) => Promise<void>;
  createContract: (data: Partial<Contract>) => Promise<void>;
  updateContract: (id: string, data: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
}

export interface InvoiceActions {
  fetchInvoices: (contractId?: string) => Promise<void>;
  fetchInvoiceById: (id: string) => Promise<void>;
  createInvoice: (data: Partial<Invoice>) => Promise<void>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
}

export interface ChatActions {
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    receiverId: string,
    content: string,
    propertyId?: string
  ) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
}

export interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark") => void;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  setLoading: (loading: boolean) => void;
}

// Additional Types
export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone: string;
  roleCode: "TENANT" | "LANDLORD";
}
