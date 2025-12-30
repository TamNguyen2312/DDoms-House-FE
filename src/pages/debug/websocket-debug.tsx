import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatSocketService } from "@/services/websocket/chat-socket.service";
import { useAuth } from "@/store";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Play,
  Send,
  Square,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error" | "warning" | "message";
  message: string;
  data?: any;
}

export default function WebSocketDebugPage() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const connectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const token = localStorage.getItem("accessToken");

  // Auto-scroll logs to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (type: LogEntry["type"], message: string, data?: any) => {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data,
    };
    setLogs((prev) => [...prev, entry]);
  };

  const getWebSocketUrl = () => {
    // Use the same logic as chat-socket.service.ts
    if (import.meta.env.VITE_WS_BASE_URL) {
      let wsUrl = import.meta.env.VITE_WS_BASE_URL.trim();
      // Remove trailing slash
      wsUrl = wsUrl.replace(/\/+$/, "");
      // Convert HTTP/HTTPS to WS/WSS if needed
      wsUrl = wsUrl.replace(/^http:/, "ws:");
      wsUrl = wsUrl.replace(/^https:/, "wss:");
      // Remove any existing /ws or /ws/chat
      wsUrl = wsUrl.replace(/\/ws\/chat$/, "");
      wsUrl = wsUrl.replace(/\/ws$/, "");
      // Add /ws/chat
      wsUrl = `${wsUrl}/ws/chat`;
      return wsUrl;
    }

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "https://api-ddoms.fptzone.site/api";

    // Convert HTTP/HTTPS to WS/WSS
    let wsUrl = apiBaseUrl
      .trim()
      .replace(/^http:/, "ws:")
      .replace(/^https:/, "wss:")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "")
      .replace(/\/ws\/chat$/, "")
      .replace(/\/ws$/, "");

    return `${wsUrl}/ws/chat`;
  };

  const testInfoEndpoint = async (baseUrl: string) => {
    // Test /ws/chat/info endpoint directly (SockJS needs this)
    // Backend: registry.addEndpoint("/ws/chat").withSockJS()
    // Note: We call /ws/chat/info without query parameters
    // The entropy value will be random each time
    const infoUrl =
      baseUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:") + "/info";
    addLog("info", "🔍 Testing /ws/chat/info endpoint...", { infoUrl });

    try {
      const response = await fetch(infoUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        addLog("success", "✅ /ws/chat/info endpoint OK", data);
        return true;
      } else {
        addLog("error", `❌ /ws/chat/info returned ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
        });
        return false;
      }
    } catch (error) {
      addLog("error", "❌ Failed to fetch /ws/chat/info", error);
      return false;
    }
  };

  const handleConnect = async () => {
    if (!token) {
      addLog("error", "❌ No JWT token found in localStorage");
      toast.error("Vui lòng đăng nhập trước");
      return;
    }

    const wsUrl = getWebSocketUrl();
    addLog("info", "🔄 Attempting to connect WebSocket...", {
      url: wsUrl,
      apiBaseUrl:
        import.meta.env.VITE_API_BASE_URL ||
        "https://api-ddoms.fptzone.site/api",
      env: {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        VITE_WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL,
      },
    });

    // Test /info endpoint first (SockJS requires this)
    const infoTestPassed = await testInfoEndpoint(wsUrl);
    if (!infoTestPassed) {
      addLog(
        "error",
        "❌ /ws/chat/info endpoint test failed. SockJS connection will fail."
      );
      addLog(
        "error",
        "💡 This is a BACKEND issue. The /ws/chat/info endpoint is returning 500."
      );
      addLog(
        "info",
        "📋 Frontend will automatically use polling fallback (REST API every 2-5 seconds)."
      );
      addLog(
        "info",
        "🔧 Backend needs to fix: /ws/chat/info endpoint should return server capabilities JSON."
      );
      // Don't proceed with connection if /info fails - it will definitely fail
      setIsConnecting(false);
      toast.error("Không thể kết nối WebSocket: /info endpoint lỗi 500");
      return;
    }

    // Reset connection state
    setIsConnected(false);
    setIsConnecting(true);

    // Clear any existing timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
    }

    // Set timeout for connection (30 seconds)
    connectionTimeoutRef.current = setTimeout(() => {
      setIsConnecting(false);
      addLog("error", "⏱️ Connection timeout after 30 seconds");
      addLog("error", "💡 Possible causes:");
      addLog("error", "   - Backend WebSocket endpoint not responding");
      addLog("error", "   - Network/firewall blocking connection");
      addLog("error", "   - Backend server is down");
      addLog("error", `   - Check if ${wsUrl} is accessible`);
      addLog("error", "   - Check browser console for more details");
      addLog("error", "   - The /ws/chat/info endpoint may be returning 500");
      addLog("error", "   - SockJS may be stuck waiting for /info response");
      toast.error("Kết nối timeout sau 30 giây");
    }, 30000);

    try {
      await chatSocketService.connect(
        () => {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          setIsConnected(true);
          setIsConnecting(false);
          addLog("success", "✅ WebSocket connected successfully!");
          addLog("info", "📡 Connection established with backend");
          toast.success("Kết nối WebSocket thành công!");
        },
        (error) => {
          if (connectionTimeoutRef.current) {
            clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = null;
          }
          setIsConnected(false);
          setIsConnecting(false);
          addLog("error", "❌ WebSocket connection failed");

          // Extract error message for better display
          let errorMessage = "Unknown error";
          if (error instanceof Error) {
            errorMessage = error.message;
            addLog("error", `💥 Error: ${errorMessage}`);
          } else if (typeof error === "object" && error !== null) {
            addLog("error", "💥 Error details:", error);
            errorMessage = JSON.stringify(error, null, 2);
          } else {
            addLog("error", `💥 Error: ${String(error)}`);
          }

          toast.error("Không thể kết nối WebSocket");
        }
      );
    } catch (error) {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      setIsConnected(false);
      setIsConnecting(false);
      addLog("error", "❌ Exception during connection attempt");

      let errorMessage = "Unknown exception";
      if (error instanceof Error) {
        errorMessage = error.message;
        addLog("error", `💥 Exception: ${errorMessage}`);
        addLog("error", "💥 Stack trace:", error.stack);
      } else {
        addLog("error", "💥 Exception details:", error);
      }

      toast.error("Lỗi khi kết nối WebSocket");
    }
  };

  const handleDisconnect = () => {
    // Clear timeout if exists
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    chatSocketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    addLog("info", "🔌 WebSocket disconnected");
    toast.info("Đã ngắt kết nối WebSocket");
  };

  const handleClearLogs = () => {
    setLogs([]);
    addLog("info", "🧹 Logs cleared");
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success("Token đã được copy");
      addLog("info", "📋 Token copied to clipboard");
    }
  };

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "message":
        return <Send className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "message":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WebSocket Connection Test</h1>
          <p className="text-muted-foreground mt-2">
            Kiểm tra kết nối WebSocket với backend
          </p>
        </div>
        <Badge
          variant={isConnected ? "default" : "secondary"}
          className="gap-2 text-base px-4 py-2"
        >
          {isConnected ? (
            <>
              <Wifi className="h-5 w-5" />
              Connected
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5" />
              Disconnected
            </>
          )}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Info */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Info</CardTitle>
            <CardDescription>Thông tin kết nối WebSocket</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>WebSocket URL</Label>
              <Input
                value={getWebSocketUrl()}
                readOnly
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label>JWT Token</Label>
              <div className="flex gap-2">
                <Input
                  value={token ? `${token.substring(0, 30)}...` : "No token"}
                  readOnly
                  className="font-mono text-xs"
                />
                {token && (
                  <Button size="icon" variant="outline" onClick={copyToken}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label>User</Label>
              <Input
                value={user ? `${user.email} (${user.role})` : "Not logged in"}
                readOnly
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleConnect}
                disabled={isConnected || isConnecting}
                className="flex-1"
                variant={isConnected ? "secondary" : "default"}
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
              <Button
                onClick={handleDisconnect}
                disabled={!isConnected || isConnecting}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                <Square className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Trạng thái kết nối</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-8">
              {isConnecting ? (
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    🔄 Đang kết nối...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Đang thử kết nối với backend
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 border-blue-500 text-blue-500"
                  >
                    <div className="h-3 w-3 mr-1 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Connecting
                  </Badge>
                </div>
              ) : isConnected ? (
                <div className="text-center space-y-2">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto animate-pulse" />
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    ✅ Kết nối thành công
                  </p>
                  <p className="text-sm text-muted-foreground">
                    WebSocket đã kết nối với backend
                  </p>
                  <Badge variant="default" className="mt-2 bg-green-500">
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  {logs.some((log) => log.type === "error") ? (
                    <>
                      <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                        ❌ Kết nối thất bại
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Không thể kết nối với backend
                      </p>
                      <Badge variant="destructive" className="mt-2">
                        <WifiOff className="h-3 w-3 mr-1" />
                        Connection Failed
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Xem logs bên dưới để biết chi tiết lỗi
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-16 w-16 text-gray-400 mx-auto" />
                      <p className="text-lg font-semibold text-muted-foreground">
                        Chưa kết nối
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click "Connect" để kiểm tra kết nối
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Debug Logs</CardTitle>
              <CardDescription>Logs kết nối WebSocket</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleClearLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full rounded border p-4">
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Chưa có logs. Click "Connect" để bắt đầu kiểm tra...
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2 text-sm ${getLogColor(
                      log.type
                    )}`}
                  >
                    <div className="mt-0.5">{getLogIcon(log.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.timestamp}
                        </span>
                        <span>{log.message}</span>
                      </div>
                      {log.data && (
                        <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
