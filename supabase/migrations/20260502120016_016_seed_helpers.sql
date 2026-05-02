-- 016_seed_helpers.sql
-- Convenience view joining appointments with related entities. RLS still applies
-- because the view is created with security_invoker = on.

CREATE OR REPLACE VIEW public.v_appointments_full
WITH (security_invoker = on)
AS
SELECT
  a.id,
  a.tenant_id,
  a.status,
  a.start_time,
  a.end_time,
  a.duration,
  a.price,
  a.currency,
  a.deposit_amount,
  a.deposit_paid,
  a.notes,
  a.internal_notes,
  a.source,
  a.cancellation_reason,
  a.cancelled_at,
  a.cancelled_by,
  a.reminder_sent,
  a.followup_sent,
  a.metadata,
  a.created_at,
  a.updated_at,
  c.id          AS customer_id,
  c.full_name   AS customer_name,
  c.email       AS customer_email,
  c.phone       AS customer_phone,
  c.avatar_url  AS customer_avatar,
  s.id          AS staff_id,
  s.name        AS staff_name,
  s.avatar_url  AS staff_avatar,
  sv.id         AS service_id,
  sv.name_tr    AS service_name_tr,
  sv.name_en    AS service_name_en,
  sv.color      AS service_color
FROM public.appointments a
LEFT JOIN public.customers c ON c.id  = a.customer_id
LEFT JOIN public.staff     s ON s.id  = a.staff_id
LEFT JOIN public.services  sv ON sv.id = a.service_id;

GRANT SELECT ON public.v_appointments_full TO anon, authenticated;
