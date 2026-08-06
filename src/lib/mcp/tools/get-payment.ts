import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_payment",
  title: "Détail d'un paiement",
  description:
    "Récupère une transaction iPay par son identifiant de transaction ou sa référence. Réservé aux administrateurs.",
  inputSchema: {
    transaction_id: z.string().trim().nullable().describe("Identifiant de transaction (NF-...). Null si référence fournie."),
    reference: z.string().trim().nullable().describe("Référence iPay. Null si transaction_id fourni."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ transaction_id, reference }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    if (!transaction_id && !reference)
      return { content: [{ type: "text", text: "Fournir transaction_id ou reference." }], isError: true };
    const supabase = supabaseForUser(ctx);
    let q = supabase.from("payments").select("*").limit(1);
    q = transaction_id ? q.eq("transaction_id", transaction_id) : q.eq("reference", reference!);
    const { data, error } = await q.maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Aucun paiement trouvé." }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { payment: data },
    };
  },
});