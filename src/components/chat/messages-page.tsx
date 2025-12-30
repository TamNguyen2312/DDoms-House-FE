import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatRoomList } from "@/components/chat/chat-room-list";
import {
  chatKeys,
  useGetMessages,
  useGetRooms,
  useMarkMessageAsRead,
  useSendMessage,
} from "@/hooks/useChat";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useUploadFile } from "@/hooks/useUpload";
import { useAuth } from "@/store";
import type {
  IChatMessage,
  IChatRoom,
  SendMessageData,
} from "@/types/chat.types";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/**
 * Component Trang Tin Nhắn Dùng Chung
 * Được sử dụng bởi cả Người Thuê và Chủ Nhà
 */
export function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<IChatRoom | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const isInitialLoadRef = useRef<boolean>(true); // Theo dõi xem có phải lần đầu tải room không

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {
        // User denied or error - ignore
      });
    }
  }, []);

  const lastRoomIdRef = useRef<number | null>(null); // Theo dõi room ID cuối cùng để phát hiện thay đổi room
  const hasScrolledToBottomRef = useRef<boolean>(false); // Theo dõi xem đã scroll xuống dưới cho room này chưa
  const lastRefetchTimeRef = useRef<number>(0); // Theo dõi thời gian refetch cuối cùng để throttle
  const lastMessageAtRef = useRef<string | null>(null); // Theo dõi timestamp tin nhắn cuối cùng từ dữ liệu room
  const lastUnreadCountRef = useRef<number>(0); // Theo dõi số lượng tin nhắn chưa đọc cuối cùng để phát hiện thay đổi
  const lastMessagesLengthRef = useRef<number>(0); // Theo dõi độ dài danh sách tin nhắn cuối cùng để phát hiện thay đổi

  // Lấy danh sách phòng chat
  const { data: roomsData, refetch: refetchRooms } = useGetRooms({
    page: 0,
    size: 50,
  });

  // Show browser notification for new message
  const showBrowserNotification = useCallback(
    (message: IChatMessage) => {
      if (!("Notification" in window)) {
        return; // Browser doesn't support notifications
      }

      if (Notification.permission !== "granted") {
        return; // Permission not granted
      }

      // Don't show notification if page is visible and user is viewing the chat room
      if (
        document.visibilityState === "visible" &&
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
          // Optionally select the room
          if (message.roomId !== selectedRoom?.id) {
            // Find and select the room
            const room = roomsData?.content?.find(
              (r) => r.id === message.roomId
            );
            if (room) {
              setSelectedRoom(room);
            }
          }
        };
      } catch (error) {
        // Ignore notification errors
      }
    },
    [selectedRoom?.id, roomsData?.content, setSelectedRoom]
  );

  // Lấy tin nhắn cho room đã chọn - tăng size để đảm bảo lấy được tất cả tin nhắn
  const { data: messagesData, refetch: refetchMessages } = useGetMessages(
    selectedRoom?.id || 0,
    { page: 0, size: 200 }, // Tăng lên 200 để đảm bảo lấy được tất cả tin nhắn
    !!selectedRoom
  );

  // Các mutation
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { mutate: markAsRead } = useMarkMessageAsRead();
  const { mutate: uploadFile, isPending: isUploading } = useUploadFile();

  // Kiểm tra xem người dùng có đang ở gần cuối vùng scroll không
  const isNearBottom = useCallback(() => {
    const viewport = document.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLElement;
    if (!viewport) return true; // Mặc định là true nếu không tìm thấy viewport

    const scrollTop = viewport.scrollTop;
    const scrollHeight = viewport.scrollHeight;
    const clientHeight = viewport.clientHeight;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Coi là "gần cuối" nếu trong vòng 100px từ dưới cùng
    return distanceFromBottom < 100;
  }, []);

  // Hàm scroll cải tiến hoạt động với ScrollArea
  const scrollToBottom = useCallback(() => {
    const scrollToBottomInternal = (attempt = 0) => {
      if (attempt > 50) return; // Tăng số lần thử tối đa để đảm bảo độ tin cậy

      const viewport = document.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement;

      if (viewport) {
        const targetScroll = viewport.scrollHeight;
        const currentScroll = viewport.scrollTop;

        // Chỉ scroll nếu chưa ở cuối
        if (Math.abs(targetScroll - currentScroll) > 5) {
          // Buộc scroll xuống cuối ngay lập tức
          viewport.scrollTop = targetScroll;

          // Cũng thử scrollTo để tương thích tốt hơn
          if (attempt === 0) {
            viewport.scrollTo({
              top: targetScroll,
              behavior: "auto",
            });
          }

          // Xác minh scroll sau một khoảng thời gian ngắn
          setTimeout(
            () => {
              const newScroll = viewport.scrollTop;
              const scrollDifference = Math.abs(targetScroll - newScroll);

              if (scrollDifference > 5 && attempt < 50) {
                scrollToBottomInternal(attempt + 1);
              }
            },
            attempt < 10 ? 100 : 50
          );
        }
      } else if (attempt < 50) {
        // Không tìm thấy viewport, thử lại với độ trễ tăng dần
        setTimeout(
          () => scrollToBottomInternal(attempt + 1),
          attempt < 10 ? 150 : 100
        );
      }
    };

    // Sử dụng requestAnimationFrame để đảm bảo DOM đã sẵn sàng
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottomInternal();
      });
    });
  }, []);

  // Ghi nhớ callback onNewMessage để tránh thay đổi subscription không cần thiết
  const handleNewMessage = useCallback(
    (message: IChatMessage) => {
      // Chuyển đổi sang số để so sánh, tránh vấn đề về kiểu dữ liệu
      const messageRoomId = Number(message.roomId);
      const currentRoomId = Number(selectedRoom?.id);

      // Chỉ thêm vào danh sách tin nhắn nếu là tin nhắn của room hiện tại
      if (messageRoomId === currentRoomId && currentRoomId > 0) {
        setMessages((prev) => {
          // Đầu tiên, kiểm tra trùng lặp theo ID (đáng tin cậy nhất)
          const isDuplicate = prev.some((m) => m.id === message.id);
          if (isDuplicate) {
            return prev;
          }

          // Xóa các tin nhắn optimistic (ID âm) khớp với tin nhắn thật này
          // Điều này rất quan trọng khi người gửi nhận được tin nhắn của chính mình qua WebSocket
          // Khi người gửi nhận được tin nhắn của chính mình, xóa tin nhắn optimistic vừa gửi
          const filteredPrev = prev.filter((m) => {
            // Nếu đây là tin nhắn optimistic (ID âm) từ cùng người gửi trong cùng room
            if (
              m.id < 0 &&
              m.senderId === message.senderId &&
              m.roomId === message.roomId
            ) {
              // Kiểm tra xem sentAt có rất gần nhau không (trong vòng 5 giây) - xử lý vấn đề thời gian
              const timeDiff = Math.abs(
                new Date(m.sentAt).getTime() -
                  new Date(message.sentAt).getTime()
              );

              // Nếu chênh lệch thời gian nhỏ hơn 5 giây, kiểm tra độ tương đồng nội dung
              if (timeDiff < 5000) {
                // Kiểm tra độ tương đồng nội dung (xử lý sự khác biệt khoảng trắng)
                const contentSimilar =
                  !m.content ||
                  !message.content || // Nếu một trong hai rỗng/null, coi như khớp
                  m.content.trim() === message.content.trim() ||
                  m.content === message.content;

                // Kiểm tra loại tin nhắn có khớp không
                const typeMatches = m.messageType === message.messageType;

                // Xóa optimistic nếu:
                // 1. Nội dung tương đồng VÀ loại khớp VÀ thời gian < 5s, HOẶC
                // 2. Thời gian rất gần (< 2 giây) - có khả năng là cùng một tin nhắn
                if ((contentSimilar && typeMatches) || timeDiff < 2000) {
                  return false; // Xóa tin nhắn optimistic
                }
              }
            }
            return true;
          });

          // Thêm tin nhắn mới vào cuối mảng
          const newMessages = [...filteredPrev, message];
          // Cập nhật ref độ dài ngay lập tức
          lastMessagesLengthRef.current = newMessages.length;

          return newMessages;
        });

        // QUAN TRỌNG: Cập nhật lastMessageAtRef NGAY LẬP TỨC để tránh polling ghi đè
        // Điều này phải xảy ra TRƯỚC bất kỳ thao tác async nào
        lastMessageAtRef.current = message.sentAt;

        // Show browser notification if:
        // 1. Message is not from current user
        // 2. User is NOT viewing this room (selectedRoom doesn't match)
        if (
          message.senderId !== Number(user?.id) &&
          messageRoomId !== currentRoomId
        ) {
          showBrowserNotification(message);
        }

        // Luôn tự động scroll khi có tin nhắn mới (người dùng muốn thấy tin nhắn mới)
        // Sử dụng requestAnimationFrame để đảm bảo DOM đã được cập nhật trước khi scroll
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Nhiều lần thử scroll với độ trễ để đảm bảo hoạt động
            setTimeout(() => scrollToBottom(), 0);
            setTimeout(() => scrollToBottom(), 100);
            setTimeout(() => scrollToBottom(), 200);
            setTimeout(() => scrollToBottom(), 350);
            setTimeout(() => scrollToBottom(), 500);
          });
        });

        // Vô hiệu hóa query rooms để cập nhật số lượng chưa đọc theo thời gian thực
        // Điều này đảm bảo badge ở sidebar cập nhật ngay lập tức
        queryClient.invalidateQueries({
          queryKey: chatKeys.rooms(),
          exact: false,
        });

        // Đánh dấu là đã đọc nếu:
        // 1. Tin nhắn không phải từ người dùng hiện tại
        // 2. Người dùng đang xem room này (selectedRoom khớp)
        // 3. Người dùng đang ở gần cuối vùng scroll (thực sự đang xem tin nhắn)
        if (
          message.senderId !== Number(user?.id) &&
          messageRoomId === currentRoomId &&
          isNearBottom()
        ) {
          // Đánh dấu là đã đọc ngay lập tức - optimistic update sẽ xử lý unreadCount ngay
          // Không cần delay vì người dùng đang xem tin nhắn
          markAsRead({ messageId: message.id, roomId: message.roomId });
        }
      } else {
        // Ngay cả khi tin nhắn không phải cho room hiện tại, vô hiệu hóa rooms để cập nhật badge
        if (message.senderId !== Number(user?.id)) {
          queryClient.invalidateQueries({
            queryKey: chatKeys.rooms(),
            exact: false,
          });
        }
      }
      // Luôn refetch query rooms để cập nhật số lượng chưa đọc theo thời gian thực
      // Không refetch messages ở đây - để polling xử lý để tránh xung đột
      queryClient.refetchQueries({
        queryKey: chatKeys.rooms(),
        exact: false,
      });
    },
    [
      selectedRoom?.id, // Chỉ phụ thuộc vào room ID, không phải toàn bộ object
      user?.id,
      markAsRead,
      queryClient,
      scrollToBottom,
      isNearBottom, // Thêm isNearBottom để kiểm tra xem người dùng có đang xem tin nhắn không
      showBrowserNotification, // Thêm showBrowserNotification để hiển thị notification
      // Lưu ý: messages.length cố ý KHÔNG có trong dependencies để tránh tạo lại callback
    ]
  );

  // Fallback đơn giản: Khi rooms được cập nhật và room hiện tại có tin nhắn chưa đọc, refetch messages
  useEffect(() => {
    if (!selectedRoom || !roomsData?.content) return;

    const currentRoomInList = roomsData.content.find(
      (room) => room.id === selectedRoom.id
    );

    if (!currentRoomInList) return;

    // Kiểm tra xem lastMessageAt có thay đổi không (cho biết có tin nhắn mới)
    const currentLastMessageAt = currentRoomInList.lastMessageAt;
    const hasNewMessage =
      currentLastMessageAt && currentLastMessageAt !== lastMessageAtRef.current;

    // Kiểm tra thay đổi số lượng chưa đọc
    const currentUnreadCount = currentRoomInList.unreadCount || 0;
    const unreadCountChanged =
      currentUnreadCount !== lastUnreadCountRef.current;

    // Cũng kiểm tra xem có tin nhắn chưa đọc không
    const hasUnreadMessages = currentUnreadCount > 0;

    // ĐƠN GIẢN: Nếu số lượng chưa đọc thay đổi HOẶC có tin nhắn chưa đọc HOẶC lastMessageAt thay đổi, refetch messages ngay lập tức
    // QUAN TRỌNG: Không cập nhật lastMessageAtRef TRƯỚC refetch, chỉ cập nhật SAU khi refetch thành công
    if (unreadCountChanged || hasUnreadMessages || hasNewMessage) {
      // Cập nhật ref số lượng chưa đọc TRƯỚC refetch để theo dõi thay đổi
      lastUnreadCountRef.current = currentUnreadCount;

      // KHÔNG cập nhật lastMessageAtRef ở đây - chỉ cập nhật SAU khi refetch thành công
      // Điều này đảm bảo chúng ta có thể phát hiện thay đổi nếu useEffect được kích hoạt lại

      // Vô hiệu hóa queries trước để đảm bảo dữ liệu mới
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(selectedRoom.id),
        exact: false,
      });

      // Refetch messages ngay lập tức - không throttle
      refetchMessages()
        .then((result) => {
          // Buộc cập nhật messages từ kết quả refetch
          if (result?.data?.content && selectedRoom) {
            const reversedMessages = [...result.data.content].reverse();
            // Merge messages thay vì thay thế để giữ lại optimistic messages
            setMessages((prev) => {
              const apiMessageIds = new Set(reversedMessages.map((m) => m.id));
              const merged: IChatMessage[] = [...reversedMessages];

              // Thêm optimistic messages chưa có trong API
              prev.forEach((existingMsg) => {
                if (!apiMessageIds.has(existingMsg.id) && existingMsg.id < 0) {
                  const msgTime = new Date(existingMsg.sentAt).getTime();
                  const now = Date.now();
                  if (now - msgTime < 10000) {
                    merged.push(existingMsg);
                  }
                }
              });

              // Sắp xếp và loại bỏ trùng lặp bằng Map để đảm bảo giữ lại tất cả messages
              merged.sort(
                (a, b) =>
                  new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
              );

              // Sử dụng Map để loại bỏ trùng lặp, giữ lại phiên bản mới nhất
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

              // Sắp xếp lại sau khi loại bỏ trùng lặp
              unique.sort(
                (a, b) =>
                  new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
              );

              return unique;
            });
            lastMessagesLengthRef.current = reversedMessages.length;

            // Cập nhật lastMessageAtRef SAU khi refetch và cập nhật thành công
            if (reversedMessages.length > 0) {
              const lastMessage = reversedMessages[reversedMessages.length - 1];
              lastMessageAtRef.current = lastMessage.sentAt;
            } else {
              // Nếu không có messages, cập nhật từ dữ liệu room
              lastMessageAtRef.current = currentLastMessageAt;
            }
            // Buộc scroll xuống cuối sau khi cập nhật messages
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setTimeout(() => scrollToBottom(), 100);
                setTimeout(() => scrollToBottom(), 300);
              });
            });
          } else {
            // Ngay cả khi không có dữ liệu, cập nhật lastMessageAtRef để tránh vòng lặp vô hạn
            lastMessageAtRef.current = currentLastMessageAt;
          }
        })
        .catch(() => {
          // Khi có lỗi, vẫn cập nhật lastMessageAtRef để tránh thử lại vô hạn
          lastMessageAtRef.current = currentLastMessageAt;
        });
    } else {
      // Cập nhật lastMessageAtRef ngay cả khi không refetch (để theo dõi trạng thái hiện tại)
      lastMessageAtRef.current = currentLastMessageAt;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomsData, selectedRoom?.id]); // Chỉ phụ thuộc vào roomsData và roomId

  // Ghi nhớ callback onPersonalMessage
  const handlePersonalMessage = useCallback(
    (message?: IChatMessage) => {
      // Nếu tin nhắn là cho room hiện tại, thêm vào state ngay lập tức (giống như handleNewMessage)
      if (
        message &&
        selectedRoom &&
        Number(message.roomId) === Number(selectedRoom.id)
      ) {
        setMessages((prev) => {
          // Kiểm tra trùng lặp
          const isDuplicate = prev.some((m) => m.id === message.id);
          if (isDuplicate) {
            return prev;
          }

          // Xóa optimistic messages khớp
          const filteredPrev = prev.filter((m) => {
            if (m.id < 0 && m.senderId === message.senderId) {
              if (
                m.content === message.content &&
                m.messageType === message.messageType
              ) {
                return false; // Xóa optimistic message
              }
            }
            return true;
          });

          // Thêm tin nhắn mới
          const newMessages = [...filteredPrev, message];
          // Cập nhật ref độ dài
          lastMessagesLengthRef.current = newMessages.length;
          return newMessages;
        });

        // Cập nhật refs
        if (message.sentAt) {
          lastMessageAtRef.current = message.sentAt;
        }

        // Scroll xuống cuối
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => scrollToBottom(), 0);
            setTimeout(() => scrollToBottom(), 100);
            setTimeout(() => scrollToBottom(), 200);
          });
        });

        // Đánh dấu là đã đọc nếu:
        // 1. Tin nhắn không phải từ người dùng hiện tại
        // 2. Người dùng đang xem room này (selectedRoom khớp)
        // 3. Người dùng đang ở gần cuối vùng scroll (thực sự đang xem tin nhắn)
        // Delay đánh dấu đã đọc một chút để cho border hiển thị trước (cập nhật unreadCount)
        if (
          message &&
          message.senderId !== Number(user?.id) &&
          selectedRoom &&
          Number(message.roomId) === Number(selectedRoom.id) &&
          isNearBottom()
        ) {
          // Đánh dấu là đã đọc ngay lập tức - optimistic update sẽ xử lý unreadCount ngay
          // Không cần delay vì người dùng đang xem tin nhắn
          markAsRead({ messageId: message.id, roomId: message.roomId });
        }
      }

      // Luôn refetch rooms để cập nhật số lượng chưa đọc
      // Nhưng không refetch messages ngay lập tức - để polling xử lý
      queryClient.refetchQueries({
        queryKey: chatKeys.rooms(),
        exact: false,
      });
    },
    [
      queryClient,
      selectedRoom,
      scrollToBottom,
      user?.id,
      markAsRead,
      isNearBottom,
    ]
  );

  // Kết nối WebSocket
  const { isConnected, sendMessage: wsSendMessage } = useChatSocket({
    roomId: selectedRoom?.id,
    onNewMessage: handleNewMessage,
    onPersonalMessage: handlePersonalMessage,
    autoConnect: true,
  });

  // Giám sát chủ động: Khi room đang active, chỉ poll tin nhắn mới NẾU WebSocket không kết nối
  // Nếu WebSocket đã kết nối, nó xử lý cập nhật real-time, nên không cần poll messages
  // Polling rooms vẫn cần thiết nhưng với tần suất thấp hơn để đồng bộ badge counts
  useEffect(() => {
    if (!selectedRoom) return;

    // Chỉ poll messages nếu WebSocket KHÔNG kết nối
    // Khi WebSocket đã kết nối, nó xử lý cập nhật real-time qua handleNewMessage
    let messagesPollInterval: ReturnType<typeof setInterval> | null = null;

    if (!isConnected) {
      messagesPollInterval = setInterval(() => {
        // Vô hiệu hóa queries trước để đảm bảo dữ liệu mới
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(selectedRoom.id),
          exact: false,
        });

        // Cũng kiểm tra dữ liệu rooms để phát hiện tin nhắn mới nhanh hơn
        const currentRoomInList = roomsData?.content?.find(
          (room) => room.id === selectedRoom.id
        );
        const apiLastMessageAt = currentRoomInList?.lastMessageAt;
        const hasNewMessageFromRoom =
          apiLastMessageAt && apiLastMessageAt !== lastMessageAtRef.current;

        // Refetch messages
        refetchMessages()
          .then((result) => {
            if (result?.data?.content && selectedRoom) {
              const reversedMessages = [...result.data.content].reverse();

              // Merge messages: kết hợp messages hiện có với messages mới từ API
              // Điều này đảm bảo không mất messages đã được thêm qua WebSocket
              setMessages((prev) => {
                // Kiểm tra xem có tin nhắn mới không bằng cách so sánh tin nhắn cuối
                const apiLastMessage =
                  reversedMessages.length > 0
                    ? reversedMessages[reversedMessages.length - 1]
                    : null;
                const currentLastMessage =
                  prev.length > 0 ? prev[prev.length - 1] : null;
                const hasNewMessage =
                  apiLastMessage &&
                  (!currentLastMessage ||
                    apiLastMessage.id !== currentLastMessage.id ||
                    apiLastMessage.sentAt !== currentLastMessage.sentAt);

                // Thêm tất cả messages từ API (đây là nguồn sự thật)
                const mergedMessages: IChatMessage[] = [];
                const apiMessageIds = new Set(
                  reversedMessages.map((m) => m.id)
                );

                // Đầu tiên, thêm tất cả messages từ API
                reversedMessages.forEach((apiMsg) => {
                  mergedMessages.push(apiMsg);
                });

                // Sau đó, thêm bất kỳ messages hiện có nào không có trong phản hồi API
                // Đây có thể là optimistic messages hoặc WebSocket messages chưa được lưu
                prev.forEach((existingMsg) => {
                  if (!apiMessageIds.has(existingMsg.id)) {
                    const msgTime = new Date(existingMsg.sentAt).getTime();
                    const now = Date.now();
                    const age = now - msgTime;

                    // Giữ optimistic messages (ID âm) nếu chúng còn mới (trong vòng 15 giây)
                    if (existingMsg.id < 0) {
                      if (age < 15000) {
                        mergedMessages.push(existingMsg);
                      }
                    } else {
                      // Đối với messages thật (ID dương) từ WebSocket chưa có trong API
                      // Giữ chúng nếu chúng còn mới (trong vòng 30 giây)
                      // Điều này rất quan trọng: WebSocket messages có thể đến trước khi API được cập nhật
                      // Tăng cửa sổ thời gian để đảm bảo messages từ chat đang active được giữ lại
                      if (age < 30000) {
                        mergedMessages.push(existingMsg);
                      }
                    }
                  }
                });

                // Sắp xếp theo sentAt để duy trì thứ tự thời gian
                mergedMessages.sort((a, b) => {
                  return (
                    new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
                  );
                });

                // Loại bỏ trùng lặp theo ID (trong trường hợp có chồng chéo)
                // Sử dụng Map để đảm bảo giữ lại phiên bản mới nhất của mỗi message
                const uniqueMessagesMap = new Map<number, IChatMessage>();

                // Thêm tất cả messages, giữ lại phiên bản mới nhất nếu có trùng lặp
                mergedMessages.forEach((msg) => {
                  const existing = uniqueMessagesMap.get(msg.id);
                  if (
                    !existing ||
                    new Date(msg.sentAt) > new Date(existing.sentAt)
                  ) {
                    uniqueMessagesMap.set(msg.id, msg);
                  }
                });

                const uniqueMessages = Array.from(uniqueMessagesMap.values());

                // Sắp xếp lại sau khi loại bỏ trùng lặp để đảm bảo thứ tự đúng
                uniqueMessages.sort((a, b) => {
                  return (
                    new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
                  );
                });

                // Luôn cập nhật nếu có messages mới hoặc cấu trúc thay đổi
                const shouldUpdate =
                  uniqueMessages.length !== prev.length ||
                  uniqueMessages.some((msg, idx) => msg.id !== prev[idx]?.id) ||
                  hasNewMessage ||
                  hasNewMessageFromRoom;

                if (shouldUpdate) {
                  lastMessagesLengthRef.current = uniqueMessages.length;

                  // Kích hoạt scroll nếu có messages mới
                  if (
                    hasNewMessage ||
                    hasNewMessageFromRoom ||
                    uniqueMessages.length > prev.length
                  ) {
                    // Sử dụng setTimeout để đảm bảo state đã được cập nhật trước khi scroll
                    setTimeout(() => {
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                          setTimeout(() => scrollToBottom(), 100);
                          setTimeout(() => scrollToBottom(), 300);
                        });
                      });
                    }, 0);
                  }

                  return uniqueMessages;
                }

                // Không có thay đổi, trả về state trước đó
                return prev;
              });

              // Cập nhật refs - nhưng chỉ nếu thực sự có messages mới từ API
              // QUAN TRỌNG: Không ghi đè lastMessageAtRef nếu WebSocket có messages mới hơn
              // Điều này đảm bảo messages realtime từ WebSocket được giữ lại
              if (reversedMessages.length > 0) {
                const lastMessage =
                  reversedMessages[reversedMessages.length - 1];
                const currentLastMessageAt = lastMessageAtRef.current;

                // Chỉ cập nhật nếu message từ API mới hơn hoặc bằng message WebSocket hiện tại
                // Điều này ngăn ghi đè messages realtime
                if (
                  !currentLastMessageAt ||
                  lastMessage.sentAt >= currentLastMessageAt
                ) {
                  lastMessageAtRef.current = lastMessage.sentAt;
                }
              }
            }
          })
          .catch(() => {});
      }, 2000); // Poll mỗi 2 giây khi WebSocket không kết nối
    }

    // Poll rooms với các khoảng thời gian khác nhau dựa trên trạng thái kết nối WebSocket
    // Khi WebSocket đã kết nối: poll mỗi 10s (chỉ để đồng bộ badge counts)
    // Khi WebSocket không kết nối: poll mỗi 5s (thường xuyên hơn để phát hiện messages mới)
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
  }, [selectedRoom?.id, roomsData, isConnected]); // Thêm isConnected vào dependencies

  // Lưu ý: Active polling ở trên xử lý cập nhật liên tục khi room được chọn
  // Fallback này bị tắt để tránh polling trùng lặp

  // Refetch rooms khi WebSocket kết nối (để lấy số lượng chưa đọc mới nhất)
  useEffect(() => {
    if (isConnected && user) {
      // Độ trễ nhỏ để đảm bảo WebSocket subscriptions đã sẵn sàng
      const timeoutId = setTimeout(() => {
        queryClient.refetchQueries({
          queryKey: chatKeys.rooms(),
          exact: false,
        });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, user]); // Chỉ phụ thuộc vào trạng thái kết nối, không phải refetchRooms

  // Đặt lại flags khi room thay đổi
  useLayoutEffect(() => {
    if (selectedRoom && lastRoomIdRef.current !== selectedRoom.id) {
      // Đây là room mới
      lastRoomIdRef.current = selectedRoom.id;
      isInitialLoadRef.current = true;
      hasScrolledToBottomRef.current = false;
    }
  }, [selectedRoom?.id]);

  // Khởi tạo messages từ API - LUÔN cập nhật khi messagesData thay đổi
  useEffect(() => {
    if (messagesData?.content && selectedRoom) {
      // Tạo mảng mới thay vì thay đổi mảng gốc
      const reversedMessages = [...messagesData.content].reverse();

      // Kiểm tra xem có messages mới không bằng cách so sánh với state hiện tại
      const currentLastMessageId =
        messages.length > 0 ? messages[messages.length - 1]?.id : null;
      const newLastMessageId =
        reversedMessages.length > 0
          ? reversedMessages[reversedMessages.length - 1]?.id
          : null;
      const hasNewMessages = newLastMessageId !== currentLastMessageId;

      // Merge messages thay vì thay thế để giữ lại WebSocket messages
      setMessages((prev) => {
        // Tạo set của message IDs từ API để kiểm tra trùng lặp
        const apiMessageIds = new Set(reversedMessages.map((m) => m.id));

        // Bắt đầu với messages từ API (nguồn sự thật)
        const merged: IChatMessage[] = [...reversedMessages];

        // Thêm optimistic messages và WebSocket messages chưa có trong API
        prev.forEach((existingMsg) => {
          if (!apiMessageIds.has(existingMsg.id)) {
            const msgTime = new Date(existingMsg.sentAt).getTime();
            const now = Date.now();
            const age = now - msgTime;

            // Giữ optimistic messages (ID âm) nếu còn mới
            if (existingMsg.id < 0) {
              if (age < 15000) {
                merged.push(existingMsg);
              }
            } else {
              // Giữ messages thật từ WebSocket chưa có trong API
              // Điều này rất quan trọng cho chat đang active - WebSocket messages đến trước khi API cập nhật
              if (age < 30000) {
                merged.push(existingMsg);
              }
            }
          }
        });

        // Sắp xếp theo sentAt
        merged.sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        // Loại bỏ trùng lặp bằng Map để đảm bảo giữ lại tất cả messages
        const uniqueMap = new Map<number, IChatMessage>();
        merged.forEach((msg) => {
          const existing = uniqueMap.get(msg.id);
          if (!existing || new Date(msg.sentAt) > new Date(existing.sentAt)) {
            uniqueMap.set(msg.id, msg);
          }
        });

        const unique = Array.from(uniqueMap.values());

        // Sắp xếp lại sau khi loại bỏ trùng lặp
        unique.sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        return unique;
      });

      // Cập nhật lastMessageAtRef khi messages được khởi tạo
      if (reversedMessages.length > 0) {
        const lastMessage = reversedMessages[reversedMessages.length - 1];
        lastMessageAtRef.current = lastMessage.sentAt;
      }

      // Nếu có messages mới, scroll xuống cuối
      if (hasNewMessages) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => scrollToBottom(), 100);
            setTimeout(() => scrollToBottom(), 300);
            setTimeout(() => scrollToBottom(), 500);
          });
        });
      }
    } else if (!selectedRoom) {
      // Xóa messages khi không có room nào được chọn
      setMessages([]);
    }
  }, [messagesData, selectedRoom, scrollToBottom]); // Xóa messages.length khỏi dependencies để luôn cập nhật

  // Khi room được chọn và có messages chưa đọc, refetch messages ngay lập tức
  useEffect(() => {
    if (!selectedRoom || !roomsData?.content) return;

    const currentRoomInList = roomsData.content.find(
      (room) => room.id === selectedRoom.id
    );

    // Nếu room có messages chưa đọc, refetch messages ngay lập tức (không đợi throttle)
    if (currentRoomInList && currentRoomInList.unreadCount > 0) {
      const now = Date.now();
      // Chỉ refetch nếu chưa refetch gần đây (tránh vòng lặp vô hạn)
      if (now - lastRefetchTimeRef.current > 500) {
        lastRefetchTimeRef.current = now;
        refetchMessages().then((result) => {
          // Buộc cập nhật messages từ kết quả refetch
          if (result?.data?.content && selectedRoom) {
            const reversedMessages = [...result.data.content].reverse();
            setMessages(reversedMessages);
            if (reversedMessages.length > 0) {
              const lastMessage = reversedMessages[reversedMessages.length - 1];
              lastMessageAtRef.current = lastMessage.sentAt;
            }
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom?.id]); // Chỉ kích hoạt khi room thay đổi, không phải mỗi lần roomsData cập nhật

  // Scroll xuống cuối đơn giản và trực tiếp khi messages được tải cho room mới
  useEffect(() => {
    // Chỉ scroll nếu có messages và đây là room mới
    if (
      messages.length > 0 &&
      selectedRoom &&
      lastRoomIdRef.current === selectedRoom.id
    ) {
      // Hàm đơn giản để scroll xuống cuối
      const performScroll = () => {
        const viewport = document.querySelector(
          '[data-slot="scroll-area-viewport"]'
        ) as HTMLElement;

        if (viewport) {
          // Đợi scrollHeight được tính toán
          requestAnimationFrame(() => {
            const targetScroll = viewport.scrollHeight;
            const currentScroll = viewport.scrollTop;

            // Chỉ scroll nếu chưa ở cuối
            if (Math.abs(targetScroll - currentScroll) > 5) {
              // Buộc scroll xuống cuối
              viewport.scrollTop = targetScroll;
              viewport.scrollTo({
                top: targetScroll,
                behavior: "auto",
              });
            }
          });
        }
      };

      // Thử scroll nhiều lần với độ trễ tăng dần
      // Điều này đảm bảo chúng ta bắt được DOM khi nó sẵn sàng
      performScroll(); // Ngay lập tức

      // Sử dụng requestAnimationFrame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          performScroll();
        });
      });

      // Thử với các độ trễ khác nhau để đảm bảo DOM đã được render hoàn toàn
      const delays = [
        100, 200, 300, 500, 700, 1000, 1500, 2000, 3000, 4000, 5000,
      ];
      delays.forEach((delay) => {
        setTimeout(performScroll, delay);
      });

      // Cũng sử dụng MutationObserver như một backup
      const viewport = document.querySelector(
        '[data-slot="scroll-area-viewport"]'
      ) as HTMLElement;

      if (viewport) {
        const observer = new MutationObserver(() => {
          performScroll();
        });

        observer.observe(viewport, {
          childList: true,
          subtree: true,
          attributes: true,
        });

        // Dọn dẹp sau 5 giây
        setTimeout(() => {
          observer.disconnect();
        }, 5000);

        return () => {
          observer.disconnect();
        };
      }
    }
  }, [messages.length, selectedRoom?.id]);

  // Đánh dấu messages là đã đọc khi room được chọn (chỉ một lần mỗi lần chọn room)
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
        // Đánh dấu TẤT CẢ messages chưa đọc là đã đọc, không chỉ tin nhắn mới nhất
        // Điều này đảm bảo unreadCount được cập nhật đúng khi người dùng vào room
        unreadMessages.forEach((message) => {
          markAsRead({ messageId: message.id, roomId: selectedRoom.id });
        });
        hasMarkedAsReadRef.current = selectedRoom.id;
      }
    }
    // Đặt lại khi room thay đổi
    if (!selectedRoom) {
      hasMarkedAsReadRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom?.id, messages.length, user?.id]); // Chỉ phụ thuộc vào room ID và số lượng messages, không phải toàn bộ mảng messages hoặc markAsRead

  const handleSendMessage = async (data: SendMessageData) => {
    if (!selectedRoom) return;

    let fileId = data.fileId;

    // Nếu có file để upload, upload trước
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

    // Gửi tin nhắn trực tiếp nếu không có file hoặc fileId đã tồn tại
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

    // Gửi qua WebSocket nếu đã kết nối, nếu không thì qua REST API
    if (isConnected) {
      wsSendMessage({
        roomId: selectedRoom.id,
        ...messageData,
      });

      // Thêm optimistic message ngay lập tức để UX tốt hơn
      // Tin nhắn này sẽ được thay thế bằng tin nhắn thật khi nhận được qua WebSocket
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

      // Scroll xuống cuối ngay lập tức
      requestAnimationFrame(() => {
        scrollToBottom();
        requestAnimationFrame(() => {
          scrollToBottom();
          setTimeout(() => scrollToBottom(), 50);
          setTimeout(() => scrollToBottom(), 150);
        });
      });
    } else {
      // WebSocket không kết nối - sử dụng REST API
      sendMessage(
        { roomId: selectedRoom.id, data: messageData },
        {
          onSuccess: async () => {
            const result = await refetchMessages();
            // Buộc cập nhật messages từ kết quả refetch
            if (result?.data?.content && selectedRoom) {
              const reversedMessages = [...result.data.content].reverse();
              setMessages(reversedMessages);
              if (reversedMessages.length > 0) {
                const lastMessage =
                  reversedMessages[reversedMessages.length - 1];
                lastMessageAtRef.current = lastMessage.sentAt;
              }
            }
            refetchRooms();
            // Scroll xuống cuối sau khi refetch messages từ API
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
    // Trước khi chuyển sang room mới, đánh dấu tất cả messages chưa đọc trong room hiện tại là đã đọc
    if (selectedRoom && selectedRoom.id !== room.id && messages.length > 0) {
      const unreadMessagesInCurrentRoom = messages.filter(
        (m) =>
          !m.isReadByMe &&
          m.senderId !== Number(user?.id) &&
          m.roomId === selectedRoom.id
      );

      if (unreadMessagesInCurrentRoom.length > 0) {
        // Đánh dấu tất cả messages chưa đọc trong room trước đó là đã đọc
        unreadMessagesInCurrentRoom.forEach((message) => {
          markAsRead({ messageId: message.id, roomId: selectedRoom.id });
        });
      }
    }

    setSelectedRoom(room);
    setMessages([]);
    // Đặt lại flags khi chọn room mới
    lastRoomIdRef.current = room.id;
    isInitialLoadRef.current = true;
    hasScrolledToBottomRef.current = false;
    lastMessageAtRef.current = room.lastMessageAt; // Khởi tạo lastMessageAt cho room mới
    // Đặt lại hasMarkedAsReadRef cho room mới
    hasMarkedAsReadRef.current = null;

    // Messages sẽ được tải qua useEffect khi messagesData thay đổi
    // Scroll sẽ tự động xảy ra qua useEffect khi messages được set
    refetchMessages().then((result) => {
      // Buộc cập nhật messages từ kết quả refetch
      if (result?.data?.content) {
        const reversedMessages = [...result.data.content].reverse();
        setMessages(reversedMessages);
        if (reversedMessages.length > 0) {
          const lastMessage = reversedMessages[reversedMessages.length - 1];
          lastMessageAtRef.current = lastMessage.sentAt;
        }
      }
    });
  };

  return (
    <div
      className="flex flex-col h-full min-h-0 w-full -m-4"
      style={{ height: "calc(100vh - 4rem)", maxHeight: "calc(100vh - 4rem)" }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Tin Nhắn
          </h1>
        </div>
      </div>

      {/* Chat Content */}
      <div
        className="flex-1 flex min-h-0 w-full overflow-hidden"
        style={{ maxHeight: "calc(100vh - 8rem)" }}
      >
        {/* Room List Sidebar */}
        <div className="w-80 border-r flex flex-col min-h-0 shrink-0 overflow-hidden">
          <ChatRoomList
            rooms={roomsData?.content || []}
            selectedRoomId={selectedRoom?.id}
            onRoomSelect={handleRoomSelect}
            currentUserId={Number(user?.id)}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background min-h-0 w-full overflow-hidden">
          {selectedRoom ? (
            <>
              <div className="flex-1 min-h-0 w-full overflow-hidden">
                <ChatMessageList
                  messages={messages}
                  currentUserId={Number(user?.id)}
                />
              </div>
              <div
                className="shrink-0 w-full bg-background relative z-10"
                style={{ flexShrink: 0 }}
              >
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={isSending || isUploading}
                  placeholder="Nhập tin nhắn..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center w-full max-w-md px-4">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm font-medium mb-1">Chưa có tin nhắn nào</p>
                <p className="text-xs">Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
