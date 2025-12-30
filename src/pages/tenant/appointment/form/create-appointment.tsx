// File: src/components/appointment/CreateAppointment.tsx

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateAppointment } from "@/hooks/useAppointment";
import { useToast } from "@/hooks/useToast";
import type { UnitConfirmedAppointment } from "@/pages/landlord/appointments/types";
import {
  appointmentSchema,
  type AppointmentFormData,
} from "@/schemas/auth.schema";
import type { IGetListingResponse } from "@/services/api/listing.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Calendar, Check, Clock, FileText, X } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: IGetListingResponse;
  confirmedAppointments?: UnitConfirmedAppointment[];
}

export default function CreateAppointment({
  open,
  onOpenChange,
  listing,
  confirmedAppointments = [],
}: AppointmentDialogProps) {
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [timeError, setTimeError] = useState("");

  const {
    mutate: createAppointment,
    isPending,
    isSuccess,
  } = useCreateAppointment();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      unitId: listing?.unit?.id || 0,
      startTime: "",
      note: "",
    },
  });
  const toast = useToast();

  // Reset form and set unitId when dialog opens
  React.useEffect(() => {
    if (open && listing?.unit?.id) {
      const unitId = listing.unit.id;
      reset({
        unitId,
        startTime: "",
        note: "",
      });
      setDateInput("");
      setTimeInput("");
      setValue("unitId", unitId);
    }
  }, [open, listing, reset, setValue]);

  // Update startTime when date or time changes
  React.useEffect(() => {
    if (dateInput && timeInput && !timeError) {
      // Combine date and time in local timezone, then convert to ISO string
      // This ensures the time is sent as the user selected it
      const localDateTime = new Date(`${dateInput}T${timeInput}:00`);
      const now = new Date();
      const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours

      // Double check validation - must be at least 24 hours in the future
      if (localDateTime > minDateTime) {
        const startTime = localDateTime.toISOString();
        setValue("startTime", startTime);
      } else {
        setValue("startTime", "");
      }
    } else {
      setValue("startTime", "");
    }
  }, [dateInput, timeInput, timeError, setValue]);

  const onSubmit = async (data: AppointmentFormData) => {
    // Validate date and time before submitting
    if (!dateInput || !timeInput) {
      toast.error("Vui lòng chọn ngày và giờ xem phòng");
      return;
    }

    // Final validation: check for conflicts
    const error = checkTimeConflict(dateInput, timeInput);
    if (error) {
      toast.error(error);
      setTimeError(error);
      return;
    }

    // Ensure unitId is correct from listing
    const unitId = listing?.unit?.id || data.unitId;

    if (!unitId || unitId === 0) {
      toast.error("Không thể đặt lịch: Thiếu thông tin phòng");
      console.error("Missing unitId. Listing:", listing);
      return;
    }

    const appointmentData = {
      ...data,
      unitId,
    };

    createAppointment(appointmentData, {
      onSuccess: () => {
        setDateInput("");
        setTimeInput("");
        reset();
        onOpenChange(false);
        toast.success("Đặt lịch hẹn thành công!");
      },
      onError: (error: unknown) => {
        console.error("Error creating appointment:", error);
        const errorMessage =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          "Có lỗi xảy ra. Vui lòng thử lại!";
        toast.error(errorMessage);
      },
    });
  };

  const handleClose = () => {
    if (!isPending) {
      setDateInput("");
      setTimeInput("");
      reset();
      onOpenChange(false);
    }
  };

  const handleQuickTimeSelect = (time: string) => {
    // Validate quick time selection
    if (dateInput && time) {
      const error = checkTimeConflict(dateInput, time);
      if (error) {
        setTimeError(error);
        return;
      }
    }
    setTimeError("");
    setTimeInput(time);
  };

  // Get minimum date (tomorrow if current time + 24h would be tomorrow, otherwise today)
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours
  const minDateStr = minDateTime.toISOString().split("T")[0];

  // Calculate minimum time based on selected date
  const getMinTime = () => {
    // If no date selected, allow any time (will validate on submit)
    if (!dateInput) return "08:00";

    const selectedDate = new Date(dateInput);
    const minDate = new Date(minDateTime);
    minDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // If selected date is the same as minimum date (the day when 24h from now falls),
    // calculate min time based on 24 hours from now
    if (selectedDate.getTime() === minDate.getTime()) {
      const minHour = minDateTime.getHours();
      const minMinute = minDateTime.getMinutes();
      // Ensure it's within working hours (8:00-20:00)
      if (minHour < 8) {
        return "08:00";
      }
      if (minHour >= 20) {
        // If min time is after 20:00, user must select next day
        return "08:00";
      }
      const minTimeStr = `${String(minHour).padStart(2, "0")}:${String(
        minMinute
      ).padStart(2, "0")}`;
      return minTimeStr;
    }

    // If selected date is after minimum date, min time is 08:00
    if (selectedDate.getTime() > minDate.getTime()) {
      return "08:00";
    }

    // If selected date is before minimum date, return a time that ensures 24h gap
    // This shouldn't happen if min date is set correctly, but just in case
    return "08:00";
  };

  const getMaxTime = () => {
    return "20:00";
  };

  // Check if selected time conflicts with confirmed appointments
  const checkTimeConflict = (dateInput: string, timeInput: string): string => {
    if (!dateInput || !timeInput) return "";

    const selectedDateTime = new Date(`${dateInput}T${timeInput}:00`);
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours

    // Check if time is at least 24 hours in the future
    if (selectedDateTime <= minDateTime) {
      return "Thời gian phải đặt trước ít nhất 24 giờ";
    }

    // Check if time conflicts with confirmed appointments
    if (confirmedAppointments && confirmedAppointments.length > 0) {
      for (const appointment of confirmedAppointments) {
        const appointmentTime = new Date(appointment.startTime);

        // Normalize both times to same timezone for comparison
        const selectedDate = new Date(selectedDateTime);
        const appointmentDate = new Date(appointmentTime);

        // Check if they are on the same day
        const isSameDay =
          selectedDate.getFullYear() === appointmentDate.getFullYear() &&
          selectedDate.getMonth() === appointmentDate.getMonth() &&
          selectedDate.getDate() === appointmentDate.getDate();

        if (isSameDay) {
          // Check if they are in the same hour (consider same hour as conflict)
          // This prevents double booking in the same time slot
          const selectedHour = selectedDate.getHours();
          const appointmentHour = appointmentDate.getHours();

          if (selectedHour === appointmentHour) {
            return `Thời gian này đã được xác nhận bởi ${
              appointment.tenantFullName || "người khác"
            } (${appointmentDate.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}). Vui lòng chọn thời gian khác.`;
          }
        }
      }
    }

    return "";
  };

  // Validate time when it changes
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeInput(newTime);

    if (dateInput && newTime) {
      const error = checkTimeConflict(dateInput, newTime);
      setTimeError(error);
    } else {
      setTimeError("");
    }
  };

  // Validate date when it changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateInput(newDate);
    setTimeError("");
    setTimeInput(""); // Reset time when date changes

    // If user selects today and has a time, validate it
    if (newDate && timeInput) {
      const error = checkTimeConflict(newDate, timeInput);
      if (error) {
        setTimeError(error);
        setTimeInput(""); // Clear invalid time
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-6 h-6 text-blue-600" />
            Đặt Lịch Xem Phòng
          </DialogTitle>
          <DialogDescription>
            {/* Chọn thời gian phù hợp để xem {listing?.title} */}
          </DialogDescription>
        </DialogHeader>

        {/* Success State */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Đặt lịch thành công!
              </h3>
              <p className="text-sm text-gray-600">
                {listing?.landlord?.displayName
                  ? `Chủ nhà ${listing.landlord.displayName} sẽ liên hệ với bạn sớm để xác nhận.`
                  : "Chủ nhà sẽ liên hệ với bạn sớm để xác nhận."}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Landlord Info Card */}
            {listing?.landlord && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {listing.landlord.displayName
                      ? listing.landlord.displayName.charAt(0).toUpperCase()
                      : listing.landlord.email?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {listing.landlord.displayName || "Chủ nhà"}
                    </p>
                    {listing.landlord.email && (
                      <p className="text-sm text-gray-600">
                        {listing.landlord.email}
                      </p>
                    )}
                    {listing.landlord.phone && (
                      <p className="text-sm text-gray-600">
                        {listing.landlord.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Ngày xem <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={handleDateChange}
                min={minDateStr}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Phải đặt lịch trước ít nhất 24 giờ
              </p>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Giờ xem <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={timeInput}
                onChange={handleTimeChange}
                min={getMinTime()}
                max={getMaxTime()}
                required
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  timeError ? "border-red-500" : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                {dateInput && dateInput === minDateStr
                  ? `Khung giờ: ${getMinTime()} - ${getMaxTime()} (từ 24 giờ sau thời điểm hiện tại)`
                  : dateInput
                  ? "Khung giờ: 08:00 - 20:00"
                  : "Khung giờ: 08:00 - 20:00 (chọn ngày để xem giới hạn chính xác)"}
              </p>
              {timeError && (
                <p className="text-xs text-red-500 mt-1">{timeError}</p>
              )}
              {errors.startTime && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.startTime.message}
                </p>
              )}
            </div>

            {/* Quick Time Buttons */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Hoặc chọn nhanh:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {["09:00", "14:00", "17:00"].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleQuickTimeSelect(time)}
                    className={`px-3 py-2 text-sm rounded-lg border transition ${
                      timeInput === time
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Ghi chú (tùy chọn)
              </label>
              <textarea
                {...register("note")}
                rows={3}
                placeholder="Ví dụ: Tôi muốn xem cả ban công và khu vực bếp..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-sm"
              />
            </div>

            {/* Important Notice */}
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                <strong>Lưu ý quan trọng:</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Đến đúng giờ đã hẹn</li>
                  <li>• Mang theo CMND/CCCD</li>
                  <li>• Chủ nhà sẽ xác nhận trong 24h</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isPending || !dateInput || !timeInput || !!timeError}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Đặt lịch
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
