-- 013_activity_log.sql
-- Audit trail.

CREATE TABLE IF NOT EXISTS public.activity_log (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  changes         JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_tenant_id   ON public.activity_log (tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id     ON public.activity_log (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity      ON public.activity_log (tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at  ON public.activity_log (tenant_id, created_at DESC);
