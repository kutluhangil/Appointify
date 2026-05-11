import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import {
  sampleAppointments, sampleCustomers, sampleStaff, sampleServices,
  type SampleAppointmentStatus,
} from "@/lib/sample-data";
import { formatCurrency, formatTime } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, subDays, startOfWeek } from "date-fns";
import { tr } from "date-fns/locale";

const STATUS_CONFIG: Record<SampleAppointmentStatus, { label: string; color: string; dot: string }> = {
  pending:     { label: "Bekliyor",     color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",  dot: "bg-yellow-500" },
  confirmed:   { label: "Onaylı",       color: "bg-green-500/10 text-green-600 dark:text-green-400",     dot: "bg-green-500" },
  in_progress: { label: "Devam Ediyor", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",        dot: "bg-blue-500" },
  completed:   { label: "Tamamlandı",   color: "bg-muted/60 text-muted-foreground",                       dot: "bg-muted-foreground" },
  cancelled:   { label: "İptal",        color: "bg-red-500/10 text-red-600 dark:text-red-400",           dot: "bg-red-500" },
  no_show:     { label: "Gelmedi",      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",  dot: "bg-orange-500" },
};

type ViewMode = "list" | "calendar";

const EMPTY_ADD_FORM = { customer_id: "", service_id: "", staff_id: "", date: "", time: "" };

export default function Appointments() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedApt, setSelectedApt] = useState<typeof sampleAppointments[0] | null>(null);
  const [appointments, setAppointments] = useState(sampleAppointments);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);

  const handleAddAppointment = () => {
    if (!addForm.customer_id || !addForm.service_id || !addForm.date || !addForm.time) return;
    const service = sampleServices.find(s => s.id === addForm.service_id);
    const startDt = new Date(`${addForm.date}T${addForm.time}`);
    const endDt = new Date(startDt);
    endDt.setMinutes(endDt.getMinutes() + (service?.duration ?? 30));
    setAppointments(prev => [...prev, {
      id: `a${Date.now()}`,
      customer_id: addForm.customer_id,
      service_id: addForm.service_id,
      staff_id: addForm.staff_id || sampleStaff[0].id,
      status: "pending" as const,
      start_time: startDt.toISOString(),
      end_time: endDt.toISOString(),
      price: service?.price ?? 0,
      currency: service?.currency ?? "TRY",
    }]);
    setAddForm(EMPTY_ADD_FORM);
    setIsAddOpen(false);
    toast({ title: "Randevu eklendi" });
  };

  const filtered = useMemo(() => {
    return appointments.filter((apt) => {
      const customer = sampleCustomers.find(c => c.id === apt.customer_id);
      const service = sampleServices.find(s => s.id === apt.service_id);
      const matchSearch = !search ||
        customer?.full_name.toLowerCase().includes(search.toLowerCase()) ||
        service?.name_tr.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || apt.status === statusFilter;
      const matchStaff = staffFilter === "all" || apt.staff_id === staffFilter;
      return matchSearch && matchStatus && matchStaff;
    }).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [search, statusFilter, staffFilter, appointments]);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const aptsByDay = useMemo(() => {
    const map: Record<string, typeof appointments> = {};
    appointments.forEach(apt => {
      const key = format(new Date(apt.start_time), "yyyy-MM-dd");
      if (!map[key]) map[key] = [];
      map[key].push(apt);
    });
    return map;
  }, [appointments]);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">Randevular</h1>
          <Button size="sm" className="h-7 text-[12px] gap-1.5" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Randevu Ekle
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-4 max-w-[1400px]">

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Müşteri veya hizmet ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-[13px] bg-transparent"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-[13px] w-36">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={staffFilter} onValueChange={setStaffFilter}>
                <SelectTrigger className="h-8 text-[13px] w-36">
                  <SelectValue placeholder="Personel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Personel</SelectItem>
                  {sampleStaff.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="ml-auto flex items-center border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setView("list")}
                  className={`px-3 py-1.5 text-[12px] transition-colors ${view === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Liste
                </button>
                <button
                  onClick={() => setView("calendar")}
                  className={`px-3 py-1.5 text-[12px] transition-colors ${view === "calendar" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Takvim
                </button>
              </div>
            </div>

            {/* Calendar view */}
            {view === "calendar" && (
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <button onClick={() => setSelectedDate(d => subDays(d, 7))} className="p-1 hover:bg-muted rounded-md transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-[13px] font-medium">
                    {format(weekStart, "d MMMM", { locale: tr })} – {format(addDays(weekStart, 6), "d MMMM yyyy", { locale: tr })}
                  </span>
                  <button onClick={() => setSelectedDate(d => addDays(d, 7))} className="p-1 hover:bg-muted rounded-md transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-7 divide-x divide-border">
                  {weekDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const dayApts = aptsByDay[key] || [];
                    const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                    return (
                      <div key={key} className="min-h-[140px] p-2">
                        <div className={`text-center mb-2 ${isToday ? "text-foreground font-semibold" : ""}`}>
                          <p className="text-[11px] text-muted-foreground uppercase">{format(day, "EEE", { locale: tr })}</p>
                          <p className={`text-[15px] mt-0.5 ${isToday ? "h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center mx-auto" : ""}`}>
                            {format(day, "d")}
                          </p>
                        </div>
                        <div className="space-y-1">
                          {dayApts.slice(0, 3).map((apt) => {
                            const customer = sampleCustomers.find(c => c.id === apt.customer_id);
                            const cfg = STATUS_CONFIG[apt.status];
                            return (
                              <button
                                key={apt.id}
                                onClick={() => setSelectedApt(apt)}
                                className="w-full text-left p-1.5 rounded-md bg-muted/40 hover:bg-muted transition-colors"
                              >
                                <div className="flex items-center gap-1">
                                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                                  <span className="text-[10px] truncate">{customer?.full_name.split(" ")[0]}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{formatTime(apt.start_time)}</p>
                              </button>
                            );
                          })}
                          {dayApts.length > 3 && (
                            <p className="text-[10px] text-muted-foreground text-center">+{dayApts.length - 3} daha</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List view */}
            {view === "list" && (
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Müşteri</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Hizmet</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Personel</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Tarih & Saat</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Tutar</th>
                      <th className="text-left font-medium text-muted-foreground px-4 py-2.5 text-[12px]">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-muted-foreground text-[13px]">
                          Randevu bulunamadı
                        </td>
                      </tr>
                    ) : (
                      filtered.map((apt) => {
                        const customer = sampleCustomers.find(c => c.id === apt.customer_id);
                        const service = sampleServices.find(s => s.id === apt.service_id);
                        const staff = sampleStaff.find(s => s.id === apt.staff_id);
                        const cfg = STATUS_CONFIG[apt.status];
                        return (
                          <tr
                            key={apt.id}
                            className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                            onClick={() => setSelectedApt(apt)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium shrink-0">
                                  {customer?.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                                </div>
                                <span className="font-medium">{customer?.full_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{service?.name_tr}</td>
                            <td className="px-4 py-3 text-muted-foreground">{staff?.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              <div>
                                <p className="text-[12px] font-medium text-foreground">{formatTime(apt.start_time)}</p>
                                <p className="text-[11px]">{format(new Date(apt.start_time), "d MMM yyyy", { locale: tr })}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{formatCurrency(apt.price)}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add appointment dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Yeni Randevu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Müşteri *</Label>
              <Select value={addForm.customer_id} onValueChange={v => setAddForm(f => ({ ...f, customer_id: v }))}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Müşteri seçin" /></SelectTrigger>
                <SelectContent>
                  {sampleCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Hizmet *</Label>
              <Select value={addForm.service_id} onValueChange={v => setAddForm(f => ({ ...f, service_id: v }))}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Hizmet seçin" /></SelectTrigger>
                <SelectContent>
                  {sampleServices.map(s => <SelectItem key={s.id} value={s.id}>{s.name_tr}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Personel</Label>
              <Select value={addForm.staff_id} onValueChange={v => setAddForm(f => ({ ...f, staff_id: v }))}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Fark etmez" /></SelectTrigger>
                <SelectContent>
                  {sampleStaff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Tarih *</Label>
                <Input
                  type="date"
                  value={addForm.date}
                  onChange={e => setAddForm(f => ({ ...f, date: e.target.value }))}
                  className="h-9 text-[13px]"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Saat *</Label>
                <Input
                  type="time"
                  value={addForm.time}
                  onChange={e => setAddForm(f => ({ ...f, time: e.target.value }))}
                  className="h-9 text-[13px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>İptal</Button>
            <Button
              size="sm"
              onClick={handleAddAppointment}
              disabled={!addForm.customer_id || !addForm.service_id || !addForm.date || !addForm.time}
            >
              Randevu Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment detail dialog */}
      <Dialog open={!!selectedApt} onOpenChange={() => setSelectedApt(null)}>
        <DialogContent className="max-w-md">
          {selectedApt && (() => {
            const customer = sampleCustomers.find(c => c.id === selectedApt.customer_id);
            const service = sampleServices.find(s => s.id === selectedApt.service_id);
            const staff = sampleStaff.find(s => s.id === selectedApt.staff_id);
            const cfg = STATUS_CONFIG[selectedApt.status];
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span>Randevu Detayı</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ml-auto ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-[13px] font-medium shrink-0">
                      {customer?.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                    </div>
                    <div>
                      <p className="font-medium text-[14px]">{customer?.full_name}</p>
                      <p className="text-[12px] text-muted-foreground">{customer?.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[13px]">
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Hizmet</p>
                      <p className="font-medium">{service?.name_tr}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Personel</p>
                      <p className="font-medium">{staff?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tarih</p>
                      <p className="font-medium">{format(new Date(selectedApt.start_time), "d MMMM yyyy", { locale: tr })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Saat</p>
                      <p className="font-medium">{formatTime(selectedApt.start_time)} – {formatTime(selectedApt.end_time)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Süre</p>
                      <p className="font-medium">{service?.duration} dk</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tutar</p>
                      <p className="font-medium">{formatCurrency(selectedApt.price)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 text-[12px]">
                      <XCircle className="h-3.5 w-3.5 mr-1" /> İptal Et
                    </Button>
                    <Button size="sm" className="flex-1 text-[12px]">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Tamamla
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
