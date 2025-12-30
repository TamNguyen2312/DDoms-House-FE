import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  chatKeys,
  useCreateDirectRoom,
  useGetMessages,
  useGetRooms,
  useMarkMessageAsRead,
  useSendMessage,
} from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useIsMobile } from "@/hooks/useMobile";
import { useUploadFile } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store";
import type {
  BaseChatComponentProps,
  IChatMessage,
  IChatRoom,
  SendMessageData,
  WebSocketTypingResponse,
} from "@/types/chat.types";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { ChatRoomList } from "./chat-room-list";

// ChatSheetProps sử dụng BaseChatComponentProps
type ChatSheetProps = BaseChatComponentProps;

export function ChatSheet({
  open,
  onOpenChange,
  otherUserId,
  otherUserName,
}: ChatSheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [selectedRoom, setSelectedRoom] = useState<IChatRoom | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [showRoomList, setShowRoomList] = useState(true);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        // User denied or error - ignore
      });
    }
  }, []);

  // Show browser notification for new message
  const showBrowserNotification = useCallback(
    (message: IChatMessage) => {
      if (!("Notification" in window)) {
        return; // Browser doesn't support notifications
      }

      if (Notification.permission !== "granted") {
        return; // Permission not granted
      }

      // Don't show notification if page is visible and user is viewing the chat
      if (
        document.visibilityState === "visible" &&
        open &&
        message.roomId === selectedRoom?.id
      ) {
        return;
      }

      // Get message preview for notification
      const messagePreview =
        message.messageType === "TEXT"
          ? message.content
          : message.messageType === "IMAGE"
          ? "Đã gửi một hình ảnh"
          : message.messageType === "FILE"
          ? "Đã gửi một tệp tin"
          : "Tin nhắn mới";

      try {
        const notification = new Notification(`${message.senderName}`, {
          body: messagePreview,
          icon: "/favicon.ico", // You can customize this
          badge: "/favicon.ico",
          tag: `chat-${message.roomId}`, // Prevent duplicate notifications for same room
          requireInteraction: false,
          silent: false,
        });

        // Close notification after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        // Focus window when notification is clicked
        notification.onclick = () => {
          window.focus();
          notification.close();
          // Optionally open the chat sheet
          if (!open) {
            onOpenChange(true);
          }
        };
      } catch (error) {
        // Ignore notification errors
      }
    },
    [open, selectedRoom?.id, selectedRoom?.name, onOpenChange]
  );

  // Get rooms
  const { data: roomsData, refetch: refetchRooms } = useGetRooms({
    page: 0,
    size: 50,
  });

  // Get messages for selected room - increase size to ensure we get all messages
  const { data: messagesData, refetch: refetchMessages } = useGetMessages(
    selectedRoom?.id || 0,
    { page: 0, size: 200 }, // Increase to 200 to ensure we get all messages
    !!selectedRoom
  );

  // Mutations
  const { mutate: createDirectRoom, isPending: isCreatingRoom } =
    useCreateDirectRoom();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: markAsRead } = useMarkMessageAsRead();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();

  // Check if user is near the bottom of the scroll area
  const isNearBottom = useCallback(() => {
    const viewport = document.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement;
    if (!viewport) return true; // Default to true if viewport not found

    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Consider "near bottom" if within 100px of the bottom
    return distanceFromBottom < 100;
  }, []);

  // Simple and direct function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    const viewport = document.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement;

    if (viewport) {
      const targetScroll = viewport.scrollHeight;
      // Force scroll to bottom immediately
      viewport.scrollTop = targetScroll;
      viewport.scrollTo({
        top: targetScroll,
        behavior: "auto",
      });
    }
  }, []);

  // Memoize onNewMessage callback to prevent unnecessary subscription changes
  const handleNewMessage = useCallback(
    (message: IChatMessage) => {
      // Only add to messages if it's for the current room
      if (message.roomId === selectedRoom?.id && selectedRoom?.id) {
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

          const newMessages = [...filteredPrev, message];
          return newMessages;
        });

        // Trigger scroll with multiple attempts and delays
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToBottom();
            setTimeout(() => scrollToBottom(), 50);
            setTimeout(() => scrollToBottom(), 150);
            setTimeout(() => scrollToBottom(), 300);
            setTimeout(() => scrollToBottom(), 500);
          });
        });

        // Update lastMessageAtRef immediately to prevent polling from overwriting
        lastMessageAtRef.current = message.sentAt;

        // Show browser notification if:
        // 1. Message is not from current user
        // 2. User is NOT viewing this room (selectedRoom doesn't match) OR chat sheet is closed
        // 3. Browser supports notifications and permission is granted
        if (
          message.senderId !== Number(user?.id) &&
          (message.roomId !== selectedRoom?.id || !open)
        ) {
          showBrowserNotification(message);
        }

        // Mark as read if:
        // 1. Message is not from current user
        // 2. User is currently viewing this room (selectedRoom matches)
        // 3. User is near the bottom of the scroll area (actually viewing the messages)
        if (
          message.senderId !== Number(user?.id) &&
          message.roomId === selectedRoom?.id &&
          isNearBottom()
        ) {
          // Mark as read immediately - optimistic update will handle unreadCount instantly
          // No delay needed since user is viewing the message
          markAsRead({ messageId: message.id, roomId: message.roomId });
        }
      }

      // Always refetch rooms query to update unread counts in real-time
      queryClient.refetchQueries({
        queryKey: chatKeys.rooms(),
        exact: false,
      });
    },
    [
      selectedRoom?.id,
      user?.id,
      markAsRead,
      queryClient,
      scrollToBottom,
      isNearBottom,
    ]
  );

  const handlePersonalMessage = useCallback(
    (message?: IChatMessage) => {
      // If message is for current room, add it to state immediately
      if (message && message.roomId === selectedRoom?.id && selectedRoom?.id) {
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

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToBottom();
            setTimeout(() => scrollToBottom(), 100);
            setTimeout(() => scrollToBottom(), 200);
          });
        });

        // Mark as read if:
        // 1. Message is not from current user
        // 2. User is currently viewing this room (selectedRoom matches)
        // 3. User is near the bottom of the scroll area (actually viewing the messages)
        if (
          message &&
          message.senderId !== Number(user?.id) &&
          message.roomId === selectedRoom?.id &&
          isNearBottom()
        ) {
          // Mark as read immediately - optimistic update will handle unreadCount instantly
          // No delay needed since user is viewing the message
          markAsRead({ messageId: message.id, roomId: message.roomId });
        }
      }

      // Always refetch rooms to update unread counts
      queryClient.refetchQueries({
        queryKey: chatKeys.rooms(),
        exact: false,
      });
    },
    [
      selectedRoom?.id,
      user?.id,
      markAsRead,
      queryClient,
      scrollToBottom,
      isNearBottom,
    ]
  );

  // Typing indicator state
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());

  // Handle typing indicator from WebSocket
  const handleTypingIndicator = useCallback(
    (indicator: WebSocketTypingResponse) => {
      if (indicator.userId === Number(user?.id)) {
        // Ignore own typing indicator
        return;
      }

      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (indicator.isTyping) {
          newSet.add(indicator.userId);
        } else {
          newSet.delete(indicator.userId);
        }
        return newSet;
      });
    },
    [user?.id]
  );

  // WebSocket connection
  const {
    isConnected,
    sendMessage: wsSendMessage,
    startTyping,
    stopTyping,
  } = useChatSocket({
    roomId: selectedRoom?.id,
    onNewMessage: handleNewMessage,
    onPersonalMessage: handlePersonalMessage,
    onTypingIndicator: handleTypingIndicator,
    autoConnect: open,
  });

  // Track last message timestamp to detect new messages
  const lastMessageAtRef = useRef<string | null>(null);
  const lastUnreadCountRef = useRef<number>(0);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Initialize messages from API - merge instead of replace to preserve WebSocket messages
  useEffect(() => {
    if (messagesData?.content && selectedRoom) {
      const reversedMessages = [...messagesData.content].reverse();

      // Merge messages instead of replacing to preserve WebSocket messages
      setMessages((prev) => {
        const apiMessageIds = new Set(reversedMessages.map((m) => m.id));
        const merged: IChatMessage[] = [...reversedMessages];

        // Add optimistic messages and WebSocket messages that aren't in API yet
        prev.forEach((existingMsg) => {
          if (!apiMessageIds.has(existingMsg.id)) {
            const msgTime = new Date(existingMsg.sentAt).getTime();
            const now = Date.now();
            const age = now - msgTime;

            // Keep optimistic messages (negative IDs) if recent
            if (existingMsg.id < 0) {
              if (age < 15000) {
                merged.push(existingMsg);
              }
            } else {
              // Keep real messages from WebSocket that aren't in API yet
              if (age < 30000) {
                merged.push(existingMsg);
              }
            }
          }
        });

        // Sort and deduplicate
        merged.sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        const uniqueMap = new Map<number, IChatMessage>();
        merged.forEach((msg) => {
          const existing = uniqueMap.get(msg.id);
          if (!existing || new Date(msg.sentAt) > new Date(existing.sentAt)) {
            uniqueMap.set(msg.id, msg);
          }
        });

        const unique = Array.from(uniqueMap.values());
        unique.sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        return unique;
      });

      // Update lastMessageAtRef
      if (reversedMessages.length > 0) {
        const lastMessage = reversedMessages[reversedMessages.length - 1];
        lastMessageAtRef.current = lastMessage.sentAt;
      }
    } else if (!selectedRoom) {
      setMessages([]);
      lastMessageAtRef.current = null;
    }
  }, [messagesData, selectedRoom]);

  // Scroll to bottom when messages are loaded for a room
  useEffect(() => {
    if (messages.length > 0 && selectedRoom) {
      // Call scroll function multiple times with delays
      scrollToBottom();

      // Use requestAnimationFrame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });

      // Try with various delays to ensure DOM is fully rendered
      const delays = [50, 100, 200, 300, 500, 700, 1000, 1500, 2000, 3000];
      delays.forEach((delay) => {
        setTimeout(scrollToBottom, delay);
      });

      // Also use MutationObserver as backup
      const viewport = document.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement;

      if (viewport) {
        const observer = new MutationObserver(() => {
          scrollToBottom();
        });

        observer.observe(viewport, {
          childList: true,
          subtree: true,
          attributes: true,
        });

        // Cleanup after 3 seconds
        setTimeout(() => {
          observer.disconnect();
        }, 3000);

        return () => {
          observer.disconnect();
        };
      }
    }
  }, [messages.length, selectedRoom?.id, scrollToBottom]);

  // Auto-select room when otherUserId is provided
  useEffect(() => {
    if (open && otherUserId && roomsData?.content && !selectedRoom) {
      if (!isCreatingRoom) {
        createDirectRoom(
          { otherUserId },
          {
            onSuccess: (newRoom) => {
              setSelectedRoom(newRoom);
              refetchRooms();
            },
            onError: () => {
              refetchRooms();
            },
          }
        );
      }
    }
  }, [
    open,
    otherUserId,
    roomsData,
    isCreatingRoom,
    selectedRoom,
    createDirectRoom,
    refetchRooms,
  ]);

  // Polling: Refetch messages ONLY if WebSocket is not connected
  // When WebSocket is connected, it handles real-time updates via handleNewMessage
  useEffect(() => {
    if (!selectedRoom || !open) return;

    // Only poll messages if WebSocket is NOT connected
    let messagesPollInterval: ReturnType<typeof setInterval> | null = null;

    if (!isConnected) {
      messagesPollInterval = setInterval(() => {
        // Check if there are new messages from rooms data
        const currentRoomInList = roomsData?.content?.find(
          (room) => room.id === selectedRoom.id
        );

        if (currentRoomInList) {
          const currentLastMessageAt = currentRoomInList.lastMessageAt;
          const hasNewMessage =
            currentLastMessageAt &&
            currentLastMessageAt !== lastMessageAtRef.current;

          const currentUnreadCount = currentRoomInList.unreadCount || 0;
          const unreadCountChanged =
            currentUnreadCount !== lastUnreadCountRef.current;

          if (hasNewMessage || unreadCountChanged) {
            // Invalidate and refetch messages
            queryClient.invalidateQueries({
              queryKey: chatKeys.messages(selectedRoom.id),
              exact: false,
            });

            refetchMessages()
              .then((result) => {
                if (result?.data?.content && selectedRoom) {
                  const reversedMessages = [...result.data.content].reverse();

                  // Merge messages instead of replacing
                  setMessages((prev) => {
                    const apiMessageIds = new Set(
                      reversedMessages.map((m) => m.id)
                    );
                    const merged: IChatMessage[] = [...reversedMessages];

                    // Add optimistic messages and WebSocket messages that aren't in API yet
                    prev.forEach((existingMsg) => {
                      if (!apiMessageIds.has(existingMsg.id)) {
                        const msgTime = new Date(existingMsg.sentAt).getTime();
                        const now = Date.now();
                        const age = now - msgTime;

                        if (existingMsg.id < 0) {
                          if (age < 15000) {
                            merged.push(existingMsg);
                          }
                        } else {
                          if (age < 30000) {
                            merged.push(existingMsg);
                          }
                        }
                      }
                    });

                    // Sort and deduplicate
                    merged.sort(
                      (a, b) =>
                        new Date(a.sentAt).getTime() -
                        new Date(b.sentAt).getTime()
                    );

                    const uniqueMap = new Map<number, IChatMessage>();
                    merged.forEach((msg) => {
                      const existing = uniqueMap.get(msg.id);
                      if (
                        !existing ||
                        new Date(msg.sentAt) > new Date(existing.sentAt)
                      ) {
                        uniqueMap.set(msg.id, msg);
                      }
                    });

                    const unique = Array.from(uniqueMap.values());
                    unique.sort(
                      (a, b) =>
                        new Date(a.sentAt).getTime() -
                        new Date(b.sentAt).getTime()
                    );

                    return unique;
                  });

                  // Update refs
                  if (reversedMessages.length > 0) {
                    const lastMessage =
                      reversedMessages[reversedMessages.length - 1];
                    const currentLastMessageAt = lastMessageAtRef.current;

                    // Only update if API message is newer
                    if (
                      !currentLastMessageAt ||
                      lastMessage.sentAt >= currentLastMessageAt
                    ) {
                      lastMessageAtRef.current = lastMessage.sentAt;
                    }
                  }

                  lastUnreadCountRef.current = currentUnreadCount;

                  // Scroll to bottom if there are new messages
                  if (hasNewMessage) {
                    requestAnimationFrame(() => {
                      requestAnimationFrame(() => {
                        scrollToBottom();
                        setTimeout(() => scrollToBottom(), 100);
                        setTimeout(() => scrollToBottom(), 300);
                      });
                    });
                  }
                }
              })
              .catch(() => {});
          }
        }

        // Also refetch rooms to detect new messages
        queryClient.invalidateQueries({
          queryKey: chatKeys.rooms(),
          exact: false,
        });
        refetchRooms();
      }, 2000); // Poll every 2 seconds when WebSocket is not connected
    }

    // Poll rooms at different intervals based on WebSocket connection status
    // When WebSocket is connected: poll every 10s (just to sync badge counts)
    // When WebSocket is not connected: poll every 5s (more frequent to detect new messages)
    const roomsPollInterval = isConnected ? 10000 : 5000;
    const roomsPoll = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.rooms(),
        exact: false,
      });
      refetchRooms();
    }, roomsPollInterval);

    return () => {
      if (messagesPollInterval) {
        clearInterval(messagesPollInterval);
      }
      clearInterval(roomsPoll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom?.id, open, roomsData, isConnected]); // Add isConnected to dependencies

  // Detect new messages from rooms data and refetch messages
  useEffect(() => {
    if (!selectedRoom || !roomsData?.content || !open) return;

    const currentRoomInList = roomsData.content.find(
      (room) => room.id === selectedRoom.id
    );

    if (!currentRoomInList) return;

    const currentLastMessageAt = currentRoomInList.lastMessageAt;
    const hasNewMessage =
      currentLastMessageAt && currentLastMessageAt !== lastMessageAtRef.current;

    const currentUnreadCount = currentRoomInList.unreadCount || 0;
    const unreadCountChanged =
      currentUnreadCount !== lastUnreadCountRef.current;

    if (hasNewMessage || (unreadCountChanged && currentUnreadCount > 0)) {
      lastUnreadCountRef.current = currentUnreadCount;

      // Invalidate and refetch messages
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(selectedRoom.id),
        exact: false,
      });

      refetchMessages()
        .then((result) => {
          if (result?.data?.content && selectedRoom) {
            const reversedMessages = [...result.data.content].reverse();

            // Merge messages
            setMessages((prev) => {
              const apiMessageIds = new Set(reversedMessages.map((m) => m.id));
              const merged: IChatMessage[] = [...reversedMessages];

              prev.forEach((existingMsg) => {
                if (!apiMessageIds.has(existingMsg.id)) {
                  const msgTime = new Date(existingMsg.sentAt).getTime();
                  const now = Date.now();
                  const age = now - msgTime;

                  if (existingMsg.id < 0) {
                    if (age < 15000) merged.push(existingMsg);
                  } else {
                    if (age < 30000) merged.push(existingMsg);
                  }
                }
              });

              merged.sort(
                (a, b) =>
                  new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
              );

              const uniqueMap = new Map<number, IChatMessage>();
              merged.forEach((msg) => {
                const existing = uniqueMap.get(msg.id);
                if (
                  !existing ||
                  new Date(msg.sentAt) > new Date(existing.sentAt)
                ) {
                  uniqueMap.set(msg.id, msg);
                }
              });

              const unique = Array.from(uniqueMap.values());
              unique.sort(
                (a, b) =>
                  new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
              );

              return unique;
            });

            // Update refs
            if (reversedMessages.length > 0) {
              const lastMessage = reversedMessages[reversedMessages.length - 1];
              const currentLastMessageAt = lastMessageAtRef.current;

              if (
                !currentLastMessageAt ||
                lastMessage.sentAt >= currentLastMessageAt
              ) {
                lastMessageAtRef.current = lastMessage.sentAt;
              }
            }

            // Scroll to bottom
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                scrollToBottom();
                setTimeout(() => scrollToBottom(), 100);
                setTimeout(() => scrollToBottom(), 300);
              });
            });
          }
        })
        .catch(() => {});
    } else {
      // Update refs even if we don't refetch
      if (currentLastMessageAt) {
        lastMessageAtRef.current = currentLastMessageAt;
      }
      lastUnreadCountRef.current = currentUnreadCount;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomsData, selectedRoom?.id, open]);

  // Mark messages as read when room is selected (only once per room selection)
  const hasMarkedAsReadRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      selectedRoom &&
      messages.length > 0 &&
      hasMarkedAsReadRef.current !== selectedRoom.id
    ) {
      const unreadMessages = messages.filter(
        (m) => !m.isReadByMe && m.senderId !== Number(user?.id)
      );
      if (unreadMessages.length > 0) {
        // Mark ALL unread messages as read, not just the latest one
        // This ensures unreadCount is properly updated when user enters the room
        unreadMessages.forEach((message) => {
          markAsRead({ messageId: message.id, roomId: selectedRoom.id });
        });
        hasMarkedAsReadRef.current = selectedRoom.id;
      }
    }
    // Reset when room changes
    if (!selectedRoom) {
      hasMarkedAsReadRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom?.id, messages.length, user?.id]); // Only depend on room ID and message count, not the full messages array or markAsRead

  const handleSendMessage = async (data: SendMessageData) => {
    if (!selectedRoom) return;

    let fileId = data.fileId;

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
      requestAnimationFrame(() => {
        scrollToBottom();
        requestAnimationFrame(() => {
          scrollToBottom();
          setTimeout(() => scrollToBottom(), 50);
          setTimeout(() => scrollToBottom(), 150);
        });
      });
    } else {
      // WebSocket not connected - use REST API
      sendMessage(
        { roomId: selectedRoom.id, data: messageData },
        {
          onSuccess: async () => {
            await refetchMessages();
            refetchRooms();
            // Scroll to bottom after refetching
            requestAnimationFrame(() => {
              scrollToBottom();
              setTimeout(() => scrollToBottom(), 100);
              setTimeout(() => scrollToBottom(), 300);
            });
          },
        }
      );
    }
  };

  const handleRoomSelect = (room: IChatRoom) => {
    // Before switching to new room, mark all unread messages in the current room as read
    if (selectedRoom && selectedRoom.id !== room.id && messages.length > 0) {
      const unreadMessagesInCurrentRoom = messages.filter(
        (m) =>
          !m.isReadByMe &&
          m.senderId !== Number(user?.id) &&
          m.roomId === selectedRoom.id
      );

      if (unreadMessagesInCurrentRoom.length > 0) {
        // Mark all unread messages in the previous room as read
        unreadMessagesInCurrentRoom.forEach((message) => {
          markAsRead({ messageId: message.id, roomId: selectedRoom.id });
        });
      }
    }

    setSelectedRoom(room);
    setMessages([]);
    // Reset hasMarkedAsReadRef for the new room
    hasMarkedAsReadRef.current = null;
    // On mobile, hide room list when a room is selected
    if (isMobile) {
      setShowRoomList(false);
    }
    refetchMessages().then(() => {
      // Scroll to bottom after messages are refetched
      scrollToBottom();
      setTimeout(() => scrollToBottom(), 200);
      setTimeout(() => scrollToBottom(), 500);
      setTimeout(() => scrollToBottom(), 1000);
    });
  };

  const handleBackToRoomList = () => {
    setShowRoomList(true);
    setSelectedRoom(null);
    setMessages([]);
  };

  const handleClose = () => {
    setSelectedRoom(null);
    setMessages([]);
    setShowRoomList(true);
    onOpenChange(false);
  };

  // Reset showRoomList when dialog closes
  useEffect(() => {
    if (!open) {
      setShowRoomList(true);
    }
  }, [open]);

  // Get the other participant's name for direct rooms
  const otherParticipantInfo = useMemo(() => {
    if (!selectedRoom) return null;

    if (selectedRoom.name) {
      const name = selectedRoom.name.trim();
      if (name) {
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return {
          name: selectedRoom.name,
          initials,
        };
      }
    }

    if (selectedRoom.roomType === "DIRECT" && messages.length > 0) {
      const otherMessage = messages.find(
        (m) => m.senderId !== Number(user?.id)
      );
      if (otherMessage && otherMessage.senderName) {
        const initials = otherMessage.senderName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        return {
          name: otherMessage.senderName,
          initials,
        };
      }
    }

    return null;
  }, [selectedRoom, messages, user?.id]);

  const displayName = useMemo(() => {
    if (!selectedRoom) return "Tin nhắn";
    if (otherUserName) return otherUserName;
    if (selectedRoom.name) return selectedRoom.name;
    if (otherParticipantInfo) return otherParticipantInfo.name;
    if (selectedRoom.roomType === "DIRECT") {
      return "Cuộc trò chuyện";
    }
    return `Phòng chat #${selectedRoom.id}`;
  }, [selectedRoom, otherUserName, otherParticipantInfo]);

  const displayInitials = useMemo(() => {
    if (otherParticipantInfo) return otherParticipantInfo.initials;
    if (selectedRoom?.name) {
      const name = selectedRoom.name.trim();
      if (name) {
        return name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      }
    }
    return "CH";
  }, [otherParticipantInfo, selectedRoom]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "!fixed !p-0 !flex !flex-col !translate-x-0 !translate-y-0 rounded-lg shadow-2xl border z-[100] overflow-hidden",
          // Mobile: fullscreen
          isMobile
            ? "!bottom-0 !right-0 !top-0 !left-0 !w-full !h-full !max-w-none !max-h-none !rounded-none"
            : // Tablet: smaller size, centered
              "!bottom-6 !right-6 !top-auto !left-auto !w-[850px] md:!w-[calc(100vw-3rem)] md:max-w-[850px] !h-[700px] md:!h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)]"
        )}
        showCloseButton={false}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0 bg-primary text-primary-foreground flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isMobile && selectedRoom && showRoomList === false && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToRoomList}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            {selectedRoom ? (
              <>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary-foreground text-primary">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {displayName}
                  </div>
                  {selectedRoom.roomType === "DIRECT" && (
                    <div className="text-xs opacity-80">Cuộc trò chuyện</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span className="font-semibold text-sm">Tin nhắn</span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden rounded-b-lg">
          {/* Room List Sidebar */}
          {(showRoomList || !isMobile) && (
            <div
              className={cn(
                "border-r flex flex-col bg-muted/30",
                isMobile ? "w-full absolute inset-0 z-10" : "w-[40%] md:w-[35%]"
              )}
            >
              <ChatRoomList
                rooms={roomsData?.content || []}
                selectedRoomId={selectedRoom?.id}
                onRoomSelect={handleRoomSelect}
                currentUserId={Number(user?.id)}
              />
            </div>
          )}

          {/* Chat Area */}
          <div
            className={cn(
              "flex-1 flex flex-col bg-background rounded-br-lg min-h-0",
              isMobile && showRoomList && "hidden"
            )}
          >
            {selectedRoom ? (
              <>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ChatMessageList
                    messages={messages}
                    currentUserId={Number(user?.id)}
                    typingUsers={Array.from(typingUsers)}
                  />
                </div>
                <div className="shrink-0">
                  <ChatInput
                    onSend={handleSendMessage}
                    disabled={isSending || isUploading}
                    placeholder="Nhập tin nhắn..."
                    onTypingChange={(isTyping) => {
                      if (!selectedRoom || !isConnected) return;
                      if (isTyping) {
                        startTyping({ roomId: selectedRoom.id });
                      } else {
                        stopTyping({ roomId: selectedRoom.id });
                      }
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center w-full max-w-md px-4">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm font-medium mb-1">
                    Chưa có tin nhắn nào
                  </p>
                  <p className="text-xs">Hãy bắt đầu cuộc trò chuyện!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
