CREATE TABLE public.inscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  whatsapp text NOT NULL,
  programme text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  note text,
  validated_at timestamptz,
  access_granted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.inscriptions TO authenticated;
GRANT ALL ON public.inscriptions TO service_role;

ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read inscriptions" ON public.inscriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update inscriptions" ON public.inscriptions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER inscriptions_touch_updated_at
  BEFORE UPDATE ON public.inscriptions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX inscriptions_whatsapp_idx ON public.inscriptions (whatsapp);
CREATE INDEX inscriptions_created_at_idx ON public.inscriptions (created_at DESC);