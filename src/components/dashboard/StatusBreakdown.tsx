import { AppointmentWithRelations } from "@/hooks/useAppointments";

interface StatusBreakdownProps {
  appointments: AppointmentWithRelations[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  confirmed:   { label: "Onaylı",      color: "text-green-500 bg-green-500" },
  pending:     { label: "Bekliyor",    color: "text-yellow-500 bg-yellow-500" },
  completed:   { label: "Tamamlandı",  color: "text-muted-foreground bg-muted-foreground" },
  cancelled:   { label: "İptal",       color: "text-red-500 bg-red-500" },
  no_show:     { label: "Gelmedi",     color: "text-orange-500 bg-orange-500" },
};

export function StatusBreakdown({ appointments }: StatusBreakdownProps) {
  return (
    <div className="border border-border rounded-xl bg-card p-5">
      <p className="text-[13px] font-medium mb-4">Randevu Durumları</p>
      <div className="space-y-3">
        {["confirmed", "pending", "completed", "cancelled", "no_show"].map((status) => {
          const count = appointments.filter((a) => a.status === status).length;
          const total = appointments.length || 1;
          const pct = Math.round((count / total) * 100);
          const cfg = STATUS_CONFIG[status] || { label: status, color: "text-muted-foreground bg-muted-foreground" };
          const colorClass = cfg.color.split(" ")[0];
          const bgClass = cfg.color.split(" ")[1];

          return (
            <div key={status}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[12px] font-medium ${colorClass}`}>{cfg.label}</span>
                <span className="text-[12px] text-muted-foreground">{count}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${bgClass}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
