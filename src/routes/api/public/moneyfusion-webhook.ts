import { createFileRoute } from "@tanstack/react-router";

/**
 * Webhook MoneyFusion (FusionPay).
 * URL à configurer : https://<domaine>/api/public/moneyfusion-webhook
 *
 * MoneyFusion envoie : { event, tokenPay, personal_Info, Montant, numeroTransaction, ... }
 * On retrouve la ligne via personal_Info[].transaction_id, sinon via le token (reference).
 */
export const Route = createFileRoute("/api/public/moneyfusion-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: Record<string, unknown> = {};
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, error: "JSON invalide" }, 400);
        }

        const event = typeof payload.event === "string" ? payload.event : "";
        const token = typeof payload.tokenPay === "string" ? payload.tokenPay : null;

        const info = Array.isArray(payload.personal_Info)
          ? (payload.personal_Info[0] as Record<string, unknown> | undefined)
          : undefined;
        const transactionId =
          info && typeof info.transaction_id === "string" ? info.transaction_id : null;

        if (!transactionId && !token) {
          return json({ ok: false, error: "Référence manquante" }, 400);
        }

        const status = mapEvent(event, payload);

        const update: Record<string, unknown> = { status, raw: payload };
        if (status === "success") update.paid_at = new Date().toISOString();
        if (token) update.reference = token;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const query = supabaseAdmin.from("payments").update(update as never);
        const { error } = transactionId
          ? await query.eq("transaction_id", transactionId)
          : await query.eq("reference", token!);

        if (error) {
          console.error("moneyfusion-webhook update failed", error);
          return json({ ok: false, error: error.message }, 500);
        }

        let license: string | null = null;
        if (status === "success") {
          try {
            const { data: row } = await supabaseAdmin
              .from("payments")
              .select("transaction_id")
              .eq(transactionId ? "transaction_id" : "reference", (transactionId ?? token)!)
              .maybeSingle();
            if (row?.transaction_id) {
              const { issueLicenseForPayment } = await import("@/lib/licenses.server");
              const issued = await issueLicenseForPayment(row.transaction_id);
              license = issued?.code ?? null;
            }
          } catch (e) {
            console.error("license issue failed", e);
          }
        }

        return json({ ok: true, license });
      },
    },
  },
});

function mapEvent(
  event: string,
  payload: Record<string, unknown>,
): "pending" | "success" | "failed" | "cancelled" {
  const raw = (typeof payload.statut === "string" ? payload.statut : "").toLowerCase();
  if (event === "payin.session.completed" || raw === "paid") return "success";
  if (event === "payin.session.cancelled") return "cancelled";
  if (raw === "failure") return "failed";
  return "pending";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
