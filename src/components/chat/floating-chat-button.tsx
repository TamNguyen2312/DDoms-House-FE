import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chatKeys, useGetRooms } from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { cn } from "@/lib/utils";
import { useAuth } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChatSheet } from "./chat-sheet";

export function FloatingChatButton() {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const prevUnreadCountRef = useRef(0);
  const [shouldPulse, setShouldPulse] = useState(false);

  // Get rooms to calculate unread count
  const { data: roomsData, refetch: refetchRooms } = useGetRooms({
    page: 0,
    size: 50,
  });

  // Subscribe to WebSocket to receive new messages in real-time
  const { isConnected } = useChatSocket({
    onPersonalMessage: () => {
      // When receiving a new message, immediately refetch rooms to update unread count
      queryClient.refetchQueries({
        queryKey: chatKeys.rooms(),
        exact: false,
      });
      // Also call refetchRooms directly for immediate update
      refetchRooms();
    },
    autoConnect: !!user, // Only connect if user is logged in
  });

  // Polling fallback: If WebSocket is not connected, poll for new messages every 10 seconds
  useEffect(() => {
    if (!user || isConnected) return; // Don't poll if WebSocket is connected

    const pollInterval = setInterval(() => {
      refetchRooms();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [user, isConnected, refetchRooms]);

  // Refetch rooms when WebSocket connects (to get latest unread count)
  useEffect(() => {
    if (isConnected && user) {
      // Small delay to ensure WebSocket subscriptions are ready
      const timeoutId = setTimeout(() => {
        refetchRooms();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isConnected, user, refetchRooms]);

  // Calculate total unread messages
  const totalUnreadCount = useMemo(() => {
    if (!roomsData?.content) return 0;
    return roomsData.content.reduce(
      (total, room) => total + room.unreadCount,
      0
    );
  }, [roomsData]);

  // Pulse animation when new message arrives
  useEffect(() => {
    if (totalUnreadCount > prevUnreadCountRef.current && totalUnreadCount > 0) {
      setShouldPulse(true);
      // Play notification sound (optional)
      try {
        const audio = new Audio("/notification.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore if audio fails (browser may block autoplay)
        });
      } catch {
        // Ignore if audio fails
      }
      setTimeout(() => setShouldPulse(false), 1000);
    }
    prevUnreadCountRef.current = totalUnreadCount;
  }, [totalUnreadCount]);

  // Don't show if user is not logged in
  if (!user) return null;

  // Don't show in management pages (tenant, landlord, admin) - they have sidebar menu
  const isManagementPage =
    location.pathname.startsWith("/tenant") ||
    location.pathname.startsWith("/landlord") ||
    location.pathname.startsWith("/admin");

  if (isManagementPage) return null;

  return (
    <>
      {/* Floating Chat Button - Shopee Style */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(true)}
          size="lg"
          className={cn(
            "relative h-14 w-14 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-2 border-white",
            shouldPulse &&
              "animate-pulse ring-4 ring-orange-400 ring-opacity-50"
          )}
          aria-label="Mở tin nhắn"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {totalUnreadCount > 0 && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs font-bold border-2 border-white shadow-lg",
                shouldPulse && "animate-bounce"
              )}
            >
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat Sheet - Slide from right like Shopee */}
      <ChatSheet open={isChatOpen} onOpenChange={setIsChatOpen} />
    </>
  );
}
