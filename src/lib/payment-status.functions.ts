import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z
  .object({
    transaction_id: z.string().trim().min(4).max(64).optional(),
    reference: z.string().trim().min(1).max(64).optional(),
  })
  .refine((v) => Boolean(v.transaction_id || v.reference), {
    message: "Référence requise",
  });

function maskMsisdn(msisdn: string): string {
  if (msisdn.length <= 4) return "••••";
  return `${"•".repeat(msisdn.length - 4)}${msisdn.slice(-4)}`;
}

/**
 * Lookup public d'UNE seule transaction, par identifiant exact.
 * La table `payments` n'est plus lisible côté client : seul ce handler,
 * qui filtre sur un identifiant exact, expose les champs non sensibles.
 */
export const getPublicPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("payments")
      .select(
        "reference, transaction_id, customer_name, msisdn, amount, programme, status, created_at, paid_at",
      )
      .limit(1);

    query = data.transaction_id
      ? query.eq("transaction_id", data.transaction_id)
      : query.eq("reference", data.reference!);

    const { data: row, error } = await query.maybeSingle();
    if (error) {
      console.error("getPublicPayment failed", error);
      return { payment: null };
    }
    if (!row) return { payment: null };

    return { payment: { ...row, msisdn: maskMsisdn(row.msisdn) } };
  });
