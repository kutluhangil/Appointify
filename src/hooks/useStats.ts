import { useAppointments } from "./useAppointments";
import { useCustomers } from "./useCustomers";
import { usePayments } from "./usePayments";
import { startOfDay, endOfDay, subDays, format, isAfter, isBefore } from "date-fns";
import { tr } from "date-fns/locale";

export function useStats() {
  const { appointments, isLoading: loadingAppts } = useAppointments();
  const { customers, isLoading: loadingCusts } = useCustomers();
  const { payments, isLoading: loadingPayments } = usePayments();

  const isLoading = loadingAppts || loadingCusts || loadingPayments;

  const today = startOfDay(new Date());
  const tonight = endOfDay(new Date());
  const oneWeekAgo = subDays(today, 7);

  const todayAppointments = appointments.filter((appt) => {
    const start = new Date(appt.starts_at);
    return isAfter(start, today) && isBefore(start, tonight);
  }).length;

  const totalCustomers = customers.length;

  const completedAppts = appointments.filter(
    (appt) => appt.status === "completed" || appt.status === "confirmed"
  );
  const avgBookingValue =
    completedAppts.length > 0
      ? Math.round(
          completedAppts.reduce((sum, appt) => sum + Number(appt.price || 0), 0) /
            completedAppts.length
        )
      : 0;

  const weekPayments = payments.filter((p) => {
    const pDate = new Date(p.created_at || p.paid_at || "");
    return isAfter(pDate, oneWeekAgo) && p.status === "completed";
  });

  const weekRevenue = weekPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Generate chart series for past 7 days
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    return {
      date: d,
      dayName: format(d, "EEE", { locale: tr }),
      revenue: 0,
    };
  });

  daysOfWeek.forEach((day) => {
    const dStart = startOfDay(day.date);
    const dEnd = endOfDay(day.date);
    const dayPayments = payments.filter((p) => {
      const pDate = new Date(p.created_at || p.paid_at || "");
      return isAfter(pDate, dStart) && isBefore(pDate, dEnd) && p.status === "completed";
    });
    day.revenue = dayPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  });

  const weekRevenueSeries = daysOfWeek.map((d) => ({
    day: d.dayName,
    revenue: d.revenue,
  }));

  return {
    stats: {
      todayAppointments,
      weekRevenue,
      totalCustomers,
      avgBookingValue,
      weekRevenueSeries,
    },
    isLoading,
  };
}
