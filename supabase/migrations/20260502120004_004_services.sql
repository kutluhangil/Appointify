-- 004_services.sql
-- Service catalog: categories + services.

CREATE TABLE IF NOT EXISTS public.service_categories (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name_tr         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  sort_order      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_categories_tenant_id ON public.service_categories (tenant_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_active    ON public.service_categories (tenant_id, is_active);

CREATE TABLE IF NOT EXISTS public.services (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name_tr         TEXT NOT NULL,
  name_en         TEXT NOT NULL,
  description_tr  TEXT,
  description_en  TEXT,
  duration        INT NOT NULL DEFAULT 30,
  price           DECIMAL(10,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'TRY',
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount  DECIMAL(10,2),
  color           TEXT DEFAULT '#6b7280',
  image_url       TEXT,
  max_per_day     INT,
  is_active       BOOLEAN DEFAULT true,
  sort_order      INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_tenant_id   ON public.services (tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services (category_id);
CREATE INDEX IF NOT EXISTS idx_services_active      ON public.services (tenant_id, is_active);

DROP TRIGGER IF EXISTS trg_services_set_updated_at ON public.services;
CREATE TRIGGER trg_services_set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
