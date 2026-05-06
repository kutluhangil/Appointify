import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  Plus, CalendarDays, Users, TrendingUp, Clock,
  CheckCircle2, XCircle, AlertCircle, ArrowRight,
} from "lucide-react";
import {
  sampleAppointments, sampleCustomers, sampleStaff, sampleServices, sampleStats,
  type SampleAppointmentStatus,
} from "@/lib/sample-data";
import { formatCurrency, formatTime } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_CONFIG: Record<SampleAppointmentStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: "Bekliyor",    color: "text-yellow-500", bg: "bg-yellow-500/10" },
  confirmed:  { label: "Onaylı",      color: "text-green-500",  bg: "bg-green-500/10" },
  in_progress:{ label: "Devam Ediyor", color: "text-blue-500",   bg: "bg-blue-500/10" },
  completed:  { label: "Tamamlandı",  color: "text-muted-foreground", bg: "bg-muted/40" },
  cancelled:  { label: "İptal",       color: "text-red-500",    bg: "bg-red-500/10" },
  no_show:    { label: "Gelmedi",     color: "text-orange-500", bg: "bg-orange-500/10" },
};

const revenueChartConfig: ChartConfig = {
  revenue: { label: "Gelir (₺)", color: "hsl(var(--foreground))" },
};

export default function Dashboard() {
  const { profile } = useAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayAppointments = useMemo(
    () => sampleAppointments.filter((a) => {
      const d = new Date(a.start_time);
      return d >= today && d < tomorrow;
    }),
    []
  );

  const upcomingAppointments = useMemo(
    () => sampleAppointments
      .filter((a) => new Date(a.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 5),
    []
  );

  const stats = [
    {
      label: "Bugünkü Randevular",
      value: sampleStats.todayAppointments,
      sub: `${todayAppointments.filter(a => a.status === "confirmed").length} onaylı`,
      icon: CalendarDays,
      color: "text-blue-500",
    },
    {
      label: "Haftalık Gelir",
      value: formatCurrency(sampleStats.weekRevenue),
      sub: `ort. ${formatCurrency(sampleStats.avgBookingValue)}/randevu`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Toplam Müşteri",
      value: sampleStats.totalCustomers,
      sub: "kayıtlı müşteri",
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: "Ort. Randevu Değeri",
      value: formatCurrency(sampleStats.avgBookingValue),
      sub: "bu hafta",
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <div>
            <span className="text-[13px] font-medium">
              {profile?.full_name ? `Merhaba, ${profile.full_name.split(" ")[0]}` : "Dashboard"}
            </span>
          </div>
          <Button asChild size="sm" className="h-7 text-[12px] gap-1.5">
            <Link to="/appointments">
              <Plus className="h-3.5 w-3.5" /> Yeni Randevu
            </Link>
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {stats.map((s, i) => (
                <div key={i} className="bg-card p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">{s.label}</span>
                    <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center`}>
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Revenue chart */}
              <div className="lg:col-span-3 border border-border rounded-xl bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[13px] font-medium">Haftalık Gelir</p>
                    <p className="text-[11px] text-muted-foreground">Son 7 gün</p>
                  </div>
                  <span className="text-[20px] font-semibold">{formatCurrency(sampleStats.weekRevenue)}</span>
                </div>
                <ChartContainer config={revenueChartConfig} className="h-[180px] w-full">
                  <BarChart data={sampleStats.weekRevenueSeries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" name="revenue" fill="hsl(var(--foreground))" radius={[3,3,0,0]} />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Status breakdown */}
              <div className="lg:col-span-2 border border-border rounded-xl bg-card p-5">
                <p className="text-[13px] font-medium mb-4">Randevu Durumları</p>
                <div className="space-y-3">
                  {(["confirmed","pending","completed","cancelled","no_show"] as SampleAppointmentStatus[]).map((status) => {
                    const count = sampleAppointments.filter(a => a.status === status).length;
                    const total = sampleAppointments.length;
                    const pct = Math.round((count / total) * 100);
                    const cfg = STATUS_CONFIG[status];
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[12px] font-medium ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-[12px] text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cfg.color.replace("text-", "bg-")}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming appointments */}
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <p className="text-[13px] font-medium">Yaklaşan Randevular</p>
                <Link to="/appointments" className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  Tümünü gör <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {upcomingAppointments.map((apt) => {
                  const customer = sampleCustomers.find(c => c.id === apt.customer_id);
                  const service = sampleServices.find(s => s.id === apt.service_id);
                  const staff = sampleStaff.find(s => s.id === apt.staff_id);
                  const cfg = STATUS_CONFIG[apt.status];
                  return (
                    <div key={apt.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-medium">
                          {customer?.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{customer?.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">{service?.name_tr} · {staff?.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] font-medium">{formatTime(apt.start_time)}</p>
                        <p className="text-[11px] text-muted-foreground">{formatCurrency(apt.price)}</p>
                      </div>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} shrink-0`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border rounded-xl bg-card p-5">
                <p className="text-[13px] font-medium mb-3">Hizmet Dağılımı</p>
                <div className="space-y-2.5">
                  {sampleServices.slice(0,4).map((svc) => {
                    const count = sampleAppointments.filter(a => a.service_id === svc.id).length;
                    return (
                      <div key={svc.id} className="flex items-center justify-between">
                        <span className="text-[12px] text-muted-foreground truncate">{svc.name_tr}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-medium">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-border rounded-xl bg-card p-5">
                <p className="text-[13px] font-medium mb-3">Personel Performansı</p>
                <div className="space-y-2.5">
                  {sampleStaff.map((s) => {
                    const count = sampleAppointments.filter(a => a.staff_id === s.id).length;
                    const revenue = sampleAppointments.filter(a => a.staff_id === s.id && a.status === "completed").reduce((sum, a) => sum + a.price, 0);
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-medium text-background" style={{ background: s.color }}>
                          {s.name[0]}
                        </div>
                        <span className="text-[12px] truncate flex-1">{s.name}</span>
                        <span className="text-[11px] text-muted-foreground">{count} randevu</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-border rounded-xl bg-card p-5">
                <p className="text-[13px] font-medium mb-3">VIP Müşteriler</p>
                <div className="space-y-2.5">
                  {sampleCustomers.filter(c => c.tags.includes("VIP") || c.total_visits >= 6).slice(0,4).map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-muted shrink-0 flex items-center justify-center text-[10px] font-medium">
                        {c.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <span className="text-[12px] truncate flex-1">{c.full_name}</span>
                      <span className="text-[11px] text-muted-foreground">{c.total_visits} ziyaret</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
