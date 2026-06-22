import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Phone, Mail, TrendingUp, CalendarDays, AlertTriangle } from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/format";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";
import { AppointmentWithRelations } from "@/hooks/useAppointments";
import { useTranslation } from "react-i18next";

type Customer = Tables<"customers">;

interface CustomerDetailSheetProps {
  customer: Customer | null;
  onClose: () => void;
  stats: { visits: number; spent: number; noShows: number } | null;
  appointments: AppointmentWithRelations[];
}

const TAG_COLORS: Record<string, string> = {
  VIP:     "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  regular: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  new:     "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
};

export function CustomerDetailSheet({
  customer,
  onClose,
  stats,
  appointments,
}: CustomerDetailSheetProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "tr" ? tr : enUS;

  if (!customer) return null;

  const tag = customer.tag || "regular";
  const currentStats = stats || { visits: 0, spent: 0, noShows: 0 };

  return (
    <Sheet open={!!customer} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-[13px] font-medium">
              {customer.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-[15px]">{customer.full_name}</p>
              <div className="flex gap-1 mt-0.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${TAG_COLORS[tag] || "bg-muted text-muted-foreground border-border"}`}>
                  {tag === "VIP" ? "⭐ VIP" : tag === "new" ? t("customers.new_tag", { defaultValue: "Yeni" }) : t("customers.regular_tag", { defaultValue: "Düzenli" })}
                </span>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Contact */}
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{t("customers.contact")}</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[13px]">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{customer.phone || t("common.no_phone", { defaultValue: "Telefon yok" })}</span>
              </div>
              <div className="flex items-center gap-2 text-[13px]">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{customer.email || t("common.no_email", { defaultValue: "E-posta yok" })}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t("customers.visits"), value: currentStats.visits, icon: CalendarDays },
              { label: t("customers.spent"), value: formatCurrency(currentStats.spent), icon: TrendingUp },
              { label: t("customers.no_show"), value: currentStats.noShows, icon: AlertTriangle },
            ].map((s, i) => (
              <div key={i} className="border border-border rounded-lg p-3 text-center">
                <s.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-[16px] font-semibold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Appointment history */}
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">{t("customers.history")}</p>
            <div className="space-y-2">
              {appointments.length === 0 ? (
                <p className="text-[13px] text-muted-foreground">{t("appointments.not_found")}</p>
              ) : (
                appointments.map((apt) => {
                  return (
                    <div key={apt.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium">{apt.service?.name || t("common.unknown_service", { defaultValue: "Bilinmeyen Hizmet" })}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {apt.staff?.full_name || t("appointments.select_staff")} · {format(new Date(apt.starts_at), "d MMM yyyy", { locale: dateLocale })} {formatTime(apt.starts_at)}
                        </p>
                      </div>
                      <p className="text-[12px] font-medium shrink-0">{formatCurrency(Number(apt.price || 0))}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
