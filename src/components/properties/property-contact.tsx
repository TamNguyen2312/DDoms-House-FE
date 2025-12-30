import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UnitConfirmedAppointment } from "@/pages/landlord/appointments/types";
import type { IGetListingResponse } from "@/services/api/listing.service";
import { useAuth } from "@/store";
import { CalendarDays, CheckCircle, Mail, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateAppointment from "../../pages/tenant/appointment/form/create-appointment";
import { ChatSheet } from "../chat/chat-sheet";

interface PropertyContactProps {
  listing: IGetListingResponse;
  isOwner?: boolean;
  confirmedAppointments?: UnitConfirmedAppointment[];
}

export default function PropertyContact({ 
  listing, 
  isOwner = false,
  confirmedAppointments = []
}: PropertyContactProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);

  // Handle actions that require authentication
  const handleAuthenticatedAction = (action: () => void) => {
    if (!isAuthenticated) {
      // Redirect to login page
      navigate('/auth/login');
      return;
    }
    action();
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Liên Hệ Với Chủ Nhà</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Landlord info */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
              {listing.landlord?.displayName
                ? listing.landlord.displayName.charAt(0).toUpperCase()
                : listing.landlord?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2">
                {listing.landlord?.displayName || "Chủ nhà"}
                {listing.landlord?.verified && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {listing.landlord?.email}
              </div>
            </div>
          </div>

          {/* Contact buttons */}
          <div className="space-y-3">
            {listing.landlord?.phone && (
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={() => {
                  window.location.href = `tel:${listing.landlord.phone}`;
                }}
              >
                <Phone className="w-4 h-4" />
                {listing.landlord.phone}
              </Button>
            )}
            {!isOwner && listing.landlord?.email && (
              <Button
                variant="outline"
                className="w-full gap-2 bg-transparent"
                size="lg"
                onClick={() => {
                  window.location.href = `mailto:${listing.landlord.email}?subject=Liên hệ về ${encodeURIComponent(
                    listing.title
                  )}`;
                }}
              >
                <Mail className="w-4 h-4" />
                Gửi Email
              </Button>
            )}
            {!isOwner && (
              <Button
                variant="outline"
                className="w-full gap-2 bg-transparent"
                size="lg"
                onClick={() => handleAuthenticatedAction(() => setAppointmentDialogOpen(true))}
                disabled={!listing?.unit?.id}
              >
                <CalendarDays className="w-4 h-4" />
                Đặt lịch hẹn
              </Button>
            )}

            {!isOwner && listing.landlord?.id && (
              <Button
                variant="outline"
                className="w-full gap-2 bg-transparent"
                size="lg"
                onClick={() => handleAuthenticatedAction(() => setMessageDialogOpen(true))}
              >
                <MessageCircle className="w-4 h-4" />
                Nhắn Tin
              </Button>
            )}
          </div>

          {/* Important note */}
          {!isOwner && (
            <div className="space-y-2">
              {!isAuthenticated && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                  <strong>Thông báo:</strong> Bạn cần đăng nhập để sử dụng tính năng nhắn tin và đặt lịch hẹn.
                </div>
              )}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                <strong>Lưu ý:</strong> Hãy xem trực tiếp để kiểm tra kỹ. Đừng
                chuyển tiền trước khi xem nhà.
              </div>
            </div>
          )}

          {/* Owner notice - at the bottom */}
          {isOwner && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Đây là bài đăng của bạn</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat Sheet - Sidebar bên phải */}
      <ChatSheet
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        otherUserId={listing.landlord?.id}
        otherUserName={listing.landlord?.displayName || listing.landlord?.email}
      />

      {/* Appointment Dialog */}
      <CreateAppointment
        open={appointmentDialogOpen}
        onOpenChange={setAppointmentDialogOpen}
        listing={listing}
        confirmedAppointments={confirmedAppointments}
      />
    </>
  );
}
