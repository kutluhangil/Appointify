import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays, Users, TrendingUp, Clock, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/hooks/useAppointments";
import { useCustomers } from "@/hooks/useCustomers";
import { useStaff } from "@/hooks/useStaff";
import { useServices } from "@/hooks/useServices";
import { useStats } from "@/hooks/useStats";
import { useTranslation } from "react-i18next";

import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatusBreakdown } from "@/components/dashboard/StatusBreakdown";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";

export default function Dashboard() {
  const { profile } = useAuth();
  const { t } = useTranslation();
  const { appointments, isLoading: loadingAppts } = useAppointments();
  const { customers, isLoading: loadingCusts } = useCustomers();
  const { staff, isLoading: loadingStaff } = useStaff();
  const { services, isLoading: loadingServices } = useServices();
  const { stats: dashboardStats, isLoading: loadingStats } = useStats();

  const isLoading = loadingAppts || loadingCusts || loadingStaff || loadingServices || loadingStats;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayAppointments = useMemo(
    () => appointments.filter((a) => {
      const d = new Date(a.starts_at);
      return d >= today && d < tomorrow;
    }),
    [appointments]
  );

  const upcomingAppointments = useMemo(
    () => appointments
      .filter((a) => new Date(a.starts_at) >= new Date())
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .slice(0, 5),
    [appointments]
  );

  const statsList = [
    {
      label: t("dashboard.today_appointments"),
      value: dashboardStats.todayAppointments,
      sub: `${todayAppointments.filter(a => a.status === "confirmed").length} ${t("dashboard.confirmed")}`,
      icon: CalendarDays,
      color: "text-blue-500",
    },
    {
      label: t("dashboard.week_revenue"),
      value: formatCurrency(dashboardStats.weekRevenue),
      sub: `ort. ${formatCurrency(dashboardStats.avgBookingValue)}/${t("dashboard.appointments_count")}`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: t("dashboard.total_customers"),
      value: dashboardStats.totalCustomers,
      sub: t("dashboard.registered_customer"),
      icon: Users,
      color: "text-purple-500",
    },
    {
      label: t("dashboard.avg_booking_value"),
      value: formatCurrency(dashboardStats.avgBookingValue),
      sub: t("dashboard.this_week"),
      icon: Clock,
      color: "text-orange-500",
    },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <div>
            <span className="text-[13px] font-medium">
              {profile?.full_name ? t("dashboard.welcome", { name: profile.full_name.split(" ")[0] }) : t("nav.dashboard")}
            </span>
          </div>
          <Button asChild size="sm" className="h-7 text-[12px] gap-1.5">
            <Link to="/appointments?new=1">
              <Plus className="h-3.5 w-3.5" /> {t("dashboard.new_appointment")}
            </Link>
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">

            {/* Stats Grid */}
            <StatsGrid stats={statsList} />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-3">
                <RevenueChart data={dashboardStats.weekRevenueSeries} totalRevenue={dashboardStats.weekRevenue} />
              </div>

              {/* Status Breakdown */}
              <div className="lg:col-span-2">
                <StatusBreakdown appointments={appointments} />
              </div>
            </div>

            {/* Upcoming Appointments */}
            <UpcomingAppointments appointments={upcomingAppointments} />

            {/* Quick stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border rounded-xl bg-card p-5">
                <p className="text-[13px] font-medium mb-3">{t("dashboard.service_distribution")}</p>
                <div className="space-y-2.5">
                  {services.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">{t("dashboard.no_services")}</p>
                  ) : (
                    services.slice(0, 4).map((svc) => {
                      const count = appointments.filter(a => a.service_id === svc.id).length;
                      return (
                        <div key={svc.id} className="flex items-center justify-between">
                          <span className="text-[12px] text-muted-foreground truncate">{svc.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-medium">{count}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="border border-border rounded-xl bg-card p-5">
                <p className="text-[13px] font-medium mb-3">{t("dashboard.staff_performance")}</p>
                <div className="space-y-2.5">
                  {staff.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">{t("dashboard.no_staff")}</p>
                  ) : (
                    staff.slice(0, 4).map((s) => {
                      const count = appointments.filter(a => a.staff_id === s.id).length;
                      return (
                        <div key={s.id} className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-medium text-background" style={{ background: s.color || "#6366f1" }}>
                            {s.full_name[0]}
                          </div>
                          <span className="text-[12px] truncate flex-1">{s.full_name}</span>
                          <span className="text-[11px] text-muted-foreground">{count} {t("dashboard.appointments_count")}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="border border-border rounded-xl bg-card p-5">
                <p className="text-[13px] font-medium mb-3">{t("dashboard.vip_customers")}</p>
                <div className="space-y-2.5">
                  {customers.length === 0 ? (
                    <p className="text-[12px] text-muted-foreground">{t("dashboard.no_customers")}</p>
                  ) : (
                    customers
                      .map(c => {
                        const count = appointments.filter(a => a.customer_id === c.id && a.status === "completed").length;
                        return { ...c, visits: count };
                      })
                      .sort((a, b) => b.visits - a.visits)
                      .slice(0, 4)
                      .map((c) => (
                        <div key={c.id} className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-muted shrink-0 flex items-center justify-center text-[10px] font-medium">
                            {c.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="text-[12px] truncate flex-1">{c.full_name}</span>
                          <span className="text-[11px] text-muted-foreground">{c.visits} {t("dashboard.visits")}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
