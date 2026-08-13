CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  transaction_id text NOT NULL UNIQUE,
  reference text,
  customer_name text NOT NULL,
  programme text,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'active',
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.licenses TO service_role;
GRANT SELECT ON public.licenses TO authenticated;

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view licenses"
ON public.licenses FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX licenses_transaction_id_idx ON public.licenses (transaction_id);