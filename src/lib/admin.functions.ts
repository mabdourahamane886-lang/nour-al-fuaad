import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Accès refusé : administrateur uniquement.");
}

export const isCurrentUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { admin: Boolean(data) };
  });

export const listPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        status: z.enum(["all", "pending", "success", "failed", "cancelled"]).default("all"),
        limit: z.number().int().min(1).max(200).default(100),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    let q = supabaseAdmin
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const { data: totals } = await supabaseAdmin
      .from("payments")
      .select("amount, status, paid_at")
      .eq("status", "success");
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const sumToday = (totals ?? [])
      .filter((r) => r.paid_at && r.paid_at >= startOfDay)
      .reduce((s, r) => s + (r.amount ?? 0), 0);
    const sumMonth = (totals ?? [])
      .filter((r) => r.paid_at && r.paid_at >= startOfMonth)
      .reduce((s, r) => s + (r.amount ?? 0), 0);

    return { rows: rows ?? [], sumToday, sumMonth };
  });

export const getIPayConfigStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    return {
      privateKey: Boolean(process.env.IPAY_PRIVATE_KEY),
      webhookSecret: Boolean(process.env.IPAY_WEBHOOK_SECRET),
      environment: (process.env.IPAY_ENVIRONMENT ?? "sandbox").toLowerCase(),
    };
  });