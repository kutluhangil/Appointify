-- 015_functions.sql
-- Business-logic functions and triggers.

-- ==========================================================================
-- check_availability — does the staff member have any conflicting appointment
-- in the requested window?
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.check_availability(
  p_tenant_id UUID,
  p_staff_id  UUID,
  p_start     TIMESTAMPTZ,
  p_end       TIMESTAMPTZ
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM public.appointments
    WHERE tenant_id = p_tenant_id
      AND staff_id  = p_staff_id
      AND status NOT IN ('cancelled', 'no_show')
      AND tstzrange(start_time, end_time) && tstzrange(p_start, p_end)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_availability(UUID, UUID, TIMESTAMPTZ, TIMESTAMPTZ)
  TO anon, authenticated;

-- ==========================================================================
-- update_customer_stats — increment counters when an appointment is completed
-- or marked no-show.
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    UPDATE public.customers SET
      total_visits  = total_visits + 1,
      total_spent   = total_spent + NEW.price,
      last_visit_at = NEW.end_time,
      updated_at    = NOW()
    WHERE id = NEW.customer_id;
  END IF;

  IF NEW.status = 'no_show' AND (OLD.status IS NULL OR OLD.status <> 'no_show') THEN
    UPDATE public.customers SET
      no_show_count = no_show_count + 1,
      updated_at    = NOW()
    WHERE id = NEW.customer_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_customer_stats ON public.appointments;
CREATE TRIGGER trg_update_customer_stats
  AFTER UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_stats();

-- ==========================================================================
-- slugify helper
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.slugify(p_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_slug TEXT;
BEGIN
  IF p_text IS NULL OR length(trim(p_text)) = 0 THEN
    RETURN 'tenant';
  END IF;
  v_slug := lower(p_text);
  -- Common Turkish + accented character replacements.
  v_slug := translate(
    v_slug,
    'çğıöşüÇĞİÖŞÜàáâäãåèéêëìíîïòóôöõùúûüñÀÁÂÄÃÅÈÉÊËÌÍÎÏÒÓÔÖÕÙÚÛÜÑ',
    'cgiosucgiosuaaaaaaeeeeiiiiooooouuuunAAAAAAEEEEIIIIOOOOOUUUUN'
  );
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := regexp_replace(v_slug, '(^-+|-+$)', '', 'g');
  IF v_slug = '' THEN
    v_slug := 'tenant';
  END IF;
  RETURN v_slug;
END;
$$;

-- ==========================================================================
-- handle_new_user — fired on auth.users insert.
-- Creates a tenant from raw_user_meta_data and a profile linked to it.
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_name TEXT;
  v_industry      TEXT;
  v_country       TEXT;
  v_locale        TEXT;
  v_full_name     TEXT;
  v_base_slug     TEXT;
  v_slug          TEXT;
  v_suffix        INT := 0;
  v_tenant_id     UUID;
BEGIN
  v_business_name := COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Business');
  v_industry      := COALESCE(NEW.raw_user_meta_data->>'industry',      'other');
  v_country       := COALESCE(NEW.raw_user_meta_data->>'country',       'TR');
  v_locale        := COALESCE(NEW.raw_user_meta_data->>'locale',        'tr');
  v_full_name     := COALESCE(NEW.raw_user_meta_data->>'full_name',
                              split_part(NEW.email, '@', 1));

  v_base_slug := public.slugify(v_business_name);
  v_slug := v_base_slug;

  -- Find a unique slug.
  WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = v_slug) LOOP
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || v_suffix::text;
  END LOOP;

  INSERT INTO public.tenants (name, slug, industry, email, country, locale)
  VALUES (v_business_name, v_slug, v_industry, NEW.email, v_country, v_locale)
  RETURNING id INTO v_tenant_id;

  INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
  VALUES (NEW.id, v_tenant_id, NEW.email, v_full_name, 'owner');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
