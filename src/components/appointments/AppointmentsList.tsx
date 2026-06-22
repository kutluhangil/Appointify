import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { formatCurrency, formatTime } from "@/lib/format";
import { AppointmentWithRelations } from "@/hooks/useAppointments";
import { useTranslation } from "react-i18next";

interface AppointmentsListProps {
  appointments: AppointmentWithRelations[];
  onSelect: (id: string) => void;
}

const STATUS_CONFIG: Record<string, { labelKey: string; defaultLabel: string; color: string; dot: string }> = {
  pending:     { labelKey: "payments.pending_status",     defaultLabel: "Bekliyor",     color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",  dot: "bg-yellow-500" },
  confirmed:   { labelKey: "dashboard.confirmed",       defaultLabel: "Onaylı",       color: "bg-green-500/10 text-green-600 dark:text-green-400",     dot: "bg-green-500" },
  in_progress: { labelKey: "common.in_progress", defaultLabel: "Devam Ediyor", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",        dot: "bg-blue-500" },
  completed:   { labelKey: "payments.completed_status",   defaultLabel: "Tamamlandı",   color: "bg-muted/60 text-muted-foreground",                       dot: "bg-muted-foreground" },
  cancelled:   { labelKey: "appointments.cancel",        defaultLabel: "İptal",        color: "bg-red-500/10 text-red-600 dark:text-red-400",           dot: "bg-red-500" },
  no_show:     { labelKey: "customers.no_show",      defaultLabel: "Gelmedi",      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",  dot: "bg-orange-500" },
};

export function AppointmentsList({ appointments, onSelect }: AppointmentsListProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "tr" ? tr : enUS;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/20">
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("appointments.customer")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("appointments.service")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("appointments.staff_member")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("appointments.date_time")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("appointments.price")}</th>
            <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">{t("appointments.status")}</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-muted-foreground text-[13px]">
                {t("appointments.not_found")}
              </td>
            </tr>
          ) : (
            appointments.map((apt) => {
              const cfg = STATUS_CONFIG[apt.status || "pending"] || STATUS_CONFIG.pending;
              return (
                <tr
                  key={apt.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => onSelect(apt.id)}
                >
                  <td className="px-4 py-3">
                     <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                        {apt.customer?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "M"}
                      </div>
                      <span className="font-medium">{apt.customer?.full_name || t("common.unknown_customer", { defaultValue: "Bilinmeyen Müşteri" })}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{apt.service?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{apt.staff?.full_name || t("appointments.select_staff")}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>
                      <p className="text-[12px] font-medium text-foreground">{formatTime(apt.starts_at)}</p>
                      <p className="text-[11px]">{format(new Date(apt.starts_at), "d MMM yyyy", { locale: dateLocale })}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(Number(apt.price || 0))}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                      {t(cfg.labelKey, { defaultValue: cfg.defaultLabel })}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
