import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120).optional(),
  amount: z.number().int().min(100).max(10_000_000),
  programme: z.string().trim().max(80).optional(),
  origin: z.string().trim().url().max(200).optional(),
});

/**
 * Crée une session Stripe Checkout (carte bancaire internationale).
 * Montants en FCFA (XOF) : devise sans décimale côté Stripe.
 */
export const createStripeCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const secretKey = process.env["STRIPE_SECRET_KEY"];
    if (!secretKey) {
      return {
        ok: false as const,
        message: "Le paiement par carte n'est pas encore activé (clé Stripe manquante).",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const transaction_id = `NF-ST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const base = data.origin?.replace(/\/$/, "") ?? "";

    const { error: insertError } = await supabaseAdmin.from("payments").insert({
      transaction_id,
      customer_name: data.customer_name,
      msisdn: "00000000",
      amount: data.amount,
      programme: data.programme ?? null,
      status: "pending",
      provider: "stripe",
      environment: secretKey.startsWith("sk_live_") ? "live" : "sandbox",
    } as never);
    if (insertError) {
      console.error("payments insert failed", insertError);
      return { ok: false as const, message: "Impossible d'enregistrer la transaction." };
    }

    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("client_reference_id", transaction_id);
    form.set("line_items[0][quantity]", "1");
    form.set("line_items[0][price_data][currency]", "xof");
    form.set("line_items[0][price_data][unit_amount]", String(data.amount));
    form.set(
      "line_items[0][price_data][product_data][name]",
      data.programme ?? "NOUROUL FOUA'AD — Formation",
    );
    form.set("metadata[transaction_id]", transaction_id);
    form.set("metadata[programme]", data.programme ?? "");
    if (data.email) form.set("customer_email", data.email);
    form.set(
      "success_url",
      `${base}/api/public/stripe-return?session_id={CHECKOUT_SESSION_ID}&tx=${transaction_id}`,
    );
    form.set("cancel_url", `${base}/statut/${transaction_id}`);

    try {
      const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });
      const body = (await res.json().catch(() => ({}))) as {
        id?: string;
        url?: string;
        error?: { message?: string };
      };

      if (!res.ok || !body.url) {
        await supabaseAdmin
          .from("payments")
          .update({ status: "failed", raw: body as never })
          .eq("transaction_id", transaction_id);
        console.error("stripe checkout failed", body);
        return {
          ok: false as const,
          message:
            body.error?.message ?? "Stripe a refusé la demande de paiement. Réessayez plus tard.",
        };
      }

      await supabaseAdmin
        .from("payments")
        .update({ reference: body.id ?? null, raw: body as never })
        .eq("transaction_id", transaction_id);

      return { ok: true as const, transaction_id, url: body.url };
    } catch (error) {
      console.error("stripe request failed", error);
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed", raw: { error: String(error) } as never })
        .eq("transaction_id", transaction_id);
      return { ok: false as const, message: "Service Stripe momentanément indisponible." };
    }
  });
