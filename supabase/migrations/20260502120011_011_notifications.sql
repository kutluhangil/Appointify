-- 011_notifications.sql
-- Notification channel/type enums + notifications log table.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
    CREATE TYPE public.notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'push');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
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
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.notifications (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  customer_id     UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  channel         public.notification_channel NOT NULL,
  type            public.notification_type NOT NULL,
  recipient       TEXT NOT NULL,
  subject         TEXT,
  body            TEXT,
  status          TEXT DEFAULT 'pending',
  sent_at         TIMESTAMPTZ,
  error           TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_tenant_id      ON public.notifications (tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id ON public.notifications (appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id    ON public.notifications (customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status         ON public.notifications (tenant_id, status);
