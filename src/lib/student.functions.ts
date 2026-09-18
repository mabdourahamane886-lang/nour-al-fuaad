/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const claimSchema = z.object({
  tracking_code: z.string().trim().min(8).max(32).toUpperCase(),
  phone_last4: z.string().trim().regex(/^\d{4}$/, "Les 4 derniers chiffres sont requis."),
});

const programmeToSlugs: Record<string, string[]> = {
  "mémorisation du coran": ["memorisation-coran"],
  tajwid: ["tajwid"],
  hadiths: ["hadiths"],
  fiqh: ["fiqh"],
  invocations: ["invocations"],
  "langue arabe": ["langue-arabe"],
  arabe: ["langue-arabe"],
  "sciences islamiques": ["memorisation-coran", "tajwid", "hadiths", "fiqh", "invocations"],
};

const normalizeProgramme = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();

export const createStudentAccount = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
    full_name: z.string().trim().min(2).max(100),
  }).parse(input))
  .handler(async ({ data }) => {
    // La clé secrète Supabase reste uniquement côté serveur.
    // Les comptes étudiants sont confirmés automatiquement : aucun email de validation n'est requis.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        throw new Error("Un compte existe déjà avec cet email. Connectez-vous avec votre mot de passe ou utilisez un autre email.");
      }
      throw new Error(error.message);
    }

    if (!created.user) throw new Error("Le compte étudiant n'a pas pu être créé.");

    await supabaseAdmin.from("student_profiles").upsert({
      user_id: created.user.id,
      full_name: data.full_name,
    }, { onConflict: "user_id" });

    return { ok: true };
  });

export const getStudentDashboard = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ access_token: z.string().min(20) }).parse(input))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Configuration Supabase serveur manquante.");
    const db = createClient<Database>(url, key, {
      global: { headers: { Authorization: `Bearer ${data.access_token}` } },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data: claimsData, error: claimsError } = await db.auth.getClaims(data.access_token);
    if (claimsError || !claimsData?.claims?.sub) throw new Error("Unauthorized: Invalid token");
    const userId = claimsData.claims.sub;
    const email = claimsData.claims.email as string | undefined;
    // Le jeton de la session navigateur est transmis explicitement au serveur.
    // Cela évite de dépendre d'un Authorization header que useServerFn ne relaie pas automatiquement.

    const { data: existingProfile } = await db.from("student_profiles")
      .select("user_id, full_name, whatsapp, level, avatar_url, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    let profile = existingProfile;
    if (!profile) {
      const { data: createdProfile, error: profileError } = await db.from("student_profiles")
        .upsert({
          user_id: userId,
          full_name: email?.split("@")[0] ?? null,
        }, { onConflict: "user_id" })
        .select("user_id, full_name, whatsapp, level, avatar_url, created_at, updated_at")
        .maybeSingle();

      if (profileError) {
        console.error("[StudentDashboard] profile bootstrap failed", profileError);
      } else {
        profile = createdProfile;
      }
    }

    const inscriptionRes = await db.from("inscriptions")
      .select("id, tracking_code, customer_name, whatsapp, programme, status, note, created_at, validated_at, access_granted_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    const [coursesRes, enrollmentsRes, progressRes, quranRes, assessmentsRes, attendanceRes, notificationsRes] = await Promise.all([
      db.from("student_courses").select("id, slug, title, subject, description, level, schedule, active").eq("active", true).order("title"),
      db.from("student_enrollments").select("id, status, enrolled_at, course_id, inscription_id, student_courses(id, slug, title, subject, description, level, schedule)").eq("user_id", userId).order("enrolled_at", { ascending: false }),
      db.from("student_progress").select("id, progress, last_activity_at, teacher_note, course_id, student_courses(title, subject)").eq("user_id", userId).order("updated_at", { ascending: false }),
      db.from("quran_progress").select("id, surah_number, surah_name, memorization_percent, revision_percent, teacher_note, updated_at").eq("user_id", userId).order("surah_number"),
      db.from("student_assessments").select("id, subject, title, score, max_score, assessed_at, teacher_note").eq("user_id", userId).order("assessed_at", { ascending: false }).limit(10),
      db.from("student_attendance").select("id, session_date, status, notes, course_id, student_courses(title)").eq("user_id", userId).order("session_date", { ascending: false }).limit(30),
      db.from("student_notifications").select("id, title, message, type, read_at, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(12),
    ]);

    const courseIds = (enrollmentsRes.data ?? []).map((e: any) => e.course_id).filter(Boolean);
    let resources: any[] = [];
    const publicResources = await db.from("student_resources")
      .select("id, title, description, resource_type, url, course_id, created_at")
      .eq("is_public", true).order("created_at", { ascending: false }).limit(20);
    resources = publicResources.data ?? [];
    if (courseIds.length) {
      const privateResources = await db.from("student_resources")
        .select("id, title, description, resource_type, url, course_id, created_at")
        .in("course_id", courseIds).order("created_at", { ascending: false }).limit(20);
      resources = Array.from(new Map([...resources, ...(privateResources.data ?? [])].map((r: any) => [r.id, r])).values());
    }

    return {
      profile,
      inscription: inscriptionRes.data?.[0] ?? null,
      courses: coursesRes.data ?? [],
      enrollments: enrollmentsRes.data ?? [],
      progress: progressRes.data ?? [],
      quranProgress: quranRes.data ?? [],
      assessments: assessmentsRes.data ?? [],
      attendance: attendanceRes.data ?? [],
      notifications: notificationsRes.data ?? [],
      resources,
    };
  });

export const claimStudentInscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => claimSchema.parse(input))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inscription, error } = await supabaseAdmin.from("inscriptions")
      .select("id, tracking_code, customer_name, whatsapp, programme, status, user_id")
      .eq("tracking_code", data.tracking_code).maybeSingle();

    if (error) throw new Error(error.message);
    if (!inscription) throw new Error("Code de suivi introuvable.");
    const digits = inscription.whatsapp.replace(/\D/g, "");
    if (!digits.endsWith(data.phone_last4)) throw new Error("Les 4 derniers chiffres ne correspondent pas.");
    if (inscription.status === "pending") throw new Error("Votre dossier est encore en attente de validation.");
    if (inscription.user_id && inscription.user_id !== userId) throw new Error("Ce dossier est déjà rattaché à un autre compte.");

    if (!inscription.user_id) {
      const { error: updateError } = await supabaseAdmin.from("inscriptions").update({ user_id: userId }).eq("id", inscription.id).is("user_id", null);
      if (updateError) throw new Error(updateError.message);
    }

    await supabaseAdmin.from("student_profiles").upsert({ user_id: userId, full_name: inscription.customer_name, whatsapp: inscription.whatsapp }, { onConflict: "user_id" });

    const slugs = programmeToSlugs[normalizeProgramme(inscription.programme)] ?? [];
    if (slugs.length) {
      const { data: courses } = await supabaseAdmin.from("student_courses").select("id, slug").in("slug", slugs);
      for (const course of courses ?? []) {
        await supabaseAdmin.from("student_enrollments").upsert({
          user_id: userId, course_id: course.id, inscription_id: inscription.id, status: "active",
        }, { onConflict: "user_id,course_id" });
      }
    }
    return { ok: true };
  });

export const updateStudentProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ full_name: z.string().trim().min(2).max(100), level: z.string().trim().max(80).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { error } = await context.supabase.from("student_profiles")
      .upsert({ user_id: userId, full_name: data.full_name, level: data.level || null }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markStudentNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("student_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
