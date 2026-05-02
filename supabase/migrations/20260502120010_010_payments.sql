-- 010_payments.sql
-- Payment status / type enums + payments table.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM (
      'pending', 'completed', 'failed', 'refunded', 'partial_refund'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type') THEN
    CREATE TYPE public.payment_type AS ENUM (
      'deposit', 'full_payment', 'remaining', 'refund', 'subscription'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.payments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  appointment_id  UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  customer_id     UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount          DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'TRY',
  type            public.payment_type NOT NULL,
  status          public.payment_status DEFAULT 'pending',
  payment_method  TEXT,
  provider        TEXT,
  provider_id     TEXT,
  refund_amount   DECIMAL(10,2),
  refund_reason   TEXT,
  receipt_url     TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_tenant_id      ON public.payments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON public.payments (appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id    ON public.payments (customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status         ON public.payments (tenant_id, status);

DROP TRIGGER IF EXISTS trg_payments_set_updated_at ON public.payments;
CREATE TRIGGER trg_payments_set_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
