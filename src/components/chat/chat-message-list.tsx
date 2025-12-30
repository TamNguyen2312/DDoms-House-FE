import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDownloadUrl, useFile } from "@/hooks/useUpload";
import { cn } from "@/lib/utils";
import type { IChatMessage } from "@/types/chat.types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Check,
  CheckCheck,
  Download,
  File,
  Image as ImageIcon,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";

interface ChatMessageListProps {
  messages: IChatMessage[];
  currentUserId: number;
  typingUsers?: number[];
}

// Component to render image message - memoized to prevent unnecessary re-renders
const ImageMessage = memo(
  ({ fileId, fileUrl }: { fileId: number; fileUrl: string | null }) => {
    // Use fileUrl if available, otherwise fetch from API
    const shouldFetch = !fileUrl && !!fileId;
    const { data: downloadData, isLoading } = useDownloadUrl(fileId, {
      enabled: shouldFetch,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // Cache for 10 minutes
      gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    } as any);

    const imageUrl = useMemo(() => {
      return fileUrl || downloadData?.data?.downloadUrl || null;
    }, [fileUrl, downloadData?.data?.downloadUrl]);

    if (isLoading && !imageUrl) {
      return (
        <div className="w-64 h-48 bg-muted rounded-lg flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground animate-pulse" />
        </div>
      );
    }

    if (!imageUrl) {
      return (
        <div className="w-64 h-48 bg-muted rounded-lg flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt="Chat image"
        className="max-w-full max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => window.open(imageUrl, "_blank")}
        loading="lazy"
        onError={(e) => {
          // Fallback nếu image load lỗi
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
        }}
      />
    );
  }
);

ImageMessage.displayName = "ImageMessage";

// Component to render file message
const FileMessage = memo(
  ({ fileId, content }: { fileId: number; content: string }) => {
    const { data: fileData, isLoading: isLoadingFile } = useFile(fileId, {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // Cache for 10 minutes
      gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    } as any);
    const { data: downloadData, isLoading: isLoadingUrl } = useDownloadUrl(
      fileId,
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: 10 * 60 * 1000, // Cache for 10 minutes
        gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
      } as any
    );

    const isLoading = isLoadingFile || isLoadingUrl;
    const fileName =
      fileData?.data?.metadata?.description ||
      fileData?.data?.url?.split("/").pop() ||
      (content && content !== "Sent a document"
        ? content
        : "Tài liệu đính kèm");
    const fileSize = fileData?.data?.sizeBytes
      ? `${(fileData.data.sizeBytes / 1024).toFixed(2)} KB`
      : "";

    const handleDownload = () => {
      if (downloadData?.data?.downloadUrl) {
        window.open(downloadData.data.downloadUrl, "_blank");
      }
    };

    return (
      <div className="flex items-center gap-3 bg-muted/50 rounded-lg border">
        <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center shrink-0">
          <File className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">
            {isLoading ? "Đang tải..." : fileName}
          </p>
          {fileSize && (
            <p className="text-xs text-muted-foreground">{fileSize}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          disabled={isLoading || !downloadData?.data?.downloadUrl}
          className="shrink-0"
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    );
  }
);

FileMessage.displayName = "FileMessage";

export function ChatMessageList({
  messages,
  currentUserId,
  typingUsers = [],
}: ChatMessageListProps) {
  const previousMessagesLengthRef = useRef<number>(0);
  const isInitialLoadRef = useRef<boolean>(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Simple and direct function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    // Find the viewport element
    const viewport = document.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement;

    if (viewport) {
      // Wait a bit to ensure scrollHeight is calculated
      requestAnimationFrame(() => {
        const targetScroll = viewport.scrollHeight;
        const currentScroll = viewport.scrollTop;

        // Only scroll if we're not already at the bottom
        if (Math.abs(targetScroll - currentScroll) > 5) {
          // Force scroll to bottom - try multiple methods
          viewport.scrollTop = targetScroll;
          viewport.scrollTo(0, targetScroll);
          viewport.scrollTo({
            top: targetScroll,
            left: 0,
            behavior: "auto",
          });
        }
      });
    }
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messages.length === 0) {
      // Reset flags when messages are cleared
      previousMessagesLengthRef.current = 0;
      isInitialLoadRef.current = true;
      return;
    }

    // Check if this is initial load (messages went from 0 to some number)
    const isInitialLoad =
      isInitialLoadRef.current && previousMessagesLengthRef.current === 0;

    if (isInitialLoad) {
      // This is initial load - scroll to bottom with multiple attempts
      isInitialLoadRef.current = false;
      previousMessagesLengthRef.current = messages.length;

      // Call scroll function multiple times with delays
      // This ensures scroll happens even if DOM is not ready immediately
      scrollToBottom();

      // Use requestAnimationFrame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });

      // Try with various delays
      setTimeout(() => scrollToBottom(), 100);
      setTimeout(() => scrollToBottom(), 200);
      setTimeout(() => scrollToBottom(), 300);
      setTimeout(() => scrollToBottom(), 500);
      setTimeout(() => scrollToBottom(), 700);
      setTimeout(() => scrollToBottom(), 1000);
      setTimeout(() => scrollToBottom(), 1500);
      setTimeout(() => scrollToBottom(), 2000);
      setTimeout(() => scrollToBottom(), 3000);

      // Use MutationObserver as backup
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
        });

        // Cleanup after 3 seconds
        const timeoutId = setTimeout(() => {
          observer.disconnect();
        }, 3000);

        return () => {
          observer.disconnect();
          clearTimeout(timeoutId);
        };
      }

      return;
    }

    // Only scroll if messages are being added (length increased)
    if (messages.length > previousMessagesLengthRef.current) {
      // New messages were added - scroll to bottom
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToBottom();
          setTimeout(scrollToBottom, 100);
          setTimeout(scrollToBottom, 200);
        });
      });
    }

    // Update previous length
    previousMessagesLengthRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Scroll to last message when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const scrollToLastMessage = () => {
        if (lastMessageRef.current) {
          // Scroll the last message into view
          lastMessageRef.current.scrollIntoView({
            behavior: "auto",
            block: "end",
            inline: "nearest",
          });
        }

        // Also try scrolling viewport directly
        const viewport = document.querySelector(
          '[data-slot="scroll-area-viewport"]'
        ) as HTMLElement;
        if (viewport) {
          const targetScroll = viewport.scrollHeight;
          viewport.scrollTop = targetScroll;
          viewport.scrollTo({
            top: targetScroll,
            behavior: "auto",
          });
        }
      };

      // Try scrolling multiple times with delays
      scrollToLastMessage();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToLastMessage();
        });
      });

      // Try with various delays
      setTimeout(scrollToLastMessage, 50);
      setTimeout(scrollToLastMessage, 100);
      setTimeout(scrollToLastMessage, 200);
      setTimeout(scrollToLastMessage, 300);
      setTimeout(scrollToLastMessage, 500);
      setTimeout(scrollToLastMessage, 700);
      setTimeout(scrollToLastMessage, 1000);
      setTimeout(scrollToLastMessage, 1500);
      setTimeout(scrollToLastMessage, 2000);
      setTimeout(scrollToLastMessage, 3000);
    }
  }, [messages.length]);

  const isOwnMessage = (message: IChatMessage) => {
    return message.senderId === currentUserId;
  };

  const formatMessageTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  const getSenderInitials = (message: IChatMessage) => {
    if (!message.senderName) return "U";
    const name = message.senderName.trim();
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (messages.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
        <div className="text-center w-full max-w-md px-4">
          <p className="text-sm">Chưa có tin nhắn nào</p>
          <p className="text-xs mt-2">Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col">
      <ScrollArea className="flex-1 min-h-0 w-full">
        <div ref={messagesContainerRef} className="p-4 space-y-4">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const own = isOwnMessage(message);
            return (
              <div
                key={message.id}
                ref={isLastMessage ? lastMessageRef : null}
                className={cn("flex gap-3", own && "flex-row-reverse")}
              >
                {!own && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-muted">
                      {getSenderInitials(message)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "flex flex-col max-w-[70%]",
                    own && "items-end"
                  )}
                >
                  {!own && (
                    <p className="text-xs text-muted-foreground mb-1 px-2">
                      {message.senderName}
                    </p>
                  )}
                  <div
                    className={cn(
                      "rounded-lg",
                      message.messageType === "IMAGE" ||
                        message.messageType === "FILE"
                        ? ""
                        : "px-4 py-2",
                      own ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    {message.isDeleted ? (
                      <p className="text-sm italic text-muted-foreground">
                        Tin nhắn đã bị xóa
                      </p>
                    ) : (
                      <>
                        {message.replyToMessageId && (
                          <div className="text-xs opacity-70 mb-1 border-l-2 pl-2">
                            Trả lời tin nhắn
                          </div>
                        )}

                        {/* Image Message */}
                        {message.messageType === "IMAGE" && message.fileId && (
                          <div>
                            <ImageMessage
                              fileId={message.fileId}
                              fileUrl={message.fileUrl}
                            />
                            {message.content &&
                              message.content !== "Sent an image" && (
                                <p className="text-sm whitespace-pre-wrap break-words px-4 pt-2">
                                  {message.content}
                                </p>
                              )}
                          </div>
                        )}

                        {/* File Message */}
                        {message.messageType === "FILE" && message.fileId && (
                          <div className="space-y-2">
                            <FileMessage
                              fileId={message.fileId}
                              content={message.content}
                            />
                          </div>
                        )}

                        {/* Text Message */}
                        {message.messageType === "TEXT" && (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}

                        {message.isEdited && (
                          <p className="text-xs opacity-70 mt-1">
                            (đã chỉnh sửa)
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1 px-2",
                      own && "flex-row-reverse"
                    )}
                  >
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(message.sentAt)}
                    </span>
                    {own && (
                      <span className="text-xs">
                        {message.isReadByMe ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {typingUsers.length === 1
                  ? "Đang nhập..."
                  : `${typingUsers.length} người đang nhập...`}
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
