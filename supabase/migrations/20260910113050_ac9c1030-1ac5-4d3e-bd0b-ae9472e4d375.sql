ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'ipay';
CREATE INDEX IF NOT EXISTS payments_provider_idx ON public.payments (provider);