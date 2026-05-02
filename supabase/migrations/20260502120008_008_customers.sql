-- 008_customers.sql
-- Customers / contacts per tenant.

CREATE TABLE IF NOT EXISTS public.customers (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT,
  phone           TEXT NOT NULL,
  gender          TEXT,
  date_of_birth   DATE,
  notes           TEXT,
  tags            TEXT[] DEFAULT '{}',
  avatar_url      TEXT,
  total_visits    INT DEFAULT 0,
  total_spent     DECIMAL(10,2) DEFAULT 0,
  last_visit_at   TIMESTAMPTZ,
  no_show_count   INT DEFAULT 0,
  is_blocked      BOOLEAN DEFAULT false,
  source          TEXT DEFAULT 'manual',
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant_phone ON public.customers (tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_email ON public.customers (tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id    ON public.customers (tenant_id);

DROP TRIGGER IF EXISTS trg_customers_set_updated_at ON public.customers;
CREATE TRIGGER trg_customers_set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
