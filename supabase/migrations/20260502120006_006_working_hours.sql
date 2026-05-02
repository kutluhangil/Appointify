-- 006_working_hours.sql
-- Per-staff weekly working hours.

CREATE TABLE IF NOT EXISTS public.working_hours (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  staff_id        UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week     INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  break_start     TIME,
  break_end       TIME,
  is_working      BOOLEAN DEFAULT true,
  UNIQUE(staff_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_working_hours_tenant_id ON public.working_hours (tenant_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_staff_id  ON public.working_hours (staff_id);
