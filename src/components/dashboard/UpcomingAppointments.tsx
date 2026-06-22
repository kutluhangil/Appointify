import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatCurrency, formatTime } from "@/lib/format";
import { AppointmentWithRelations } from "@/hooks/useAppointments";

interface UpcomingAppointmentsProps {
  appointments: AppointmentWithRelations[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Bekliyor",    color: "text-yellow-500", bg: "bg-yellow-500/10" },
  confirmed:  { label: "Onaylı",      color: "text-green-500",  bg: "bg-green-500/10" },
  in_progress:{ label: "Devam Ediyor", color: "text-blue-500",   bg: "bg-blue-500/10" },
  completed:  { label: "Tamamlandı",  color: "text-muted-foreground", bg: "bg-muted/40" },
  cancelled:  { label: "İptal",       color: "text-red-500",    bg: "bg-red-500/10" },
  no_show:    { label: "Gelmedi",     color: "text-orange-500", bg: "bg-orange-500/10" },
};

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <p className="text-[13px] font-medium">Yaklaşan Randevular</p>
        <Link
          to="/appointments"
          className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          Tümünü gör <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {appointments.length === 0 ? (
          <div className="px-5 py-6 text-center text-[13px] text-muted-foreground">
            Yaklaşan randevu bulunmuyor.
          </div>
        ) : (
          appointments.map((apt) => {
            const cfg = STATUS_CONFIG[apt.status || "pending"] || STATUS_CONFIG.pending;
            return (
              <div
                key={apt.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-medium">
                    {apt.customer?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2) || "M"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">
                    {apt.customer?.full_name || "Bilinmeyen Müşteri"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {apt.service?.name || "Bilinmeyen Hizmet"} · {apt.staff?.full_name || "Fark etmez"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-medium">{formatTime(apt.starts_at)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatCurrency(Number(apt.price || 0))}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} shrink-0`}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
