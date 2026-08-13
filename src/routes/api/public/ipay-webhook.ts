import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * iPay Money callback endpoint.
 *
 * Configuration côté iPay : `https://<domaine>/api/public/ipay-webhook`
 * Header partagé attendu : `X-Webhook-Secret: <IPAY_WEBHOOK_SECRET>`
 *
 * iPay envoie typiquement : { reference, transaction_id, status, msisdn, amount, ... }
 * On accepte les deux clés (reference OU transaction_id) pour retrouver la ligne.
 */
export const Route = createFileRoute("/api/public/ipay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.IPAY_WEBHOOK_SECRET;
        if (!expected) {
          return json({ ok: false, error: "Webhook non configuré" }, 503);
        }
        const received =
          request.headers.get("x-webhook-secret") ??
          request.headers.get("x-ipay-secret") ??
          "";
        if (received !== expected) {
          return json({ ok: false, error: "Signature invalide" }, 401);
        }

        let payload: Record<string, unknown> = {};
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ ok: false, error: "JSON invalide" }, 400);
        }

        const reference =
          typeof payload.reference === "string" ? payload.reference : null;
        const transactionId =
          typeof payload.transaction_id === "string"
            ? payload.transaction_id
            : null;
        const rawStatus =
          typeof payload.status === "string" ? payload.status.toLowerCase() : "";

        if (!reference && !transactionId) {
          return json({ ok: false, error: "Référence manquante" }, 400);
        }

        const status = mapStatus(rawStatus);

        const update: Record<string, unknown> = {
          status,
          raw: payload,
        };
        if (status === "success") update.paid_at = new Date().toISOString();
        if (reference) update.reference = reference;

        const query = supabaseAdmin.from("payments").update(update as never);
        const filtered = transactionId
          ? query.eq("transaction_id", transactionId)
          : query.eq("reference", reference!);

        const { error } = await filtered;
        if (error) {
          console.error("ipay-webhook update failed", error);
          return json({ ok: false, error: error.message }, 500);
        }

        // Paiement validé → émission (idempotente) de la licence d'accès.
        let license: string | null = null;
        if (status === "success") {
          try {
            const { data: row } = await supabaseAdmin
              .from("payments")
              .select("transaction_id")
              .eq(
                transactionId ? "transaction_id" : "reference",
                (transactionId ?? reference)!,
              )
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

function mapStatus(raw: string): "pending" | "success" | "failed" | "cancelled" {
  if (["success", "succeeded", "paid", "completed"].includes(raw)) return "success";
  if (["failed", "error", "rejected"].includes(raw)) return "failed";
  if (["cancelled", "canceled"].includes(raw)) return "cancelled";
  return "pending";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}