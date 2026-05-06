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
import { toast } from "@/hooks/use-toast";
import {
  User, Building2, Bell, Clock, Loader2, Camera, CalendarDays, Link,
} from "lucide-react";
import { initials } from "@/lib/format";

// ─── Profile Tab ─────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, profile, refreshProfile } = useAuth();
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
      toast({ title: "Geçersiz dosya türü", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Dosya çok büyük (max 5MB)", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { toast({ title: "Yükleme başarısız", description: upErr.message, variant: "destructive" }); setUploadingAvatar(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    await refreshProfile();
    toast({ title: "Profil fotoğrafı güncellendi" });
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: "Hata", description: error.message, variant: "destructive" });
    else { toast({ title: "Profil güncellendi" }); await refreshProfile(); }
  };

  const handleChangePw = async () => {
    if (newPassword.length < 6) { toast({ title: "Şifre en az 6 karakter olmalı", variant: "destructive" }); return; }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);
    if (error) toast({ title: "Hata", description: error.message, variant: "destructive" });
    else { toast({ title: "Şifre güncellendi" }); setNewPassword(""); }
  };

  return (
    <div className="divide-y divide-border">
      <div className="px-4 md:px-6 py-5">
        <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider mb-4">Profil Bilgileri</p>
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
            <p className="text-[14px] font-medium">{fullName || "Kullanıcı"}</p>
            <p className="text-[12px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="max-w-sm space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[12px]">Ad Soyad</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} className="h-9 text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">E-posta</Label>
            <Input value={user?.email || ""} disabled className="h-9 text-[13px] opacity-60" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="h-8 text-[12px] mt-4">
          {saving && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />} Kaydet
        </Button>
      </div>

      <div className="px-4 md:px-6 py-5">
        <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider mb-4">Şifre Değiştir</p>
        <div className="max-w-xs space-y-1.5">
          <Label className="text-[12px]">Yeni Şifre</Label>
          <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="h-9 text-[13px]" />
        </div>
        <Button onClick={handleChangePw} disabled={changingPw} variant="outline" size="sm" className="h-8 text-[12px] mt-4">
          {changingPw && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />} Şifreyi Güncelle
        </Button>
      </div>
    </div>
  );
}

// ─── Business Tab ────────────────────────────────────────────────────────────

function BusinessTab() {
  const [form, setForm] = useState({
    name: "Demo Kuaför",
    slug: "demo-kuafor",
    industry: "barber",
    phone: "+90 212 555 0000",
    email: "info@demokuafor.com",
    address: "Bağcılar, İstanbul",
    timezone: "Europe/Istanbul",
    locale: "tr",
    currency: "TRY",
  });

  return (
    <div className="px-4 md:px-6 py-5 space-y-5">
      <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">İşletme Bilgileri</p>
      <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
        <div className="space-y-1.5">
          <Label className="text-[12px]">İşletme Adı</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Booking URL (slug)</Label>
          <div className="flex items-center border border-input rounded-md overflow-hidden">
            <span className="px-2.5 text-[12px] text-muted-foreground border-r border-input bg-muted h-9 flex items-center shrink-0">/book/</span>
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="h-9 text-[13px] border-0 rounded-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Sektör</Label>
          <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[
                ["barber", "Kuaför & Berber"],
                ["beauty", "Güzellik Salonu"],
                ["tattoo", "Dövme Stüdyosu"],
                ["dietitian", "Diyetisyen"],
                ["physio", "Fizyoterapist"],
                ["fitness", "Fitness & PT"],
                ["spa", "Spa & Masaj"],
                ["other", "Diğer"],
              ].map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Telefon</Label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">E-posta</Label>
          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Adres</Label>
          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Dil</Label>
          <Select value={form.locale} onValueChange={v => setForm(f => ({ ...f, locale: v }))}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Para Birimi</Label>
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
      <Button size="sm" className="h-8 text-[12px]" onClick={() => toast({ title: "İşletme bilgileri kaydedildi" })}>
        Kaydet
      </Button>
    </div>
  );
}

// ─── Booking Tab ─────────────────────────────────────────────────────────────

function BookingTab() {
  const [settings, setSettings] = useState({
    slot_duration: "30",
    buffer_between: "10",
    max_advance_days: "60",
    min_advance_hours: "2",
    allow_cancellation: true,
    cancellation_hours: "24",
    require_deposit: false,
    deposit_percentage: "25",
    auto_confirm: true,
    show_staff_selection: true,
  });

  return (
    <div className="px-4 md:px-6 py-5 space-y-6">
      <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">Randevu Ayarları</p>

      <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
        <div className="space-y-1.5">
          <Label className="text-[12px]">Slot Süresi (dakika)</Label>
          <Select value={settings.slot_duration} onValueChange={v => setSettings(s => ({ ...s, slot_duration: v }))}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["15","20","30","45","60","90","120"].map(v => <SelectItem key={v} value={v}>{v} dk</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Randevular Arası Ara (dakika)</Label>
          <Select value={settings.buffer_between} onValueChange={v => setSettings(s => ({ ...s, buffer_between: v }))}>
            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["0","5","10","15","20","30"].map(v => <SelectItem key={v} value={v}>{v} dk</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Maksimum İleri Gün</Label>
          <Input type="number" value={settings.max_advance_days} onChange={e => setSettings(s => ({ ...s, max_advance_days: e.target.value }))} className="h-9 text-[13px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px]">Min. Kaç Saat Önceden</Label>
          <Input type="number" value={settings.min_advance_hours} onChange={e => setSettings(s => ({ ...s, min_advance_hours: e.target.value }))} className="h-9 text-[13px]" />
        </div>
      </div>

      <div className="max-w-lg space-y-4">
        {[
          { key: "auto_confirm", label: "Otomatik Onay", desc: "Randevuları otomatik onayla" },
          { key: "show_staff_selection", label: "Personel Seçimi", desc: "Müşterilerin personel seçmesine izin ver" },
          { key: "allow_cancellation", label: "İptal İzni", desc: "Müşteriler randevusunu iptal edebilir" },
          { key: "require_deposit", label: "Depozito Gerektir", desc: "Randevu için depozito al" },
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
          <Label className="text-[12px]">Depozito Yüzdesi (%)</Label>
          <Input type="number" value={settings.deposit_percentage} min={5} max={100} onChange={e => setSettings(s => ({ ...s, deposit_percentage: e.target.value }))} className="h-9 text-[13px]" />
        </div>
      )}

      <Button size="sm" className="h-8 text-[12px]" onClick={() => toast({ title: "Randevu ayarları kaydedildi" })}>
        Kaydet
      </Button>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [notif, setNotif] = useState({
    email_confirmation: true,
    email_reminder: true,
    sms_confirmation: false,
    sms_reminder: false,
    whatsapp_reminder: false,
    reminder_hours_before: "24",
    followup_enabled: false,
  });

  return (
    <div className="px-4 md:px-6 py-5 space-y-6">
      <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wider">Bildirim Ayarları</p>

      <div className="max-w-lg space-y-4">
        {[
          { key: "email_confirmation", label: "E-posta Onayı", desc: "Randevu alındığında e-posta gönder" },
          { key: "email_reminder", label: "E-posta Hatırlatma", desc: "Randevu öncesi e-posta hatırlatması" },
          { key: "sms_confirmation", label: "SMS Onayı", desc: "Randevu alındığında SMS gönder" },
          { key: "sms_reminder", label: "SMS Hatırlatma", desc: "Randevu öncesi SMS hatırlatması" },
          { key: "whatsapp_reminder", label: "WhatsApp Hatırlatma", desc: "Randevu öncesi WhatsApp mesajı (yakında)" },
          { key: "followup_enabled", label: "Sonrası Takip", desc: "Randevu sonrası müşteriye değerlendirme iste" },
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
        <Label className="text-[12px]">Kaç Saat Önce Hatırlatma Gönderilsin?</Label>
        <Select value={notif.reminder_hours_before} onValueChange={v => setNotif(n => ({ ...n, reminder_hours_before: v }))}>
          <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["1","2","4","6","12","24","48"].map(v => <SelectItem key={v} value={v}>{v} saat önce</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Button size="sm" className="h-8 text-[12px]" onClick={() => toast({ title: "Bildirim ayarları kaydedildi" })}>
        Kaydet
      </Button>
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function Settings() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="px-4 md:px-6 h-12 flex items-center border-b border-border shrink-0">
          <h1 className="text-[13px] font-medium">Ayarlar</h1>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-[900px]">
            <Tabs defaultValue="profile" className="flex flex-col md:flex-row">
              <TabsList className="flex md:flex-col md:w-44 h-auto p-1 md:p-2 gap-px bg-background border-b md:border-b-0 md:border-r border-border rounded-none justify-start overflow-x-auto md:overflow-x-visible shrink-0">
                {[
                  { value: "profile", label: "Profil", icon: User },
                  { value: "business", label: "İşletme", icon: Building2 },
                  { value: "booking", label: "Randevu", icon: CalendarDays },
                  { value: "notifications", label: "Bildirimler", icon: Bell },
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
                <TabsContent value="business" className="m-0"><BusinessTab /></TabsContent>
                <TabsContent value="booking" className="m-0"><BookingTab /></TabsContent>
                <TabsContent value="notifications" className="m-0"><NotificationsTab /></TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
