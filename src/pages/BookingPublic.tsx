import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CalendarClock, Clock, ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sampleServices, sampleStaff } from "@/lib/sample-data";
import { formatCurrency, formatDuration } from "@/lib/format";
import { format, addDays, startOfWeek, isBefore, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";

type Step = "service" | "staff" | "datetime" | "info" | "confirm" | "success";

const MOCK_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const UNAVAILABLE = ["10:00", "13:30", "15:00"];

const BUSINESS_INFO = {
  name: "Demo Kuaför",
  industry: "Kuaför & Berber",
  avatar: null,
};

export default function BookingPublic() {
  const { slug } = useParams();
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<typeof sampleServices[0] | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<typeof sampleStaff[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = startOfDay(new Date());
  const weekStart = startOfWeek(addDays(today, weekOffset * 7), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const steps: Step[] = ["service", "staff", "datetime", "info", "confirm", "success"];
  const stepIdx = steps.indexOf(step);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setStep("success");
  };

  const StepDots = () => (
    <div className="flex items-center gap-2 justify-center mb-8">
      {["Hizmet", "Personel", "Tarih & Saat", "Bilgiler", "Onay"].map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full transition-colors ${
            i < stepIdx ? "bg-foreground" : i === stepIdx ? "bg-foreground" : "bg-muted-foreground/30"
          }`} />
          {i < 4 && <div className={`h-px w-6 ${i < stepIdx ? "bg-foreground/40" : "bg-muted-foreground/20"}`} />}
        </div>
      ))}
    </div>
  );

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
              <p className="text-[13px] font-semibold leading-none">{BUSINESS_INFO.name}</p>
              <p className="text-[11px] text-muted-foreground">{BUSINESS_INFO.industry}</p>
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
            <h2 className="text-[22px] font-semibold mb-1">Hizmet seçin</h2>
            <p className="text-[13px] text-muted-foreground mb-6">Randevu almak istediğiniz hizmetleri seçin</p>
            <div className="space-y-2">
              {sampleServices.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`w-full text-left flex items-center gap-4 p-4 border rounded-xl transition-colors ${
                    selectedService?.id === svc.id
                      ? "border-foreground bg-muted/30"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="h-3 w-3 rounded-full shrink-0" style={{ background: svc.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[14px]">{svc.name_tr}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[12px] text-muted-foreground">{formatDuration(svc.duration)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-[15px]">{formatCurrency(svc.price, svc.currency)}</p>
                  </div>
                  {selectedService?.id === svc.id && (
                    <Check className="h-4 w-4 text-foreground shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <Button
              className="w-full mt-6"
              disabled={!selectedService}
              onClick={() => setStep("staff")}
            >
              Devam Et <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step: Staff selection */}
        {step === "staff" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-1">Personel seçin</h2>
            <p className="text-[13px] text-muted-foreground mb-6">Tercih ettiğiniz personeli seçin</p>

            <button
              onClick={() => setSelectedStaff(null)}
              className={`w-full text-left flex items-center gap-4 p-4 border rounded-xl mb-2 transition-colors ${
                selectedStaff === null ? "border-foreground bg-muted/30" : "border-border hover:border-foreground/30"
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Fark etmez</p>
                <p className="text-[12px] text-muted-foreground">İlk uygun personel atanır</p>
              </div>
              {selectedStaff === null && <Check className="h-4 w-4 text-foreground shrink-0" />}
            </button>

            {sampleStaff.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStaff(s)}
                className={`w-full text-left flex items-center gap-4 p-4 border rounded-xl mb-2 transition-colors ${
                  selectedStaff?.id === s.id ? "border-foreground bg-muted/30" : "border-border hover:border-foreground/30"
                }`}
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-white shrink-0"
                  style={{ background: s.color }}
                >
                  {s.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-[12px] text-muted-foreground">{s.specialties.join(", ")}</p>
                </div>
                {selectedStaff?.id === s.id && <Check className="h-4 w-4 text-foreground shrink-0" />}
              </button>
            ))}

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep("service")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Geri
              </Button>
              <Button className="flex-1" onClick={() => setStep("datetime")}>
                Devam Et <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Date & Time */}
        {step === "datetime" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-1">Tarih & Saat seçin</h2>
            <p className="text-[13px] text-muted-foreground mb-6">Uygun olduğunuz gün ve saati seçin</p>

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
                  {format(weekStart, "d MMMM", { locale: tr })} – {format(addDays(weekStart, 6), "d MMMM", { locale: tr })}
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
                  const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
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
                        {format(day, "EEE", { locale: tr })}
                      </span>
                      <span className={`text-[14px] font-medium ${isToday && !isSelected ? "underline" : ""}`}>
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
                {MOCK_SLOTS.map((slot) => {
                  const isUnavailable = UNAVAILABLE.includes(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={isUnavailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 text-[13px] font-medium border rounded-lg transition-colors ${
                        isSelected ? "bg-foreground text-background border-foreground" :
                        isUnavailable ? "border-border text-muted-foreground/30 cursor-not-allowed line-through" :
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
                <ArrowLeft className="mr-2 h-4 w-4" /> Geri
              </Button>
              <Button className="flex-1" disabled={!selectedDate || !selectedSlot} onClick={() => setStep("info")}>
                Devam Et <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Customer info */}
        {step === "info" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-1">Bilgileriniz</h2>
            <p className="text-[13px] text-muted-foreground mb-6">Randevu onayı için iletişim bilgilerinizi girin</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[12px]">Ad Soyad *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ahmet Yılmaz"
                  className="h-10 text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Telefon *</Label>
                <Input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+90 5xx xxx xx xx"
                  className="h-10 text-[13px]"
                  type="tel"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">E-posta</Label>
                <Input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="ornek@mail.com"
                  className="h-10 text-[13px]"
                  type="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px]">Not (isteğe bağlı)</Label>
                <Input
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Özel bir isteğiniz var mı?"
                  className="h-10 text-[13px]"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep("datetime")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Geri
              </Button>
              <Button className="flex-1" disabled={!form.name || !form.phone} onClick={() => setStep("confirm")}>
                Devam Et <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div>
            <h2 className="text-[22px] font-semibold mb-1">Randevunuzu onaylayın</h2>
            <p className="text-[13px] text-muted-foreground mb-6">Bilgilerinizi kontrol edin</p>

            <div className="border border-border rounded-xl divide-y divide-border">
              {[
                { label: "Hizmet", value: selectedService?.name_tr },
                { label: "Personel", value: selectedStaff?.name ?? "İlk uygun personel" },
                { label: "Tarih", value: selectedDate ? format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr }) : "—" },
                { label: "Saat", value: selectedSlot ?? "—" },
                { label: "Süre", value: selectedService ? formatDuration(selectedService.duration) : "—" },
                { label: "Tutar", value: selectedService ? formatCurrency(selectedService.price, selectedService.currency) : "—" },
                { label: "Ad Soyad", value: form.name },
                { label: "Telefon", value: form.phone },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-3">
                  <span className="text-[12px] text-muted-foreground">{row.label}</span>
                  <span className="text-[13px] font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep("info")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Geri
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Gönderiliyor..." : "Randevuyu Onayla"}
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
            <h2 className="text-[24px] font-semibold mb-2">Randevunuz alındı!</h2>
            <p className="text-[14px] text-muted-foreground mb-1">
              {selectedService?.name_tr} · {selectedSlot} · {selectedDate && format(selectedDate, "d MMMM yyyy", { locale: tr })}
            </p>
            <p className="text-[13px] text-muted-foreground mb-8">
              Onay SMS'i {form.phone} numarasına gönderildi.
            </p>
            <Button variant="outline" onClick={() => {
              setStep("service");
              setSelectedService(null);
              setSelectedStaff(null);
              setSelectedDate(null);
              setSelectedSlot(null);
              setForm({ name: "", phone: "", email: "", notes: "" });
            }}>
              Yeni Randevu Al
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
