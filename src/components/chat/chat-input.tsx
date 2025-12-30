import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SendMessageData } from "@/types/chat.types";
import { Image, Paperclip, Send, X } from "lucide-react";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSend: (data: SendMessageData) => void;
  disabled?: boolean;
  placeholder?: string;
  onTypingChange?: (isTyping: boolean) => void;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Nhập tin nhắn...",
  onTypingChange,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const handleSend = () => {
    if (disabled) return;

    // Stop typing indicator when sending
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChange?.(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    if (selectedFile) {
      // Determine message type based on file type
      const isImage = selectedFile.type.startsWith("image/");
      const messageType = isImage ? "IMAGE" : "FILE";

      onSend({
        content:
          message.trim() || (isImage ? "Sent an image" : "Sent a document"),
        messageType: messageType,
        fileId: null,
        file: selectedFile,
      });

      // Reset state
      setMessage("");
      setSelectedFile(null);
      setFilePreview(null);
    } else if (message.trim()) {
      // Send text message
      onSend({
        content: message.trim(),
        messageType: "TEXT",
        fileId: null,
      });
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (
    e: ChangeEvent<HTMLInputElement>,
    isImage: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File quá lớn. Kích thước tối đa: 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (isImage && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        onTypingChange?.(false);
      }
    };
  }, [onTypingChange]);

  return (
    <div className="p-4 border-t space-y-2">
      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          {filePreview ? (
            <img
              src={filePreview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-16 bg-muted-foreground/20 rounded flex items-center justify-center">
              <Paperclip className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2">
        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, true)}
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFileSelect(e, false)}
        />

        {/* Image Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleImageClick}
          disabled={disabled}
          className="shrink-0"
          aria-label="Gửi ảnh"
        >
          <Image className="w-4 h-4" />
        </Button>

        {/* File Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFileClick}
          disabled={disabled}
          className="shrink-0"
          aria-label="Gửi file"
        >
          <Paperclip className="w-4 h-4" />
        </Button>

        {/* Text Input */}
        <Input
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);

            // Handle typing indicator
            if (onTypingChange) {
              // Clear existing timeout
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              // Start typing if not already typing
              if (!isTypingRef.current && e.target.value.trim().length > 0) {
                isTypingRef.current = true;
                onTypingChange(true);
              }

              // Stop typing after 3 seconds of inactivity
              typingTimeoutRef.current = setTimeout(() => {
                if (isTypingRef.current) {
                  isTypingRef.current = false;
                  onTypingChange(false);
                }
              }, 3000);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && !selectedFile)}
          size="icon"
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
