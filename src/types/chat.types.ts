// Chat Room Types
export type RoomType = "DIRECT" | "GROUP" | "SUPPORT";
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM";

// Chat Room Interface
export interface IChatRoom {
  id: number;
  roomType: RoomType;
  name: string | null;
  description: string | null;
  createdBy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  participantCount: number;
  unreadCount: number;
  lastMessagePreview: string | null;
}

// Chat Message Interface
export interface IChatMessage {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  messageType: MessageType;
  content: string;
  fileId: number | null;
  fileUrl: string | null;
  replyToMessageId: number | null;
  isEdited: boolean;
  isDeleted: boolean;
  sentAt: string;
  editedAt: string | null;
  readCount: number;
  isReadByMe: boolean;
}

// Paginated Response Types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Request Types
export interface GetRoomsRequest {
  page?: number;
  size?: number;
}

export interface CreateDirectRoomRequest {
  otherUserId: number;
}

export interface GetMessagesRequest {
  page?: number;
  size?: number;
}

export interface SendMessageRequest {
  messageType: MessageType;
  content: string;
  fileId: number | null;
  replyToMessageId: number | null;
}

export interface EditMessageRequest {
  content: string;
}

// Response Types
export interface RoomsResponse extends PaginatedResponse<IChatRoom> {}
export interface MessagesResponse extends PaginatedResponse<IChatMessage> {}

// WebSocket Types
export interface WebSocketSendMessage {
  roomId: number;
  messageType: MessageType;
  content: string;
  fileId: number | null;
  replyToMessageId: number | null;
}

export interface WebSocketTypingIndicator {
  roomId: number;
}

export interface WebSocketTypingResponse {
  userId: number;
  isTyping: boolean;
}

export interface WebSocketReadReceipt {
  messageId: number;
  userId: number;
  readAt: string;
}

// Component Types
// Type cho dữ liệu gửi tin nhắn (được dùng chung trong ChatInput, messages-page, chat-dialog, chat-sheet)
export interface SendMessageData {
  content: string;
  messageType: "TEXT" | "IMAGE" | "FILE";
  fileId: number | null;
  file?: File;
}

// Base props cho các chat component (ChatDialog, ChatSheet)
export interface BaseChatComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otherUserId?: number; // User ID để tạo direct room khi mở từ listing detail
  otherUserName?: string; // Tên người dùng để hiển thị
}

