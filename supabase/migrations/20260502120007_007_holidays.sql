-- 007_holidays.sql
-- Holidays / closure days. NULL staff_id = whole business.

CREATE TABLE IF NOT EXISTS public.holidays (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id        UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_recurring    BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holidays_tenant_id ON public.holidays (tenant_id);
CREATE INDEX IF NOT EXISTS idx_holidays_staff_id  ON public.holidays (staff_id);
CREATE INDEX IF NOT EXISTS idx_holidays_dates     ON public.holidays (tenant_id, start_date, end_date);
