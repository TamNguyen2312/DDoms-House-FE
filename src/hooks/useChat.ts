import { chatService } from "@/services/api/chat.service";
import type {
  CreateDirectRoomRequest,
  EditMessageRequest,
  GetMessagesRequest,
  GetRoomsRequest,
  SendMessageRequest,
} from "@/types/chat.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query Keys
export const chatKeys = {
  all: ["chat"] as const,
  rooms: () => [...chatKeys.all, "rooms"] as const,
  roomsParams: (params?: GetRoomsRequest) =>
    [...chatKeys.all, "rooms", params] as const,
  messages: (roomId: number) => [...chatKeys.all, "messages", roomId] as const,
  messagesParams: (roomId: number, params?: GetMessagesRequest) =>
    [...chatKeys.all, "messages", roomId, params] as const,
};

// ============================================
// ROOM Queries
// ============================================

/**
 * Get all chat rooms with pagination
 */
export const useGetRooms = (params?: GetRoomsRequest) => {
  return useQuery({
    queryKey: chatKeys.roomsParams(params),
    queryFn: async () => {
      const res = await chatService.getRooms(params);
      return res;
    },
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Always refetch on mount
  });
};

// ============================================
// MESSAGE Queries
// ============================================

/**
 * Get messages in a room with pagination
 */
export const useGetMessages = (
  roomId: number,
  params?: GetMessagesRequest,
  enabled = true,
  refetchInterval?: number | false
) => {
  return useQuery({
    queryKey: chatKeys.messagesParams(roomId, params),
    queryFn: async () => {
      const res = await chatService.getMessages(roomId, params);
      return res;
    },
    enabled: enabled && roomId > 0,
    refetchInterval: refetchInterval !== undefined ? refetchInterval : false,
  });
};

// ============================================
// ROOM Mutations
// ============================================

/**
 * Create a direct chat room
 */
export const useCreateDirectRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDirectRoomRequest) => {
      const res = await chatService.createDirectRoom(data);
      return res;
    },
    onSuccess: () => {
      // Invalidate rooms list to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Không thể tạo phòng chat";
      toast.error(errorMessage);
    },
  });
};

/**
 * Leave a chat room
 */
export const useLeaveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: number) => {
      const res = await chatService.leaveRoom(roomId);
      return res;
    },
    onSuccess: () => {
      // Invalidate rooms list to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      toast.success("Đã rời khỏi phòng chat");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Không thể rời khỏi phòng chat";
      toast.error(errorMessage);
    },
  });
};

// ============================================
// MESSAGE Mutations
// ============================================

/**
 * Send a message in a room
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      data,
    }: {
      roomId: number;
      data: SendMessageRequest;
    }) => {
      const res = await chatService.sendMessage(roomId, data);
      return res;
    },
    onSuccess: (data, variables) => {
      // Invalidate messages for this room
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.roomId),
      });
      // Invalidate rooms list to update lastMessageAt and lastMessagePreview
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Không thể gửi tin nhắn";
      toast.error(errorMessage);
    },
  });
};

/**
 * Edit a message
 */
export const useEditMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      data,
    }: {
      messageId: number;
      data: EditMessageRequest;
    }) => {
      const res = await chatService.editMessage(messageId, data);
      return res;
    },
    onSuccess: (data) => {
      // Invalidate messages for this room
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(data.roomId),
      });
      toast.success("Đã chỉnh sửa tin nhắn");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Không thể chỉnh sửa tin nhắn";
      toast.error(errorMessage);
    },
  });
};

/**
 * Delete a message
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: number) => {
      const res = await chatService.deleteMessage(messageId);
      return res;
    },
    onSuccess: () => {
      // Invalidate all messages queries (we don't have roomId here)
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
      toast.success("Đã xóa tin nhắn");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Không thể xóa tin nhắn";
      toast.error(errorMessage);
    },
  });
};

/**
 * Mark messages as read
 */
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messageId,
      roomId,
    }: {
      messageId: number;
      roomId: number;
    }) => {
      const res = await chatService.markMessageAsRead(messageId, roomId);
      return res;
    },
    onMutate: async ({ roomId }) => {
      // Optimistically update unreadCount immediately
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: chatKeys.rooms() });

      // Snapshot the previous value
      const previousRooms = queryClient.getQueriesData({
        queryKey: chatKeys.rooms(),
      });

      // Optimistically update unreadCount for the room
      // Update all queries that match rooms pattern (with or without params)
      const allRoomsQueries = queryClient.getQueriesData({ 
        queryKey: chatKeys.rooms(),
        exact: false 
      });
      
      allRoomsQueries.forEach(([queryKey, data]) => {
        if (!data) return;
        
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          
          // Handle both content and data structures
          const rooms = old.content || old.data || [];
          const updatedRooms = rooms.map((room: any) => {
            if (room.id === roomId && room.unreadCount > 0) {
              return {
                ...room,
                unreadCount: Math.max(0, room.unreadCount - 1),
              };
            }
            return room;
          });

          // Return updated structure
          if (old.content) {
            return { ...old, content: updatedRooms };
          } else if (old.data) {
            return { ...old, data: updatedRooms };
          }
          return old;
        });
      });

      // Return context with the snapshotted value
      return { previousRooms };
    },
    onSuccess: (_, variables) => {
      // Invalidate messages for this room to update read status
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.roomId),
      });
      // Don't invalidate rooms immediately - optimistic update already handled it
      // Refetch in background after a short delay to sync with server
      // This ensures optimistic update is visible first
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: chatKeys.rooms(),
          exact: false
        });
      }, 100);
    },
    onError: (error: any, variables, context) => {
      // Rollback optimistic update on error
      if (context?.previousRooms) {
        context.previousRooms.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const errorMessage =
        error?.response?.data?.message || "Không thể đánh dấu đã đọc";
      toast.error(errorMessage);
    },
  });
};
