import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Récupère (et émet si besoin) la licence liée à une transaction payée. */
export const getLicense = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ transaction_id: z.string().trim().min(4).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { issueLicenseForPayment } = await import("./licenses.server");
    const license = await issueLicenseForPayment(data.transaction_id);
    return { license };
  });

/** Vérification publique d'un code de licence. */
export const verifyLicense = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ code: z.string().trim().min(6).max(32) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("licenses")
      .select("code, customer_name, programme, status, issued_at, expires_at")
      .eq("code", data.code.toUpperCase())
      .maybeSingle();

    if (!row) return { valid: false as const };
    const expired = row.expires_at ? new Date(row.expires_at) < new Date() : false;
    return {
      valid: (row.status === "active" && !expired) as boolean,
      expired,
      license: row,
    };
  });