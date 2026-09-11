import { createFileRoute } from "@tanstack/react-router";

/**
 * Retour Stripe Checkout : vérifie la session côté serveur, met à jour le
 * paiement, émet la licence, puis redirige vers la page de statut.
 */
export const Route = createFileRoute("/api/public/stripe-return")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id");
        const tx = url.searchParams.get("tx");

        if (!sessionId || !tx) {
          return Response.redirect(new URL("/paiement", url.origin), 302);
        }

        const secretKey = process.env["STRIPE_SECRET_KEY"];
        const target = new URL(`/statut/${tx}`, url.origin);
        if (!secretKey) return Response.redirect(target, 302);

        try {
          const res = await fetch(
            `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
            { headers: { Authorization: `Bearer ${secretKey}` } },
          );
          const session = (await res.json().catch(() => ({}))) as {
            payment_status?: string;
            client_reference_id?: string;
          };

          if (res.ok && session.client_reference_id === tx) {
            const paid = session.payment_status === "paid";
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            await supabaseAdmin
              .from("payments")
              .update({
                status: paid ? "success" : "pending",
                paid_at: paid ? new Date().toISOString() : null,
                raw: session as never,
              } as never)
              .eq("transaction_id", tx);

            if (paid) {
              try {
                const { issueLicenseForPayment } = await import("@/lib/licenses.server");
                await issueLicenseForPayment(tx);
              } catch (e) {
                console.error("license issue failed", e);
              }
            }
          }
        } catch (error) {
          console.error("stripe-return verification failed", error);
        }

        return Response.redirect(target, 302);
      },
    },
  },
});
