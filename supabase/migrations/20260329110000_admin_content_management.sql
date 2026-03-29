CREATE TABLE IF NOT EXISTS public.custom_diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  description text NOT NULL,
  symptoms text[] NOT NULL DEFAULT '{}',
  causes text[] NOT NULL DEFAULT '{}',
  prevention text[] NOT NULL DEFAULT '{}',
  treatment text[] NOT NULL DEFAULT '{}',
  risk_factors text[] NOT NULL DEFAULT '{}',
  when_to_see_doctor text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.custom_first_aid_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  overview text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium')),
  steps text[] NOT NULL DEFAULT '{}',
  do_not text[] NOT NULL DEFAULT '{}',
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.custom_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  number text NOT NULL,
  description text NOT NULL,
  country text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium')),
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_feature_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  details text,
  badge text,
  href text,
  cta_label text,
  icon_name text NOT NULL DEFAULT 'activity',
  is_external boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_diseases_published_order
ON public.custom_diseases(is_published, display_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_custom_first_aid_guides_published_order
ON public.custom_first_aid_guides(is_published, display_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_custom_emergency_contacts_published_order
ON public.custom_emergency_contacts(is_published, display_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_feature_cards_published_order
ON public.app_feature_cards(is_published, display_order, created_at DESC);

ALTER TABLE public.custom_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_first_aid_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_feature_cards ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_admin_content_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = COALESCE(NEW.created_by, auth.uid());
    NEW.updated_by = COALESCE(NEW.updated_by, auth.uid());
  ELSE
    NEW.updated_by = auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_admin_content_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entity_uuid uuid;
  before_state jsonb;
  after_state jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  entity_uuid = COALESCE(NEW.id, OLD.id);
  before_state = CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END;
  after_state = CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END;

  PERFORM public.write_admin_audit_log(
    lower(TG_OP) || '_' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    entity_uuid,
    before_state,
    after_state,
    NULL,
    NULL
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP POLICY IF EXISTS "Public can read published custom diseases" ON public.custom_diseases;
DROP POLICY IF EXISTS "Admins can manage custom diseases" ON public.custom_diseases;
CREATE POLICY "Public can read published custom diseases"
ON public.custom_diseases FOR SELECT
USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage custom diseases"
ON public.custom_diseases FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can read published custom first aid guides" ON public.custom_first_aid_guides;
DROP POLICY IF EXISTS "Admins can manage custom first aid guides" ON public.custom_first_aid_guides;
CREATE POLICY "Public can read published custom first aid guides"
ON public.custom_first_aid_guides FOR SELECT
USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage custom first aid guides"
ON public.custom_first_aid_guides FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can read published custom emergency contacts" ON public.custom_emergency_contacts;
DROP POLICY IF EXISTS "Admins can manage custom emergency contacts" ON public.custom_emergency_contacts;
CREATE POLICY "Public can read published custom emergency contacts"
ON public.custom_emergency_contacts FOR SELECT
USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage custom emergency contacts"
ON public.custom_emergency_contacts FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can read published app feature cards" ON public.app_feature_cards;
DROP POLICY IF EXISTS "Admins can manage app feature cards" ON public.app_feature_cards;
CREATE POLICY "Public can read published app feature cards"
ON public.app_feature_cards FOR SELECT
USING (is_published = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage app feature cards"
ON public.app_feature_cards FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS set_custom_diseases_metadata ON public.custom_diseases;
CREATE TRIGGER set_custom_diseases_metadata
BEFORE INSERT OR UPDATE ON public.custom_diseases
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_content_metadata();

DROP TRIGGER IF EXISTS set_custom_first_aid_guides_metadata ON public.custom_first_aid_guides;
CREATE TRIGGER set_custom_first_aid_guides_metadata
BEFORE INSERT OR UPDATE ON public.custom_first_aid_guides
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_content_metadata();

DROP TRIGGER IF EXISTS set_custom_emergency_contacts_metadata ON public.custom_emergency_contacts;
CREATE TRIGGER set_custom_emergency_contacts_metadata
BEFORE INSERT OR UPDATE ON public.custom_emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_content_metadata();

DROP TRIGGER IF EXISTS set_app_feature_cards_metadata ON public.app_feature_cards;
CREATE TRIGGER set_app_feature_cards_metadata
BEFORE INSERT OR UPDATE ON public.app_feature_cards
FOR EACH ROW
EXECUTE FUNCTION public.set_admin_content_metadata();

DROP TRIGGER IF EXISTS update_custom_diseases_updated_at ON public.custom_diseases;
CREATE TRIGGER update_custom_diseases_updated_at
BEFORE UPDATE ON public.custom_diseases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_first_aid_guides_updated_at ON public.custom_first_aid_guides;
CREATE TRIGGER update_custom_first_aid_guides_updated_at
BEFORE UPDATE ON public.custom_first_aid_guides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_emergency_contacts_updated_at ON public.custom_emergency_contacts;
CREATE TRIGGER update_custom_emergency_contacts_updated_at
BEFORE UPDATE ON public.custom_emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_feature_cards_updated_at ON public.app_feature_cards;
CREATE TRIGGER update_app_feature_cards_updated_at
BEFORE UPDATE ON public.app_feature_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS audit_custom_diseases_change ON public.custom_diseases;
CREATE TRIGGER audit_custom_diseases_change
AFTER INSERT OR UPDATE OR DELETE ON public.custom_diseases
FOR EACH ROW
EXECUTE FUNCTION public.audit_admin_content_change();

DROP TRIGGER IF EXISTS audit_custom_first_aid_guides_change ON public.custom_first_aid_guides;
CREATE TRIGGER audit_custom_first_aid_guides_change
AFTER INSERT OR UPDATE OR DELETE ON public.custom_first_aid_guides
FOR EACH ROW
EXECUTE FUNCTION public.audit_admin_content_change();

DROP TRIGGER IF EXISTS audit_custom_emergency_contacts_change ON public.custom_emergency_contacts;
CREATE TRIGGER audit_custom_emergency_contacts_change
AFTER INSERT OR UPDATE OR DELETE ON public.custom_emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.audit_admin_content_change();

DROP TRIGGER IF EXISTS audit_app_feature_cards_change ON public.app_feature_cards;
CREATE TRIGGER audit_app_feature_cards_change
AFTER INSERT OR UPDATE OR DELETE ON public.app_feature_cards
FOR EACH ROW
EXECUTE FUNCTION public.audit_admin_content_change();

GRANT SELECT ON public.custom_diseases TO anon, authenticated;
GRANT SELECT ON public.custom_first_aid_guides TO anon, authenticated;
GRANT SELECT ON public.custom_emergency_contacts TO anon, authenticated;
GRANT SELECT ON public.app_feature_cards TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.custom_diseases TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.custom_first_aid_guides TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.custom_emergency_contacts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_feature_cards TO authenticated;
