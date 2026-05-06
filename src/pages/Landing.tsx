import { Link } from "react-router-dom";
import {
  ArrowRight, CalendarClock, CalendarDays, Users, CreditCard,
  Bell, BarChart3, Scissors, PenTool, Stethoscope, Dumbbell,
  Check, Moon, Sun, Star,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { PRICING, PLAN_FEATURES, PLAN_FEATURES_EN, TRIAL_DAYS } from "@/lib/constants/pricing";

type BillingCycle = "monthly" | "yearly";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-500",
  pending: "bg-yellow-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-500",
};

const MOCK_APPOINTMENTS = [
  { id: "A-001", name: "Emre Yılmaz", service: "Saç Kesim", time: "10:00", status: "confirmed" },
  { id: "A-002", name: "Zeynep Aksoy", service: "Saç Boyama", time: "11:30", status: "confirmed" },
  { id: "A-003", name: "Burak Şahin", service: "Sakal Tıraşı", time: "15:00", status: "pending" },
  { id: "A-004", name: "Deniz Kara", service: "Kombo", time: "Dün 14:00", status: "completed" },
  { id: "A-005", name: "Aylin Çelik", service: "Saç Yıkama", time: "Dün 13:00", status: "completed" },
];

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Akıllı Randevu Takvimi",
    desc: "Gün, hafta veya aylık görünümle tüm randevularınızı tek ekranda yönetin. Çakışmaları önleyin, boşlukları doldurun.",
  },
  {
    icon: Users,
    title: "Müşteri Portalı",
    desc: "Müşterileriniz 7/24 kendi randevularını alabilir, iptal edebilir. Onay SMS ve e-posta otomatik gönderilir.",
  },
  {
    icon: CreditCard,
    title: "Depozito & Ödeme",
    desc: "Online depozito alarak no-show'ları minimize edin. Iyzico ve Stripe entegrasyonu ile güvenli ödeme.",
  },
  {
    icon: Bell,
    title: "Otomatik Hatırlatmalar",
    desc: "Randevu öncesi SMS, e-posta veya WhatsApp hatırlatmaları ile müşteri devamsızlığını %70 azaltın.",
  },
  {
    icon: BarChart3,
    title: "Gelir & Raporlar",
    desc: "Haftalık, aylık gelir raporları. En çok tercih edilen hizmetler, VIP müşteriler, personel performansı.",
  },
  {
    icon: CalendarClock,
    title: "Çoklu Personel & Lokasyon",
    desc: "Her personelin farklı çalışma saatleri, izin günleri ve hizmetleri. Birden fazla şube desteği.",
  },
];

const INDUSTRIES = [
  { icon: Scissors, label: "Kuaför & Berber" },
  { icon: PenTool, label: "Dövme Stüdyosu" },
  { icon: Stethoscope, label: "Diyetisyen" },
  { icon: Dumbbell, label: "Fitness & PT" },
  { icon: Star, label: "Güzellik Salonu" },
  { icon: CalendarClock, label: "Fizyoterapist" },
];

const TESTIMONIALS = [
  {
    quote: "Appointify ile müşterilerim gece 2'de bile randevu alabiliyor. No-show oranım %80 düştü.",
    name: "Merve K.",
    title: "Güzellik Salonu Sahibi, İstanbul",
  },
  {
    quote: "3 şubem var, 12 personelim. Hepsini tek panelden yönetiyorum. Olmasa ne yapardım bilmiyorum.",
    name: "Cihan A.",
    title: "Berber Zinciri Sahibi, Ankara",
  },
];

export default function Landing() {
  const { theme, setTheme } = useTheme();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [lang, setLang] = useState<"tr" | "en">("tr");

  const isDark = theme === "dark";
  const pricing = PRICING["tr"];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur border-b border-border px-6">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-foreground" />
            <span className="text-[15px] font-semibold text-foreground tracking-tight">Appointify</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Özellikler</a>
            <a href="#pricing" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Fiyatlar</a>
            <a href="#industries" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Sektörler</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link to="/auth">
              <button className="text-[13px] text-muted-foreground hover:text-foreground transition-colors h-8 px-3">
                Giriş Yap
              </button>
            </Link>
            <Link to="/auth">
              <button className="text-[13px] h-8 px-4 bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-md font-medium">
                Ücretsiz Dene
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-14 pb-0 px-6 overflow-hidden">
        <div className="mx-auto max-w-[1200px]">
          <div className="pt-20 pb-16 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/40 text-[12px] text-muted-foreground mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {TRIAL_DAYS} gün ücretsiz — kredi kartı gerekmez
            </div>
            <h1 className="text-[clamp(2.4rem,5vw,4rem)] font-[600] leading-[1.05] tracking-[-0.04em] text-foreground max-w-[800px]">
              Randevu yönetimini{" "}
              <span className="relative inline-block">
                kolaylaştır
                <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-foreground/20 rounded-full" />
              </span>
            </h1>
            <p className="mt-6 text-[16px] leading-relaxed text-muted-foreground max-w-[520px]">
              Kuaför, dövme stüdyosu, diyetisyen veya güzellik salonu — tüm randevularınızı, müşterilerinizi
              ve ödemelerinizi tek platformdan yönetin.
            </p>
            <div className="mt-10 flex items-center gap-3 flex-wrap justify-center">
              <Link to="/auth">
                <button className="group inline-flex items-center gap-2 px-6 py-3 text-[14px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-md">
                  Hemen Başla
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link to="/book/demo">
                <button className="inline-flex items-center gap-2 px-6 py-3 text-[14px] text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 transition-colors rounded-md">
                  Demo Booking Sayfası
                </button>
              </Link>
            </div>
          </div>

          {/* App preview */}
          <div className="relative rounded-t-xl border border-b-0 border-border bg-card overflow-hidden shadow-2xl">
            <div className="flex min-h-[400px]">
              {/* Sidebar mock */}
              <div className="w-[180px] border-r border-border p-2.5 flex flex-col gap-0.5 shrink-0">
                <div className="flex items-center gap-2 px-2 h-10 mb-1">
                  <div className="h-4 w-4 rounded bg-foreground/20 shrink-0" />
                  <div className="h-2 w-20 rounded-full bg-foreground/15" />
                </div>
                <div className="h-px bg-border mb-1" />
                {[
                  { w: "w-20", active: true, label: "Dashboard" },
                  { w: "w-24", active: false, label: "Randevular" },
                  { w: "w-20", active: false, label: "Müşteriler" },
                  { w: "w-16", active: false, label: "Hizmetler" },
                  { w: "w-16", active: false, label: "Ödemeler" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 px-2 h-8 rounded-md ${item.active ? "bg-accent" : ""}`}>
                    <div className="h-3 w-3 rounded bg-muted-foreground/20 shrink-0" />
                    <div className={`h-1.5 ${item.w} rounded-full ${item.active ? "bg-foreground/25" : "bg-muted-foreground/15"}`} />
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex items-center justify-between px-4 h-10 border-b border-border">
                  <div className="h-2 w-24 rounded-full bg-foreground/15" />
                  <div className="flex gap-2">
                    <div className="h-7 w-20 rounded-md bg-foreground/10" />
                    <div className="h-7 w-7 rounded-md bg-foreground/10" />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-px bg-border p-px m-4 rounded-lg overflow-hidden">
                  {[
                    { label: "Bugün", value: "8", sub: "randevu" },
                    { label: "Bu Hafta", value: "₺5.2K", sub: "gelir" },
                    { label: "Müşteriler", value: "312", sub: "toplam" },
                    { label: "Doluluk", value: "%87", sub: "oran" },
                  ].map((s, i) => (
                    <div key={i} className="bg-card p-3">
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      <p className="text-[18px] font-semibold mt-0.5">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Appointments list mock */}
                <div className="mx-4 border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center px-3 h-8 border-b border-border bg-muted/30">
                    <span className="text-[11px] font-medium text-muted-foreground">Bugünkü Randevular</span>
                  </div>
                  {MOCK_APPOINTMENTS.slice(0, 4).map((apt, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 h-9 border-b border-border last:border-0">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${STATUS_COLORS[apt.status]}`} />
                      <span className="text-[11px] text-muted-foreground font-mono w-12 shrink-0">{apt.time}</span>
                      <span className="text-[12px] font-medium truncate">{apt.name}</span>
                      <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{apt.service}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      <div className="w-full border-t border-border" />

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-16">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Özellikler</p>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-[600] tracking-[-0.03em] text-foreground leading-[1.15]">
              Randevu yönetimi için ihtiyacınız olan her şey
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="border border-border rounded-xl p-6 bg-card hover:border-foreground/20 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-[15px] font-medium text-foreground mb-2">{f.title}</h3>
                <p className="text-[13px] leading-[1.65] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full border-t border-border" />

      {/* Industries */}
      <section id="industries" className="py-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-12">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Sektörler</p>
            <h2 className="text-[clamp(1.6rem,2.5vw,2.4rem)] font-[600] tracking-[-0.03em] text-foreground leading-[1.2]">
              Her hizmet sektörüne uygun
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {INDUSTRIES.map((ind, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-5 border border-border rounded-xl hover:border-foreground/20 transition-colors cursor-default">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <ind.icon className="h-5 w-5 text-foreground" />
                </div>
                <span className="text-[12px] text-center font-medium text-foreground">{ind.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full border-t border-border" />

      {/* Testimonials */}
      <section className="py-24 px-6 bg-muted/20">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="border border-border rounded-xl p-8 bg-card">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <blockquote className="text-[16px] font-[400] leading-[1.6] text-foreground/85 mb-6">
                  "{t.quote}"
                </blockquote>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{t.name}</p>
                  <p className="text-[12px] text-muted-foreground">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full border-t border-border" />

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-12">
            <p className="text-[12px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Fiyatlandırma</p>
            <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-[600] tracking-[-0.03em] text-foreground leading-[1.15] mb-6">
              İşletmenize uygun plan
            </h2>
            <div className="inline-flex items-center border border-border rounded-lg p-1 gap-1">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-4 py-1.5 text-[13px] rounded-md transition-colors ${billing === "monthly" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                Aylık
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-4 py-1.5 text-[13px] rounded-md transition-colors ${billing === "yearly" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                Yıllık <span className="text-green-500 font-medium">%20 indirim</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["solo", "team", "business", "enterprise"] as const).map((planId) => {
              const plan = pricing.plans[planId];
              const isPopular = planId === "team";
              const price = billing === "monthly" ? plan.monthly : Math.round(plan.yearly / 12);
              const features = PLAN_FEATURES[planId];

              return (
                <div
                  key={planId}
                  className={`border rounded-xl p-6 flex flex-col ${isPopular ? "border-foreground bg-foreground text-background" : "border-border bg-card"}`}
                >
                  {isPopular && (
                    <div className="text-[11px] font-medium uppercase tracking-wider text-background/60 mb-2">
                      En Popüler
                    </div>
                  )}
                  <div className="capitalize font-semibold text-[15px] mb-1">{planId}</div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-[28px] font-[700] leading-none">
                      {pricing.symbol}{price.toLocaleString("tr-TR")}
                    </span>
                    <span className={`text-[12px] mb-1 ${isPopular ? "text-background/60" : "text-muted-foreground"}`}>/ay</span>
                  </div>
                  {billing === "yearly" && (
                    <p className={`text-[11px] mb-4 ${isPopular ? "text-background/60" : "text-muted-foreground"}`}>
                      Yıllık {pricing.symbol}{plan.yearly.toLocaleString("tr-TR")} faturalandırılır
                    </p>
                  )}
                  <Link to="/auth" className="mt-4 mb-6">
                    <button
                      className={`w-full py-2 text-[13px] font-medium rounded-md transition-colors ${
                        isPopular
                          ? "bg-background text-foreground hover:bg-background/90"
                          : "border border-border hover:bg-accent"
                      }`}
                    >
                      {TRIAL_DAYS} gün ücretsiz başla
                    </button>
                  </Link>
                  <ul className="space-y-2.5 flex-1">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${isPopular ? "text-background/70" : "text-muted-foreground"}`} />
                        <span className={`text-[12px] leading-snug ${isPopular ? "text-background/85" : "text-muted-foreground"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="w-full border-t border-border" />

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-[1200px] text-center">
          <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-[600] tracking-[-0.035em] text-foreground leading-[1.1] mx-auto max-w-[600px]">
            Randevularınız sizi beklemesin
          </h2>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-[420px] mx-auto">
            {TRIAL_DAYS} gün ücretsiz deneyin. Kredi kartı gerekmez. 2 dakikada kurulum.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link to="/auth">
              <button className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-md">
                Hemen Başla
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-foreground" />
            <span className="text-[13px] font-semibold text-foreground tracking-tight">Appointify</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Özellikler</a>
            <a href="#pricing" className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">Fiyatlar</a>
            <span className="text-[12px] text-muted-foreground">Gizlilik</span>
            <span className="text-[12px] text-muted-foreground">Koşullar</span>
          </div>
          <span className="text-[12px] text-muted-foreground">© {new Date().getFullYear()} Appointify</span>
        </div>
      </div>
    </div>
  );
}
