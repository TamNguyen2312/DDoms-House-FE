import type {
  CreateDirectRoomRequest,
  EditMessageRequest,
  GetMessagesRequest,
  GetRoomsRequest,
  IChatMessage,
  IChatRoom,
  MessagesResponse,
  RoomsResponse,
  SendMessageRequest,
} from "@/types/chat.types";
import axiosInstance, { type ApiResponse } from "./axios.config";

class ChatService {
  private readonly BASE_PATH = "/chat";

  // ============================================
  // ROOM APIs
  // ============================================

  /**
   * Get all chat rooms with pagination
   * GET /api/chat/rooms
   */
  async getRooms(params?: GetRoomsRequest) {
    const response = await axiosInstance.get<ApiResponse<RoomsResponse>>(
      `${this.BASE_PATH}/rooms`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
        },
      }
    );
    return response.data?.data;
  }

  /**
   * Create a direct chat room
   * POST /api/chat/rooms/direct
   */
  async createDirectRoom(data: CreateDirectRoomRequest) {
    const response = await axiosInstance.post<ApiResponse<IChatRoom>>(
      `${this.BASE_PATH}/rooms/direct`,
      data
    );
    return response.data?.data;
  }

  /**
   * Leave a chat room
   * POST /api/chat/rooms/{roomId}/leave
   */
  async leaveRoom(roomId: number) {
    const response = await axiosInstance.post<ApiResponse<void>>(
      `${this.BASE_PATH}/rooms/${roomId}/leave`
    );
    return response.data;
  }

  // ============================================
  // MESSAGE APIs
  // ============================================

  /**
   * Get messages in a room with pagination
   * GET /api/chat/rooms/{roomId}/messages
   */
  async getMessages(roomId: number, params?: GetMessagesRequest) {
    const response = await axiosInstance.get<ApiResponse<MessagesResponse>>(
      `${this.BASE_PATH}/rooms/${roomId}/messages`,
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 50,
        },
      }
    );
    return response.data?.data;
  }

  /**
   * Send a message in a room
   * POST /api/chat/rooms/{roomId}/messages
   */
  async sendMessage(roomId: number, data: SendMessageRequest) {
    const response = await axiosInstance.post<ApiResponse<IChatMessage>>(
      `${this.BASE_PATH}/rooms/${roomId}/messages`,
      data
    );
    return response.data?.data;
  }

  /**
   * Edit a message
   * PUT /api/chat/messages/{messageId}
   */
  async editMessage(messageId: number, data: EditMessageRequest) {
    const response = await axiosInstance.put<ApiResponse<IChatMessage>>(
      `${this.BASE_PATH}/messages/${messageId}`,
      data.content
    );
    return response.data?.data;
  }

  /**
   * Delete a message
   * DELETE /api/chat/messages/{messageId}
   */
  async deleteMessage(messageId: number) {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `${this.BASE_PATH}/messages/${messageId}`
    );
    return response.data;
  }

  /**
   * Mark messages as read
   * POST /api/chat/messages/{messageId}/read?roomId={roomId}
   */
  async markMessageAsRead(messageId: number, roomId: number) {
    const response = await axiosInstance.post<ApiResponse<void>>(
      `${this.BASE_PATH}/messages/${messageId}/read`,
      null,
      {
        params: {
          roomId,
        },
      }
    );
    return response.data;
  }
}

export const chatService = new ChatService();

