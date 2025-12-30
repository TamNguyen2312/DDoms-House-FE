import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { IChatRoom } from "@/types/chat.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageCircle } from "lucide-react";

interface ChatRoomListProps {
  rooms: IChatRoom[];
  selectedRoomId?: number;
  onRoomSelect: (room: IChatRoom) => void;
  currentUserId: number;
}

export function ChatRoomList({
  rooms,
  selectedRoomId,
  onRoomSelect,
  currentUserId,
}: ChatRoomListProps) {
  const getRoomDisplayName = (room: IChatRoom) => {
    // Priority: room.name (backend should set this for direct rooms)
    if (room.name) return room.name;
    if (room.roomType === "DIRECT") {
      // For direct rooms without name, show default
      return "Cuộc trò chuyện";
    }
    return `Phòng ${room.id}`;
  };

  const getRoomInitials = (room: IChatRoom) => {
    if (room.name) {
      const name = room.name.trim();
      if (name) {
        return name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      }
    }
    // For direct rooms, use "CH" as default
    return "CH";
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 border-b shrink-0">
        <h3 className="font-semibold text-sm">Cuộc trò chuyện</h3>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2">
          {rooms.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            rooms.map((room) => {
              // Show border only when:
              // 1. There are unread messages (unreadCount > 0)
              // 2. This room is NOT the currently selected room (user is not viewing this conversation)
              // This ensures border appears for rooms with unread messages that user is not currently viewing
              const hasUnreadMessages = room.unreadCount > 0;
              const isCurrentlyViewing = selectedRoomId === room.id;
              const shouldShowBorder = hasUnreadMessages && !isCurrentlyViewing;
              
              return (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room)}
                className={cn(
                  "w-full p-3 rounded-lg mb-2 text-left transition-all duration-200",
                  "hover:bg-muted",
                  isCurrentlyViewing && "bg-muted",
                  shouldShowBorder && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getRoomInitials(room)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm truncate">
                        {getRoomDisplayName(room)}
                      </p>
                      {room.lastMessageAt && (
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {formatDistanceToNow(new Date(room.lastMessageAt), {
                            addSuffix: false,
                            locale: vi,
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate">
                        {room.lastMessagePreview || "Chưa có tin nhắn"}
                      </p>
                      {/* Only show badge if there are unread messages AND user is NOT currently viewing this room */}
                      {room.unreadCount > 0 && !isCurrentlyViewing && (
                        <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center shrink-0 ml-2">
                          {room.unreadCount > 9 ? "9+" : room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
