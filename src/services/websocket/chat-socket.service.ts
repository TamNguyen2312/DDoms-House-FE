import type {
  IChatMessage,
  WebSocketReadReceipt,
  WebSocketSendMessage,
  WebSocketTypingIndicator,
  WebSocketTypingResponse,
} from "@/types/chat.types";
import type { Client, IFrame, IMessage } from "@stomp/stompjs";

/**
 * Build WebSocket URL from API base URL or use explicit WS URL
 *
 * According to backend socket-test-frontend/index.html:
 * - Backend endpoint: /ws/chat
 * - Production backend URL: https://api-ddoms.fptzone.site
 * - Uses SockJS with STOMP protocol
 * - JWT authentication via Authorization header: "Bearer {token}"
 * - SockJS expects HTTP/HTTPS URL (not WS/WSS) - it handles protocol conversion internally
 *
 * URL format: baseUrl + endpoint
 * Example: https://api-ddoms.fptzone.site/ws/chat
 */
function getWebSocketUrl(): string {
  // If explicit WebSocket URL is provided, use it
  if (import.meta.env.VITE_WS_BASE_URL) {
    let baseUrl = import.meta.env.VITE_WS_BASE_URL.trim();
    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/+$/, "");
    // Remove any existing /ws or /ws/chat
    baseUrl = baseUrl.replace(/\/ws\/chat$/, "");
    baseUrl = baseUrl.replace(/\/ws$/, "");
    // Add /ws/chat endpoint
    return `${baseUrl}/ws/chat`;
  }

  // Otherwise, build from API base URL
  // Production backend URL: https://api-ddoms.fptzone.site
  // For local development, set VITE_API_BASE_URL=http://localhost:8085/api
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "https://api-ddoms.fptzone.site/api";

  // Extract base URL (remove /api suffix if present)
  // SockJS expects HTTP/HTTPS URL, not WS/WSS
  let baseUrl = apiBaseUrl.trim();

  // Remove trailing slash
  baseUrl = baseUrl.replace(/\/+$/, "");

  // Remove /api suffix if present
  baseUrl = baseUrl.replace(/\/api$/, "");

  // Remove any existing /ws or /ws/chat
  baseUrl = baseUrl.replace(/\/ws\/chat$/, "");
  baseUrl = baseUrl.replace(/\/ws$/, "");

  // Add /ws/chat endpoint
  // SockJS will handle protocol conversion (HTTP/HTTPS -> WS/WSS) internally
  return `${baseUrl}/ws/chat`;
}

// WebSocket connection configuration
const WS_BASE_URL = getWebSocketUrl();

/**
 * Chat WebSocket Service
 *
 * Note: If WebSocket connection fails (e.g., /info endpoint returns 500),
 * the service will automatically disable WebSocket and the chat system will
 * fall back to REST API polling (configured in chat components).
 *
 * Polling intervals:
 * - Messages: every 2 seconds when WebSocket is not connected
 * - Rooms: every 5 seconds when WebSocket is not connected, 10 seconds when connected
 */
class ChatSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, () => void> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 1; // Reduced to 1 to fail fast and rely on polling
  private reconnectDelay: number = 3000;
  private isReconnecting: boolean = false;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private hasLoggedMaxAttempts: boolean = false; // Track if we've already logged max attempts
  private isDisabled: boolean = false; // Disable WebSocket after max attempts

  /**
   * Get JWT token from localStorage
   */
  private getAuthToken(): string | null {
    try {
      const token = localStorage.getItem("accessToken");
      return token;
    } catch {
      return null;
    }
  }

  /**
   * Initialize STOMP client
   * Note: Requires @stomp/stompjs package
   * Install: npm install @stomp/stompjs
   */
  async connect(
    onConnect?: () => void,
    onError?: (error: IFrame | ErrorEvent | Error) => void
  ): Promise<void> {
    // Don't attempt to connect if WebSocket is disabled
    if (this.isDisabled) {
      return;
    }

    if (this.isConnected && this.client) {
      onConnect?.();
      return;
    }

    try {
      // Dynamic import for STOMP client
      const { Client } = await import("@stomp/stompjs");
      const token = this.getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Backend ONLY supports SockJS (not native WebSocket)
      // According to backend config: registry.addEndpoint("/ws/chat").withSockJS()
      // When .withSockJS() is used, backend only accepts SockJS connections
      // - Endpoint: /ws/chat
      // - JWT auth: Authorization: "Bearer {token}"
      //
      // Note: SockJS will call /ws/chat/info first to get server capabilities
      // If /info returns 500, SockJS will retry with different transports
      // We must use SockJS as backend doesn't support native WebSocket
      const SockJS = (await import("sockjs-client")).default;

      const socketFactory = () => {
        // Use SockJS - backend endpoint is /ws/chat
        //
        // ⚠️ IMPORTANT: SockJS Behavior
        // SockJS will AUTOMATICALLY call /ws/chat/info?t={timestamp} first
        // The query parameter "t" is added by SockJS library for cache busting
        // This is DEFAULT BEHAVIOR and CANNOT be disabled from frontend
        //
        // Expected response from /ws/chat/info:
        // {"entropy":...,"origins":["*:*"],"cookie_needed":true,"websocket":true}
        //
        // Backend MUST handle BOTH:
        // - /ws/chat/info (without query parameter)
        // - /ws/chat/info?t={timestamp} (with query parameter - SockJS default)
        //
        // If /info returns 500, SockJS will try alternative transports (xhr-streaming, xhr-polling)
        // but will still fail because /info is required for all transports
        //
        // WS_BASE_URL is already in HTTP/HTTPS format (from getWebSocketUrl)
        // SockJS expects HTTP/HTTPS URL, not WS/WSS
        // SockJS handles protocol conversion (HTTP/HTTPS -> WS/WSS) internally
        // Backend endpoint: https://api-ddoms.fptzone.site/ws/chat
        let sockjsUrl = WS_BASE_URL;

        // Ensure URL is correct format for SockJS
        // SockJS expects: http://host:port/ws/chat or https://host:port/ws/chat
        // Remove any trailing slashes
        sockjsUrl = sockjsUrl.replace(/\/+$/, "");

        if (import.meta.env.DEV) {
          console.log("🔌 SockJS connection URL:", sockjsUrl);
          console.log(
            "ℹ️ Note: SockJS will automatically add ?t={timestamp} to /info endpoint"
          );
        }

        // Create SockJS instance with error handling
        // Note: SockJS will call /ws/chat/info?t={timestamp} first (automatic)
        // If /info returns 500, SockJS will try alternative transports
        // We configure transports in order of preference
        // Backend config: registry.addEndpoint("/ws/chat").withSockJS()
        // - Allowed origins: * (from realtime.websocket.allowed-origins=*)
        // - Endpoint: /ws/chat
        const sock = new SockJS(sockjsUrl, null, {
          // SockJS transport options (in order of preference)
          // SockJS will try each transport if previous one fails
          // Order: websocket (best) -> xhr-streaming -> xhr-polling (fallback)
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
          // Timeout for /info request (in ms) - increased for slow networks
          timeout: 15000,
          // Session ID - let SockJS generate it automatically
          // server: null means use default SockJS server
        });

        // Add error handlers to SockJS socket for debugging
        // Backend expects SockJS to call /ws/chat/info first
        // If /info fails, SockJS will try alternative transports
        sock.onopen = () => {
          if (import.meta.env.DEV) {
            console.log("✅ SockJS: Connection opened successfully");
          }
        };
        sock.onerror = (error) => {
          // Log error details for debugging
          // Note: SockJS may call onerror multiple times during transport negotiation
          if (import.meta.env.DEV) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : error instanceof ErrorEvent
                ? error.message
                : "Unknown SockJS error";
            console.error("❌ SockJS connection error:", {
              error,
              url: sockjsUrl,
              errorType: error?.constructor?.name,
              message: errorMessage,
              note: "SockJS will try alternative transports if websocket fails",
            });
          }
        };
        sock.onclose = (event) => {
          // Log close event for debugging
          // Note: onclose may be called during transport negotiation
          if (import.meta.env.DEV) {
            console.warn("⚠️ SockJS closed:", {
              code: event.code,
              reason: event.reason || "No reason provided",
              wasClean: event.wasClean,
              url: sockjsUrl,
              note: event.wasClean
                ? "Normal closure"
                : "Unexpected closure - may retry with different transport",
            });
          }
        };

        return sock;
      };

      this.client = new Client({
        webSocketFactory: socketFactory,
        // JWT authentication header - format: "Bearer {token}"
        // Backend WebSocketConfig.java expects: Authorization: "Bearer " + token
        // Authentication happens in configureClientInboundChannel interceptor
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        // Debug mode for development
        debug: import.meta.env.DEV
          ? (str) => {
              if (str.includes("CONNECTED") || str.includes("ERROR")) {
                console.log("STOMP:", str);
              }
            }
          : undefined,
        onConnect: () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.hasLoggedMaxAttempts = false; // Reset when successfully connected
          this.isDisabled = false; // Re-enable if connection succeeds
          if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
          }
          if (import.meta.env.DEV) {
            console.log("✅ WebSocket connected successfully");
          }
          onConnect?.();
        },
        onStompError: (frame) => {
          this.isConnected = false;
          // Only log error, don't trigger reconnect here as onWebSocketError will handle it
          onError?.(frame);
        },
        onWebSocketError: (event) => {
          this.isConnected = false;

          // Log detailed error information for debugging
          if (import.meta.env.DEV) {
            const errorDetails: any = {
              error: event,
              errorType: event?.constructor?.name,
              reconnectAttempts: this.reconnectAttempts,
              maxAttempts: this.maxReconnectAttempts,
            };

            if (event instanceof ErrorEvent) {
              errorDetails.message = event.message;
              errorDetails.filename = event.filename;
              errorDetails.lineno = event.lineno;
              errorDetails.colno = event.colno;
            }

            if (event instanceof Error) {
              errorDetails.message = event.message;
              errorDetails.stack = event.stack;
            }

            console.warn("❌ WebSocket connection error:", errorDetails);
          }

          // Check if this is likely an /info endpoint error (500 error)
          // If so, disable WebSocket immediately to avoid repeated failures
          const isInfoEndpointError =
            event instanceof ErrorEvent &&
            (event.message?.includes("500") ||
              event.message?.includes("Internal Server Error") ||
              event.message?.includes("failed") ||
              event.target instanceof WebSocket);

          if (isInfoEndpointError && !this.hasLoggedMaxAttempts) {
            // Disable WebSocket immediately if /info endpoint fails
            this.hasLoggedMaxAttempts = true;
            this.isDisabled = true;
            this.reconnectAttempts = this.maxReconnectAttempts; // Mark as max attempts reached
            if (import.meta.env.DEV) {
              console.warn(
                "⚠️ WebSocket connection failed. Disabling WebSocket and using polling fallback."
              );
            }
            // Disconnect and cleanup
            if (this.client) {
              try {
                this.client.deactivate();
              } catch {
                // Ignore errors during cleanup
              }
              this.client = null;
            }
            onError?.(event);
            return; // Don't attempt to reconnect
          }

          if (
            this.reconnectAttempts >= this.maxReconnectAttempts &&
            !this.hasLoggedMaxAttempts
          ) {
            // Disable WebSocket after max attempts
            this.hasLoggedMaxAttempts = true;
            this.isDisabled = true;
            if (import.meta.env.DEV) {
              console.warn(
                `⚠️ WebSocket connection failed after ${this.maxReconnectAttempts} attempt(s). Using polling fallback.`
              );
            }
            // Disconnect and cleanup
            if (this.client) {
              try {
                this.client.deactivate();
              } catch {
                // Ignore errors during cleanup
              }
              this.client = null;
            }
            onError?.(event);
            return; // Don't attempt to reconnect
          }

          onError?.(event);
          this.handleReconnect(onConnect, onError);
        },
        onDisconnect: () => {
          this.isConnected = false;
        },
      });

      this.client.activate();
    } catch (error) {
      onError?.(error as Error);
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(
    onConnect?: () => void,
    onError?: (error: IFrame | ErrorEvent | Error) => void
  ) {
    // Prevent multiple simultaneous reconnection attempts
    if (this.isReconnecting) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Stop reconnecting after max attempts
      this.isReconnecting = false;
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    // Only log in dev mode to reduce console noise
    if (import.meta.env.DEV) {
      console.log(
        `Attempting to reconnect WebSocket (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
    }

    // Clear any existing timeout
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }

    // Exponential backoff: delay increases with each attempt
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.isReconnecting = false;
      this.connect(onConnect, onError);
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    // Clear reconnection timeout
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    // Reset reconnection state
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.hasLoggedMaxAttempts = false;
    this.isDisabled = false; // Re-enable on manual disconnect

    if (this.client) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((unsubscribe) => unsubscribe());
      this.subscriptions.clear();

      // Disconnect client
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
    }
  }

  /**
   * Subscribe to room messages
   * @param roomId Room ID
   * @param callback Callback function to handle messages
   * @returns Unsubscribe function
   *
   * Backend destination: /topic/room.{roomId}
   * According to backend docs: stompClient.subscribe("/topic/room." + roomId, ...)
   */
  subscribeToRoomMessages(
    roomId: number,
    callback: (message: IChatMessage) => void
  ): () => void {
    if (!this.client || !this.isConnected || !this.client.connected) {
      return () => {};
    }

    const destination = `/topic/room.${roomId}`;

    // Check if already subscribed to this room
    if (this.subscriptions.has(destination)) {
      // Return existing unsubscribe function
      return this.subscriptions.get(destination)!;
    }

    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const data: IChatMessage = JSON.parse(message.body);
          // Call callback immediately
          callback(data);
        } catch {
          // Ignore parse errors
        }
      }
    );

    const unsubscribe = () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };

    this.subscriptions.set(destination, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to personal messages
   * @param callback Callback function to handle messages
   * @returns Unsubscribe function
   *
   * Backend destination: /user/queue/messages
   * According to backend docs: stompClient.subscribe("/user/queue/messages", ...)
   */
  subscribeToPersonalMessages(
    callback: (message: IChatMessage) => void
  ): () => void {
    if (!this.client || !this.isConnected || !this.client.connected) {
      return () => {};
    }

    const destination = `/user/queue/messages`;
    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const data: IChatMessage = JSON.parse(message.body);
          callback(data);
        } catch {
          // Ignore parse errors
        }
      }
    );

    const unsubscribe = () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };

    this.subscriptions.set(destination, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to typing indicators
   * @param roomId Room ID
   * @param callback Callback function to handle typing indicators
   * @returns Unsubscribe function
   *
   * Backend destination: /topic/room.{roomId}/typing
   * According to backend docs: stompClient.subscribe("/topic/room." + roomId + "/typing", ...)
   */
  subscribeToTypingIndicators(
    roomId: number,
    callback: (indicator: WebSocketTypingResponse) => void
  ): () => void {
    if (!this.client || !this.isConnected || !this.client.connected) {
      return () => {};
    }

    const destination = `/topic/room.${roomId}/typing`;
    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const data: WebSocketTypingResponse = JSON.parse(message.body);
          callback(data);
        } catch {
          // Ignore parse errors
        }
      }
    );

    const unsubscribe = () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };

    this.subscriptions.set(destination, unsubscribe);
    return unsubscribe;
  }

  /**
   * Subscribe to read receipts
   * @param roomId Room ID
   * @param callback Callback function to handle read receipts
   * @returns Unsubscribe function
   */
  subscribeToReadReceipts(
    roomId: number,
    callback: (receipt: WebSocketReadReceipt) => void
  ): () => void {
    if (!this.client || !this.isConnected || !this.client.connected) {
      return () => {};
    }

    const destination = `/topic/room.${roomId}/read`;
    const subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const data: WebSocketReadReceipt = JSON.parse(message.body);
          callback(data);
        } catch {
          // Ignore parse errors
        }
      }
    );

    const unsubscribe = () => {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    };

    this.subscriptions.set(destination, unsubscribe);
    return unsubscribe;
  }

  /**
   * Send a message via WebSocket
   * @param data Message data
   *
   * Backend destination: /app/chat.send
   * According to backend docs: stompClient.send("/app/chat.send", {}, JSON.stringify({...}))
   *
   * Expected payload:
   * {
   *   roomId: number,
   *   messageType: "TEXT",
   *   content: string,
   *   fileId: number | null,
   *   replyToMessageId: number | null
   * }
   */
  sendMessage(data: WebSocketSendMessage): void {
    if (!this.client || !this.isConnected || !this.client.connected) {
      return;
    }

    this.client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(data),
    });
  }

  /**
   * Start typing indicator
   * @param data Typing indicator data
   *
   * Backend destination: /app/chat.typing.start
   * According to backend docs: stompClient.send("/app/chat.typing.start", {}, JSON.stringify({roomId}))
   *
   * Expected payload: { roomId: number }
   */
  startTyping(data: WebSocketTypingIndicator): void {
    if (!this.client || !this.isConnected || !this.client.connected) {
      return;
    }

    this.client.publish({
      destination: "/app/chat.typing.start",
      body: JSON.stringify(data),
    });
  }

  /**
   * Stop typing indicator
   * @param data Typing indicator data
   *
   * Backend destination: /app/chat.typing.stop
   * According to backend docs: stompClient.send("/app/chat.typing.stop", {}, JSON.stringify({roomId}))
   *
   * Expected payload: { roomId: number }
   */
  stopTyping(data: WebSocketTypingIndicator): void {
    if (!this.client || !this.isConnected || !this.client.connected) {
      return;
    }

    this.client.publish({
      destination: "/app/chat.typing.stop",
      body: JSON.stringify(data),
    });
  }

  /**
   * Check if client is connected
   */
  get connected(): boolean {
    return this.isConnected && this.client?.connected === true;
  }
}

export const chatSocketService = new ChatSocketService();
