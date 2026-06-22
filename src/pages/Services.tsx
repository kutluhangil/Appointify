import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Clock, Edit2, Trash2, Loader2 } from "lucide-react";
import { formatCurrency, formatDuration } from "@/lib/format";
import { useServices } from "@/hooks/useServices";
import { useAppointments } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Service = Tables<"services">;

export default function Services() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { services, isLoading: loadingServices, createService, updateService, deleteService } = useServices();
  const { appointments, isLoading: loadingAppts } = useAppointments();

  const [isAdding, setIsAdding] = useState(false);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({ name: "", description: "", duration_min: 30, price: 0 });

  const openAdd = () => {
    setForm({ name: "", description: "", duration_min: 30, price: 0 });
    setIsAdding(true);
  };

  const openEdit = (svc: Service) => {
    setForm({
      name: svc.name,
      description: svc.description || "",
      duration_min: svc.duration_min,
      price: Number(svc.price || 0),
    });
    setEditTarget(svc);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await updateService({
          id: editTarget.id,
          updates: {
            name: form.name,
            description: form.description || null,
            duration_min: form.duration_min,
            price: form.price,
          },
        });
        setEditTarget(null);
        toast({ title: t("services.update_success") });
      } else {
        await createService({
          name: form.name,
          description: form.description || null,
          duration_min: form.duration_min,
          price: form.price,
          currency: "TRY",
          color: "#6366f1",
          is_active: true,
        });
        setIsAdding(false);
        toast({ title: t("services.add_success") });
      }
    } catch (err: any) {
      toast({
        title: t("common.error", { defaultValue: "Hata" }),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("services.delete_confirm"))) return;
    try {
      await deleteService(id);
      toast({ title: t("services.delete_success") });
    } catch (err: any) {
      toast({
        title: t("common.error_deleting", { defaultValue: "Silme işlemi başarısız" }),
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const totalRevenue = appointments
    .filter(a => a.status === "completed")
    .reduce((sum, a) => sum + Number(a.price || 0), 0);

  const avgPrice = services.length > 0
    ? services.reduce((sum, s) => sum + Number(s.price || 0), 0) / services.length
    : 0;

  const avgDuration = services.length > 0
    ? services.reduce((sum, s) => sum + s.duration_min, 0) / services.length
    : 0;

  const isLoading = loadingServices || loadingAppts;

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
          <h1 className="text-[13px] font-medium">{t("services.title")}</h1>
          <Button size="sm" className="h-7 text-[12px] gap-1.5" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" /> {t("services.add")}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-[1400px]">

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
              {[
                { label: t("services.total"), value: services.length },
                { label: t("services.avg_price"), value: formatCurrency(avgPrice) },
                { label: t("services.avg_duration"), value: `${Math.round(avgDuration)} dk` },
                { label: t("services.total_revenue"), value: formatCurrency(totalRevenue) },
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
                const aptCount = appointments.filter(a => a.service_id === svc.id).length;
                return (
                  <div key={svc.id} className="border border-border rounded-xl bg-card p-5 group relative hover:border-foreground/20 transition-colors">
                    {/* Color indicator */}
                    <div className="h-1 w-12 rounded-full mb-4" style={{ background: svc.color || "#6366f1" }} />

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-[14px] font-semibold">{svc.name}</h3>
                        {svc.description && (
                          <p className="text-[12px] text-muted-foreground mt-0.5">{svc.description}</p>
                        )}
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
                        <span className="text-[12px]">{formatDuration(svc.duration_min)}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[16px] font-semibold">{formatCurrency(Number(svc.price || 0), svc.currency || "TRY")}</p>
                        <p className="text-[11px] text-muted-foreground">{aptCount} {t("services.appointments_count")}</p>
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
                <span className="text-[13px] text-muted-foreground">{t("services.add_placeholder")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={isAdding || !!editTarget} onOpenChange={() => { setIsAdding(false); setEditTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editTarget ? t("services.edit_title") : t("services.new_title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-[12px]">{t("services.name_tr", { defaultValue: "Hizmet Adı" })}</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="h-8 text-[13px]"
                placeholder="Örn: Saç Kesim"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">{t("common.description", { defaultValue: "Açıklama" })}</Label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="h-8 text-[13px]"
                placeholder="Örn: Yıkama ve fön dahil"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px]">{t("services.duration_label")}</Label>
                <Input
                  type="number"
                  value={form.duration_min}
                  onChange={e => setForm(f => ({ ...f, duration_min: Number(e.target.value) }))}
                  className="h-8 text-[13px]"
                  min={5}
                  step={5}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">{t("services.price_label")}</Label>
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
              {t("services.cancel")}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSubmitting || !form.name}>
              {isSubmitting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              {editTarget ? t("services.update") : t("services.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
