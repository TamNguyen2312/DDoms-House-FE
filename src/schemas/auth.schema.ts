import z from "zod";

// Zod Schema
export const appointmentSchema = z.object({
  unitId: z.number(),
  startTime: z.string().refine(
    (val) => {
      const date = new Date(val);
      const now = new Date();
      const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours
      return !isNaN(date.getTime()) && date > minDateTime;
    },
    { message: "Thời gian phải đặt trước ít nhất 24 giờ" }
  ),
  note: z.string().default(""),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
