# Appointify

> **Premium randevu yönetimi & müşteri portalı** — kuaför, dövme stüdyosu, diyetisyen, güzellik salonu, fizyoterapist ve benzeri hizmet sağlayıcıları için tasarlanmış SaaS platformu.

---

## Tech stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** + **Radix UI** primitives
- **Framer Motion** — premium sayfa & mikro-etkileşimler
- **Supabase** — Auth + Postgres + Storage + Realtime + RLS
- **TanStack Query** — server state caching
- **react-i18next** — TR/EN tam çeviri
- **Recharts** — dashboard grafikleri
- **Zustand** — client UI state
- **Zod** + **react-hook-form** — form validation

## Özellikler

- 🗓️ Çoklu personel takvimi (gün / hafta / ay)
- 🔗 Public booking sayfası — `/book/:slug`
- 🔔 Otomatik onay + 24h / 2h hatırlatmaları
- 💳 Stripe (global) + Iyzico (TR) çift ödeme altyapısı
- 💼 4 plan: Solo / Team / Business / Enterprise (TRY + USD)
- 🌍 Tam i18n: Türkçe + İngilizce
- 🎨 Premium koyu tema + Satoshi/General Sans + grain overlay + cursor glow
- 🛡️ Row Level Security ile multi-tenant izolasyon

## Hızlı başlangıç

```bash
# Bağımlılıklar
npm install

# Geliştirme sunucusu
npm run dev          # → http://localhost:8080

# Production build
npm run build
npm run preview

# Type check & lint
npm run type-check
npm run lint
```

## Ortam değişkenleri

`.env` dosyası oluşturun (`.env.example` şablonu mevcut):

```env
VITE_SUPABASE_URL="https://xxxxx.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbG..."
VITE_SUPABASE_PROJECT_ID="xxxxx"
```

## Vercel deploy

Bu proje Vercel için hazır. `vercel.json` SPA fallback'ini içerir:

```bash
# Vercel CLI ile
npx vercel

# veya GitHub'a push edin → Vercel projesi bağlayın
# Ortam değişkenlerini Vercel Dashboard → Settings → Environment Variables üzerinden ekleyin
```

## Veritabanı

Supabase migration'ları `supabase/migrations/` altındadır. Lokal Supabase CLI ile uygulamak için:

```bash
npx supabase link --project-ref <project-id>
npx supabase db push
```

## Klasör yapısı

```
src/
├── components/        # Layout + UI + premium FX
│   ├── fx/            # GrainOverlay, CursorGlow, GlassCard, ScrollReveal…
│   ├── layout/        # DashboardLayout, Sidebar, TopBar, MobileNav
│   └── ui/            # shadcn primitives
├── contexts/          # AuthContext (tenant + profile aware)
├── hooks/             # useAppointments, useCustomers, …
├── integrations/
│   └── supabase/      # client + types
├── lib/               # i18n, motion presets, utils
├── locales/           # tr/, en/ — namespace bazlı JSON
├── pages/             # Landing, Auth, Dashboard, Appointments, …
└── index.css          # Design tokens (CSS variables)

supabase/
└── migrations/        # 14 migration: tenants → activity_log + RLS + functions
```

## Lisans

Özel — © Appointify
