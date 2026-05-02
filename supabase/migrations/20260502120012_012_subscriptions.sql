-- 012_subscriptions.sql
-- Platform subscriptions per tenant.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL,
  billing_cycle   TEXT NOT NULL DEFAULT 'monthly',
  amount          DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'TRY',
  status          TEXT DEFAULT 'active',
  provider        TEXT NOT NULL,
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at       TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant_id ON public.subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status    ON public.subscriptions (status);

DROP TRIGGER IF EXISTS trg_subscriptions_set_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
