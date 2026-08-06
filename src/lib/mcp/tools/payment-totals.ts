import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "payment_totals",
  title: "Totaux encaissés",
  description:
    "Calcule le total encaissé (paiements validés) sur les N derniers jours, en FCFA. Réservé aux administrateurs.",
  inputSchema: {
    days: z.number().int().min(1).max(365).default(30).describe("Fenêtre en jours à partir d'aujourd'hui."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    const supabase = supabaseForUser(ctx);
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { data, error } = await supabase
      .from("payments")
      .select("amount, paid_at")
      .eq("status", "success")
      .gte("paid_at", since);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const rows = data ?? [];
    const total = rows.reduce((s, r) => s + (r.amount ?? 0), 0);
    return {
      content: [
        { type: "text", text: `${rows.length} paiement(s) validé(s) sur ${days} jours — total ${total} FCFA.` },
      ],
      structuredContent: { days, count: rows.length, total_fcfa: total },
    };
  },
});