-- 009_appointments.sql
-- Appointment status enum + appointments table + availability composite index.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE public.appointment_status AS ENUM (
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'no_show'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.appointments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_id     UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  staff_id        UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  service_id      UUID REFERENCES public.services(id) ON DELETE SET NULL,
  status          public.appointment_status DEFAULT 'pending',
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ NOT NULL,
  duration        INT NOT NULL,
  price           DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'TRY',
  deposit_amount  DECIMAL(10,2) DEFAULT 0,
  deposit_paid    BOOLEAN DEFAULT false,
  notes           TEXT,
  internal_notes  TEXT,
  source          TEXT DEFAULT 'online',
  cancellation_reason TEXT,
  cancelled_at    TIMESTAMPTZ,
  cancelled_by    TEXT,
  reminder_sent   BOOLEAN DEFAULT false,
  followup_sent   BOOLEAN DEFAULT false,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id   ON public.appointments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON public.appointments (customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id    ON public.appointments (staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id  ON public.appointments (service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status      ON public.appointments (tenant_id, status);

-- Composite index for availability queries
CREATE INDEX IF NOT EXISTS idx_appointments_availability
  ON public.appointments (tenant_id, staff_id, start_time, end_time)
  WHERE status NOT IN ('cancelled', 'no_show');

DROP TRIGGER IF EXISTS trg_appointments_set_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
