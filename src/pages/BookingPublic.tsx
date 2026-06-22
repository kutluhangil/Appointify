import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarClock, Clock, ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDuration } from "@/lib/format";
import { format, addDays, startOfWeek, isBefore, startOfDay, endOfDay } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { useTenantBySlug } from "@/hooks/useTenant";
import { useServices } from "@/hooks/useServices";
import { useStaff } from "@/hooks/useStaff";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

type Step = "service" | "staff" | "datetime" | "info" | "confirm" | "success";

const ALL_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

export default function BookingPublic() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === "tr" ? tr : enUS;

  const { slug } = useParams();
  const [step, setStep] = useState<Step>("service");
  
  // Queries
  const { data: tenant, isLoading: loadingTenant } = useTenantBySlug(slug);
  const { services, isLoading: loadingServices } = useServices(tenant?.id);
  const { staff, isLoading: loadingStaff } = useStaff(tenant?.id);

  // States
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null | "any">("any");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInfoErrors, setShowInfoErrors] = useState(false);

  const selectedService = useMemo(() => {
    return services.find(s => s.id === selectedServiceId) || null;
  }, [selectedServiceId, services]);

  const selectedStaff = useMemo(() => {
    if (selectedStaffId === "any" || !selectedStaffId) return null;
    return staff.find(s => s.id === selectedStaffId) || null;
  }, [selectedStaffId, staff]);

  // Fetch appointments for selected date to prevent double booking
  const { data: dayAppointments } = useQuery({
    queryKey: ["public-appointments", tenant?.id, selectedDate],
    queryFn: async () => {
      if (!tenant?.id || !selectedDate) return [];
      const start = startOfDay(selectedDate).toISOString();
      const end = endOfDay(selectedDate).toISOString();
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("tenant_id", tenant.id)
        .gte("starts_at", start)
        .lte("starts_at", end);

      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id && !!selectedDate,
  });

  const bookedSlots = useMemo(() => {
    if (!dayAppointments) return [];
    return dayAppointments
      .filter(apt => selectedStaffId === "any" || apt.staff_id === selectedStaffId)
      .map(apt => format(new Date(apt.starts_at), "HH:mm"));
  }, [dayAppointments, selectedStaffId]);

  const isPhoneValid = (p: string) => /^[\d\s+\-()]{7,}$/.test(p.trim());

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const steps: Step[] = ["service", "staff", "datetime", "info", "confirm", "success"];
  const stepIdx = steps.indexOf(step);

  const handleSubmit = async () => {
    if (!tenant || !selectedService || !selectedDate || !selectedSlot) return;
    setIsSubmitting(true);
    try {
      // 1. Get or Create Customer for this tenant
      let customerId: string;
      const { data: existingCusts, error: searchErr } = await supabase
        .from("customers")
        .select("id")
        .eq("tenant_id", tenant.id)
        .eq("phone", form.phone.trim());

      if (searchErr) throw searchErr;

      if (existingCusts && existingCusts.length > 0) {
        customerId = existingCusts[0].id;
      } else {
        const { data: newCust, error: createCustErr } = await supabase
          .from("customers")
          .insert({
            tenant_id: tenant.id,
            full_name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || null,
            tag: "new",
          })
          .select()
          .single();

        if (createCustErr) throw createCustErr;
        customerId = newCust.id;
      }

      // 2. Create Appointment
      const startDt = new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedSlot}:00`);
      const endDt = new Date(startDt.getTime() + selectedService.duration_min * 60 * 1000);

      const { error: apptErr } = await supabase
        .from("appointments")
        .insert({
          tenant_id: tenant.id,
          customer_id: customerId,
          service_id: selectedService.id,
          staff_id: selectedStaff?.id || null,
          starts_at: startDt.toISOString(),
          ends_at: endDt.toISOString(),
          price: selectedService.price || 0,
          notes: form.notes.trim() || null,
          status: "pending",
        });

      if (apptErr) throw apptErr;

      setStep("success");
    } catch (err: any) {
      toast({
        title: t("common.error_creating", { defaultValue: "Randevu oluşturulamadı" }),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepDots = () => (
    <div className="flex items-center gap-2 justify-center mb-8">
      {[t("appointments.service"), t("appointments.staff_member"), t("appointments.date_time"), t("common.info", { defaultValue: "Bilgiler" }), t("common.confirm", { defaultValue: "Onay" })].map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full transition-colors ${
            i < stepIdx ? "bg-foreground" : i === stepIdx ? "bg-foreground" : "bg-muted-foreground/30"
          }`} />
          {i < 4 && <div className={`h-px w-6 ${i < stepIdx ? "bg-foreground/40" : "bg-muted-foreground/20"}`} />}
        </div>
      ))}
    </div>
  );

  if (loadingTenant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-[20px] font-semibold mb-2">{t("common.tenant_not_found", { defaultValue: "İşletme bulunamadı" })}</h2>
        <p className="text-[14px] text-muted-foreground mb-6">{t("common.tenant_not_found_desc", { defaultValue: "Girdiğiniz adrese ait bir işletme kaydı yok." })}</p>
        <Button asChild size="sm">
          <Link to="/">{t("common.back_to_home", { defaultValue: "Ana Sayfaya Dön" })}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur px-4">
        <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-none">{tenant.name}</p>
              <p className="text-[11px] text-muted-foreground">{tenant.industry || "Randevu Sistemi"}</p>
            </div>
          </div>
          <Link to="/" className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            Appointify
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-[640px] px-4 py-8">
        {step !== "success" && <StepDots />}

        {/* Step: Service selection */}
        {step === "service" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-1">{t("appointments.select_service")}</h2>
            <p className="text-[13px] text-muted-foreground mb-6">{t("appointments.select_service_desc", { defaultValue: "Randevu almak istediğiniz hizmeti seçin" })}</p>
            
            {loadingServices ? (
              <div className="flex py-12 justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground text-[13px]">
                {t("dashboard.no_services")}
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`w-full text-left flex items-center gap-4 p-4 border rounded-xl transition-colors ${
                      selectedServiceId === svc.id
                        ? "border-foreground bg-muted/30"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className="h-3 w-3 rounded-full shrink-0" style={{ background: svc.color || "#6366f1" }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[14px]">{svc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[12px] text-muted-foreground">{formatDuration(svc.duration_min)}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-[15px]">{formatCurrency(Number(svc.price || 0), svc.currency || "TRY")}</p>
                    </div>
                    {selectedServiceId === svc.id && (
                      <Check className="h-4 w-4 text-foreground shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <Button
              className="w-full mt-6"
              disabled={!selectedServiceId}
              onClick={() => setStep("staff")}
            >
              {t("common.continue", { defaultValue: "Devam Et" })} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step: Staff selection */}
        {step === "staff" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-1">{t("appointments.select_staff_title", { defaultValue: "Personel seçin" })}</h2>
            <p className="text-[13px] text-muted-foreground mb-6">{t("appointments.select_staff_desc", { defaultValue: "Tercih ettiğiniz personeli seçin" })}</p>

            <button
              onClick={() => setSelectedStaffId("any")}
              className={`w-full text-left flex items-center gap-4 p-4 border rounded-xl mb-2 transition-colors ${
                selectedStaffId === "any" ? "border-foreground bg-muted/30" : "border-border hover:border-foreground/30"
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{t("appointments.select_staff")}</p>
                <p className="text-[12px] text-muted-foreground">{t("appointments.any_staff_desc", { defaultValue: "İlk uygun personel atanır" })}</p>
              </div>
              {selectedStaffId === "any" && <Check className="h-4 w-4 text-foreground shrink-0" />}
            </button>

            {loadingStaff ? (
              <div className="flex py-6 justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              staff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaffId(s.id)}
                  className={`w-full text-left flex items-center gap-4 p-4 border rounded-xl mb-2 transition-colors ${
                    selectedStaffId === s.id ? "border-foreground bg-muted/30" : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-white shrink-0"
                    style={{ background: s.color || "#6366f1" }}
                  >
                    {s.full_name.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{s.full_name}</p>
                    {s.title && <p className="text-[12px] text-muted-foreground">{s.title}</p>}
                  </div>
                  {selectedStaffId === s.id && <Check className="h-4 w-4 text-foreground shrink-0" />}
                </button>
              ))
            )}

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep("service")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("common.back", { defaultValue: "Geri" })}
              </Button>
              <Button className="flex-1" onClick={() => setStep("datetime")}>
                {t("common.continue", { defaultValue: "Devam Et" })} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Date & Time */}
        {step === "datetime" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-1">{t("appointments.select_datetime", { defaultValue: "Tarih & Saat seçin" })}</h2>
            <p className="text-[13px] text-muted-foreground mb-6">{t("appointments.select_datetime_desc", { defaultValue: "Uygun olduğunuz gün ve saati seçin" })}</p>

            {/* Week nav */}
            <div className="border border-border rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <button
                  onClick={() => setWeekOffset(w => w - 1)}
                  disabled={weekOffset <= 0}
                  className="p-1 hover:bg-muted rounded-md transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[13px] font-medium">
                  {format(weekStart, "d MMMM", { locale: dateLocale })} – {format(addDays(weekStart, 6), "d MMMM yyyy", { locale: dateLocale })}
                </span>
                <button
                  onClick={() => setWeekOffset(w => w + 1)}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-7 divide-x divide-border">
                {weekDays.map((day) => {
                  const isPast = isBefore(day, today);
                  const isSelected = selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                  const isTodayDay = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                  return (
                    <button
                      key={day.toISOString()}
                      disabled={isPast}
                      onClick={() => { setSelectedDate(day); setSelectedSlot(null); }}
                      className={`py-3 flex flex-col items-center transition-colors ${
                        isSelected ? "bg-foreground text-background" :
                        isPast ? "opacity-30 cursor-not-allowed" :
                        "hover:bg-muted"
                      }`}
                    >
                      <span className={`text-[10px] uppercase mb-1 ${isSelected ? "text-background/70" : "text-muted-foreground"}`}>
                        {format(day, "EEE", { locale: dateLocale })}
                      </span>
                      <span className={`text-[14px] font-medium ${isTodayDay && !isSelected ? "underline" : ""}`}>
                        {format(day, "d")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="grid grid-cols-4 gap-2">
                {ALL_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 text-[13px] font-medium border rounded-lg transition-colors ${
                        isSelected ? "bg-foreground text-background border-foreground" :
                        isBooked ? "border-border text-muted-foreground/30 cursor-not-allowed line-through bg-muted/20" :
                        "border-border hover:border-foreground/30"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep("staff")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("common.back", { defaultValue: "Geri" })}
              </Button>
              <Button className="flex-1" disabled={!selectedDate || !selectedSlot} onClick={() => setStep("info")}>
                {t("common.continue", { defaultValue: "Devam Et" })} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Customer info */}
        {step === "info" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-1">{t("common.your_info", { defaultValue: "Bilgileriniz" })}</h2>
            <p className="text-[13px] text-muted-foreground mb-6">{t("appointments.info_desc", { defaultValue: "Randevu onayı için iletişim bilgilerinizi girin" })}</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[12px]">{t("customers.name_label")}</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ahmet Yılmaz"
                  className={`h-10 text-[13px] ${showInfoErrors && !form.name ? "border-destructive" : ""}`}
                />
                {showInfoErrors && !form.name && (
                  <p className="text-[12px] text-destructive">{t("common.name_required", { defaultValue: "Ad soyad zorunludur." })}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">{t("customers.phone_label")}</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+90 5xx xxx xx xx"
                  className={`h-10 text-[13px] ${showInfoErrors && !isPhoneValid(form.phone) ? "border-destructive" : ""}`}
                  type="tel"
                />
                {showInfoErrors && !form.phone && (
                  <p className="text-[12px] text-destructive">{t("common.phone_required", { defaultValue: "Telefon numarası zorunludur." })}</p>
                )}
                {showInfoErrors && form.phone && !isPhoneValid(form.phone) && (
                  <p className="text-[12px] text-destructive">{t("common.invalid_phone", { defaultValue: "Geçerli bir telefon numarası girin (en az 7 rakam)." })}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">{t("customers.email_label")}</Label>
                <Input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="ornek@mail.com"
                  className="h-10 text-[13px]"
                  type="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">{t("common.notes_optional", { defaultValue: "Not (isteğe bağlı)" })}</Label>
                <Input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={t("common.notes_placeholder", { defaultValue: "Özel bir isteğiniz var mı?" })}
                  className="h-10 text-[13px]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => { setShowInfoErrors(false); setStep("datetime"); }}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("common.back", { defaultValue: "Geri" })}
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowInfoErrors(true);
                  if (form.name && isPhoneValid(form.phone)) setStep("confirm");
                }}
              >
                {t("common.continue", { defaultValue: "Devam Et" })} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-1">{t("appointments.confirm_title", { defaultValue: "Randevunuzu onaylayın" })}</h2>
            <p className="text-[13px] text-muted-foreground mb-6">{t("appointments.confirm_desc", { defaultValue: "Bilgilerinizi kontrol edin" })}</p>

            <div className="border border-border rounded-xl divide-y divide-border">
              {[
                { label: t("appointments.service"), value: selectedService?.name },
                { label: t("appointments.staff_member"), value: selectedStaff?.full_name ?? t("appointments.select_staff") },
                { label: t("appointments.date"), value: selectedDate ? format(selectedDate, "d MMMM yyyy, EEEE", { locale: dateLocale }) : "—" },
                { label: t("appointments.time"), value: selectedSlot ?? "—" },
                { label: t("appointments.duration"), value: selectedService ? formatDuration(selectedService.duration_min) : "—" },
                { label: t("appointments.price"), value: selectedService ? formatCurrency(Number(selectedService.price || 0), selectedService.currency || "TRY") : "—" },
                { label: t("settings.name"), value: form.name },
                { label: t("settings.phone"), value: form.phone },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[12px] text-muted-foreground">{row.label}</span>
                  <span className="text-[13px] font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep("info")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {t("common.back", { defaultValue: "Geri" })}
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t("common.sending", { defaultValue: "Gönderiliyor..." }) : t("appointments.confirm_btn", { defaultValue: "Randevuyu Onayla" })}
              </Button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-[24px] font-semibold mb-2">{t("appointments.success_title", { defaultValue: "Randevunuz alındı!" })}</h2>
            <p className="text-[14px] text-muted-foreground mb-1">
              {selectedService?.name} · {selectedSlot} · {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: dateLocale })}
            </p>
            <p className="text-[13px] text-muted-foreground mb-8">
              {t("appointments.success_desc", { defaultValue: "Randevunuz başarıyla oluşturuldu ve onay bekliyor." })}
            </p>
            <Button variant="outline" onClick={() => {
              setStep("service");
              setSelectedServiceId(null);
              setSelectedStaffId("any");
              setSelectedDate(null);
              setSelectedSlot(null);
              setForm({ name: "", phone: "", email: "", notes: "" });
            }}>
              {t("appointments.new_booking_btn", { defaultValue: "Yeni Randevu Al" })}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
