import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  amount: z.number().int().min(100).max(10_000_000),
  msisdn: z.string().trim().regex(/^\d{8,15}$/, "Numéro invalide (chiffres uniquement, indicatif sans +)"),
  transaction_id: z.string().trim().min(4).max(64),
});

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
          msisdn: data.msisdn,
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        status?: string;
        reference?: string;
        message?: string;
      };

      if (!res.ok || body.status === "failed") {
        return {
          ok: false as const,
          message: body.message ?? `Erreur iPay (${res.status})`,
        };
      }

      return {
        ok: true as const,
        status: body.status ?? "pending",
        reference: body.reference ?? "",
      };
    } catch (error) {
      console.error("iPay request failed", error);
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