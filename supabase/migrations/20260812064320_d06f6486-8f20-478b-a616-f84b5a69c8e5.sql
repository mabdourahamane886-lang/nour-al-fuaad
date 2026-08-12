DROP POLICY IF EXISTS "Public can read payments" ON public.payments;

CREATE POLICY "Admins read payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.payments FROM anon;
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;