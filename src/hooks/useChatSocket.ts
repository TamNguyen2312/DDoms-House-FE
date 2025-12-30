import { chatSocketService } from "@/services/websocket/chat-socket.service";
import type {
  IChatMessage,
  WebSocketReadReceipt,
  WebSocketSendMessage,
  WebSocketTypingIndicator,
  WebSocketTypingResponse,
} from "@/types/chat.types";
import { useEffect, useRef, useState } from "react";

interface UseChatSocketOptions {
  roomId?: number;
  onNewMessage?: (message: IChatMessage) => void;
  onPersonalMessage?: (message: IChatMessage) => void;
  onTypingIndicator?: (indicator: WebSocketTypingResponse) => void;
  onReadReceipt?: (receipt: WebSocketReadReceipt) => void;
  autoConnect?: boolean;
}

/**
 * Hook to manage WebSocket connection for chat
 *
 * @example
 * ```tsx
 * const {
 *   isConnected,
 *   sendMessage,
 *   startTyping,
 *   stopTyping
 * } = useChatSocket({
 *   roomId: 1,
 *   onNewMessage: (message) => {
 *     // Handle new message
 *   }
 * });
 * ```
 */
export const useChatSocket = (options: UseChatSocketOptions = {}) => {
  const {
    roomId,
    onNewMessage,
    onPersonalMessage,
    onTypingIndicator,
    onReadReceipt,
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRefs = useRef<Array<() => void>>([]);

  // Connect to WebSocket
  useEffect(() => {
    if (!autoConnect) return;

    let mounted = true;

    const connect = async () => {
      try {
        await chatSocketService.connect(
          () => {
            if (mounted) {
              setIsConnected(true);
            }
          },
          (error) => {
            // Don't log here - let chatSocketService handle logging
            // Only update state
            if (mounted) {
              setIsConnected(false);
            }
          }
        );
      } catch (error) {
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      // Cleanup subscriptions
      unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
      unsubscribeRefs.current = [];
    };
  }, [autoConnect]);

  // Subscribe to room messages
  useEffect(() => {
    if (!isConnected || !roomId || !onNewMessage || !chatSocketService.connected) {
      return;
    }

    const unsubscribe = chatSocketService.subscribeToRoomMessages(
      roomId,
      (message) => {
        // Call callback immediately
        onNewMessage(message);
      }
    );
    unsubscribeRefs.current.push(unsubscribe);

    return () => {
      unsubscribe();
      const index = unsubscribeRefs.current.indexOf(unsubscribe);
      if (index > -1) {
        unsubscribeRefs.current.splice(index, 1);
      }
    };
  }, [isConnected, roomId, onNewMessage]);

  // Subscribe to personal messages
  useEffect(() => {
    if (!isConnected || !onPersonalMessage || !chatSocketService.connected) return;

    const unsubscribe = chatSocketService.subscribeToPersonalMessages(
      (message) => {
        // Pass the message to the callback
        onPersonalMessage(message);
      }
    );
    unsubscribeRefs.current.push(unsubscribe);

    return () => {
      unsubscribe();
      const index = unsubscribeRefs.current.indexOf(unsubscribe);
      if (index > -1) {
        unsubscribeRefs.current.splice(index, 1);
      }
    };
  }, [isConnected, onPersonalMessage]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!isConnected || !roomId || !onTypingIndicator || !chatSocketService.connected) return;

    const unsubscribe = chatSocketService.subscribeToTypingIndicators(
      roomId,
      onTypingIndicator
    );
    unsubscribeRefs.current.push(unsubscribe);

    return () => {
      unsubscribe();
      const index = unsubscribeRefs.current.indexOf(unsubscribe);
      if (index > -1) {
        unsubscribeRefs.current.splice(index, 1);
      }
    };
  }, [isConnected, roomId, onTypingIndicator]);

  // Subscribe to read receipts
  useEffect(() => {
    if (!isConnected || !roomId || !onReadReceipt || !chatSocketService.connected) return;

    const unsubscribe = chatSocketService.subscribeToReadReceipts(
      roomId,
      onReadReceipt
    );
    unsubscribeRefs.current.push(unsubscribe);

    return () => {
      unsubscribe();
      const index = unsubscribeRefs.current.indexOf(unsubscribe);
      if (index > -1) {
        unsubscribeRefs.current.splice(index, 1);
      }
    };
  }, [isConnected, roomId, onReadReceipt]);

  // Send message function
  const sendMessage = (data: WebSocketSendMessage) => {
    if (!isConnected) {
      return;
    }
    chatSocketService.sendMessage(data);
  };

  // Start typing function
  const startTyping = (data: WebSocketTypingIndicator) => {
    if (!isConnected) {
      return;
    }
    chatSocketService.startTyping(data);
  };

  // Stop typing function
  const stopTyping = (data: WebSocketTypingIndicator) => {
    if (!isConnected) {
      return;
    }
    chatSocketService.stopTyping(data);
  };

  // Disconnect function
  const disconnect = () => {
    chatSocketService.disconnect();
    setIsConnected(false);
    unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
    unsubscribeRefs.current = [];
  };

  return {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    disconnect,
  };
};
