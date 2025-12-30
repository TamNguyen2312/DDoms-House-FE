import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  chatKeys,
  useCreateDirectRoom,
  useGetMessages,
  useGetRooms,
  useMarkMessageAsRead,
  useSendMessage,
} from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useUploadFile } from "@/hooks/useUpload";
import { useAuth } from "@/store";
import type {
  BaseChatComponentProps,
  IChatMessage,
  IChatRoom,
  SendMessageData,
} from "@/types/chat.types";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { ChatRoomList } from "./chat-room-list";

// ChatDialogProps sử dụng BaseChatComponentProps
type ChatDialogProps = BaseChatComponentProps;

export function ChatDialog({
  open,
  onOpenChange,
  otherUserId,
  otherUserName,
}: ChatDialogProps) {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<IChatRoom | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get rooms
  const { data: roomsData, refetch: refetchRooms } = useGetRooms({
    page: 0,
    size: 50,
  });

  const queryClient = useQueryClient();

  // Get messages for selected room
  const { data: messagesData, refetch: refetchMessages } = useGetMessages(
    selectedRoom?.id || 0,
    { page: 0, size: 100 },
    !!selectedRoom
  );

  // Mutations
  const { mutate: createDirectRoom, isPending: isCreatingRoom } =
    useCreateDirectRoom();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: markAsRead } = useMarkMessageAsRead();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();

  // WebSocket connection
  const { isConnected, sendMessage: wsSendMessage } = useChatSocket({
    roomId: selectedRoom?.id,
    onNewMessage: (message: IChatMessage) => {
      // Only add to messages if it's for the current room
      if (message.roomId === selectedRoom?.id) {
        setMessages((prev) => {
          // First, check for duplicate by ID (most reliable)
          const isDuplicate = prev.some((m) => m.id === message.id);
          if (isDuplicate) {
            return prev;
          }

          // Remove any optimistic messages (negative IDs) that match this real message
          // This is critical when sender receives their own message via WebSocket
          const filteredPrev = prev.filter((m) => {
            // If this is an optimistic message (negative ID) from the same sender in the same room
            if (
              m.id < 0 &&
              m.senderId === message.senderId &&
              m.roomId === message.roomId
            ) {
              // Check if sentAt is very close (within 5 seconds) - this handles timing
              const timeDiff = Math.abs(
                new Date(m.sentAt).getTime() -
                  new Date(message.sentAt).getTime()
              );

              // If time difference is less than 5 seconds, check content similarity
              if (timeDiff < 5000) {
                // Check content similarity (handle whitespace differences)
                const contentSimilar =
                  !m.content ||
                  !message.content || // If either is empty/null, consider it a match
                  m.content.trim() === message.content.trim() ||
                  m.content === message.content;

                // Check message type matches
                const typeMatches = m.messageType === message.messageType;

                // Remove optimistic if:
                // 1. Content is similar AND type matches AND time < 5s, OR
                // 2. Time is very close (< 2 seconds) - likely the same message
                if ((contentSimilar && typeMatches) || timeDiff < 2000) {
                  return false; // Remove optimistic message
                }
              }
            }
            return true;
          });

          return [...filteredPrev, message];
        });
        // Force scroll to bottom when new message arrives
        setTimeout(() => {
          const viewport = document.querySelector(
            '[data-slot="scroll-area-viewport"]'
          ) as HTMLElement;
          if (viewport) {
            viewport.scrollTo({
              top: viewport.scrollHeight,
              behavior: "smooth",
            });
          }
        }, 50);
        // Mark as read if message is not from current user
        if (message.senderId !== Number(user?.id)) {
          markAsRead({ messageId: message.id, roomId: message.roomId });
        }
      }
      // Always refetch rooms query to update unread counts in real-time
      queryClient.refetchQueries({
        queryKey: chatKeys.rooms(),
        exact: false,
      });
    },
    onPersonalMessage: () => {
      // Handle messages from other rooms (not currently open)
      // This ensures we get notifications for all rooms
      // Use refetchQueries to ensure immediate refetch
      queryClient.refetchQueries({
        queryKey: chatKeys.rooms(),
        exact: false,
      });
    },
    autoConnect: open,
  });

  // Initialize messages from API and scroll to bottom
  useEffect(() => {
    if (messagesData?.content && selectedRoom) {
      setMessages(messagesData.content.reverse()); // Reverse to show oldest first
      // Scroll to bottom after messages are loaded - use multiple attempts
      const scrollToBottomWithRetry = (attempt = 0) => {
        if (attempt > 10) return; // Max 10 attempts

        setTimeout(
          () => {
            scrollToBottom();
            // Also try direct viewport scroll as fallback
            const viewport = document.querySelector(
              '[data-slot="scroll-area-viewport"]'
            ) as HTMLElement;
            if (viewport) {
              const targetScroll = viewport.scrollHeight;
              // Force scroll to bottom first
              viewport.scrollTop = targetScroll;

              // Also try smooth scroll on first attempt
              if (attempt === 0) {
                viewport.scrollTo({
                  top: targetScroll,
                  behavior: "smooth",
                });
              }

              // If not scrolled to bottom, try again
              if (viewport.scrollTop < targetScroll - 10 && attempt < 10) {
                scrollToBottomWithRetry(attempt + 1);
              }
            } else if (attempt < 10) {
              scrollToBottomWithRetry(attempt + 1);
            }
          },
          attempt === 0 ? 300 : attempt < 5 ? 150 : 100
        );
      };

      scrollToBottomWithRetry();
    }
  }, [messagesData, selectedRoom]);

  // Auto-select room when otherUserId is provided
  useEffect(() => {
    if (open && otherUserId && roomsData?.content && !selectedRoom) {
      // Try to find existing direct room
      // Note: We can't check participant IDs from room data, so we'll create a new one
      // Backend should handle returning existing room if it exists
      if (!isCreatingRoom) {
        createDirectRoom(
          { otherUserId },
          {
            onSuccess: (newRoom) => {
              setSelectedRoom(newRoom);
              refetchRooms();
            },
            onError: () => {
              // If creation fails, it might be because room already exists
              // Refetch rooms to get the existing one
              refetchRooms();
            },
          }
        );
      }
    }
  }, [open, otherUserId, roomsData, isCreatingRoom, selectedRoom]);

  // Mark messages as read when room is selected
  useEffect(() => {
    if (selectedRoom && messages.length > 0) {
      const unreadMessages = messages.filter(
        (m) => !m.isReadByMe && m.senderId !== Number(user?.id)
      );
      if (unreadMessages.length > 0) {
        // Mark the latest unread message as read
        const latestUnread = unreadMessages[unreadMessages.length - 1];
        markAsRead({ messageId: latestUnread.id, roomId: selectedRoom.id });
      }
    }
  }, [selectedRoom, messages, user?.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleSendMessage = async (data: SendMessageData) => {
    if (!selectedRoom) return;

    let fileId = data.fileId;

    // If there's a file to upload, upload it first
    if (data.file && !fileId) {
      uploadFile(
        {
          file: data.file,
          module: data.messageType === "IMAGE" ? "LISTING_MEDIA" : "DOCUMENT",
        },
        {
          onSuccess: (response) => {
            fileId = response.data.fileId;
            sendMessageWithData(data.content, data.messageType, fileId);
          },
          onError: () => {},
        }
      );
      return;
    }

    // Send message directly if no file or fileId already exists
    sendMessageWithData(data.content, data.messageType, fileId);
  };

  const sendMessageWithData = (
    content: string,
    messageType: "TEXT" | "IMAGE" | "FILE",
    fileId: number | null
  ) => {
    if (!selectedRoom) return;

    const messageData = {
      messageType: messageType,
      content:
        content ||
        (messageType === "IMAGE"
          ? "Sent an image"
          : messageType === "FILE"
          ? "Sent a document"
          : ""),
      fileId: fileId,
      replyToMessageId: null,
    };

    // Send via WebSocket if connected, otherwise via REST API
    if (isConnected) {
      wsSendMessage({
        roomId: selectedRoom.id,
        ...messageData,
      });

      // Add optimistic message immediately for better UX
      // This will be replaced by real message when received via WebSocket
      const optimisticId = -Date.now();
      const optimisticMessage: IChatMessage = {
        id: optimisticId,
        roomId: selectedRoom.id,
        senderId: Number(user?.id),
        senderName: user?.name || user?.email || "Bạn",
        messageType: messageType,
        content: messageData.content,
        fileId: fileId,
        fileUrl: null,
        replyToMessageId: null,
        isEdited: false,
        isDeleted: false,
        sentAt: new Date().toISOString(),
        editedAt: null,
        readCount: 0,
        isReadByMe: false,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      // Scroll to bottom immediately
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    } else {
      sendMessage(
        { roomId: selectedRoom.id, data: messageData },
        {
          onSuccess: async () => {
            await refetchMessages();
            refetchRooms();
            // Scroll to bottom after refetching messages from API
            setTimeout(() => {
              scrollToBottom();
            }, 200);
          },
        }
      );
    }
  };

  const handleRoomSelect = (room: IChatRoom) => {
    setSelectedRoom(room);
    setMessages([]);
    refetchMessages().then(() => {
      // Scroll to bottom after messages are refetched
      setTimeout(() => {
        scrollToBottom();
        const viewport = document.querySelector(
          '[data-slot="scroll-area-viewport"]'
        ) as HTMLElement;
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 200);
    });
  };

  const handleClose = () => {
    setSelectedRoom(null);
    setMessages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-6xl !w-[90vw] h-[85vh] p-0 flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {selectedRoom
                ? otherUserName ||
                  selectedRoom.name ||
                  `Phòng chat #${selectedRoom.id}`
                : "Tin nhắn"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Room List Sidebar */}
          <div className="w-80 border-r flex flex-col">
            <ChatRoomList
              rooms={roomsData?.content || []}
              selectedRoomId={selectedRoom?.id}
              onRoomSelect={handleRoomSelect}
              currentUserId={Number(user?.id)}
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {selectedRoom ? (
              <>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ChatMessageList
                    messages={messages}
                    currentUserId={Number(user?.id)}
                  />
                </div>
                <div className="shrink-0">
                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={isSending || isUploading}
                    placeholder="Nhập tin nhắn..."
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
