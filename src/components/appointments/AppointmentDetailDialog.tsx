import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/format";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { AppointmentWithRelations } from "@/hooks/useAppointments";
import { useTranslation } from "react-i18next";

interface AppointmentDetailDialogProps {
  appointment: AppointmentWithRelations | null;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}

const STATUS_CONFIG: Record<string, { labelKey: string; defaultLabel: string; color: string; dot: string }> = {
  pending:     { labelKey: "payments.pending_status",     defaultLabel: "Bekliyor",     color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",  dot: "bg-yellow-500" },
  confirmed:   { labelKey: "dashboard.confirmed",       defaultLabel: "Onaylı",       color: "bg-green-500/10 text-green-600 dark:text-green-400",     dot: "bg-green-500" },
  in_progress: { labelKey: "common.in_progress", defaultLabel: "Devam Ediyor", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",        dot: "bg-blue-500" },
  completed:   { labelKey: "payments.completed_status",   defaultLabel: "Tamamlandı",   color: "bg-muted/60 text-muted-foreground",                       dot: "bg-muted-foreground" },
  cancelled:   { labelKey: "appointments.cancel",        defaultLabel: "İptal",        color: "bg-red-500/10 text-red-600 dark:text-red-400",           dot: "bg-red-500" },
  no_show:     { labelKey: "customers.no_show",      defaultLabel: "Gelmedi",      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",  dot: "bg-orange-500" },
};

const ACTIONABLE = new Set<string>(["pending", "confirmed", "in_progress"]);

export function AppointmentDetailDialog({
  appointment,
  onClose,
  onStatusChange,
}: AppointmentDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "tr" ? tr : enUS;

  if (!appointment) return null;

  const cfg = STATUS_CONFIG[appointment.status || "pending"] || STATUS_CONFIG.pending;

  return (
    <Dialog open={!!appointment} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{t("appointments.detail_title")}</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-auto ${cfg.color}`}>
              {t(cfg.labelKey, { defaultValue: cfg.defaultLabel })}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-[13px] font-medium shrink-0">
              {appointment.customer?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "M"}
            </div>
            <div>
              <p className="font-medium text-[14px]">{appointment.customer?.full_name || t("common.unknown_customer", { defaultValue: "Bilinmeyen Müşteri" })}</p>
              <p className="text-[12px] text-muted-foreground">{appointment.customer?.phone || t("common.no_phone", { defaultValue: "Telefon yok" })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("appointments.service")}</p>
              <p className="font-medium">{appointment.service?.name || t("common.unknown_service", { defaultValue: "Bilinmeyen Hizmet" })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("appointments.staff_member")}</p>
              <p className="font-medium">{appointment.staff?.full_name || t("appointments.select_staff")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("appointments.date")}</p>
              <p className="font-medium">{format(new Date(appointment.starts_at), "d MMMM yyyy", { locale: dateLocale })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("appointments.time")}</p>
              <p className="font-medium">{formatTime(appointment.starts_at)} – {formatTime(appointment.ends_at)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("appointments.duration")}</p>
              <p className="font-medium">{appointment.service?.duration_min || 30} {t("common.mins", { defaultValue: "dk" })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t("appointments.price")}</p>
              <p className="font-medium">{formatCurrency(Number(appointment.price || 0))}</p>
            </div>
          </div>

          {appointment.status && ACTIONABLE.has(appointment.status) && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-[12px] text-red-600 hover:text-red-600 hover:border-red-300"
                onClick={() => onStatusChange(appointment.id, "cancelled")}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> {t("appointments.cancel_btn")}
              </Button>
              <Button
                size="sm"
                className="flex-1 text-[12px]"
                onClick={() => onStatusChange(appointment.id, "completed")}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t("appointments.complete_btn")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
