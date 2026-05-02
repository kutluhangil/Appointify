-- 002_tenants.sql
-- Tenants (workspaces / businesses) — root of multi-tenant isolation.

CREATE TABLE IF NOT EXISTS public.tenants (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  industry        TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  country         TEXT NOT NULL DEFAULT 'TR',
  currency        TEXT NOT NULL DEFAULT 'TRY',
  timezone        TEXT NOT NULL DEFAULT 'Europe/Istanbul',
  locale          TEXT NOT NULL DEFAULT 'tr',
  logo_url        TEXT,
  cover_url       TEXT,
  website         TEXT,
  address         JSONB,
  social_links    JSONB DEFAULT '{}'::jsonb,
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
  }'::jsonb,
  notification_settings JSONB DEFAULT '{
    "email_enabled": true,
    "sms_enabled": false,
    "whatsapp_enabled": false,
    "reminder_hours": [24, 2],
    "followup_enabled": true,
    "followup_hours": 48
  }'::jsonb,
  branding        JSONB DEFAULT '{
    "primary_color": "#0a0a0a",
    "accent_color": "#6b7280",
    "font": "Satoshi"
  }'::jsonb,
  subscription_plan TEXT DEFAULT 'trial',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  iyzico_customer_id TEXT,
  trial_ends_at   TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_slug                ON public.tenants (slug);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON public.tenants (subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_country             ON public.tenants (country);

DROP TRIGGER IF EXISTS trg_tenants_set_updated_at ON public.tenants;
CREATE TRIGGER trg_tenants_set_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
