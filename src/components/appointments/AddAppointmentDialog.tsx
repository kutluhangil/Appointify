import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Customer = Tables<"customers">;
type Service = Tables<"services">;
type Staff = Tables<"staff">;

interface AddAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  services: Service[];
  staff: Staff[];
  onSubmit: (form: { customer_id: string; service_id: string; staff_id: string; date: string; time: string }) => Promise<void>;
  isSubmitting: boolean;
}

const EMPTY_FORM = { customer_id: "", service_id: "", staff_id: "", date: "", time: "" };

export function AddAppointmentDialog({
  open,
  onOpenChange,
  customers,
  services,
  staff,
  onSubmit,
  isSubmitting,
}: AddAppointmentDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);

  const handleSave = async () => {
    if (!form.customer_id || !form.service_id || !form.date || !form.time) return;
    await onSubmit(form);
    setForm(EMPTY_FORM);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("appointments.new_appointment_title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("appointments.customer")} *</Label>
            <Select value={form.customer_id} onValueChange={v => setForm(f => ({ ...f, customer_id: v }))}>
              <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder={t("appointments.select_customer")} /></SelectTrigger>
              <SelectContent>
                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("appointments.service")} *</Label>
            <Select value={form.service_id} onValueChange={v => setForm(f => ({ ...f, service_id: v }))}>
              <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder={t("appointments.select_service")} /></SelectTrigger>
              <SelectContent>
                {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("appointments.staff_member")}</Label>
            <Select value={form.staff_id} onValueChange={v => setForm(f => ({ ...f, staff_id: v }))}>
              <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder={t("appointments.select_staff")} /></SelectTrigger>
              <SelectContent>
                {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px]">{t("appointments.date")}</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="h-9 text-[13px]"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px]">{t("appointments.time")}</Label>
              <Input
                type="time"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="h-9 text-[13px]"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t("appointments.cancel")}</Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || !form.customer_id || !form.service_id || !form.date || !form.time}
          >
            {isSubmitting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            {t("appointments.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
