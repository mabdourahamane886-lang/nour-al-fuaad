import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_payments",
  title: "Lister les paiements",
  description:
    "Liste les transactions iPay de NOUROUL FOUA'AD (les plus récentes d'abord). Réservé aux administrateurs.",
  inputSchema: {
    status: z
      .enum(["all", "pending", "success", "failed", "cancelled"])
      .default("all")
      .describe("Filtrer par statut de paiement."),
    limit: z.number().int().min(1).max(200).default(50).describe("Nombre maximum de lignes."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    const supabase = supabaseForUser(ctx);
    let q = supabase
      .from("payments")
      .select("transaction_id, reference, customer_name, msisdn, amount, programme, status, created_at, paid_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { count: data?.length ?? 0, payments: data ?? [] },
    };
  },
});