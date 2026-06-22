import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: { full_name: string; phone: string; email: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function AddCustomerDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddCustomerDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ full_name: "", phone: "", email: "" });

  const handleSave = async () => {
    if (!form.full_name || !form.phone) return;
    await onSubmit(form);
    setForm({ full_name: "", phone: "", email: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("customers.new_customer_title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("customers.name_label")}</Label>
            <Input
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Ahmet Yılmaz"
              className="h-9 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("customers.phone_label")}</Label>
            <Input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+90 5xx xxx xx xx"
              className="h-9 text-[13px]"
              type="tel"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("customers.email_label")}</Label>
            <Input
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="ornek@mail.com"
              className="h-9 text-[13px]"
              type="email"
            />
          </div>
        </div>
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{t("appointments.cancel", { defaultValue: "İptal" })}</Button>
          <Button size="sm" onClick={handleSave} disabled={isSubmitting || !form.full_name || !form.phone}>
            {isSubmitting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
            {t("customers.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
