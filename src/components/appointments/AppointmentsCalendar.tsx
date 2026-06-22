import { useMemo } from "react";
import { format, addDays, subDays, startOfWeek } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatTime } from "@/lib/format";
import { AppointmentWithRelations } from "@/hooks/useAppointments";
import { useTranslation } from "react-i18next";

interface AppointmentsCalendarProps {
  appointments: AppointmentWithRelations[];
  selectedDate: Date;
  onSelectDate: (date: Date | ((prev: Date) => Date)) => void;
  onSelectAppointment: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { labelKey: string; defaultLabel: string; color: string; dot: string }> = {
  pending:     { labelKey: "payments.pending_status",     defaultLabel: "Bekliyor",     color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",  dot: "bg-yellow-500" },
  confirmed:   { labelKey: "dashboard.confirmed",       defaultLabel: "Onaylı",       color: "bg-green-500/10 text-green-600 dark:text-green-400",     dot: "bg-green-500" },
  in_progress: { labelKey: "common.in_progress", defaultLabel: "Devam Ediyor", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",        dot: "bg-blue-500" },
  completed:   { labelKey: "payments.completed_status",   defaultLabel: "Tamamlandı",   color: "bg-muted/60 text-muted-foreground",                       dot: "bg-muted-foreground" },
  cancelled:   { labelKey: "appointments.cancel",        defaultLabel: "İptal",        color: "bg-red-500/10 text-red-600 dark:text-red-400",           dot: "bg-red-500" },
  no_show:     { labelKey: "customers.no_show",      defaultLabel: "Gelmedi",      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",  dot: "bg-orange-500" },
};

export function AppointmentsCalendar({
  appointments,
  selectedDate,
  onSelectDate,
  onSelectAppointment,
}: AppointmentsCalendarProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "tr" ? tr : enUS;

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const aptsByDay = useMemo(() => {
    const map: Record<string, typeof appointments> = {};
    appointments.forEach((apt) => {
      const key = format(new Date(apt.starts_at), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(apt);
    });
    return map;
  }, [appointments]);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <button
          onClick={() => onSelectDate((d) => subDays(d, 7))}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-[13px] font-medium">
          {format(weekStart, "d MMMM", { locale: dateLocale })} –{" "}
          {format(addDays(weekStart, 6), "d MMMM yyyy", { locale: dateLocale })}
        </span>
        <button
          onClick={() => onSelectDate((d) => addDays(d, 7))}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 divide-x divide-border">
        {weekDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayApts = aptsByDay[key] || [];
          const isToday =
            format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          return (
            <div key={key} className="min-h-[140px] p-2">
              <div className={`text-center mb-2 ${isToday ? "text-foreground font-semibold" : ""}`}>
                <p className="text-[11px] text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: dateLocale })}
                </p>
                <div
                  className={`text-[15px] mt-0.5 ${
                    isToday
                      ? "h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center mx-auto"
                      : ""
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
              <div className="space-y-1">
                {dayApts.slice(0, 3).map((apt) => {
                  const cfg = STATUS_CONFIG[apt.status || "pending"] || STATUS_CONFIG.pending;
                  return (
                    <button
                      key={apt.id}
                      onClick={() => onSelectAppointment(apt.id)}
                      className="w-full text-left p-1.5 rounded-md bg-muted/40 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        <span className="text-[10px] truncate">
                          {apt.customer?.full_name?.split(" ")[0] || t("common.customer_fallback", { defaultValue: "Müşteri" })}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatTime(apt.starts_at)}
                      </p>
                    </button>
                  );
                })}
                {dayApts.length > 3 && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    +{dayApts.length - 3} {t("common.more", { defaultValue: "daha" })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
