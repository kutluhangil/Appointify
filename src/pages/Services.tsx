import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Clock, Edit2, Trash2 } from "lucide-react";
import { sampleServices, sampleAppointments } from "@/lib/sample-data";
import { formatCurrency, formatDuration } from "@/lib/format";

export default function Services() {
  const [services, setServices] = useState(sampleServices);
  const [isAdding, setIsAdding] = useState(false);
  const [editTarget, setEditTarget] = useState<typeof sampleServices[0] | null>(null);

  const [form, setForm] = useState({ name_tr: "", name_en: "", duration: 30, price: 0 });

  const openAdd = () => {
    setForm({ name_tr: "", name_en: "", duration: 30, price: 0 });
    setIsAdding(true);
  };

  const openEdit = (svc: typeof sampleServices[0]) => {
    setForm({ name_tr: svc.name_tr, name_en: svc.name_en, duration: svc.duration, price: svc.price });
    setEditTarget(svc);
  };

  const handleSave = () => {
    if (editTarget) {
      setServices(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...form } : s));
      setEditTarget(null);
    } else {
      setServices(prev => [...prev, {
        id: `sv${Date.now()}`,
        ...form,
        currency: "TRY",
        color: "#94a3b8",
      }]);
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const totalRevenue = sampleAppointments.filter(a => a.status === "completed").reduce((sum, a) => sum + a.price, 0);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 md:px-6 h-12 border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">Hizmetler</h1>
          <Button size="sm" className="h-7 text-[12px] gap-1.5" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" /> Hizmet Ekle
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {[
                { label: "Toplam Hizmet", value: services.length },
                { label: "Ort. Fiyat", value: formatCurrency(services.reduce((s, v) => s + v.price, 0) / services.length) },
                { label: "Ort. Süre", value: `${Math.round(services.reduce((s, v) => s + v.duration, 0) / services.length)} dk` },
                { label: "Tamamlanan Gelir", value: formatCurrency(totalRevenue) },
              ].map((s, i) => (
                <div key={i} className="bg-card p-4">
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-[20px] font-semibold mt-1">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Service grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => {
                const aptCount = sampleAppointments.filter(a => a.service_id === svc.id).length;
                return (
                  <div key={svc.id} className="border border-border rounded-xl bg-card p-5 group relative hover:border-foreground/20 transition-colors">
                    {/* Color indicator */}
                    <div className="h-1 w-12 rounded-full mb-4" style={{ background: svc.color }} />

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-[14px] font-semibold">{svc.name_tr}</h3>
                        <p className="text-[12px] text-muted-foreground">{svc.name_en}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(svc)}
                          className="p-1.5 hover:bg-muted rounded-md transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(svc.id)}
                          className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-[12px]">{formatDuration(svc.duration)}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[16px] font-semibold">{formatCurrency(svc.price, svc.currency)}</p>
                        <p className="text-[11px] text-muted-foreground">{aptCount} randevu</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add card */}
              <button
                onClick={openAdd}
                className="border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:border-foreground/30 hover:bg-muted/20 transition-colors min-h-[140px]"
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-[13px] text-muted-foreground">Yeni hizmet ekle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={isAdding || !!editTarget} onOpenChange={() => { setIsAdding(false); setEditTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Hizmet Düzenle" : "Yeni Hizmet"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">Hizmet Adı (TR)</Label>
              <Input
                value={form.name_tr}
                onChange={e => setForm(f => ({ ...f, name_tr: e.target.value }))}
                className="h-8 text-[13px]"
                placeholder="Saç Kesim"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">Hizmet Adı (EN)</Label>
              <Input
                value={form.name_en}
                onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
                className="h-8 text-[13px]"
                placeholder="Haircut"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Süre (dakika)</Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                  className="h-8 text-[13px]"
                  min={5}
                  step={5}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Fiyat (₺)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="h-8 text-[13px]"
                  min={0}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" size="sm" onClick={() => { setIsAdding(false); setEditTarget(null); }}>
              İptal
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!form.name_tr}>
              {editTarget ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
