import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Star, TrendingUp, CalendarDays } from "lucide-react";
import { sampleStaff, sampleAppointments, sampleServices } from "@/lib/sample-data";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

const WORKING_HOURS = [
  { day: "Pazartesi", open: true, start: "09:00", end: "18:00" },
  { day: "Salı",      open: true, start: "09:00", end: "18:00" },
  { day: "Çarşamba",  open: true, start: "09:00", end: "18:00" },
  { day: "Perşembe",  open: true, start: "09:00", end: "18:00" },
  { day: "Cuma",      open: true, start: "09:00", end: "18:00" },
  { day: "Cumartesi", open: true, start: "10:00", end: "17:00" },
  { day: "Pazar",     open: false, start: "—",     end: "—" },
];

const STAFF_COLORS = ["#a78bfa", "#34d399", "#f472b6", "#60a5fa", "#fbbf24", "#fb923c"];

export default function Staff() {
  const { toast } = useToast();
  const [selected, setSelected] = useState<typeof sampleStaff[0] | null>(null);
  const [staffList, setStaffList] = useState(sampleStaff);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", specialties: "" });

  const handleAddStaff = () => {
    if (!addForm.name) return;
    const newStaff = {
      id: `s${Date.now()}`,
      name: addForm.name,
      avatar_url: "",
      specialties: addForm.specialties.split(",").map(s => s.trim()).filter(Boolean),
      color: STAFF_COLORS[staffList.length % STAFF_COLORS.length],
    };
    setStaffList(prev => [...prev, newStaff]);
    setAddForm({ name: "", specialties: "" });
    setIsAddOpen(false);
    toast({ title: "Personel eklendi", description: `${addForm.name} başarıyla eklendi.` });
  };

  const staffWithStats = staffList.map(s => {
    const apts = sampleAppointments.filter(a => a.staff_id === s.id);
    const completed = apts.filter(a => a.status === "completed");
    const revenue = completed.reduce((sum, a) => sum + a.price, 0);
    const topService = sampleServices.reduce((best, svc) => {
      const cnt = apts.filter(a => a.service_id === svc.id).length;
      return cnt > (best?.cnt ?? 0) ? { svc, cnt } : best;
    }, null as { svc: typeof sampleServices[0]; cnt: number } | null);
    return { ...s, totalApts: apts.length, completedApts: completed.length, revenue, topService };
  });

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">Personel</h1>
          <Button size="sm" className="h-7 text-[12px] gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Personel Ekle
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {[
                { label: "Toplam Personel", value: staffList.length },
                { label: "Aktif Personel", value: staffList.length },
                { label: "Toplam Randevu", value: sampleAppointments.length },
                { label: "Tamamlanan Gelir", value: formatCurrency(sampleAppointments.filter(a => a.status === "completed").reduce((s, a) => s + a.price, 0)) },
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
                  onClick={() => setSelected(s)}
                  className="text-left border border-border rounded-xl bg-card p-5 hover:border-foreground/20 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-[16px] font-semibold text-white shrink-0"
                      style={{ background: s.color }}
                    >
                      {s.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                    </div>
                    <div>
                      <p className="font-semibold text-[14px]">{s.name}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {s.specialties.slice(0,2).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-[15px] font-semibold">{s.totalApts}</p>
                      <p className="text-[10px] text-muted-foreground">Randevu</p>
                    </div>
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-[15px] font-semibold">{s.completedApts}</p>
                      <p className="text-[10px] text-muted-foreground">Tamamlandı</p>
                    </div>
                    <div className="border border-border rounded-lg p-2">
                      <p className="text-[13px] font-semibold">{formatCurrency(s.revenue)}</p>
                      <p className="text-[10px] text-muted-foreground">Gelir</p>
                    </div>
                  </div>

                  {s.topService && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3" />
                      <span>En çok: {s.topService.svc.name_tr} ({s.topService.cnt}x)</span>
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
                <span className="text-[13px] text-muted-foreground">Yeni personel ekle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add staff dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Yeni Personel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Ad Soyad *</Label>
              <Input
                value={addForm.name}
                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ayşe Kaya"
                className="h-9 text-[13px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Uzmanlık Alanları</Label>
              <Input
                value={addForm.specialties}
                onChange={e => setAddForm(f => ({ ...f, specialties: e.target.value }))}
                placeholder="Saç kesimi, Boyama (virgülle ayırın)"
                className="h-9 text-[13px]"
              />
              <p className="text-[11px] text-muted-foreground">Virgülle ayrılmış uzmanlık alanları</p>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>İptal</Button>
            <Button size="sm" onClick={handleAddStaff} disabled={!addForm.name}>
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Staff detail sheet */}
      <Sheet open={!!selected} onOpenChange={() => setSelected(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (() => {
            const s = staffWithStats.find(x => x.id === selected.id)!;
            return (
              <>
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-[16px] font-semibold text-white"
                        style={{ background: s.color }}
                      >
                        {s.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <p className="font-semibold text-[15px]">{s.name}</p>
                        <p className="text-[12px] text-muted-foreground font-normal">{s.specialties.join(", ")}</p>
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Toplam Randevu", value: s.totalApts, icon: CalendarDays },
                      { label: "Tamamlandı", value: s.completedApts, icon: TrendingUp },
                      { label: "Gelir", value: formatCurrency(s.revenue), icon: Star },
                    ].map((stat, i) => (
                      <div key={i} className="border border-border rounded-lg p-3 text-center">
                        <stat.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-[14px] font-semibold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Çalışma Saatleri</p>
                    <div className="space-y-1.5">
                      {WORKING_HOURS.map((wh) => (
                        <div key={wh.day} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                          <span className="text-[13px] font-medium w-24">{wh.day}</span>
                          {wh.open ? (
                            <span className="text-[12px] text-muted-foreground">{wh.start} – {wh.end}</span>
                          ) : (
                            <span className="text-[12px] text-red-500">Kapalı</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Uzmanlık Alanları</p>
                    <div className="flex flex-wrap gap-2">
                      {s.specialties.map(sp => (
                        <span key={sp} className="px-2.5 py-1 bg-muted rounded-full text-[12px] font-medium">{sp}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
