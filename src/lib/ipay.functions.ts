import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  amount: z.number().int().min(100).max(10_000_000),
  msisdn: z.string().trim().regex(/^\d{8,15}$/, "Numéro invalide"),
  transaction_id: z.string().trim().min(4).max(64),
  programme: z.string().trim().max(80).optional(),
});

// iPay attend le numéro local Niger (8 chiffres), sans indicatif pays.
function normalizeNigerMsisdn(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("227") && digits.length === 11) return digits.slice(3);
  if (digits.startsWith("00227")) return digits.slice(5);
  return digits;
}

export const createIPayMobilePayment = createServerFn({ method: "POST" })
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.IPAY_PRIVATE_KEY;
    const env = (process.env.IPAY_ENVIRONMENT ?? "sandbox").toLowerCase();

    if (!key) {
      return {
        ok: false as const,
        message:
          "Le paiement en ligne n'est pas encore activé. L'administrateur doit configurer la clé IPAY_PRIVATE_KEY.",
      };
    }

    // 1) Historise la transaction en "pending" AVANT l'appel iPay.
    const msisdn = normalizeNigerMsisdn(data.msisdn);
    const { error: insertError } = await supabaseAdmin.from("payments").insert({
      transaction_id: data.transaction_id,
      customer_name: data.customer_name,
      msisdn,
      amount: data.amount,
      programme: data.programme ?? null,
      status: "pending",
      environment: env === "live" ? "live" : "sandbox",
    });
    if (insertError) {
      console.error("payments insert failed", insertError);
      return { ok: false as const, message: "Impossible d'enregistrer la transaction." };
    }

    try {
      const res = await fetch("https://i-pay.money/api/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "Ipay-Payment-Type": "mobile",
          "Ipay-Target-Environment": env === "live" ? "live" : "sandbox",
        },
        body: JSON.stringify({
          customer_name: data.customer_name,
          currency: "XOF",
          country: "NE",
          amount: String(data.amount),
          transaction_id: data.transaction_id,
          msisdn,
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        status?: string;
        reference?: string;
        message?: string;
      };

      if (!res.ok || body.status === "failed") {
        await supabaseAdmin
          .from("payments")
          .update({ status: "failed", raw: body as never })
          .eq("transaction_id", data.transaction_id);
        return {
          ok: false as const,
          message: body.message ?? `Erreur iPay (${res.status})`,
        };
      }

      await supabaseAdmin
        .from("payments")
        .update({
          reference: body.reference ?? null,
          status: body.status ?? "pending",
          raw: body as never,
        })
        .eq("transaction_id", data.transaction_id);

      return {
        ok: true as const,
        status: body.status ?? "pending",
        reference: body.reference ?? "",
        transaction_id: data.transaction_id,
      };
    } catch (error) {
      console.error("iPay request failed", error);
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed", raw: { error: String(error) } as never })
        .eq("transaction_id", data.transaction_id);
      return {
        ok: false as const,
        message: "Service iPay momentanément indisponible. Réessayez.",
      };
    }
  });

export const getIPayStatus = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ reference: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.IPAY_PRIVATE_KEY;
    const env = (process.env.IPAY_ENVIRONMENT ?? "sandbox").toLowerCase();
    if (!key) return { ok: false as const, message: "IPAY_PRIVATE_KEY manquant" };

    try {
      const res = await fetch(
        `https://i-pay.money/api/v1/payments/${encodeURIComponent(data.reference)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
            "Ipay-Payment-Type": "mobile",
            "Ipay-Target-Environment": env === "live" ? "live" : "sandbox",
          },
        },
      );
      const body = (await res.json().catch(() => ({}))) as {
        status?: string;
        reference?: string;
        external_reference?: string;
        msisdn?: string;
      };
      if (!res.ok) return { ok: false as const, message: `Erreur ${res.status}` };
      return { ok: true as const, ...body };
    } catch (error) {
      console.error("iPay status failed", error);
      return { ok: false as const, message: "Service iPay indisponible" };
    }
  });