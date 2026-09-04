import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const STATUSES = ["pending", "validated", "access_granted"] as const;
export type InscriptionStatus = (typeof STATUSES)[number];

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function block(n: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/** Code de suivi lisible : INS-XXXX-XXXX */
function generateTrackingCode(): string {
  return `INS-${block(4)}-${block(4)}`;
}

function maskWhatsapp(v: string): string {
  const digits = v.replace(/\D/g, "");
  if (digits.length <= 4) return "••••";
  return `${"•".repeat(Math.max(2, digits.length - 4))}${digits.slice(-4)}`;
}

/** Enregistre une demande d'inscription et renvoie son code de suivi. */
export const createInscription = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        customer_name: z.string().trim().min(2).max(80),
        whatsapp: z.string().trim().min(6).max(20),
        programme: z.string().trim().min(2).max(80),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const tracking_code = generateTrackingCode();
    const { data: row, error } = await supabaseAdmin
      .from("inscriptions")
      .insert({ ...data, tracking_code, status: "pending" })
      .select("tracking_code")
      .single();
    if (error) {
      console.error("createInscription failed", error);
      throw new Error("Impossible d'enregistrer l'inscription. Réessayez.");
    }
    return { tracking_code: row.tracking_code };
  });

/** Consultation publique du statut par code de suivi (ou numéro WhatsApp). */
export const getInscriptionStatus = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ query: z.string().trim().min(4).max(40) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const q = data.query.trim();
    const isCode = /^INS-/i.test(q);

    let req = supabaseAdmin
      .from("inscriptions")
      .select(
        "tracking_code, customer_name, whatsapp, programme, status, note, created_at, validated_at, access_granted_at",
      )
      .order("created_at", { ascending: false })
      .limit(1);

    req = isCode
      ? req.eq("tracking_code", q.toUpperCase())
      : req.eq("whatsapp", q);

    const { data: row, error } = await req.maybeSingle();
    if (error) {
      console.error("getInscriptionStatus failed", error);
      return { inscription: null };
    }
    if (!row) return { inscription: null };
    return { inscription: { ...row, whatsapp: maskWhatsapp(row.whatsapp) } };
  });

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Accès refusé : administrateur uniquement.");
  return supabaseAdmin;
}

export const listInscriptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ status: z.enum(["all", ...STATUSES]).default("all") })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context.userId);
    let q = db
      .from("inscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const updateInscriptionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(STATUSES),
        note: z.string().trim().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const db = await assertAdmin(context.userId);
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status: data.status };
    if (data.note !== undefined) patch.note = data.note || null;
    if (data.status === "validated") {
      patch.validated_at = now;
      patch.access_granted_at = null;
    } else if (data.status === "access_granted") {
      patch.access_granted_at = now;
    } else {
      patch.validated_at = null;
      patch.access_granted_at = null;
    }
    const { error } = await db.from("inscriptions").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
