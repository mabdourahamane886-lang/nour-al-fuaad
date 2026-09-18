/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export const getStudentDashboard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existingProfile } = await supabaseAdmin.from("student_profiles").select("user_id, full_name, whatsapp, level, avatar_url, created_at, updated_at").eq("user_id", context.userId).maybeSingle();
    const profile = existingProfile ?? (await supabaseAdmin.from("student_profiles").insert({
      user_id: context.userId,
      full_name: (context.claims?.email as string | undefined)?.split("@")[0] ?? null,
    }).select("user_id, full_name, whatsapp, level, avatar_url, created_at, updated_at").single()).data;

    const inscriptionRes = await supabaseAdmin.from("inscriptions")
      .select("id, tracking_code, customer_name, whatsapp, programme, status, note, created_at, validated_at, access_granted_at")
      .eq("user_id", context.userId).order("created_at", { ascending: false }).limit(1);

    const [coursesRes, enrollmentsRes, progressRes, quranRes, assessmentsRes, attendanceRes, notificationsRes] = await Promise.all([
      supabaseAdmin.from("student_courses").select("id, slug, title, subject, description, level, schedule, active").eq("active", true).order("title"),
      supabaseAdmin.from("student_enrollments").select("id, status, enrolled_at, course_id, inscription_id, student_courses(id, slug, title, subject, description, level, schedule)").eq("user_id", context.userId).order("enrolled_at", { ascending: false }),
      supabaseAdmin.from("student_progress").select("id, progress, last_activity_at, teacher_note, course_id, student_courses(title, subject)").eq("user_id", context.userId).order("updated_at", { ascending: false }),
      supabaseAdmin.from("quran_progress").select("id, surah_number, surah_name, memorization_percent, revision_percent, teacher_note, updated_at").eq("user_id", context.userId).order("surah_number"),
      supabaseAdmin.from("student_assessments").select("id, subject, title, score, max_score, assessed_at, teacher_note").eq("user_id", context.userId).order("assessed_at", { ascending: false }).limit(10),
      supabaseAdmin.from("student_attendance").select("id, session_date, status, notes, course_id, student_courses(title)").eq("user_id", context.userId).order("session_date", { ascending: false }).limit(30),
      supabaseAdmin.from("student_notifications").select("id, title, message, type, read_at, created_at").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(12),
    ]);

    const courseIds = (enrollmentsRes.data ?? []).map((e: any) => e.course_id).filter(Boolean);
    let resources: any[] = [];
    const publicResources = await supabaseAdmin.from("student_resources").select("id, title, description, resource_type, url, course_id, created_at").eq("is_public", true).order("created_at", { ascending: false }).limit(20);
    resources = publicResources.data ?? [];
    if (courseIds.length) {
      const privateResources = await supabaseAdmin.from("student_resources").select("id, title, description, resource_type, url, course_id, created_at").in("course_id", courseIds).order("created_at", { ascending: false }).limit(20);
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inscription, error } = await supabaseAdmin.from("inscriptions")
      .select("id, tracking_code, customer_name, whatsapp, programme, status, user_id")
      .eq("tracking_code", data.tracking_code).maybeSingle();

    if (error) throw new Error(error.message);
    if (!inscription) throw new Error("Code de suivi introuvable.");
    const digits = inscription.whatsapp.replace(/\D/g, "");
    if (!digits.endsWith(data.phone_last4)) throw new Error("Les 4 derniers chiffres ne correspondent pas.");
    if (inscription.status === "pending") throw new Error("Votre dossier est encore en attente de validation.");
    if (inscription.user_id && inscription.user_id !== context.userId) throw new Error("Ce dossier est déjà rattaché à un autre compte.");

    if (!inscription.user_id) {
      const { error: updateError } = await supabaseAdmin.from("inscriptions").update({ user_id: context.userId }).eq("id", inscription.id).is("user_id", null);
      if (updateError) throw new Error(updateError.message);
    }

    await supabaseAdmin.from("student_profiles").upsert({ user_id: context.userId, full_name: inscription.customer_name, whatsapp: inscription.whatsapp }, { onConflict: "user_id" });

    const slugs = programmeToSlugs[normalizeProgramme(inscription.programme)] ?? [];
    if (slugs.length) {
      const { data: courses } = await supabaseAdmin.from("student_courses").select("id, slug").in("slug", slugs);
      for (const course of courses ?? []) {
        await supabaseAdmin.from("student_enrollments").upsert({
          user_id: context.userId, course_id: course.id, inscription_id: inscription.id, status: "active",
        }, { onConflict: "user_id,course_id" });
      }
    }
    return { ok: true };
  });

export const updateStudentProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ full_name: z.string().trim().min(2).max(100), level: z.string().trim().max(80).optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("student_profiles").upsert({ user_id: context.userId, full_name: data.full_name, level: data.level || null }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markStudentNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("student_notifications").update({ read_at: new Date().toISOString() }).eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
