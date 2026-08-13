import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomBlock(n: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Code lisible : NF-XXXX-XXXX-XXXX */
export function generateLicenseCode(): string {
  return `NF-${randomBlock(4)}-${randomBlock(4)}-${randomBlock(4)}`;
}

/** Durée de validité selon le programme payé. */
function expiryFor(programme: string | null): string {
  const d = new Date();
  const isMonthly = (programme ?? "").toLowerCase().includes("mensual");
  d.setMonth(d.getMonth() + (isMonthly ? 1 : 12));
  return d.toISOString();
}

export type LicenseRow = {
  code: string;
  transaction_id: string;
  reference: string | null;
  customer_name: string;
  programme: string | null;
  amount: number;
  status: string;
  issued_at: string;
  expires_at: string | null;
};

/**
 * Émet (une seule fois) une licence d'accès pour un paiement validé.
 * Idempotent : renvoie la licence existante si elle a déjà été générée.
 */
export async function issueLicenseForPayment(
  transactionId: string,
): Promise<LicenseRow | null> {
  const existing = await supabaseAdmin
    .from("licenses")
    .select("code, transaction_id, reference, customer_name, programme, amount, status, issued_at, expires_at")
    .eq("transaction_id", transactionId)
    .maybeSingle();
  if (existing.data) return existing.data as LicenseRow;

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("transaction_id, reference, customer_name, programme, amount, status")
    .eq("transaction_id", transactionId)
    .maybeSingle();

  if (!payment || payment.status !== "success") return null;

  const { data, error } = await supabaseAdmin
    .from("licenses")
    .insert({
      code: generateLicenseCode(),
      transaction_id: payment.transaction_id,
      reference: payment.reference,
      customer_name: payment.customer_name,
      programme: payment.programme,
      amount: payment.amount,
      status: "active",
      expires_at: expiryFor(payment.programme),
    })
    .select("code, transaction_id, reference, customer_name, programme, amount, status, issued_at, expires_at")
    .single();

  if (error) {
    // Course possible entre deux webhooks : on relit.
    const retry = await supabaseAdmin
      .from("licenses")
      .select("code, transaction_id, reference, customer_name, programme, amount, status, issued_at, expires_at")
      .eq("transaction_id", transactionId)
      .maybeSingle();
    return (retry.data as LicenseRow | null) ?? null;
  }
  return data as LicenseRow;
}