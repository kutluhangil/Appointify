import { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  sub: string;
  icon: LucideIcon;
  color: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
      {stats.map((s, i) => (
        <div key={i} className="bg-card p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-muted-foreground">{s.label}</span>
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
          </div>
          <div>
            <p className="text-[22px] font-semibold leading-none">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
