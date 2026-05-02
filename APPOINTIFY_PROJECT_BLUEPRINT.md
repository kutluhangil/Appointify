# APPOINTIFY — Randevu & Müşteri Portalı

## Proje Tanımı (Project Overview)

**Appointify**, kuaför, dövme stüdyosu, diyetisyen, güzellik salonu, fizyoterapist gibi dikey sektörlerdeki solo ve çoklu lokasyon hizmet sağlayıcıları için geliştirilmiş **tam kapsamlı randevu yönetim ve müşteri portalı** platformudur.

- **Diller:** Türkçe (TR) + English (EN) — tam i18n desteği
- **Hedef Pazar:** Türkiye + Global
- **Model:** SaaS (aylık abonelik)

---

## 1. TEKNİK MİMARİ (Tech Stack & Architecture)

### 1.1 Genel Mimari

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                     │
│          React 18 + TypeScript + Vite + Zustand         │
│              Framer Motion + TailwindCSS                │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────┐
│               REVERSE PROXY (Caddy)                     │
│          Auto SSL + Gzip + Rate Limiting                │
│                 Docker Container                        │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              API GATEWAY (Node.js + Express)            │
│           TypeScript + Helmet + CORS + JWT              │
│                 Docker Container                        │
└──────┬──────────────┬──────────────┬────────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
│  Supabase   │ │  Redis    │ │  Bull MQ   │
│  (DB+Auth+  │ │  (Cache + │ │  (Job      │
│   Storage)  │ │  Sessions)│ │   Queue)   │
└─────────────┘ └───────────┘ └────────────┘
```

### 1.2 Frontend Stack

| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool |
| TailwindCSS | 3.x | Utility-First CSS |
| Framer Motion | 11.x | Animasyon & Geçiş Efektleri |
| Zustand | 4.x | State Management |
| React Router | 6.x | Client-Side Routing |
| React Hook Form | 7.x | Form Yönetimi |
| Zod | 3.x | Schema Validation |
| react-i18next | 14.x | Çoklu Dil (TR/EN) |
| date-fns | 3.x | Tarih İşlemleri |
| Lucide React | latest | İkon Seti |
| Recharts | 2.x | Dashboard Grafikleri |
| @tanstack/react-query | 5.x | Server State + Cache |

### 1.3 Backend Stack

| Teknoloji | Versiyon | Amaç |
|-----------|----------|------|
| Node.js | 20 LTS | Runtime |
| Express | 4.x | HTTP Framework |
| TypeScript | 5.x | Type Safety |
| Supabase JS | 2.x | DB Client + Auth + Realtime |
| Bull MQ | 5.x | Job Queue (hatırlatma, bildirim) |
| Redis | 7.x | Cache + Session + Queue Backend |
| Nodemailer | 6.x | E-posta Gönderimi |
| node-cron | 3.x | Zamanlı Görevler |
| Helmet | 7.x | Güvenlik Header'ları |
| express-rate-limit | 7.x | Rate Limiting |
| jsonwebtoken | 9.x | JWT Token |
| sharp | 0.33.x | Görsel İşleme |
| winston | 3.x | Logging |
| Stripe | latest | Global Ödeme |
| Iyzico | latest | TR Ödeme (Sanal POS) |

### 1.4 Infrastructure (Ubuntu Server + Docker)

| Servis | Container | Port |
|--------|-----------|------|
| Frontend (Vite build → Caddy serve) | `appointify-web` | 443 (HTTPS) |
| Backend API | `appointify-api` | 4000 |
| Redis | `appointify-redis` | 6379 |
| Caddy (Reverse Proxy) | `appointify-proxy` | 80, 443 |
| Bull Board (Queue Dashboard) | `appointify-bullboard` | 4001 (internal) |

> **Not:** Veritabanı olarak Supabase Cloud kullanılacak, Docker'da DB container'a gerek yok. Auth, Storage ve Realtime da Supabase üzerinden.

---

## 2. PROJE KLASÖR YAPISI (Project Structure)

```
appointify/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── README.md
│
├── packages/
│   ├── shared/                        # Paylaşılan tipler ve yardımcılar
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── appointment.ts
│   │   │   │   ├── customer.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── provider.ts
│   │   │   │   ├── payment.ts
│   │   │   │   ├── subscription.ts
│   │   │   │   ├── notification.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   │   ├── pricing.ts
│   │   │   │   ├── industries.ts
│   │   │   │   └── locales.ts
│   │   │   ├── validators/
│   │   │   │   ├── appointment.schema.ts
│   │   │   │   ├── customer.schema.ts
│   │   │   │   └── payment.schema.ts
│   │   │   └── utils/
│   │   │       ├── date.ts
│   │   │       ├── currency.ts
│   │   │       └── slug.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                           # Frontend (React + Vite)
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   └── og-image.png
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── vite-env.d.ts
│   │   │   │
│   │   │   ├── assets/
│   │   │   │   ├── fonts/
│   │   │   │   │   ├── Satoshi-Variable.woff2
│   │   │   │   │   └── GeneralSans-Variable.woff2
│   │   │   │   └── images/
│   │   │   │
│   │   │   ├── styles/
│   │   │   │   ├── globals.css          # Tailwind directives + CSS variables
│   │   │   │   ├── fonts.css            # @font-face declarations
│   │   │   │   └── animations.css       # Keyframe animations
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── routes.tsx
│   │   │   │   ├── i18n.ts
│   │   │   │   ├── supabase.ts
│   │   │   │   └── queryClient.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useAppointments.ts
│   │   │   │   ├── useServices.ts
│   │   │   │   ├── useCustomers.ts
│   │   │   │   ├── useNotifications.ts
│   │   │   │   ├── usePayment.ts
│   │   │   │   ├── useLocale.ts
│   │   │   │   ├── useMediaQuery.ts
│   │   │   │   └── useDebounce.ts
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── uiStore.ts
│   │   │   │   ├── bookingStore.ts
│   │   │   │   └── notificationStore.ts
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/                  # Atomic / Reusable
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Select.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Drawer.tsx
│   │   │   │   │   ├── Toast.tsx
│   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   ├── Avatar.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Skeleton.tsx
│   │   │   │   │   ├── Spinner.tsx
│   │   │   │   │   ├── Toggle.tsx
│   │   │   │   │   ├── Tabs.tsx
│   │   │   │   │   ├── Tooltip.tsx
│   │   │   │   │   ├── DropdownMenu.tsx
│   │   │   │   │   ├── Calendar.tsx
│   │   │   │   │   ├── TimePicker.tsx
│   │   │   │   │   ├── DateRangePicker.tsx
│   │   │   │   │   ├── FileUpload.tsx
│   │   │   │   │   ├── EmptyState.tsx
│   │   │   │   │   ├── PageTransition.tsx
│   │   │   │   │   └── AnimatedCounter.tsx
│   │   │   │   │
│   │   │   │   ├── layout/
│   │   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   │   ├── PublicLayout.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── TopBar.tsx
│   │   │   │   │   ├── MobileNav.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   └── LanguageSwitcher.tsx
│   │   │   │   │
│   │   │   │   ├── booking/             # Public Booking Widget
│   │   │   │   │   ├── BookingPage.tsx
│   │   │   │   │   ├── ServiceSelector.tsx
│   │   │   │   │   ├── StaffSelector.tsx
│   │   │   │   │   ├── DateTimeSelector.tsx
│   │   │   │   │   ├── CustomerForm.tsx
│   │   │   │   │   ├── BookingConfirmation.tsx
│   │   │   │   │   ├── DepositPayment.tsx
│   │   │   │   │   └── BookingSuccess.tsx
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── Overview.tsx
│   │   │   │   │   ├── StatsCard.tsx
│   │   │   │   │   ├── RevenueChart.tsx
│   │   │   │   │   ├── UpcomingAppointments.tsx
│   │   │   │   │   └── RecentActivity.tsx
│   │   │   │   │
│   │   │   │   ├── appointments/
│   │   │   │   │   ├── AppointmentList.tsx
│   │   │   │   │   ├── AppointmentCard.tsx
│   │   │   │   │   ├── AppointmentDetail.tsx
│   │   │   │   │   ├── AppointmentCalendar.tsx
│   │   │   │   │   ├── NewAppointment.tsx
│   │   │   │   │   └── AppointmentFilters.tsx
│   │   │   │   │
│   │   │   │   ├── customers/
│   │   │   │   │   ├── CustomerList.tsx
│   │   │   │   │   ├── CustomerDetail.tsx
│   │   │   │   │   ├── CustomerForm.tsx
│   │   │   │   │   ├── CustomerHistory.tsx
│   │   │   │   │   └── CustomerNotes.tsx
│   │   │   │   │
│   │   │   │   ├── services/
│   │   │   │   │   ├── ServiceList.tsx
│   │   │   │   │   ├── ServiceForm.tsx
│   │   │   │   │   ├── ServiceCard.tsx
│   │   │   │   │   └── CategoryManager.tsx
│   │   │   │   │
│   │   │   │   ├── staff/
│   │   │   │   │   ├── StaffList.tsx
│   │   │   │   │   ├── StaffForm.tsx
│   │   │   │   │   ├── StaffSchedule.tsx
│   │   │   │   │   └── StaffPerformance.tsx
│   │   │   │   │
│   │   │   │   ├── payments/
│   │   │   │   │   ├── PaymentList.tsx
│   │   │   │   │   ├── PaymentDetail.tsx
│   │   │   │   │   ├── InvoicePreview.tsx
│   │   │   │   │   └── DepositManager.tsx
│   │   │   │   │
│   │   │   │   ├── settings/
│   │   │   │   │   ├── GeneralSettings.tsx
│   │   │   │   │   ├── BookingSettings.tsx
│   │   │   │   │   ├── NotificationSettings.tsx
│   │   │   │   │   ├── PaymentSettings.tsx
│   │   │   │   │   ├── BrandingSettings.tsx
│   │   │   │   │   ├── WorkingHours.tsx
│   │   │   │   │   ├── HolidayManager.tsx
│   │   │   │   │   └── IntegrationSettings.tsx
│   │   │   │   │
│   │   │   │   ├── subscription/
│   │   │   │   │   ├── PricingPlans.tsx
│   │   │   │   │   ├── CurrentPlan.tsx
│   │   │   │   │   ├── BillingHistory.tsx
│   │   │   │   │   └── UpgradeModal.tsx
│   │   │   │   │
│   │   │   │   └── landing/
│   │   │   │       ├── Hero.tsx
│   │   │   │       ├── Features.tsx
│   │   │   │       ├── Pricing.tsx
│   │   │   │       ├── Testimonials.tsx
│   │   │   │       ├── Industries.tsx
│   │   │   │       ├── FAQ.tsx
│   │   │   │       ├── CTA.tsx
│   │   │   │       └── LandingNav.tsx
│   │   │   │
│   │   │   ├── pages/
│   │   │   │   ├── Landing.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Appointments.tsx
│   │   │   │   ├── Customers.tsx
│   │   │   │   ├── Services.tsx
│   │   │   │   ├── Staff.tsx
│   │   │   │   ├── Payments.tsx
│   │   │   │   ├── Settings.tsx
│   │   │   │   ├── Subscription.tsx
│   │   │   │   ├── Reports.tsx
│   │   │   │   ├── BookingPublic.tsx      # /book/:slug
│   │   │   │   └── NotFound.tsx
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                 # Axios instance + interceptors
│   │   │   │   ├── supabase.ts
│   │   │   │   ├── stripe.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   └── errorHandler.ts
│   │   │   │
│   │   │   └── locales/
│   │   │       ├── tr/
│   │   │       │   ├── common.json
│   │   │       │   ├── booking.json
│   │   │       │   ├── dashboard.json
│   │   │       │   ├── settings.json
│   │   │       │   └── landing.json
│   │   │       └── en/
│   │   │           ├── common.json
│   │   │           ├── booking.json
│   │   │           ├── dashboard.json
│   │   │           ├── settings.json
│   │   │           └── landing.json
│   │   │
│   │   ├── index.html
│   │   ├── tailwind.config.ts
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                             # Backend (Express + TypeScript)
│       ├── src/
│       │   ├── server.ts                  # Entry point
│       │   ├── app.ts                     # Express app setup
│       │   │
│       │   ├── config/
│       │   │   ├── env.ts                 # Environment variables
│       │   │   ├── supabase.ts            # Supabase admin client
│       │   │   ├── redis.ts               # Redis connection
│       │   │   ├── stripe.ts              # Stripe config
│       │   │   ├── iyzico.ts              # Iyzico (TR payments)
│       │   │   ├── email.ts               # SMTP config
│       │   │   └── logger.ts              # Winston logger
│       │   │
│       │   ├── middleware/
│       │   │   ├── auth.ts                # JWT verification
│       │   │   ├── rateLimiter.ts
│       │   │   ├── validator.ts           # Zod middleware
│       │   │   ├── tenantResolver.ts      # Multi-tenant resolver
│       │   │   ├── subscriptionGuard.ts   # Plan-based feature gating
│       │   │   ├── errorHandler.ts
│       │   │   └── logger.ts
│       │   │
│       │   ├── routes/
│       │   │   ├── index.ts
│       │   │   ├── auth.routes.ts
│       │   │   ├── appointment.routes.ts
│       │   │   ├── customer.routes.ts
│       │   │   ├── service.routes.ts
│       │   │   ├── staff.routes.ts
│       │   │   ├── payment.routes.ts
│       │   │   ├── notification.routes.ts
│       │   │   ├── subscription.routes.ts
│       │   │   ├── settings.routes.ts
│       │   │   ├── booking.routes.ts       # Public booking API
│       │   │   ├── report.routes.ts
│       │   │   ├── webhook.routes.ts       # Stripe/Iyzico webhooks
│       │   │   └── admin.routes.ts
│       │   │
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── appointment.controller.ts
│       │   │   ├── customer.controller.ts
│       │   │   ├── service.controller.ts
│       │   │   ├── staff.controller.ts
│       │   │   ├── payment.controller.ts
│       │   │   ├── notification.controller.ts
│       │   │   ├── subscription.controller.ts
│       │   │   ├── settings.controller.ts
│       │   │   ├── booking.controller.ts
│       │   │   ├── report.controller.ts
│       │   │   └── webhook.controller.ts
│       │   │
│       │   ├── services/                   # Business logic
│       │   │   ├── auth.service.ts
│       │   │   ├── appointment.service.ts
│       │   │   ├── customer.service.ts
│       │   │   ├── availability.service.ts
│       │   │   ├── payment.service.ts
│       │   │   ├── stripe.service.ts
│       │   │   ├── iyzico.service.ts
│       │   │   ├── notification.service.ts
│       │   │   ├── email.service.ts
│       │   │   ├── sms.service.ts
│       │   │   ├── whatsapp.service.ts
│       │   │   ├── subscription.service.ts
│       │   │   ├── report.service.ts
│       │   │   ├── cache.service.ts
│       │   │   └── storage.service.ts
│       │   │
│       │   ├── jobs/                       # Bull MQ Workers
│       │   │   ├── queue.ts                # Queue definitions
│       │   │   ├── reminder.job.ts         # Otomatik hatırlatma
│       │   │   ├── followup.job.ts         # Sonrası takip mesajı
│       │   │   ├── noshow.job.ts           # Gelmedi işlemleri
│       │   │   ├── report.job.ts           # Günlük/haftalık rapor
│       │   │   ├── cleanup.job.ts          # Eski data temizliği
│       │   │   └── subscription.job.ts     # Abonelik kontrolü
│       │   │
│       │   ├── templates/                  # E-posta Şablonları
│       │   │   ├── base.hbs
│       │   │   ├── appointment-confirmation.hbs
│       │   │   ├── appointment-reminder.hbs
│       │   │   ├── appointment-cancelled.hbs
│       │   │   ├── deposit-receipt.hbs
│       │   │   ├── welcome.hbs
│       │   │   ├── password-reset.hbs
│       │   │   └── invoice.hbs
│       │   │
│       │   └── utils/
│       │       ├── response.ts
│       │       ├── pagination.ts
│       │       ├── slug.ts
│       │       └── timezone.ts
│       │
│       ├── Dockerfile
│       ├── tsconfig.json
│       └── package.json
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_tenants.sql
│   │   ├── 002_profiles.sql
│   │   ├── 003_services.sql
│   │   ├── 004_staff.sql
│   │   ├── 005_customers.sql
│   │   ├── 006_appointments.sql
│   │   ├── 007_payments.sql
│   │   ├── 008_notifications.sql
│   │   ├── 009_subscriptions.sql
│   │   ├── 010_settings.sql
│   │   ├── 011_working_hours.sql
│   │   ├── 012_holidays.sql
│   │   ├── 013_rls_policies.sql
│   │   └── 014_functions_triggers.sql
│   ├── seed.sql
│   └── config.toml
│
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   ├── restore.sh
│   └── setup-server.sh
│
└── docs/
    ├── API.md
    ├── DEPLOYMENT.md
    └── CONTRIBUTING.md
```

---

## 3. VERİTABANI ŞEMASI (Database Schema — Supabase PostgreSQL)

### 3.1 Tablolar

```sql
-- ==========================================
-- TENANT (İşletme / Workspace)
-- ==========================================
CREATE TABLE tenants (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,                -- appointify.com/book/{slug}
  industry        TEXT NOT NULL,                       -- barber, tattoo, dietitian, beauty, physio, other
  email           TEXT NOT NULL,
  phone           TEXT,
  country         TEXT NOT NULL DEFAULT 'TR',          -- TR, US, DE, etc.
  currency        TEXT NOT NULL DEFAULT 'TRY',         -- TRY, USD, EUR, GBP
  timezone        TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  locale          TEXT NOT NULL DEFAULT 'tr',          -- tr, en
  logo_url        TEXT,
  cover_url       TEXT,
  website         TEXT,
  address         JSONB,                               -- {line1, line2, city, state, zip, country}
  social_links    JSONB DEFAULT '{}',                  -- {instagram, facebook, twitter, tiktok}
  booking_settings JSONB DEFAULT '{
    "slot_duration": 30,
    "buffer_between": 10,
    "max_advance_days": 60,
    "min_advance_hours": 2,
    "allow_cancellation": true,
    "cancellation_hours": 24,
    "require_deposit": false,
    "deposit_percentage": 25,
    "auto_confirm": true,
    "show_staff_selection": true,
    "max_bookings_per_slot": 1
  }',
  notification_settings JSONB DEFAULT '{
    "email_enabled": true,
    "sms_enabled": false,
    "whatsapp_enabled": false,
    "reminder_hours": [24, 2],
    "followup_enabled": true,
    "followup_hours": 48
  }',
  branding        JSONB DEFAULT '{
    "primary_color": "#0a0a0a",
    "accent_color": "#6b7280",
    "font": "Satoshi"
  }',
  subscription_plan TEXT DEFAULT 'trial',              -- trial, solo, team, enterprise
  subscription_status TEXT DEFAULT 'active',           -- active, past_due, cancelled
  stripe_customer_id TEXT,
  iyzico_customer_id TEXT,
  trial_ends_at   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PROFILES (Kullanıcılar — auth.users ile bağlantılı)
-- ==========================================
CREATE TABLE profiles (
  id              UUID REFERENCES auth.users(id) PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  avatar_url      TEXT,
  phone           TEXT,
  role            TEXT NOT NULL DEFAULT 'owner',       -- owner, admin, staff, receptionist
  permissions     JSONB DEFAULT '[]',
  is_active       BOOLEAN DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- HİZMETLER (Services)
-- ==========================================
CREATE TABLE service_categories (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name_tr         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  sort_order      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  name_tr         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  description_tr  TEXT,
  description_en  TEXT,
  duration        INT NOT NULL DEFAULT 30,              -- dakika
  price           DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'TRY',
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount  DECIMAL(10,2),
  color           TEXT DEFAULT '#6b7280',               -- UI renk kodu
  image_url       TEXT,
  max_per_day     INT,                                  -- günlük max randevu
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- PERSONEL (Staff)
-- ==========================================
CREATE TABLE staff (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  profile_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  bio_tr          TEXT,
  bio_en          TEXT,
  specialties     TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Staff ↔ Service ilişkisi (M:N)
CREATE TABLE staff_services (
  staff_id        UUID REFERENCES staff(id) ON DELETE CASCADE,
  service_id      UUID REFERENCES services(id) ON DELETE CASCADE,
  custom_duration INT,                                  -- override süresi
  custom_price    DECIMAL(10,2),                        -- override fiyatı
  PRIMARY KEY (staff_id, service_id)
);

-- ==========================================
-- ÇALIŞMA SAATLERİ (Working Hours)
-- ==========================================
CREATE TABLE working_hours (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  staff_id        UUID REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week     INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Pazar
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  break_start     TIME,
  break_end       TIME,
  is_working      BOOLEAN DEFAULT true,
  UNIQUE(staff_id, day_of_week)
);

-- ==========================================
-- TATİLLER / ÖZEL KAPALI GÜNLER
-- ==========================================
CREATE TABLE holidays (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  staff_id        UUID REFERENCES staff(id) ON DELETE SET NULL,    -- NULL = tüm işletme
  title           TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_recurring    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- MÜŞTERİLER (Customers)
-- ==========================================
CREATE TABLE customers (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT NOT NULL,
  gender          TEXT,                                 -- male, female, other, prefer_not_to_say
  date_of_birth   DATE,
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',                  -- VIP, regular, new, etc.
  avatar_url      TEXT,
  total_visits    INT DEFAULT 0,
  total_spent     DECIMAL(10,2) DEFAULT 0,
  last_visit_at   TIMESTAMPTZ,
  no_show_count   INT DEFAULT 0,
  is_blocked      BOOLEAN DEFAULT false,
  source          TEXT DEFAULT 'manual',                -- manual, booking, import
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- RANDEVULAR (Appointments)
-- ==========================================
CREATE TYPE appointment_status AS ENUM (
  'pending',        -- Onay bekliyor
  'confirmed',      -- Onaylandı
  'in_progress',    -- Devam ediyor
  'completed',      -- Tamamlandı
  'cancelled',      -- İptal edildi
  'no_show'         -- Gelmedi
);

CREATE TABLE appointments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  staff_id        UUID REFERENCES staff(id) ON DELETE SET NULL,
  service_id      UUID REFERENCES services(id) ON DELETE SET NULL,
  status          appointment_status DEFAULT 'pending',
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  duration        INT NOT NULL,                         -- dakika
  price           DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'TRY',
  deposit_amount  DECIMAL(10,2) DEFAULT 0,
  deposit_paid    BOOLEAN DEFAULT false,
  notes           TEXT,                                 -- müşteri notu
  internal_notes  TEXT,                                 -- personel notu
  source          TEXT DEFAULT 'online',                -- online, manual, phone, walkin
  cancellation_reason TEXT,
  cancelled_at    TIMESTAMPTZ,
  cancelled_by    TEXT,                                 -- customer, staff, system
  reminder_sent   BOOLEAN DEFAULT false,
  followup_sent   BOOLEAN DEFAULT false,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Composite index for availability queries
CREATE INDEX idx_appointments_availability
  ON appointments (tenant_id, staff_id, start_time, end_time)
  WHERE status NOT IN ('cancelled', 'no_show');

-- ==========================================
-- ÖDEMELER (Payments)
-- ==========================================
CREATE TYPE payment_status AS ENUM (
  'pending', 'completed', 'failed', 'refunded', 'partial_refund'
);

CREATE TYPE payment_type AS ENUM (
  'deposit', 'full_payment', 'remaining', 'refund', 'subscription'
);

CREATE TABLE payments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  amount          DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'TRY',
  type            payment_type NOT NULL,
  status          payment_status DEFAULT 'pending',
  payment_method  TEXT,                                 -- card, cash, bank_transfer
  provider        TEXT,                                 -- stripe, iyzico, manual
  provider_id     TEXT,                                 -- Stripe/Iyzico transaction ID
  refund_amount   DECIMAL(10,2),
  refund_reason   TEXT,
  receipt_url     TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- BİLDİRİMLER LOG (Notification Log)
-- ==========================================
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'push');
CREATE TYPE notification_type AS ENUM (
  'appointment_confirmation',
  'appointment_reminder',
  'appointment_cancelled',
  'appointment_rescheduled',
  'deposit_request',
  'deposit_received',
  'followup',
  'no_show',
  'welcome',
  'custom'
);

CREATE TABLE notifications (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
  channel         notification_channel NOT NULL,
  type            notification_type NOT NULL,
  recipient       TEXT NOT NULL,                        -- email veya telefon
  subject         TEXT,
  body            TEXT,
  status          TEXT DEFAULT 'pending',               -- pending, sent, failed, delivered
  sent_at         TIMESTAMPTZ,
  error           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ABONELİKLER (Platform Subscriptions)
-- ==========================================
CREATE TABLE subscriptions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL,                        -- solo, team, enterprise
  billing_cycle   TEXT NOT NULL DEFAULT 'monthly',     -- monthly, yearly
  amount          DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'TRY',
  status          TEXT DEFAULT 'active',                -- active, past_due, cancelled, paused
  provider        TEXT NOT NULL,                        -- stripe, iyzico
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at       TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AKTİVİTE LOG (Audit Trail)
-- ==========================================
CREATE TABLE activity_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,                        -- created, updated, deleted, cancelled, etc.
  entity_type     TEXT NOT NULL,                        -- appointment, customer, service, etc.
  entity_id       UUID,
  changes         JSONB,                                -- {field: {old, new}}
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 Row Level Security (RLS)

```sql
-- Tüm tablolar tenant_id bazlı izolasyon sağlar
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Örnek Policy: Kullanıcı sadece kendi tenant'ının verilerini görebilir
CREATE POLICY tenant_isolation ON appointments
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Public booking endpoint için ayrı policy
CREATE POLICY public_booking ON tenants
  FOR SELECT USING (true);  -- Slug ile erişim

CREATE POLICY public_services ON services
  FOR SELECT USING (is_active = true);
```

### 3.3 Veritabanı Fonksiyonları

```sql
-- Müsaitlik kontrolü
CREATE OR REPLACE FUNCTION check_availability(
  p_tenant_id UUID,
  p_staff_id UUID,
  p_start TIMESTAMPTZ,
  p_end TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM appointments
    WHERE tenant_id = p_tenant_id
      AND staff_id = p_staff_id
      AND status NOT IN ('cancelled', 'no_show')
      AND tstzrange(start_time, end_time) && tstzrange(p_start, p_end)
  );
END;
$$ LANGUAGE plpgsql;

-- Randevu sonrası müşteri istatistiklerini güncelle
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE customers SET
      total_visits = total_visits + 1,
      total_spent = total_spent + NEW.price,
      last_visit_at = NEW.end_time,
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;

  IF NEW.status = 'no_show' AND (OLD.status IS NULL OR OLD.status != 'no_show') THEN
    UPDATE customers SET
      no_show_count = no_show_count + 1,
      updated_at = NOW()
    WHERE id = NEW.customer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_customer_stats
  AFTER UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats();
```

---

## 4. FİYATLANDIRMA PLANLARI (Pricing)

### 4.1 Global Fiyatlandırma (USD)

| Özellik | Solo ($29/ay) | Team ($49/ay) | Business ($79/ay) | Enterprise ($149/ay) |
|---------|---------------|---------------|--------------------|-----------------------|
| Personel Sayısı | 1 | 5 | 15 | Sınırsız |
| Lokasyon | 1 | 1 | 3 | Sınırsız |
| Aylık Randevu | 200 | 500 | 2.000 | Sınırsız |
| Müşteri Kayıt | 500 | 2.000 | 10.000 | Sınırsız |
| Online Booking | ✓ | ✓ | ✓ | ✓ |
| E-posta Hatırlatma | ✓ | ✓ | ✓ | ✓ |
| SMS Hatırlatma | — | ✓ | ✓ | ✓ |
| WhatsApp Entegrasyon | — | — | ✓ | ✓ |
| Depozito Alma | — | ✓ | ✓ | ✓ |
| Raporlar (Temel) | ✓ | ✓ | ✓ | ✓ |
| Raporlar (Gelişmiş) | — | — | ✓ | ✓ |
| Müşteri Portalı | — | ✓ | ✓ | ✓ |
| Custom Branding | — | — | ✓ | ✓ |
| API Erişimi | — | — | — | ✓ |
| Öncelikli Destek | — | — | ✓ | ✓ |
| Dedicated Manager | — | — | — | ✓ |

### 4.2 Türkiye Fiyatlandırma (TRY)

| Özellik | Solo (₺899/ay) | Takım (₺1.499/ay) | İşletme (₺2.499/ay) | Kurumsal (₺4.999/ay) |
|---------|-----------------|---------------------|----------------------|------------------------|
| Personel Sayısı | 1 | 5 | 15 | Sınırsız |
| Lokasyon | 1 | 1 | 3 | Sınırsız |
| Aylık Randevu | 200 | 500 | 2.000 | Sınırsız |
| Müşteri Kayıt | 500 | 2.000 | 10.000 | Sınırsız |
| Online Booking | ✓ | ✓ | ✓ | ✓ |
| E-posta Hatırlatma | ✓ | ✓ | ✓ | ✓ |
| SMS Hatırlatma | — | ✓ | ✓ | ✓ |
| WhatsApp Entegrasyon | — | — | ✓ | ✓ |
| Depozito Alma | — | ✓ | ✓ | ✓ |
| Raporlar (Temel) | ✓ | ✓ | ✓ | ✓ |
| Raporlar (Gelişmiş) | — | — | ✓ | ✓ |
| Müşteri Portalı | — | ✓ | ✓ | ✓ |
| Özel Markalama | — | — | ✓ | ✓ |
| API Erişimi | — | — | — | ✓ |
| Öncelikli Destek | — | — | ✓ | ✓ |
| Özel Hesap Yöneticisi | — | — | — | ✓ |

### 4.3 Yıllık İndirim

- Global: %20 indirim (yıllık ödeme)
- Türkiye: %20 indirim (yıllık ödeme)
- 14 gün ücretsiz deneme (tüm planlar)

### 4.4 Fiyatlandırma Constants (Code)

```typescript
// packages/shared/src/constants/pricing.ts

export const PRICING = {
  global: {
    currency: 'USD',
    symbol: '$',
    plans: {
      solo:       { monthly: 29,  yearly: 278,  staffLimit: 1,  locationLimit: 1,  appointmentLimit: 200,   customerLimit: 500 },
      team:       { monthly: 49,  yearly: 470,  staffLimit: 5,  locationLimit: 1,  appointmentLimit: 500,   customerLimit: 2000 },
      business:   { monthly: 79,  yearly: 758,  staffLimit: 15, locationLimit: 3,  appointmentLimit: 2000,  customerLimit: 10000 },
      enterprise: { monthly: 149, yearly: 1430, staffLimit: -1, locationLimit: -1, appointmentLimit: -1,    customerLimit: -1 },
    },
  },
  tr: {
    currency: 'TRY',
    symbol: '₺',
    plans: {
      solo:       { monthly: 899,   yearly: 8630,  staffLimit: 1,  locationLimit: 1,  appointmentLimit: 200,   customerLimit: 500 },
      team:       { monthly: 1499,  yearly: 14390, staffLimit: 5,  locationLimit: 1,  appointmentLimit: 500,   customerLimit: 2000 },
      business:   { monthly: 2499,  yearly: 23990, staffLimit: 15, locationLimit: 3,  appointmentLimit: 2000,  customerLimit: 10000 },
      enterprise: { monthly: 4999,  yearly: 47990, staffLimit: -1, locationLimit: -1, appointmentLimit: -1,    customerLimit: -1 },
    },
  },
  trialDays: 14,
  yearlyDiscount: 0.20,
} as const;
```

---

## 5. OTOMASYON SİSTEMİ (Automation Pipeline)

### 5.1 Otomatik Hatırlatmalar (Automated Reminders)

```
┌──────────────────────────────────────────────────────────────┐
│                    OTOMASYON AKIŞI                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Randevu Oluşturuldu]                                       │
│       │                                                      │
│       ▼                                                      │
│  ┌─────────────────┐                                         │
│  │ Onay Mesajı Gönder │──► Email + SMS (plan'a göre)        │
│  └────────┬────────┘                                         │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────┐                             │
│  │ Hatırlatma #1 Zamanla (24h) │──► Bull MQ delayed job     │
│  └────────┬────────────────────┘                             │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────┐                             │
│  │ Hatırlatma #2 Zamanla (2h)  │──► Bull MQ delayed job     │
│  └────────┬────────────────────┘                             │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                │
│  │ Randevu Saati    │───►│ Tamamlandı mı?   │                │
│  └──────────────────┘    └───────┬──────────┘                │
│                                  │                           │
│                    ┌─────────────┼─────────────┐             │
│                    ▼             ▼              ▼             │
│              [Tamamlandı]   [Gelmedi]     [İptal Edildi]     │
│                    │             │              │             │
│                    ▼             ▼              ▼             │
│             Takip Mesajı   No-Show İşle   İptal Bildirimi   │
│             (48h sonra)    Depozito Kes   Depozito İade?     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Job Tanımları

```typescript
// packages/api/src/jobs/queue.ts

import { Queue, Worker } from 'bullmq';
import { redis } from '../config/redis';

// Kuyruk tanımları
export const reminderQueue = new Queue('reminders', { connection: redis });
export const notificationQueue = new Queue('notifications', { connection: redis });
export const followupQueue = new Queue('followups', { connection: redis });
export const reportQueue = new Queue('reports', { connection: redis });
export const subscriptionQueue = new Queue('subscriptions', { connection: redis });

// Randevu oluşturulduğunda tetiklenen otomasyonlar
export async function scheduleAppointmentAutomations(appointment: Appointment) {
  const { id, start_time, tenant_id } = appointment;
  const startDate = new Date(start_time);

  // 1. Onay bildirimi (hemen)
  await notificationQueue.add('confirmation', {
    appointmentId: id,
    tenantId: tenant_id,
    type: 'appointment_confirmation',
  });

  // 2. 24 saat öncesi hatırlatma
  const reminder24h = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
  if (reminder24h > new Date()) {
    await reminderQueue.add('reminder-24h', {
      appointmentId: id,
      tenantId: tenant_id,
      type: 'reminder_24h',
    }, {
      delay: reminder24h.getTime() - Date.now(),
      jobId: `reminder-24h-${id}`,
      removeOnComplete: true,
    });
  }

  // 3. 2 saat öncesi hatırlatma
  const reminder2h = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);
  if (reminder2h > new Date()) {
    await reminderQueue.add('reminder-2h', {
      appointmentId: id,
      tenantId: tenant_id,
      type: 'reminder_2h',
    }, {
      delay: reminder2h.getTime() - Date.now(),
      jobId: `reminder-2h-${id}`,
      removeOnComplete: true,
    });
  }

  // 4. Takip mesajı (48 saat sonra)
  const followupTime = new Date(startDate.getTime() + 48 * 60 * 60 * 1000);
  await followupQueue.add('followup', {
    appointmentId: id,
    tenantId: tenant_id,
  }, {
    delay: followupTime.getTime() - Date.now(),
    jobId: `followup-${id}`,
    removeOnComplete: true,
  });
}

// İptal durumunda kuyruktaki job'ları temizle
export async function cancelAppointmentAutomations(appointmentId: string) {
  await reminderQueue.remove(`reminder-24h-${appointmentId}`);
  await reminderQueue.remove(`reminder-2h-${appointmentId}`);
  await followupQueue.remove(`followup-${appointmentId}`);
}
```

### 5.3 No-Show Otomasyonu

```typescript
// Her gün gece 00:30'da çalışır
// Geçen günün randevularını kontrol eder
// "confirmed" durumundaki randevuları "no_show" olarak işaretler
// Depozito varsa iade değil, kazanç olarak işaretlenir
// Müşteriye no-show bildirimi gönderilir
// Müşteri no_show_count artırılır
```

### 5.4 Abonelik Kontrol Otomasyonu

```typescript
// Her gün 03:00'te çalışır
// Trial süresi dolan tenant'ları kontrol eder
// Ödeme başarısız olan abonelikleri "past_due" yapar
// 7 gün sonra hala ödenmediyse "cancelled" yapar
// Tenant'a uyarı e-postaları gönderir (3 gün kala, 1 gün kala, gün dolduğunda)
```

### 5.5 Haftalık Özet Raporu

```typescript
// Her Pazartesi 09:00'da çalışır
// Geçen haftanın istatistiklerini derler:
//   - Toplam randevu sayısı
//   - Tamamlanan / İptal / No-show oranları
//   - Toplam gelir
//   - Yeni müşteri sayısı
//   - En popüler hizmet
//   - En yoğun gün/saat
// HTML e-posta olarak tenant sahibine gönderilir
```

---

## 6. API ENDPOINT'LERİ

### 6.1 Authentication

```
POST   /api/auth/register          # Yeni işletme kaydı
POST   /api/auth/login             # Giriş
POST   /api/auth/logout            # Çıkış
POST   /api/auth/refresh           # Token yenile
POST   /api/auth/forgot-password   # Şifre sıfırlama isteği
POST   /api/auth/reset-password    # Şifre sıfırla
GET    /api/auth/me                # Mevcut kullanıcı bilgisi
```

### 6.2 Tenant / İşletme

```
GET    /api/tenant                 # Kendi işletme bilgisi
PUT    /api/tenant                 # İşletme güncelle
PUT    /api/tenant/branding        # Marka ayarları
PUT    /api/tenant/booking         # Randevu ayarları
PUT    /api/tenant/notifications   # Bildirim ayarları
POST   /api/tenant/logo            # Logo yükle
```

### 6.3 Hizmetler (Services)

```
GET    /api/services               # Liste (filtreleme + sayfalama)
GET    /api/services/:id           # Tekil
POST   /api/services               # Oluştur
PUT    /api/services/:id           # Güncelle
DELETE /api/services/:id           # Sil (soft delete)
PUT    /api/services/reorder       # Sıralama güncelle

GET    /api/service-categories     # Kategori listesi
POST   /api/service-categories     # Kategori oluştur
PUT    /api/service-categories/:id # Kategori güncelle
DELETE /api/service-categories/:id # Kategori sil
```

### 6.4 Personel (Staff)

```
GET    /api/staff                  # Liste
GET    /api/staff/:id              # Tekil
POST   /api/staff                  # Oluştur
PUT    /api/staff/:id              # Güncelle
DELETE /api/staff/:id              # Sil

GET    /api/staff/:id/schedule     # Çalışma saatleri
PUT    /api/staff/:id/schedule     # Çalışma saatleri güncelle
GET    /api/staff/:id/services     # Sunduğu hizmetler
PUT    /api/staff/:id/services     # Hizmet eşleştirme güncelle
```

### 6.5 Müşteriler (Customers)

```
GET    /api/customers              # Liste (arama + filtreleme + sayfalama)
GET    /api/customers/:id          # Tekil (geçmiş dahil)
POST   /api/customers              # Oluştur
PUT    /api/customers/:id          # Güncelle
DELETE /api/customers/:id          # Sil (soft delete)

GET    /api/customers/:id/appointments  # Müşteri randevu geçmişi
GET    /api/customers/:id/payments      # Müşteri ödeme geçmişi
POST   /api/customers/:id/notes         # Not ekle
POST   /api/customers/import            # CSV import
GET    /api/customers/export            # CSV export
```

### 6.6 Randevular (Appointments)

```
GET    /api/appointments           # Liste (tarih, durum, personel filtreli)
GET    /api/appointments/:id       # Tekil
POST   /api/appointments           # Oluştur (manual)
PUT    /api/appointments/:id       # Güncelle
PUT    /api/appointments/:id/status # Durum değiştir (confirm, complete, cancel, noshow)
PUT    /api/appointments/:id/reschedule # Yeniden planla

GET    /api/appointments/calendar  # Takvim görünümü (gün/hafta/ay)
GET    /api/appointments/today     # Bugünkü randevular
GET    /api/appointments/upcoming  # Gelecek randevular
```

### 6.7 Ödemeler (Payments)

```
GET    /api/payments               # Liste
GET    /api/payments/:id           # Tekil
POST   /api/payments               # Manuel ödeme kaydı
POST   /api/payments/:id/refund    # İade

POST   /api/payments/create-intent      # Stripe Payment Intent
POST   /api/payments/iyzico/init        # Iyzico ödeme başlat
```

### 6.8 Public Booking API (No Auth Required)

```
GET    /api/book/:slug             # İşletme public profil
GET    /api/book/:slug/services    # Mevcut hizmetler
GET    /api/book/:slug/staff       # Mevcut personel
GET    /api/book/:slug/availability # Müsait slotlar (tarih + personel + hizmet)
POST   /api/book/:slug/create      # Randevu oluştur
POST   /api/book/:slug/deposit     # Depozito öde
GET    /api/book/:slug/confirm/:appointmentId  # Randevu onay sayfası
```

### 6.9 Raporlar (Reports)

```
GET    /api/reports/overview       # Genel bakış (tarih aralığı)
GET    /api/reports/revenue        # Gelir raporu
GET    /api/reports/appointments   # Randevu istatistikleri
GET    /api/reports/customers      # Müşteri analizi
GET    /api/reports/staff          # Personel performansı
GET    /api/reports/services       # Hizmet popülerliği
```

### 6.10 Webhooks

```
POST   /api/webhooks/stripe        # Stripe webhook handler
POST   /api/webhooks/iyzico        # Iyzico callback handler
```

### 6.11 Abonelik (Subscription)

```
GET    /api/subscription           # Mevcut plan bilgisi
POST   /api/subscription/checkout  # Ödeme sayfasına yönlendir
PUT    /api/subscription/change    # Plan değiştir
POST   /api/subscription/cancel    # İptal et
GET    /api/subscription/invoices  # Fatura geçmişi
POST   /api/subscription/portal    # Stripe Customer Portal açma
```

---

## 7. TASARIM SİSTEMİ (Design System)

### 7.1 Felsefe

> **Premium Minimalizm** — Her piksel bir amaca hizmet eder. Gereksiz süsleme yok, ama her detay zarif.
> Koyu tonlar güven ve profesyonellik hissi verir. Beyaz alan nefes aldırır. Animasyonlar hayat katar.

### 7.2 Renk Paleti

```css
:root {
  /* ── Temel Siyah/Gri Skalası ── */
  --color-black:        #0a0a0a;
  --color-charcoal:     #1a1a1a;
  --color-graphite:     #2a2a2a;
  --color-slate:        #3a3a3a;
  --color-steel:        #4a4a4a;
  --color-gray-600:     #6b6b6b;
  --color-gray-500:     #8a8a8a;
  --color-gray-400:     #a0a0a0;
  --color-gray-300:     #c0c0c0;
  --color-gray-200:     #e0e0e0;
  --color-gray-100:     #f0f0f0;
  --color-gray-50:      #f7f7f7;
  --color-white:        #fafafa;
  --color-pure-white:   #ffffff;

  /* ── Vurgu Renkleri ── */
  --color-accent:       #e5e5e5;         /* Gümüş vurgu */
  --color-accent-hover: #d4d4d4;
  --color-success:      #22c55e;
  --color-warning:      #eab308;
  --color-error:        #ef4444;
  --color-info:         #6b7280;

  /* ── Yüzeyler (Light Mode) ── */
  --surface-primary:    var(--color-pure-white);
  --surface-secondary:  var(--color-gray-50);
  --surface-elevated:   var(--color-pure-white);
  --surface-overlay:    rgba(10, 10, 10, 0.6);

  /* ── Yüzeyler (Dark Mode — Varsayılan) ── */
  --surface-primary:    var(--color-black);
  --surface-secondary:  var(--color-charcoal);
  --surface-elevated:   var(--color-graphite);
  --surface-overlay:    rgba(0, 0, 0, 0.7);

  /* ── Metin ── */
  --text-primary:       var(--color-gray-50);
  --text-secondary:     var(--color-gray-400);
  --text-muted:         var(--color-gray-500);
  --text-inverse:       var(--color-black);

  /* ── Kenarlıklar ── */
  --border-default:     var(--color-graphite);
  --border-hover:       var(--color-slate);
  --border-active:      var(--color-gray-400);

  /* ── Gölgeler ── */
  --shadow-sm:    0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md:    0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg:    0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow:  0 0 20px rgba(255, 255, 255, 0.05);

  /* ── Blur ── */
  --blur-sm:      8px;
  --blur-md:      16px;
  --blur-lg:      32px;
}
```

### 7.3 Tipografi

```css
/* ── Fontlar ── */
/* Primary: Satoshi (Display + UI) — fontshare.com */
/* Secondary: General Sans (Body) — fontshare.com */

@font-face {
  font-family: 'Satoshi';
  src: url('/fonts/Satoshi-Variable.woff2') format('woff2');
  font-weight: 300 900;
  font-display: swap;
}

@font-face {
  font-family: 'General Sans';
  src: url('/fonts/GeneralSans-Variable.woff2') format('woff2');
  font-weight: 300 700;
  font-display: swap;
}

:root {
  --font-display:     'Satoshi', system-ui, sans-serif;
  --font-body:        'General Sans', system-ui, sans-serif;
  --font-mono:        'JetBrains Mono', monospace;

  /* ── Ölçüler ── */
  --text-xs:    0.75rem;     /* 12px */
  --text-sm:    0.875rem;    /* 14px */
  --text-base:  1rem;        /* 16px */
  --text-lg:    1.125rem;    /* 18px */
  --text-xl:    1.25rem;     /* 20px */
  --text-2xl:   1.5rem;      /* 24px */
  --text-3xl:   1.875rem;    /* 30px */
  --text-4xl:   2.25rem;     /* 36px */
  --text-5xl:   3rem;        /* 48px */
  --text-6xl:   3.75rem;     /* 60px */
  --text-hero:  clamp(2.5rem, 6vw, 5rem);

  /* ── Satır Yükseklikleri ── */
  --leading-tight:    1.2;
  --leading-normal:   1.5;
  --leading-relaxed:  1.75;

  /* ── Letter Spacing ── */
  --tracking-tighter: -0.05em;
  --tracking-tight:   -0.025em;
  --tracking-normal:  0;
  --tracking-wide:    0.05em;
  --tracking-wider:   0.1em;
  --tracking-widest:  0.2em;
}
```

### 7.4 Spacing & Layout

```css
:root {
  --space-1:    0.25rem;    /* 4px */
  --space-2:    0.5rem;     /* 8px */
  --space-3:    0.75rem;    /* 12px */
  --space-4:    1rem;       /* 16px */
  --space-5:    1.25rem;    /* 20px */
  --space-6:    1.5rem;     /* 24px */
  --space-8:    2rem;       /* 32px */
  --space-10:   2.5rem;     /* 40px */
  --space-12:   3rem;       /* 48px */
  --space-16:   4rem;       /* 64px */
  --space-20:   5rem;       /* 80px */
  --space-24:   6rem;       /* 96px */

  --radius-sm:    6px;
  --radius-md:    10px;
  --radius-lg:    16px;
  --radius-xl:    24px;
  --radius-full:  9999px;

  /* ── Layout ── */
  --sidebar-width:      260px;
  --sidebar-collapsed:  72px;
  --topbar-height:      64px;
  --max-content-width:  1280px;
}
```

### 7.5 Animasyon & Efektler

```css
:root {
  /* ── Easing ── */
  --ease-out-expo:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart:   cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ── Süre ── */
  --duration-fast:    150ms;
  --duration-normal:  300ms;
  --duration-slow:    500ms;
  --duration-slower:  700ms;
}

/* ── Temel Animasyonlar ── */

/* Sayfa geçişi — slide up + fade */
@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger reveal — liste elemanları */
@keyframes staggerIn {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Kart hover — hafif yükseltme */
@keyframes cardLift {
  to {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

/* Shimmer — loading skeleton */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}

/* Pulse glow — aktif/canlı durum */
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.1); }
  50%      { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); }
}

/* Counter — sayı animasyonu */
@keyframes countUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Grain overlay — texture efekti */
@keyframes grain {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5%, -10%); }
  30% { transform: translate(3%, -15%); }
  50% { transform: translate(12%, 9%); }
  70% { transform: translate(9%, 4%); }
  90% { transform: translate(-1%, 7%); }
}
```

### 7.6 Framer Motion Presets

```typescript
// packages/web/src/config/motion.ts

export const motionPresets = {
  // Sayfa geçişi
  page: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },

  // Liste elemanları (stagger parent)
  staggerParent: {
    animate: {
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  },

  // Liste elemanları (stagger child)
  staggerChild: {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },

  // Modal / Drawer
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },

  modal: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97, y: 5 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },

  // Tab switch
  tab: {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.2 },
  },

  // Tooltip
  tooltip: {
    initial: { opacity: 0, y: 4, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.15, ease: 'easeOut' },
  },

  // Kart hover
  cardHover: {
    whileHover: {
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  },

  // Buton press
  buttonPress: {
    whileTap: { scale: 0.97 },
    transition: { duration: 0.1 },
  },

  // Sayfa yükleme hero animasyonu
  heroReveal: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
  },

  // Sayısal değer animasyonu
  counter: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};
```

### 7.7 Komponent Tasarım Kuralları

```
Button Variants:
├── Primary:    bg-white text-black (dark mode) / bg-black text-white (light mode)
│               Hover: slight opacity change + scale(0.98)
│               Active: scale(0.96)
├── Secondary:  bg-transparent border-gray-700 text-gray-200
│               Hover: bg-gray-800
├── Ghost:      bg-transparent text-gray-400
│               Hover: text-white bg-white/5
├── Danger:     bg-transparent text-red-500 border-red-500/30
│               Hover: bg-red-500/10
└── Size:       sm (h-8 text-xs) | md (h-10 text-sm) | lg (h-12 text-base)

Card:
├── bg: var(--surface-elevated)
├── border: 1px solid var(--border-default)
├── border-radius: var(--radius-lg)
├── padding: var(--space-5)
├── hover: border-color var(--border-hover) + translateY(-2px)
└── transition: all 0.2s var(--ease-out-expo)

Input:
├── bg: var(--surface-secondary)
├── border: 1px solid transparent
├── border-radius: var(--radius-md)
├── focus: border-color var(--color-gray-400) + ring(2px, white/5%)
├── error: border-color var(--color-error)
└── padding: var(--space-3) var(--space-4)

Sidebar:
├── bg: var(--color-charcoal)
├── width: var(--sidebar-width)
├── border-right: 1px solid var(--border-default)
├── nav-item: px-4 py-2.5 rounded-lg text-sm
├── nav-item-active: bg-white/5 text-white font-medium
├── nav-item-hover: bg-white/[0.03] text-gray-200
└── collapse animation: width 0.3s ease-out-expo

Table:
├── header: text-xs uppercase tracking-wider text-gray-500 font-medium
├── row: border-b border-gray-800/50
├── row-hover: bg-white/[0.02]
├── cell: py-3.5 px-4 text-sm
└── striped: odd rows bg-white/[0.01]

Badge / Status:
├── confirmed:  bg-green-500/10 text-green-400 border-green-500/20
├── pending:    bg-yellow-500/10 text-yellow-400 border-yellow-500/20
├── cancelled:  bg-red-500/10 text-red-400 border-red-500/20
├── completed:  bg-blue-500/10 text-blue-400 border-blue-500/20
└── no_show:    bg-gray-500/10 text-gray-400 border-gray-500/20

Toast:
├── position: bottom-right
├── animation: slide-in-from-right + fade
├── auto-dismiss: 5s
├── success: left-border green
├── error: left-border red
└── info: left-border gray
```

### 7.8 Özel UI Efektleri

```
1. Grain Overlay:
   - body::after ile noise texture
   - opacity: 0.015
   - mix-blend-mode: overlay
   - Performans: will-change: transform

2. Glassmorphism Cards:
   - backdrop-filter: blur(16px)
   - background: rgba(26, 26, 26, 0.8)
   - border: 1px solid rgba(255, 255, 255, 0.06)
   - Sadece elevated kartlarda kullan

3. Gradient Mesh (Landing Hero):
   - Radial gradient arka plan
   - Çok hafif: opacity 0.3
   - Renkler: koyu mor → koyu mavi → siyah
   - Animasyonlu: yavaş pulse

4. Glow Effect (CTA Button):
   - box-shadow: 0 0 30px rgba(255,255,255,0.1)
   - Hover'da intensify
   - Sadece primary CTA'da kullan

5. Scroll-Triggered Reveals:
   - IntersectionObserver ile
   - Threshold: 0.2
   - Bir kez tetikle (once: true)
   - Eleman: fade-up + stagger

6. Skeleton Loading:
   - Shimmer efekti
   - Gradient: gray-800 → gray-700 → gray-800
   - animation: shimmer 1.5s infinite
   - Gerçek content boyutlarını taklit et

7. Cursor Glow (Landing):
   - Mouse takip eden hafif glow
   - radial-gradient, mouse pozisyonunda
   - opacity: 0.03
   - Sadece desktop + landing page

8. Number Counter Animation:
   - Dashboard'da stats
   - 0'dan hedef değere animasyon
   - requestAnimationFrame ile
   - Easing: ease-out-expo
   - Süre: 1.5s
```

---

## 8. i18n STRATEJİSİ (Internationalization)

### 8.1 Yapı

```typescript
// react-i18next kullanılacak
// Namespace bazlı JSON dosyaları
// Lazy loading: sayfa bazlı chunk

// Dil Algılama Sırası:
// 1. URL parameter (?lang=en)
// 2. Tenant ayarı (tenant.locale)
// 3. LocalStorage
// 4. Browser navigator.language
// 5. Fallback: 'tr'

// Public Booking Page:
// URL'de dil belirlenebilir: /book/acme-kuafor?lang=en
// Tenant varsayılan diline göre açılır
// Kullanıcı değiştirebilir
```

### 8.2 Örnek Çeviri Dosyası

```json
// locales/tr/common.json
{
  "app_name": "Appointify",
  "nav": {
    "dashboard": "Gösterge Paneli",
    "appointments": "Randevular",
    "customers": "Müşteriler",
    "services": "Hizmetler",
    "staff": "Personel",
    "payments": "Ödemeler",
    "settings": "Ayarlar",
    "reports": "Raporlar"
  },
  "actions": {
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "edit": "Düzenle",
    "add": "Ekle",
    "search": "Ara",
    "filter": "Filtrele",
    "export": "Dışa Aktar",
    "import": "İçe Aktar",
    "confirm": "Onayla",
    "back": "Geri"
  },
  "status": {
    "pending": "Beklemede",
    "confirmed": "Onaylandı",
    "in_progress": "Devam Ediyor",
    "completed": "Tamamlandı",
    "cancelled": "İptal Edildi",
    "no_show": "Gelmedi"
  },
  "time": {
    "today": "Bugün",
    "tomorrow": "Yarın",
    "this_week": "Bu Hafta",
    "this_month": "Bu Ay",
    "minutes": "dakika",
    "hours": "saat"
  }
}
```

---

## 9. ÖDEME ENTEGRASYONLARı

### 9.1 Ödeme Akışı

```
Müşteri Randevu Oluşturma:
─────────────────────────
1. Hizmet + Personel + Tarih/Saat seçimi
2. Bilgi formu doldurma
3. Depozito gerekli mi? (Tenant ayarına göre)
   ├── Evet → Ödeme ekranı
   │         ├── TR müşteri → Iyzico (Kredi Kartı / Sanal POS)
   │         └── Global müşteri → Stripe (Card / Apple Pay / Google Pay)
   └── Hayır → Direkt onay

Platform Abonelik:
──────────────────
1. Tenant fiyatlandırma sayfası
2. Plan seçimi
3. Ülke tespiti (IP / tenant.country)
   ├── TR → Iyzico abonelik
   └── Global → Stripe Subscription
4. Webhook ile durum takibi
```

### 9.2 Stripe Entegrasyonu

```typescript
// Payment Intent (depozito almak için)
// Checkout Session (abonelik için)
// Customer Portal (abonelik yönetimi)
// Webhook Events:
//   - payment_intent.succeeded
//   - payment_intent.payment_failed
//   - customer.subscription.created
//   - customer.subscription.updated
//   - customer.subscription.deleted
//   - invoice.payment_succeeded
//   - invoice.payment_failed
```

### 9.3 Iyzico Entegrasyonu (Türkiye)

```typescript
// Iyzico Checkout Form (depozito)
// Iyzico Subscription API (abonelik)
// Callback URL ile sonuç alma
// 3D Secure zorunlu
// Taksit desteği (abonelik için)
// Events:
//   - Ödeme başarılı
//   - Ödeme başarısız
//   - Abonelik yenilendi
//   - Abonelik iptal edildi
```

---

## 10. GÜVENLİK (Security)

### 10.1 Güvenlik Katmanları

```
1. Supabase RLS:
   - Tüm tablolarda tenant_id bazlı izolasyon
   - Service role key sadece backend'de

2. API Güvenliği:
   - Helmet.js (Security Headers)
   - CORS whitelist
   - Rate limiting (IP bazlı + tenant bazlı)
   - JWT token (access + refresh)
   - Input validation (Zod)
   - SQL injection koruması (Supabase parameterized queries)
   - XSS koruması (DOMPurify + CSP)

3. Ödeme Güvenliği:
   - PCI DSS uyumlu (Stripe/Iyzico handles card data)
   - Webhook imza doğrulama
   - Idempotency key

4. Veri Güvenliği:
   - Hassas veri şifreleme (AES-256)
   - HTTPS zorunlu (Caddy auto-SSL)
   - Env variables (Docker secrets)
   - Supabase Storage signed URLs

5. Auth Güvenliği:
   - Supabase Auth (email + password)
   - Magic Link desteği
   - Password hashing (bcrypt via Supabase)
   - Session management (Redis)
   - Brute force koruması
```

---

## 11. DOCKER YAPILANDIRMASI

### 11.1 docker-compose.prod.yml

```yaml
version: '3.9'

services:
  proxy:
    image: caddy:2-alpine
    container_name: appointify-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
      - ./packages/web/dist:/srv/web
    networks:
      - appointify

  api:
    build:
      context: ./packages/api
      dockerfile: Dockerfile
    container_name: appointify-api
    restart: unless-stopped
    env_file: .env
    ports:
      - "4000:4000"
    depends_on:
      - redis
    volumes:
      - api_logs:/app/logs
    networks:
      - appointify

  redis:
    image: redis:7-alpine
    container_name: appointify-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - appointify

volumes:
  caddy_data:
  caddy_config:
  redis_data:
  api_logs:

networks:
  appointify:
    driver: bridge
```

### 11.2 Caddyfile

```
{$DOMAIN} {
  # Frontend
  handle {
    root * /srv/web
    try_files {path} /index.html
    file_server
    encode gzip
  }

  # API Proxy
  handle /api/* {
    reverse_proxy api:4000
  }

  # WebSocket (Supabase Realtime proxy if needed)
  handle /realtime/* {
    reverse_proxy api:4000
  }

  # Security Headers
  header {
    X-Content-Type-Options nosniff
    X-Frame-Options DENY
    X-XSS-Protection "1; mode=block"
    Referrer-Policy strict-origin-when-cross-origin
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
  }
}
```

### 11.3 API Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S appuser -u 1001
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src/templates ./dist/templates
USER appuser
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

---

## 12. DEPLOYMENT & CI/CD

### 12.1 Sunucu Gereksinimleri

```
Ubuntu Server 22.04+ LTS
CPU: 2+ core
RAM: 4GB+ (8GB önerilen)
Disk: 40GB+ SSD
Docker: 24.x+
Docker Compose: 2.x+
```

### 12.2 İlk Kurulum Scripti

```bash
#!/bin/bash
# scripts/setup-server.sh

# Docker kur
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Docker Compose kur
sudo apt install docker-compose-plugin -y

# Proje dizini oluştur
mkdir -p /opt/appointify
cd /opt/appointify

# .env dosyasını oluştur
cp .env.example .env
# → Değerleri düzenle

# Build & Start
docker compose -f docker-compose.prod.yml up -d --build

# Supabase migration'ları çalıştır
npx supabase db push
```

### 12.3 Backup Scripti

```bash
#!/bin/bash
# scripts/backup.sh
# Cron: 0 3 * * * /opt/appointify/scripts/backup.sh

BACKUP_DIR="/opt/backups/appointify"
DATE=$(date +%Y%m%d_%H%M)

mkdir -p $BACKUP_DIR

# Redis backup
docker exec appointify-redis redis-cli -a $REDIS_PASSWORD BGSAVE
docker cp appointify-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Supabase backup (pg_dump via Supabase CLI veya API)
# supabase db dump > $BACKUP_DIR/supabase_$DATE.sql

# Eski backup'ları temizle (30 günden eski)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

---

## 13. GELIŞTIRME ADIMLARI (Implementation Roadmap)

### Faz 1 — Temel Altyapı (Hafta 1-2)

```
□ Monorepo yapısını kur (packages/shared, web, api)
□ TypeScript + ESLint + Prettier konfigürasyonu
□ Supabase projesi oluştur + migration'ları yaz
□ Docker Compose (dev ortamı) hazırla
□ Backend boilerplate (Express + middleware)
□ Frontend boilerplate (Vite + React + Tailwind)
□ Design system kurulumu (CSS variables + fonts + motion presets)
□ i18n altyapısı (react-i18next + TR/EN dosyaları)
□ Supabase Auth entegrasyonu (register/login/logout)
□ Temel layout bileşenleri (Sidebar, TopBar, DashboardLayout)
```

### Faz 2 — Çekirdek Özellikler (Hafta 3-5)

```
□ Tenant CRUD + ayarlar
□ Hizmet yönetimi (CRUD + kategoriler)
□ Personel yönetimi (CRUD + çalışma saatleri)
□ Müşteri yönetimi (CRUD + arama + filtre)
□ Randevu oluşturma (manual — dashboard'dan)
□ Randevu takvim görünümü (gün/hafta/ay)
□ Randevu durum yönetimi (confirm/complete/cancel/noshow)
□ Müsaitlik motoru (availability.service.ts)
□ Dashboard — temel istatistikler
```

### Faz 3 — Public Booking (Hafta 6-7)

```
□ Public booking sayfası (/book/:slug)
□ Hizmet seçimi → Personel seçimi → Tarih/Saat seçimi
□ Müşteri bilgi formu
□ Booking onay sayfası
□ Booking başarı sayfası
□ Responsive mobile tasarım
□ Booking embed widget (iframe)
```

### Faz 4 — Otomasyon (Hafta 8-9)

```
□ Redis + Bull MQ kurulumu
□ E-posta şablonları (Handlebars)
□ Randevu onay bildirimi
□ Otomatik hatırlatmalar (24h + 2h)
□ İptal bildirimi
□ No-show otomasyonu
□ Takip mesajı (48h sonra)
□ SMS entegrasyonu (Netgsm veya Twilio)
□ Haftalık özet rapor e-postası
```

### Faz 5 — Ödemeler (Hafta 10-11)

```
□ Stripe entegrasyonu (global)
□ Iyzico entegrasyonu (TR)
□ Depozito alma akışı
□ Ödeme webhook handler'ları
□ Platform abonelik sistemi
□ Plan feature gating middleware
□ Fatura oluşturma
□ Stripe Customer Portal
```

### Faz 6 — Gelişmiş Özellikler (Hafta 12-14)

```
□ Müşteri portalı (müşteri self-service: geçmiş, gelecek randevular)
□ Gelişmiş raporlar (gelir, doluluk, no-show oranı, personel performans)
□ Dashboard grafikleri (Recharts)
□ Bildirim tercihleri (e-posta / SMS / WhatsApp)
□ WhatsApp Business API entegrasyonu
□ Google Calendar sync
□ Müşteri CSV import/export
□ Çoklu lokasyon desteği (Business+ planlar)
□ Custom branding (logo, renkler, booking sayfası)
□ Tatil/özel gün yönetimi
```

### Faz 7 — Polish & Launch (Hafta 15-16)

```
□ Landing page (Hero, Features, Pricing, FAQ, CTA)
□ SEO meta tags + OG images
□ Performance optimizasyonu (lazy load, code split, image opt)
□ Erişilebilirlik (a11y) kontrolü
□ Güvenlik auditi
□ E2E testler (Playwright)
□ Production Docker build
□ Domain + SSL + DNS ayarları
□ Monitoring (uptime + error tracking)
□ Soft launch + beta kullanıcılar
```

---

## 14. ENV DEĞİŞKENLERİ

```env
# .env.example

# ── App ──
NODE_ENV=production
PORT=4000
APP_URL=https://appointify.com
API_URL=https://appointify.com/api

# ── Supabase ──
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# ── Redis ──
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# ── JWT ──
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# ── Stripe (Global) ──
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── Iyzico (TR) ──
IYZICO_API_KEY=your_iyzico_api_key
IYZICO_SECRET_KEY=your_iyzico_secret
IYZICO_BASE_URL=https://api.iyzipay.com

# ── Email (SMTP) ──
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@appointify.com
SMTP_PASS=your_smtp_password
SMTP_FROM='"Appointify" <noreply@appointify.com>'

# ── SMS (Netgsm — TR) ──
NETGSM_USERCODE=your_code
NETGSM_PASSWORD=your_password
NETGSM_HEADER=APPOINTIFY

# ── SMS (Twilio — Global) ──
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# ── WhatsApp Business ──
WHATSAPP_API_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id

# ── Domain ──
DOMAIN=appointify.com
```

---

## 15. ÖNEMLİ NOTLAR (Critical Notes for Claude Code)

### Kodlama Standartları

```
1. Her dosya tek sorumluluk ilkesine uymalı
2. TypeScript strict mode aktif
3. Tüm API response'ları tutarlı format: { success, data, error, meta }
4. Hata mesajları TR/EN destekli
5. Tüm form inputları Zod ile validate edilmeli
6. Component'ler max 200 satır — büyükse parçala
7. Custom hook'lar ile iş mantığını component'ten ayır
8. Tailwind class'ları cn() helper ile merge et
9. Tüm renkler CSS variable üzerinden — hardcoded renk yok
10. Tüm metinler i18n key'i ile — hardcoded text yok
```

### Performans

```
1. React.lazy() ile sayfa bazlı code splitting
2. React Query ile server state cache (staleTime: 5min)
3. Resimler: Supabase Storage + sharp ile resize (webp)
4. API: Redis cache (popular queries: 60s TTL)
5. Debounce: arama inputları 300ms
6. Virtual scroll: 100+ satırlık listelerde
7. Bundle size < 200KB gzipped (initial)
```

### Erişilebilirlik (a11y)

```
1. Tüm interactive elementlerde keyboard navigation
2. ARIA labels tüm ikonlarda
3. Focus visible outline (custom)
4. Color contrast min 4.5:1 (WCAG AA)
5. Screen reader uyumlu form hataları
6. Skip to content link
```

---

## 16. KOMUT REFERANSLARı

```bash
# Geliştirme
npm run dev              # Frontend + Backend concurrent
npm run dev:web          # Sadece frontend
npm run dev:api          # Sadece backend

# Build
npm run build            # Tüm paketler
npm run build:web        # Frontend production build
npm run build:api        # Backend TypeScript compile

# Docker
docker compose up -d     # Dev ortamı başlat
docker compose -f docker-compose.prod.yml up -d --build  # Production

# Supabase
npx supabase migration new <name>   # Yeni migration oluştur
npx supabase db push                # Migration'ları uygula
npx supabase db reset               # DB sıfırla + seed

# Linting
npm run lint             # ESLint
npm run type-check       # TypeScript type kontrolü
npm run format           # Prettier

# Test
npm run test             # Unit testler
npm run test:e2e         # E2E testler (Playwright)
```

---

*Bu dosya Appointify projesinin tam kapsamlı teknik blueprint'idir. Claude Code ile VS Code üzerinden adım adım implemente edilecektir. Her faz bağımsız olarak çalıştırılabilir ve test edilebilir şekilde tasarlanmıştır.*
