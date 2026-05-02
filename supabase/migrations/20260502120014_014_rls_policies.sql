-- 014_rls_policies.sql
-- Enable RLS on every table and create tenant-isolation + public booking policies.

-- ==========================================================================
-- Helper: SECURITY DEFINER function returning the current user's tenant_id.
-- Bypasses RLS on profiles to prevent recursive policy evaluation.
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO anon, authenticated;

-- ==========================================================================
-- Enable RLS on all tables
-- ==========================================================================
ALTER TABLE public.tenants            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log       ENABLE ROW LEVEL SECURITY;

-- ==========================================================================
-- TENANTS
-- ==========================================================================
DROP POLICY IF EXISTS tenants_public_read ON public.tenants;
CREATE POLICY tenants_public_read ON public.tenants
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS tenants_owner_modify ON public.tenants;
CREATE POLICY tenants_owner_modify ON public.tenants
  FOR ALL
  TO authenticated
  USING (id = public.current_tenant_id())
  WITH CHECK (id = public.current_tenant_id());

-- ==========================================================================
-- PROFILES — user can see and modify only their own profile row;
-- additionally users in the same tenant can view each other.
-- ==========================================================================
DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
CREATE POLICY profiles_self_select ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS profiles_self_insert ON public.profiles;
CREATE POLICY profiles_self_insert ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_self_delete ON public.profiles;
CREATE POLICY profiles_self_delete ON public.profiles
  FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- ==========================================================================
-- SERVICE CATEGORIES
-- ==========================================================================
DROP POLICY IF EXISTS service_categories_tenant_all ON public.service_categories;
CREATE POLICY service_categories_tenant_all ON public.service_categories
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS service_categories_public_read ON public.service_categories;
CREATE POLICY service_categories_public_read ON public.service_categories
  FOR SELECT
  TO anon
  USING (is_active = true);

-- ==========================================================================
-- SERVICES
-- ==========================================================================
DROP POLICY IF EXISTS services_tenant_all ON public.services;
CREATE POLICY services_tenant_all ON public.services
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS services_public_read ON public.services;
CREATE POLICY services_public_read ON public.services
  FOR SELECT
  TO anon
  USING (is_active = true);

-- ==========================================================================
-- STAFF
-- ==========================================================================
DROP POLICY IF EXISTS staff_tenant_all ON public.staff;
CREATE POLICY staff_tenant_all ON public.staff
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS staff_public_read ON public.staff;
CREATE POLICY staff_public_read ON public.staff
  FOR SELECT
  TO anon
  USING (is_active = true);

-- ==========================================================================
-- STAFF_SERVICES — tied to staff tenant ownership
-- ==========================================================================
DROP POLICY IF EXISTS staff_services_tenant_all ON public.staff_services;
CREATE POLICY staff_services_tenant_all ON public.staff_services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = staff_services.staff_id
        AND s.tenant_id = public.current_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = staff_services.staff_id
        AND s.tenant_id = public.current_tenant_id()
    )
  );

DROP POLICY IF EXISTS staff_services_public_read ON public.staff_services;
CREATE POLICY staff_services_public_read ON public.staff_services
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.id = staff_services.staff_id AND s.is_active = true
    )
  );

-- ==========================================================================
-- WORKING HOURS
-- ==========================================================================
DROP POLICY IF EXISTS working_hours_tenant_all ON public.working_hours;
CREATE POLICY working_hours_tenant_all ON public.working_hours
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS working_hours_public_read ON public.working_hours;
CREATE POLICY working_hours_public_read ON public.working_hours
  FOR SELECT
  TO anon
  USING (true);

-- ==========================================================================
-- HOLIDAYS
-- ==========================================================================
DROP POLICY IF EXISTS holidays_tenant_all ON public.holidays;
CREATE POLICY holidays_tenant_all ON public.holidays
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS holidays_public_read ON public.holidays;
CREATE POLICY holidays_public_read ON public.holidays
  FOR SELECT
  TO anon
  USING (true);

-- ==========================================================================
-- CUSTOMERS
-- ==========================================================================
DROP POLICY IF EXISTS customers_tenant_all ON public.customers;
CREATE POLICY customers_tenant_all ON public.customers
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- Public booking: allow anonymous to insert a customer for an existing tenant.
DROP POLICY IF EXISTS customers_public_insert ON public.customers;
CREATE POLICY customers_public_insert ON public.customers
  FOR INSERT
  TO anon
  WITH CHECK (
    source = 'booking'
    AND EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = customers.tenant_id)
  );

-- ==========================================================================
-- APPOINTMENTS
-- ==========================================================================
DROP POLICY IF EXISTS appointments_tenant_all ON public.appointments;
CREATE POLICY appointments_tenant_all ON public.appointments
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS appointments_public_insert ON public.appointments;
CREATE POLICY appointments_public_insert ON public.appointments
  FOR INSERT
  TO anon
  WITH CHECK (
    source = 'online'
    AND EXISTS (SELECT 1 FROM public.tenants t WHERE t.id = appointments.tenant_id)
  );

-- ==========================================================================
-- PAYMENTS
-- ==========================================================================
DROP POLICY IF EXISTS payments_tenant_all ON public.payments;
CREATE POLICY payments_tenant_all ON public.payments
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ==========================================================================
-- NOTIFICATIONS
-- ==========================================================================
DROP POLICY IF EXISTS notifications_tenant_all ON public.notifications;
CREATE POLICY notifications_tenant_all ON public.notifications
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ==========================================================================
-- SUBSCRIPTIONS
-- ==========================================================================
DROP POLICY IF EXISTS subscriptions_tenant_all ON public.subscriptions;
CREATE POLICY subscriptions_tenant_all ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());

-- ==========================================================================
-- ACTIVITY LOG
-- ==========================================================================
DROP POLICY IF EXISTS activity_log_tenant_all ON public.activity_log;
CREATE POLICY activity_log_tenant_all ON public.activity_log
  FOR ALL
  TO authenticated
  USING (tenant_id = public.current_tenant_id())
  WITH CHECK (tenant_id = public.current_tenant_id());
