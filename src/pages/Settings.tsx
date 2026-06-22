import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Building2, Bell, Loader2, Camera, CalendarDays } from "lucide-react";
import { initials } from "@/lib/format";
import { useTenant } from "@/hooks/useTenant";
import { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next";

type Tenant = Tables<"tenants">;

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const { t } = useTranslation();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => { if (profile) setFullName(profile.full_name || ""); }, [profile]);

  const userInitials = initials(fullName || "U");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast({ title: t("common.invalid_file_type", { defaultValue: "Geçersiz dosya türü" }), variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t("common.file_too_large", { defaultValue: "Dosya çok büyük (max 5MB)" }), variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      const msg = upErr.message.includes("not found") || upErr.message.includes("Bucket")
        ? "Storage henüz yapılandırılmadı. MANUAL.md'deki 1. adımı tamamlayın."
        : upErr.message;
      toast({ title: t("common.upload_failed", { defaultValue: "Yükleme başarısız" }), description: msg, variant: "destructive" });
      setUploadingAvatar(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    await refreshProfile();
    toast({ title: t("settings.avatar_updated", { defaultValue: "Profil fotoğrafı güncellendi" }) });
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: t("common.error", { defaultValue: "Hata" }), description: error.message, variant: "destructive" });
    else { toast({ title: t("settings.profile_updated", { defaultValue: "Profil güncellendi" }) }); await refreshProfile(); }
  };

  const handleChangePw = async () => {
    if (newPassword.length < 6) { toast({ title: t("settings.password_length_err", { defaultValue: "Şifre en az 6 karakter olmalı" }), variant: "destructive" }); return; }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);
    if (error) toast({ title: t("common.error", { defaultValue: "Hata" }), description: error.message, variant: "destructive" });
    else { toast({ title: t("settings.password_updated", { defaultValue: "Şifre güncellendi" }) }); setNewPassword(""); }
  };

  return (
    <div className="divide-y divide-border">
      <div className="px-4 md:px-6 py-5">
        <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider mb-4">{t("settings.profile_info")}</p>
        <div className="flex items-center gap-3 mb-5">
          <div className="relative group">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url || ""} className="object-cover" />
              <AvatarFallback className="text-[13px]">{userInitials}</AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploadingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin text-white" /> : <Camera className="h-3.5 w-3.5 text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            </label>
          </div>
          <div>
            <p className="text-[14px] font-medium">{fullName || t("common.user", { defaultValue: "Kullanıcı" })}</p>
            <p className="text-[12px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="max-w-sm space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("settings.name")}</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-9 text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("settings.email")}</Label>
            <Input value={user?.email || ""} disabled className="h-9 text-[13px] opacity-60" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="h-8 text-[12px] mt-4">
          {saving && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />} {t("settings.save")}
        </Button>
      </div>

      <div className="px-4 md:px-6 py-5">
        <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider mb-4">{t("settings.password_change")}</p>
        <div className="max-w-xs space-y-1.5">
          <Label className="text-[12px]">{t("settings.new_password")}</Label>
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="h-9 text-[13px]" />
        </div>
        <Button onClick={handleChangePw} disabled={changingPw} variant="outline" size="sm" className="h-8 text-[12px] mt-4">
          {changingPw && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />} {t("settings.update_password")}
        </Button>
      </div>
    </div>
  );
}

// ─── Business Tab ────────────────────────────────────────────────────────────

interface TabProps {
  tenant: Tenant;
  onUpdate: (updates: Partial<Tenant>) => Promise<any>;
}

function BusinessTab({ tenant, onUpdate }: TabProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: tenant.name || "",
    slug: tenant.slug || "",
    industry: tenant.industry || "barber",
    phone: tenant.phone || "",
    email: tenant.email || "",
    address: tenant.address || "",
    timezone: tenant.timezone || "Europe/Istanbul",
    locale: tenant.locale || "tr",
    currency: tenant.currency || "TRY",
  });

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast({ title: t("settings.name_slug_required", { defaultValue: "Ad ve Slug zorunludur" }), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await onUpdate(form);
      toast({ title: t("settings.business_info_saved", { defaultValue: "İşletme bilgileri kaydedildi" }) });
      if (form.locale) {
        i18n.changeLanguage(form.locale);
      }
    } catch (err: any) {
      toast({ title: t("common.error", { defaultValue: "Hata" }), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-6 py-5 space-y-5">
      <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">{t("settings.business_info")}</p>
      <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.business_name")}</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.booking_url")}</Label>
          <div className="flex items-center border border-input rounded-md overflow-hidden">
            <span className="px-2.5 text-[12px] text-muted-foreground border-r border-input bg-muted h-9 flex items-center shrink-0">/book/</span>
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="h-9 text-[13px] border-0 rounded-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.industry")}</Label>
          <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[
                ["barber", t("common.ind_barber", { defaultValue: "Kuaför & Berber" })],
                ["beauty", t("common.ind_beauty", { defaultValue: "Güzellik Salonu" })],
                ["tattoo", t("common.ind_tattoo", { defaultValue: "Dövme Stüdyosu" })],
                ["dietitian", t("common.ind_dietitian", { defaultValue: "Diyetisyen" })],
                ["physio", t("common.ind_physio", { defaultValue: "Fizyoterapist" })],
                ["fitness", t("common.ind_fitness", { defaultValue: "Fitness & PT" })],
                ["spa", t("common.ind_spa", { defaultValue: "Spa & Masaj" })],
                ["other", t("common.ind_other", { defaultValue: "Diğer" })],
              ].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.phone")}</Label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.email")}</Label>
          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.address")}</Label>
          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.language")}</Label>
          <Select value={form.locale} onValueChange={v => setForm(f => ({ ...f, locale: v }))}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.currency")}</Label>
          <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TRY">₺ TRY</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="EUR">€ EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button size="sm" className="h-8 text-[12px]" onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
        {t("settings.save")}
      </Button>
    </div>
  );
}

// ─── Booking Tab ─────────────────────────────────────────────────────────────

function BookingTab({ tenant, onUpdate }: TabProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const existingSettings = (tenant.settings as any)?.booking || {};

  const [settings, setSettings] = useState({
    slot_duration: existingSettings.slot_duration || "30",
    buffer_between: existingSettings.buffer_between || "10",
    max_advance_days: existingSettings.max_advance_days || "60",
    min_advance_hours: existingSettings.min_advance_hours || "2",
    allow_cancellation: existingSettings.allow_cancellation !== false,
    cancellation_hours: existingSettings.cancellation_hours || "24",
    require_deposit: !!existingSettings.require_deposit,
    deposit_percentage: existingSettings.deposit_percentage || "25",
    auto_confirm: existingSettings.auto_confirm !== false,
    show_staff_selection: existingSettings.show_staff_selection !== false,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const mergedSettings = {
        ...(tenant.settings as any || {}),
        booking: settings,
      };
      await onUpdate({ settings: mergedSettings });
      toast({ title: t("settings.booking_settings_saved", { defaultValue: "Randevu ayarları kaydedildi" }) });
    } catch (err: any) {
      toast({ title: t("common.error", { defaultValue: "Hata" }), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-6 py-5 space-y-6">
      <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">{t("settings.booking_settings")}</p>

      <div className="grid gap-4 sm:grid-cols-2 max-w-[500px]">
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.slot_duration")}</Label>
          <Select value={settings.slot_duration} onValueChange={v => setSettings(s => ({ ...s, slot_duration: v }))}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["15","20","30","45","60","90","120"].map(v => <SelectItem key={v} value={v}>{v} dk</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.buffer_between")}</Label>
          <Select value={settings.buffer_between} onValueChange={v => setSettings(s => ({ ...s, buffer_between: v }))}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["0","5","10","15","20","30"].map(v => <SelectItem key={v} value={v}>{v} dk</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.max_advance_days")}</Label>
          <Input type="number" value={settings.max_advance_days} onChange={e => setSettings(s => ({ ...s, max_advance_days: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">{t("settings.min_advance_hours")}</Label>
          <Input type="number" value={settings.min_advance_hours} onChange={e => setSettings(s => ({ ...s, min_advance_hours: e.target.value }))} className="h-9 text-[13px]" />
        </div>
      </div>

      <div className="max-w-lg space-y-4">
        {[
          { key: "auto_confirm", label: t("settings.auto_confirm"), desc: t("settings.auto_confirm_desc") },
          { key: "show_staff_selection", label: t("settings.staff_selection"), desc: t("settings.staff_selection_desc") },
          { key: "allow_cancellation", label: t("settings.allow_cancellation"), desc: t("settings.allow_cancellation_desc") },
          { key: "require_deposit", label: t("settings.require_deposit"), desc: t("settings.require_deposit_desc") },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div>
              <p className="text-[13px] font-medium">{item.label}</p>
              <p className="text-[12px] text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={settings[item.key as keyof typeof settings] as boolean}
              onCheckedChange={v => setSettings(s => ({ ...s, [item.key]: v }))}
            />
          </div>
        ))}
      </div>

      {settings.require_deposit && (
        <div className="max-w-xs space-y-1.5">
          <Label className="text-[12px]">{t("settings.deposit_percentage")}</Label>
          <Input type="number" value={settings.deposit_percentage} min={5} max={100} onChange={e => setSettings(s => ({ ...s, deposit_percentage: e.target.value }))} className="h-9 text-[13px]" />
        </div>
      )}

      <Button size="sm" className="h-8 text-[12px]" onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
        {t("settings.save")}
      </Button>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab({ tenant, onUpdate }: TabProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const existingSettings = (tenant.settings as any)?.notifications || {};

  const [notif, setNotif] = useState({
    email_confirmation: existingSettings.email_confirmation !== false,
    email_reminder: existingSettings.email_reminder !== false,
    sms_confirmation: !!existingSettings.sms_confirmation,
    sms_reminder: !!existingSettings.sms_reminder,
    whatsapp_reminder: !!existingSettings.whatsapp_reminder,
    reminder_hours_before: existingSettings.reminder_hours_before || "24",
    followup_enabled: !!existingSettings.followup_enabled,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const mergedSettings = {
        ...(tenant.settings as any || {}),
        notifications: notif,
      };
      await onUpdate({ settings: mergedSettings });
      toast({ title: t("settings.notification_settings_saved", { defaultValue: "Bildirim ayarları kaydedildi" }) });
    } catch (err: any) {
      toast({ title: t("common.error", { defaultValue: "Hata" }), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-6 py-5 space-y-6">
      <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">{t("settings.notification_settings")}</p>

      <div className="max-w-lg space-y-4">
        {[
          { key: "email_confirmation", label: t("settings.email_confirmation"), desc: t("settings.email_confirmation_desc") },
          { key: "email_reminder", label: t("settings.email_reminder"), desc: t("settings.email_reminder_desc") },
          { key: "sms_confirmation", label: t("settings.sms_confirmation"), desc: t("settings.sms_confirmation_desc") },
          { key: "sms_reminder", label: t("settings.sms_reminder"), desc: t("settings.sms_reminder_desc") },
          { key: "whatsapp_reminder", label: t("settings.whatsapp_reminder"), desc: t("settings.whatsapp_reminder_desc") },
          { key: "followup_enabled", label: t("settings.followup"), desc: t("settings.followup_desc") },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div>
              <p className="text-[13px] font-medium">{item.label}</p>
              <p className="text-[12px] text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              checked={notif[item.key as keyof typeof notif] as boolean}
              onCheckedChange={v => setNotif(n => ({ ...n, [item.key]: v }))}
            />
          </div>
        ))}
      </div>

      <div className="max-w-xs space-y-1.5">
        <Label className="text-[12px]">{t("settings.reminder_before")}</Label>
        <Select value={notif.reminder_hours_before} onValueChange={v => setNotif(n => ({ ...n, reminder_hours_before: v }))}>
          <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["1","2","4","6","12","24","48"].map(v => <SelectItem key={v} value={v}>{v} {t("common.hours_before", { defaultValue: "saat önce" })}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Button size="sm" className="h-8 text-[12px]" onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
        {t("settings.save")}
      </Button>
    </div>
  );
}

// ─── Setup Business Component ───────────────────────────────────────────────

function SetupBusinessView({ onCreate }: { onCreate: (name: string, slug: string) => Promise<any> }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setSaving(true);
    try {
      await onCreate(name.trim(), slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
      toast({ title: t("settings.business_created", { defaultValue: "İşletme oluşturuldu!" }) });
    } catch (err: any) {
      toast({ title: t("settings.business_create_failed", { defaultValue: "Oluşturulamadı" }), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] items-center justify-center p-4">
      <div className="w-full max-w-md border border-border rounded-xl p-6 bg-card space-y-5">
        <div>
          <h2 className="text-[18px] font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" />
            {t("settings.setup_business_title")}
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            {t("settings.setup_business_desc")}
          </p>
        </div>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("settings.business_name")}</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Örn: Kuzey Güzellik Salonu"
              required
              className="h-9 text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">{t("settings.booking_url")}</Label>
            <div className="flex items-center border border-input rounded-md overflow-hidden bg-background">
              <span className="px-2.5 text-[12px] text-muted-foreground border-r border-input bg-muted h-9 flex items-center shrink-0">
                /book/
              </span>
              <Input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="kuzey-guzellik"
                required
                className="h-9 text-[13px] border-0 rounded-none"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-9 text-[13px]" disabled={saving || !name || !slug}>
            {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            {t("settings.save_business")}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function Settings() {
  const { t } = useTranslation();
  const { tenant, isLoading, updateTenant, createTenant } = useTenant();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[calc(100vh-3rem)] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!tenant) {
    return (
      <AppLayout>
        <SetupBusinessView onCreate={createTenant} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="px-4 md:px-6 h-12 flex items-center border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">{t("settings.title")}</h1>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-[900px]">
            <Tabs defaultValue="profile" className="flex flex-col md:flex-row">
              <TabsList className="flex md:flex-col md:w-44 h-auto p-1 md:p-2 gap-px bg-background border-b md:border-b-0 md:border-r border-border rounded-none justify-start overflow-x-auto md:overflow-x-visible shrink-0">
                {[
                  { value: "profile", label: t("settings.profile"), icon: User },
                  { value: "business", label: t("settings.business"), icon: Building2 },
                  { value: "booking", label: t("settings.booking"), icon: CalendarDays },
                  { value: "notifications", label: t("settings.notifications"), icon: Bell },
                ].map(({ value, label, icon: Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="justify-start gap-2 w-full text-[13px] data-[state=active]:bg-muted px-3 py-2 rounded-md whitespace-nowrap"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 min-w-0">
                <TabsContent value="profile" className="m-0"><ProfileTab /></TabsContent>
                <TabsContent value="business" className="m-0">
                  <BusinessTab tenant={tenant} onUpdate={updateTenant} />
                </TabsContent>
                <TabsContent value="booking" className="m-0">
                  <BookingTab tenant={tenant} onUpdate={updateTenant} />
                </TabsContent>
                <TabsContent value="notifications" className="m-0">
                  <NotificationsTab tenant={tenant} onUpdate={updateTenant} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
