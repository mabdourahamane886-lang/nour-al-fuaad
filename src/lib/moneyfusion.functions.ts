import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const schema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  amount: z.number().int().min(100).max(10_000_000),
  msisdn: z.string().trim().regex(/^\d{8,15}$/, "Numéro invalide"),
  programme: z.string().trim().max(80).optional(),
  origin: z.string().trim().url().max(200).optional(),
});

/** Retire l'indicatif 227 pour ne garder que le numéro local. */
function normalizeMsisdn(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.startsWith("00227")) return d.slice(5);
  if (d.startsWith("227") && d.length === 11) return d.slice(3);
  return d;
}

type FusionResponse = {
  statut?: boolean;
  token?: string;
  message?: string;
  url?: string;
};

export const createMoneyFusionPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.MONEYFUSION_API_KEY;
    if (!apiKey) {
      return {
        ok: false as const,
        message:
          "Le paiement en ligne n'est pas encore activé. L'administrateur doit configurer la clé MoneyFusion.",
      };
    }

    const msisdn = normalizeMsisdn(data.msisdn);
    if (msisdn.length < 8) {
      return { ok: false as const, message: "Numéro invalide : 8 chiffres attendus." };
    }

    const transaction_id = `NF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const base = data.origin?.replace(/\/$/, "") ?? "";

    const { error: insertError } = await supabaseAdmin.from("payments").insert({
      transaction_id,
      customer_name: data.customer_name,
      msisdn,
      amount: data.amount,
      programme: data.programme ?? null,
      status: "pending",
      provider: "moneyfusion",
      environment: "live",
    } as never);
    if (insertError) {
      console.error("payments insert failed", insertError);
      return { ok: false as const, message: "Impossible d'enregistrer la transaction." };
    }

    try {
      const res = await fetch(
        `https://pay.moneyfusion.net/api/${encodeURIComponent(apiKey)}/pay/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalPrice: data.amount,
            article: [{ [data.programme ?? "Formation"]: data.amount }],
            personal_Info: [{ transaction_id, programme: data.programme ?? null }],
            numeroSend: msisdn,
            nomclient: data.customer_name,
            return_url: base ? `${base}/statut/${transaction_id}` : undefined,
            webhook_url: base ? `${base}/api/public/moneyfusion-webhook` : undefined,
          }),
        },
      );

      const body = (await res.json().catch(() => ({}))) as FusionResponse;

      if (!res.ok || body.statut !== true || !body.url) {
        await supabaseAdmin
          .from("payments")
          .update({ status: "failed", raw: body as never })
          .eq("transaction_id", transaction_id);
        return {
          ok: false as const,
          message:
            body.message === "Application non approuvée."
              ? "Votre compte MoneyFusion n'est pas encore approuvé. Terminez la validation dans votre tableau de bord MoneyFusion."
              : (body.message ?? "MoneyFusion a refusé la demande de paiement."),
        };
      }

      await supabaseAdmin
        .from("payments")
        .update({ reference: body.token ?? null, raw: body as never })
        .eq("transaction_id", transaction_id);

      return {
        ok: true as const,
        transaction_id,
        token: body.token ?? "",
        url: body.url,
      };
    } catch (error) {
      console.error("MoneyFusion request failed", error);
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed", raw: { error: String(error) } as never })
        .eq("transaction_id", transaction_id);
      return {
        ok: false as const,
        message: "Service MoneyFusion momentanément indisponible. Réessayez.",
      };
    }
  });
