-- 005_staff.sql
-- Staff and staff <-> service relationship (M:N).

CREATE TABLE IF NOT EXISTS public.staff (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_staff_tenant_id  ON public.staff (tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_profile_id ON public.staff (profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_active     ON public.staff (tenant_id, is_active);

DROP TRIGGER IF EXISTS trg_staff_set_updated_at ON public.staff;
CREATE TRIGGER trg_staff_set_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.staff_services (
  staff_id        UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id      UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  custom_duration INT,
  custom_price    DECIMAL(10,2),
  PRIMARY KEY (staff_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_services_service_id ON public.staff_services (service_id);
