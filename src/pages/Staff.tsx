import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Star, TrendingUp, CalendarDays, Loader2 } from "lucide-react";
import { useStaff } from "@/hooks/useStaff";
import { useAppointments } from "@/hooks/useAppointments";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type StaffMember = Tables<"staff">;

const WORKING_HOURS = [
  { dayKey: "common.day_monday",    defaultDay: "Pazartesi", open: true, start: "09:00", end: "18:00" },
  { dayKey: "common.day_tuesday",   defaultDay: "Salı",      open: true, start: "09:00", end: "18:00" },
  { dayKey: "common.day_wednesday", defaultDay: "Çarşamba",  open: true, start: "09:00", end: "18:00" },
  { dayKey: "common.day_thursday",  defaultDay: "Perşembe",  open: true, start: "09:00", end: "18:00" },
  { dayKey: "common.day_friday",    defaultDay: "Cuma",      open: true, start: "09:00", end: "18:00" },
  { dayKey: "common.day_saturday",  defaultDay: "Cumartesi", open: true, start: "10:00", end: "17:00" },
  { dayKey: "common.day_sunday",    defaultDay: "Pazar",     open: false, start: "—",     end: "—" },
];

const STAFF_COLORS = ["#a78bfa", "#34d399", "#f472b6", "#60a5fa", "#fbbf24", "#fb923c"];

export default function Staff() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { staff, isLoading: loadingStaff, createStaff } = useStaff();
  const { appointments, isLoading: loadingAppts } = useAppointments();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", title: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = useMemo(() => {
    return staff.find(s => s.id === selectedId) || null;
  }, [selectedId, staff]);

  const handleAddStaff = async () => {
    if (!addForm.name) return;
    setIsSubmitting(true);
    try {
      const color = STAFF_COLORS[staff.length % STAFF_COLORS.length];
      await createStaff({
        full_name: addForm.name,
        title: addForm.title || null,
        color,
        is_active: true,
      });
      setAddForm({ name: "", title: "" });
      setIsAddOpen(false);
      toast({
        title: t("staff.add_success"),
        description: t("staff.add_success_desc", { name: addForm.name, defaultValue: `${addForm.name} başarıyla eklendi.` })
      });
    } catch (err: any) {
      toast({
        title: t("common.error_adding", { defaultValue: "Personel eklenemedi" }),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const staffWithStats = useMemo(() => {
    return staff.map(s => {
      const apts = appointments.filter(a => a.staff_id === s.id);
      const completed = apts.filter(a => a.status === "completed");
      const revenue = completed.reduce((sum, a) => sum + Number(a.price || 0), 0);

      // Find top service by appointment count
      const serviceCounts: Record<string, { name: string; count: number }> = {};
      apts.forEach(apt => {
        if (!apt.service_id || !apt.service) return;
        if (!serviceCounts[apt.service_id]) {
          serviceCounts[apt.service_id] = { name: apt.service.name, count: 0 };
        }
        serviceCounts[apt.service_id].count += 1;
      });

      const topService = Object.values(serviceCounts).reduce(
        (best, curr) => (curr.count > (best?.count ?? 0) ? curr : best),
        null as { name: string; count: number } | null
      );

      return {
        ...s,
        totalApts: apts.length,
        completedApts: completed.length,
        revenue,
        topService,
      };
    });
  }, [staff, appointments]);

  const selectedStaffStats = useMemo(() => {
    if (!selectedId) return null;
    return staffWithStats.find(x => x.id === selectedId) || null;
  }, [selectedId, staffWithStats]);

  const totalCompletedApts = useMemo(() => {
    return appointments.filter(a => a.status === "completed").length;
  }, [appointments]);

  const totalRevenue = useMemo(() => {
    return appointments
      .filter(a => a.status === "completed")
      .reduce((sum, a) => sum + Number(a.price || 0), 0);
  }, [appointments]);

  const isLoading = loadingStaff || loadingAppts;

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
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">{t("staff.title")}</h1>
          <Button size="sm" className="h-7 text-[12px] gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> {t("staff.add")}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {[
                { label: t("staff.total"), value: staff.length },
                { label: t("staff.active"), value: staff.filter(s => s.is_active).length },
                { label: t("staff.appointments"), value: appointments.length },
                { label: t("staff.revenue"), value: formatCurrency(totalRevenue) },
              ].map((s, i) => (
                <div key={i} className="bg-card p-4">
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-[20px] font-semibold mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Staff cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {staffWithStats.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className="text-left border border-border rounded-xl bg-card p-5 hover:border-foreground/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-[16px] font-semibold text-white shrink-0"
                      style={{ background: s.color || "#6366f1" }}
                    >
                      {s.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                    </div>
                    <div>
                      <p className="font-semibold text-[14px]">{s.full_name}</p>
                      {s.title && (
                        <p className="text-[12px] text-muted-foreground">
                          {s.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-[15px] font-semibold">{s.totalApts}</p>
                      <p className="text-[10px] text-muted-foreground">{t("dashboard.appointments_count")}</p>
                    </div>
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-[15px] font-semibold">{s.completedApts}</p>
                      <p className="text-[10px] text-muted-foreground">{t("staff.completed")}</p>
                    </div>
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-[13px] font-semibold">{formatCurrency(s.revenue)}</p>
                      <p className="text-[10px] text-muted-foreground">{t("staff.revenue_label")}</p>
                    </div>
                  </div>

                  {s.topService && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{t("staff.top_service")}: {s.topService.name} ({s.topService.count}x)</span>
                    </div>
                  )}
                </button>
              ))}

              {/* Add card */}
              <button
                onClick={() => setIsAddOpen(true)}
                className="border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-foreground/30 hover:bg-muted/20 transition-colors min-h-[180px]"
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-[13px] text-muted-foreground">{t("staff.add_placeholder")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add staff dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("staff.new_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">{t("staff.name_label")}</Label>
              <Input
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ayşe Kaya"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">{t("staff.title_label")}</Label>
              <Input
                value={addForm.title}
                onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Saç Kesim & Sakal Uzmanı"
                className="h-9 text-[13px]"
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>{t("staff.cancel")}</Button>
            <Button size="sm" onClick={handleAddStaff} disabled={isSubmitting || !addForm.name}>
              {isSubmitting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              {t("staff.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelectedId(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && selectedStaffStats && (
            <>
              <SheetHeader>
                <SheetTitle>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-[16px] font-semibold text-white"
                      style={{ background: selected.color || "#6366f1" }}
                    >
                      {selected.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                    </div>
                    <div>
                      <p className="font-semibold text-[15px]">{selected.full_name}</p>
                      {selected.title && (
                        <p className="text-[12px] text-muted-foreground font-normal">{selected.title}</p>
                      )}
                    </div>
                  </div>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t("staff.appointments"), value: selectedStaffStats.totalApts, icon: CalendarDays },
                    { label: t("staff.completed"), value: selectedStaffStats.completedApts, icon: TrendingUp },
                    { label: t("staff.revenue_label"), value: formatCurrency(selectedStaffStats.revenue), icon: Star },
                  ].map((stat, i) => (
                    <div key={i} className="border border-border rounded-lg p-3 text-center">
                      <stat.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-[14px] font-semibold">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">{t("staff.working_hours")}</p>
                  <div className="space-y-1.5">
                    {WORKING_HOURS.map((wh) => (
                      <div key={wh.dayKey} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                        <span className="text-[13px] font-medium w-24">{t(wh.dayKey, { defaultValue: wh.defaultDay })}</span>
                        {wh.open ? (
                          <span className="text-[12px] text-muted-foreground">{wh.start} – {wh.end}</span>
                        ) : (
                          <span className="text-[12px] text-red-500">{t("staff.closed")}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selected.title && (
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">{t("common.specialties", { defaultValue: "Uzmanlık Alanları" })}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 bg-muted rounded-full text-[12px] font-medium">{selected.title}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
