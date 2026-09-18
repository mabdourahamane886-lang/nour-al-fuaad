/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Bell, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, FileBadge2, GraduationCap, LogOut, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { claimStudentInscription, getStudentDashboard, markStudentNotificationRead, updateStudentProfile } from "@/lib/student.functions";

export const Route = createFileRoute("/etudiant/dashboard")({
  head: () => ({ meta: [
    { title: "Tableau de bord étudiant — NOUROUL FOUA'AD" },
    { name: "description", content: "Votre parcours, vos cours, vos progrès, vos évaluations et vos ressources Nouroul Foua'ad." },
    { name: "robots", content: "noindex" },
  ]}),
  component: StudentDashboardPage,
});

function StudentDashboardPage() {
  const navigate = useNavigate();
  const fetchDashboard = useServerFn(getStudentDashboard);
  const claim = useServerFn(claimStudentInscription);
  const markRead = useServerFn(markStudentNotificationRead);
  const saveProfile = useServerFn(updateStudentProfile);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [claimCode, setClaimCode] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileLevel, setProfileLevel] = useState("");
  const [offlineMode, setOfflineMode] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const result = await withTimeout(
        fetchDashboard({ data: undefined }),
        12000,
        "Le chargement du tableau de bord dépasse 12 secondes."
      );
      setData(result);
      setProfileName(result.profile?.full_name ?? "");
      setProfileLevel(result.profile?.level ?? "");
    } catch (e) {
      console.error("[StudentDashboard] load failed", e);
      setLoadError("Votre connexion est active, mais les données du tableau de bord n'ont pas pu être chargées.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        const { data: sessionData } = await withTimeout(
          supabase.auth.getSession(),
          8000,
          "La vérification de votre session a expiré."
        );
        if (!active) return;

        if (!sessionData.session) {
          const local = getLocalDashboardData();
          setOfflineMode(true);
          setData(local);
          setProfileName(local.profile.full_name ?? "");
          setProfileLevel(local.profile.level ?? "");
          setLoading(false);
          return;
        }

        await load();
      } catch {
        if (!active) return;
        const local = getLocalDashboardData();
        setOfflineMode(true);
        setData(local);
        setProfileName(local.profile.full_name ?? "");
        setProfileLevel(local.profile.level ?? "");
        setLoading(false);
      }
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) void load();
      else navigate({ to: "/etudiant/connexion", replace: true });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressAverage = useMemo(() => {
    const rows = data?.progress ?? [];
    return rows.length ? Math.round(rows.reduce((sum: number, r: any) => sum + Number(r.progress ?? 0), 0) / rows.length) : 0;
  }, [data]);
  const attendanceStats = useMemo(() => {
    const rows = data?.attendance ?? [];
    return { attended: rows.filter((r: any) => ["present","late"].includes(r.status)).length, total: rows.length };
  }, [data]);
  const unread = (data?.notifications ?? []).filter((n: any) => !n.read_at);

  const doClaim = async () => {
    setClaimError(null);
    if (offlineMode) {
      setClaimError("Le rattachement du dossier nécessite la base de données. Le tableau de bord autonome reste disponible hors ligne.");
      return;
    }
    try { await claim({ data: { tracking_code: claimCode, phone_last4: claimPhone } }); setClaimCode(""); setClaimPhone(""); await load(); }
    catch (e) { setClaimError((e as Error).message); }
  };
  const save = async () => {
    try {
      if (offlineMode) {
        const local = getLocalDashboardData();
        local.profile.full_name = profileName;
        local.profile.level = profileLevel;
        localStorage.setItem("nouroul_fouaad_local_dashboard", JSON.stringify(local));
        setData(local);
        return;
      }
      await saveProfile({ data: { full_name: profileName, level: profileLevel } });
      await load();
    } catch (e) { setClaimError((e as Error).message); }
  };
  const signOut = async () => { if (!offlineMode) await supabase.auth.signOut(); navigate({ to: "/etudiant/connexion" }); };

  if (loading) return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <section className="rounded-3xl border border-border bg-card p-7 md:p-10">
        <div className="animate-pulse space-y-5">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-10 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full max-w-2xl rounded bg-muted" />
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 rounded-3xl bg-muted/70" />)}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">Chargement sécurisé de votre espace étudiant…</p>
      </section>
    </main>
  );
  if (loadError) return (
    <main className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Espace étudiant</p>
        <h1 className="mt-3 text-2xl font-semibold text-primary">Votre connexion est bien active</h1>
        <p className="mt-3 text-sm text-muted-foreground">{loadError}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => void load()} className="rounded-full px-5 py-3 font-semibold text-white" style={{background:"var(--gradient-hero)"}}>Réessayer</button>
          <button onClick={signOut} className="rounded-full border border-border px-5 py-3">Se déconnecter</button>
        </div>
      </section>
    </main>
  );
  if (!data) return null;

  return <main className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-8">
    <section className="rounded-3xl p-7 md:p-10 text-primary-foreground" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div><p className="text-xs uppercase tracking-[0.25em] opacity-75">Tableau de bord étudiant</p><h1 className="text-4xl md:text-5xl mt-2" style={{ fontFamily: "var(--font-display)" }}>Bienvenue {data.profile?.full_name || "dans votre parcours"} 👋</h1><p className="mt-3 opacity-80 max-w-2xl">Un seul espace pour vos cours, votre progression, vos évaluations, votre assiduité et vos ressources.</p></div>
        <div className="flex flex-wrap gap-3"><Link to="/mon-espace" className="px-5 py-3 rounded-full border border-white/20 bg-white/10">Suivi du dossier</Link><button onClick={signOut} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-primary font-semibold"><LogOut className="w-4 h-4" /> Déconnexion</button></div>
      </div>
    </section>

    {offlineMode && <section className="rounded-3xl border border-accent/30 bg-accent/5 p-5">
      <p className="text-sm font-semibold text-primary">Mode autonome activé</p>
      <p className="mt-1 text-sm text-muted-foreground">Le tableau de bord fonctionne sans Supabase. Les modifications du profil sont conservées uniquement dans ce navigateur. Le rattachement du dossier, les notes réelles et la synchronisation avec l'académie seront réactivés lorsque la base de données sera disponible.</p>
    </section>}

    {!data.inscription && <section className="rounded-3xl border border-border bg-card p-7 md:p-9">
      <div className="flex items-center gap-3 mb-6"><ClipboardCheck className="w-6 h-6 text-accent" /><div><h2 className="text-2xl text-primary">Lier mon dossier</h2><p className="text-sm text-muted-foreground">Associez le compte à votre inscription existante.</p></div></div>
      <div className="grid md:grid-cols-[1fr_220px_auto] gap-3"><input value={claimCode} onChange={(e) => setClaimCode(e.target.value.toUpperCase())} placeholder="INS-XXXX-XXXX" className="rounded-2xl border border-input bg-background px-4 py-3.5" /><input value={claimPhone} onChange={(e) => setClaimPhone(e.target.value.replace(/\D/g,"").slice(-4))} placeholder="4 derniers chiffres WhatsApp" inputMode="numeric" className="rounded-2xl border border-input bg-background px-4 py-3.5" /><button onClick={doClaim} className="rounded-2xl px-6 py-3.5 font-semibold text-white" style={{ background: "var(--gradient-hero)" }}>Lier mon dossier</button></div>
      {claimError && <p className="mt-3 text-sm text-red-600">{claimError}</p>}
    </section>}

    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Metric icon={<GraduationCap className="w-5 h-5" />} label="Progression" value={`${progressAverage}%`} />
      <Metric icon={<CalendarDays className="w-5 h-5" />} label="Présence" value={attendanceStats.total ? `${attendanceStats.attended}/${attendanceStats.total}` : "—"} />
      <Metric icon={<ShieldCheck className="w-5 h-5" />} label="Évaluations" value={String(data.assessments?.length ?? 0)} />
      <Metric icon={<Bell className="w-5 h-5" />} label="Notifications" value={String(unread.length)} />
    </section>

    <section className="grid xl:grid-cols-[1.3fr_0.7fr] gap-6">
      <div className="rounded-3xl border border-border bg-card p-7"><div className="flex items-center justify-between mb-6"><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Parcours</p><h2 className="text-2xl text-primary">Mes formations</h2></div><BookOpen className="w-6 h-6 text-accent" /></div>
        {data.enrollments?.length ? <div className="grid md:grid-cols-2 gap-4">{data.enrollments.map((e:any)=>{const p=data.progress?.find((row:any)=>row.course_id===e.course_id);return <div key={e.id} className="rounded-2xl border border-border p-5"><p className="font-semibold text-primary">{e.student_courses?.title ?? "Formation"}</p><p className="text-xs text-muted-foreground mt-1">{e.student_courses?.subject ?? ""} · {e.status}</p>{p&&<ProgressBar value={Number(p.progress??0)}/>}<p className="text-sm text-muted-foreground mt-3">{e.student_courses?.description ?? ""}</p></div>})}</div> : <Empty text="Votre parcours apparaîtra ici dès que votre dossier sera lié et votre accès ouvert." />}
      </div>
      <div className="rounded-3xl border border-border bg-card p-7"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Calendrier</p><h2 className="text-2xl text-primary mb-5">Prochaines séances</h2><div className="space-y-3">{[["Lundi","15h30"],["Mercredi","15h30"],["Vendredi","15h30"]].map(([day,time])=><div key={day} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3"><span className="font-medium">{day}</span><span className="text-accent font-semibold">{time}</span></div>)}</div><p className="text-xs text-muted-foreground mt-4">Les horaires peuvent être adaptés selon le groupe.</p></div>
    </section>

    <section className="grid xl:grid-cols-2 gap-6">
      <Panel title="Mémorisation du Coran" icon={<BookOpen className="w-5 h-5" />}>{data.quranProgress?.length ? data.quranProgress.slice(0,8).map((q:any)=><div key={q.id} className="py-3 border-b border-border last:border-0"><div className="flex justify-between gap-4"><span className="font-medium">{q.surah_number}. {q.surah_name}</span><span className="text-xs text-muted-foreground">{q.memorization_percent}% mémorisation</span></div><ProgressBar value={Number(q.memorization_percent)}/><p className="text-xs text-muted-foreground mt-1">Révision : {q.revision_percent}%</p></div>) : <Empty text="Les sourates suivies par votre enseignant apparaîtront ici." />}</Panel>
      <Panel title="Évaluations récentes" icon={<CheckCircle2 className="w-5 h-5" />}>{data.assessments?.length ? data.assessments.map((a:any)=><div key={a.id} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0"><div><p className="font-medium">{a.title}</p><p className="text-xs text-muted-foreground">{a.subject} · {new Date(a.assessed_at).toLocaleDateString("fr-FR")}</p></div><span className="text-lg font-semibold text-accent">{a.score}/{a.max_score}</span></div>) : <Empty text="Vos notes et évaluations apparaîtront ici." />}</Panel>
      <Panel title="Présence" icon={<CalendarDays className="w-5 h-5" />}>{data.attendance?.length ? data.attendance.slice(0,8).map((a:any)=><div key={a.id} className="flex items-center justify-between py-3 border-b border-border last:border-0"><span>{new Date(a.session_date).toLocaleDateString("fr-FR")}</span><span className="text-xs px-2 py-1 rounded-full bg-muted">{labelAttendance(a.status)}</span></div>) : <Empty text="L'historique de présence sera renseigné par l'équipe pédagogique." />}</Panel>
      <Panel title="Ressources" icon={<FileBadge2 className="w-5 h-5" />}>{data.resources?.length ? data.resources.map((r:any)=><a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block py-3 border-b border-border last:border-0 hover:text-accent"><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground">{r.resource_type} · {r.description}</p></a>) : <Empty text="Les PDF, audios, vidéos et exercices seront ajoutés ici." />}</Panel>
    </section>

    <section className="grid xl:grid-cols-2 gap-6">
      <Panel title="Notifications" icon={<Bell className="w-5 h-5" />}>{data.notifications?.length ? data.notifications.map((n:any)=><div key={n.id} className="py-3 border-b border-border last:border-0"><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{n.title}</p><p className="text-sm text-muted-foreground mt-1">{n.message}</p></div>{!n.read_at&&<button onClick={async()=>{if(offlineMode){const local=getLocalDashboardData();local.notifications=(local.notifications??[]).map((item:any)=>item.id===n.id?{...item,read_at:new Date().toISOString()}:item);localStorage.setItem("nouroul_fouaad_local_dashboard",JSON.stringify(local));setData(local);}else{await markRead({data:{id:n.id}});await load();}}} className="text-xs text-accent font-semibold">Lu</button>}</div></div>) : <Empty text="Vous n'avez pas encore de notification." />}</Panel>
      <Panel title="Mon dossier & certificats" icon={<FileBadge2 className="w-5 h-5" />}>{data.inscription?<div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Code</span><span className="font-mono">{data.inscription.tracking_code}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Programme</span><span>{data.inscription.programme}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Statut</span><span className="text-accent font-semibold">{data.inscription.status}</span></div><div className="flex gap-3 pt-2"><Link to="/mon-espace" className="rounded-full border border-border px-4 py-2">Certificat / suivi</Link><Link to="/paiement" className="rounded-full border border-border px-4 py-2">Paiement</Link></div></div>:<Empty text="Liez votre dossier pour afficher vos informations d'inscription." />}</Panel>
    </section>

    <section className="rounded-3xl border border-border bg-card p-7"><div className="flex items-center gap-3 mb-5"><UserRound className="w-5 h-5 text-accent" /><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Profil</p><h2 className="text-2xl text-primary">Mes informations</h2></div></div><div className="grid md:grid-cols-[1fr_240px_auto] gap-3"><input value={profileName} onChange={(e)=>setProfileName(e.target.value)} className="rounded-2xl border border-input bg-background px-4 py-3.5" placeholder="Nom complet" /><input value={profileLevel} onChange={(e)=>setProfileLevel(e.target.value)} className="rounded-2xl border border-input bg-background px-4 py-3.5" placeholder="Niveau" /><button onClick={save} className="rounded-2xl px-6 py-3.5 font-semibold text-white" style={{background:"var(--gradient-hero)"}}>Enregistrer</button></div></section>
    <div className="flex flex-wrap justify-center gap-3 pb-6"><a href="https://wa.me/22788376133" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3"><MessageCircle className="w-4 h-4" /> Assistance WhatsApp</a><Link to="/cours" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3">Catalogue des formations</Link></div>
  </main>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-3xl border border-border bg-card p-5"><div className="flex items-center gap-2 text-accent">{icon}<span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span></div><p className="text-3xl text-primary mt-3">{value}</p></div>; }
function ProgressBar({ value }: { value: number }) { return <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full" style={{width:`${Math.max(0,Math.min(100,value))}%`,background:"var(--gradient-gold)"}} /></div>; }
function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-3xl border border-border bg-card p-7"><div className="flex items-center gap-3 mb-4">{icon}<h2 className="text-xl text-primary">{title}</h2></div>{children}</section>; }
function Empty({ text }: { text: string }) { return <div className="rounded-2xl bg-muted/40 p-5 text-sm text-muted-foreground">{text}</div>; }
function labelAttendance(status: string) { return ({present:"Présent",late:"En retard",absent:"Absent",excused:"Justifié"} as Record<string,string>)[status] ?? status; }

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}


function getLocalDashboardData() {
  const key = "nouroul_fouaad_local_dashboard";
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    // Ignore malformed local storage and restore the safe local state.
  }
  return {
    profile: {
      user_id: "local-student",
      full_name: "Étudiant Nouroul Foua'ad",
      whatsapp: "",
      level: "Mémorisation du Coran",
      avatar_url: null,
    },
    inscription: null,
    courses: [
      { id: "local-coran", slug: "memorisation-coran", title: "Mémorisation du Coran", subject: "Coran", description: "Parcours de mémorisation, révision et accompagnement.", level: "Tous niveaux", schedule: "Selon le groupe", active: true },
      { id: "local-tajwid", slug: "tajwid", title: "Tajwid", subject: "Sciences coraniques", description: "Apprentissage progressif des règles de récitation.", level: "Tous niveaux", schedule: "Selon le groupe", active: true },
    ],
    enrollments: [{
      id: "local-enrollment-1",
      status: "mode autonome",
      enrolled_at: new Date().toISOString(),
      course_id: "local-coran",
      inscription_id: null,
      student_courses: { id: "local-coran", title: "Mémorisation du Coran", subject: "Coran", description: "Parcours de mémorisation, révision et accompagnement." },
    }],
    progress: [{ id: "local-progress-1", course_id: "local-coran", progress: 0, teacher_note: "Les données réelles apparaîtront après reconnexion à la base." }],
    quranProgress: [],
    assessments: [],
    attendance: [],
    notifications: [{
      id: "local-notice",
      title: "Mode autonome",
      message: "Le tableau de bord reste accessible pendant l'indisponibilité de la base de données.",
      type: "system",
      read_at: null,
      created_at: new Date().toISOString(),
    }],
    resources: [],
  };
}
