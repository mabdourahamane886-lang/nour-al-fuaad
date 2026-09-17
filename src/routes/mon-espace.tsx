import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BookOpen, CheckCircle2, ClipboardCheck, CreditCard, MessageCircle, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getInscriptionStatus } from "@/lib/inscriptions.functions";

export const Route = createFileRoute("/mon-espace")({
  head: () => ({ meta: [
    { title: "Espace étudiant — Nouroul Foua'ad" },
    { name: "description", content: "Suivez votre inscription, votre parcours et les prochaines étapes depuis votre espace étudiant Nouroul Foua'ad." },
  ] }),
  component: MonEspacePage,
});

type Inscription = { tracking_code: string; customer_name: string; whatsapp: string; programme: string; status: string; note: string | null; created_at: string; validated_at: string | null; access_granted_at: string | null };

const STEPS = [
  { key: "pending", label: "Dossier reçu", desc: "Votre demande est enregistrée. Envoyez le justificatif de paiement si nécessaire." },
  { key: "validated", label: "Paiement validé", desc: "Votre dossier est confirmé et votre place est réservée." },
  { key: "access_granted", label: "Accès au parcours", desc: "Votre accès aux séances et ressources peut être ouvert." },
] as const;

function MonEspacePage() {
  const fetchStatus = useServerFn(getInscriptionStatus);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Inscription | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certificateCode, setCertificateCode] = useState("");
  const [certificateMessage, setCertificateMessage] = useState("");

  const lookup = async (value: string) => {
    if (value.trim().length < 4) return;
    setLoading(true);
    try {
      const res = await fetchStatus({ data: { query: value.trim() } });
      setData((res.inscription as Inscription | null) ?? null);
      setSearched(true);
      if (typeof window !== "undefined") window.localStorage.setItem("nf_tracking_code", value.trim());
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("nf_tracking_code");
    if (saved) { setQuery(saved); lookup(saved); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentIndex = data ? Math.max(0, STEPS.findIndex((s) => s.key === data.status)) : -1;

  const verifyCertificate = () => {
    const value = certificateCode.trim().toUpperCase();
    if (!value) { setCertificateMessage("Saisissez le code figurant sur votre certificat."); return; }
    setCertificateMessage(/^NF-[A-Z0-9-]{6,30}$/.test(value)
      ? "Code reconnu au format certificat. La vérification définitive dépendra de l'enregistrement du certificat dans la base de l'académie."
      : "Format de code invalide. Exemple : NF-2026-000145.");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
      <header className="text-center max-w-3xl mx-auto mb-12"><p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Espace étudiant</p><h1 className="text-5xl md:text-6xl text-primary mb-4">Mon parcours</h1><p className="text-muted-foreground text-lg leading-relaxed">Retrouvez votre inscription, son statut, les prochaines étapes et les actions utiles au même endroit.</p></header>

      <section className="max-w-4xl mx-auto mb-10"><form onSubmit={(e) => { e.preventDefault(); lookup(query); }} className="rounded-3xl bg-card border border-border p-4 md:p-5 shadow-sm"><div className="flex flex-col md:flex-row gap-3"><div className="relative flex-1"><ClipboardCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" /><input value={query} onChange={(e) => setQuery(e.target.value)} maxLength={40} placeholder="Code INS-XXXX-XXXX ou numéro WhatsApp" className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-background border border-input outline-none focus:ring-2 focus:ring-accent/25" /></div><button type="submit" disabled={loading} className="px-7 py-3.5 rounded-2xl font-semibold text-primary-foreground disabled:opacity-60" style={{ background: "var(--gradient-hero)" }}>{loading ? "Recherche…" : "Voir mon dossier"}</button></div><p className="text-xs text-muted-foreground mt-3">Votre code de suivi est fourni après l'inscription.</p></form></section>

      {searched && !data && <div className="max-w-4xl mx-auto mb-10 rounded-3xl border border-border bg-card p-8 text-center"><p className="text-lg font-semibold text-primary">Aucun dossier trouvé</p><p className="text-sm text-muted-foreground mt-2 mb-5">Vérifiez votre code ou votre numéro WhatsApp.</p><Link to="/inscription" className="inline-flex px-6 py-3 rounded-full text-primary font-semibold" style={{ background: "var(--gradient-gold)" }}>Créer une inscription</Link></div>}

      {data && <div className="space-y-8">
        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
          <div className="rounded-3xl bg-card border border-border p-7 md:p-9 shadow-sm"><div className="flex items-center justify-between gap-4 mb-6"><div><p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Dossier étudiant</p><p className="font-mono text-xl text-primary mt-1">{data.tracking_code}</p></div><div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-gold)" }}><UserRound className="w-6 h-6 text-primary" /></div></div><dl className="grid sm:grid-cols-2 gap-5 text-sm"><Field label="Nom" value={data.customer_name} /><Field label="Programme" value={data.programme} /><Field label="WhatsApp" value={data.whatsapp} /><Field label="Demande" value={new Date(data.created_at).toLocaleDateString("fr-FR")} /></dl>{data.note && <div className="mt-6 rounded-2xl bg-accent/10 border border-accent/20 p-4 text-sm text-primary">{data.note}</div>}</div>
          <div className="rounded-3xl p-7 md:p-9 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}><p className="text-xs uppercase tracking-[0.25em] mb-3 opacity-70">Statut</p><p className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>{STEPS[currentIndex]?.label ?? "Dossier reçu"}</p><p className="text-sm opacity-75 mt-3">{STEPS[currentIndex]?.desc}</p><div className="mt-6 h-2 rounded-full bg-white/15 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max(20, ((currentIndex + 1) / STEPS.length) * 100)}%`, background: "var(--gradient-gold)" }} /></div></div>
        </section>

        <section className="rounded-3xl bg-card border border-border p-7 md:p-9"><div className="flex items-center gap-3 mb-6"><div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-gold)" }}><CheckCircle2 className="w-5 h-5 text-primary" /></div><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Étapes</p><h2 className="text-2xl text-primary">Avancement de votre dossier</h2></div></div><ol className="grid md:grid-cols-3 gap-4">{STEPS.map((step, i) => { const done = currentIndex >= i; const active = currentIndex === i; return <li key={step.key} className={`rounded-2xl border p-5 ${done ? "border-accent/40 bg-accent/5" : "border-border bg-muted/30 opacity-70"}`}><div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-primary" style={done ? { background: "var(--gradient-gold)" } : { background: "var(--muted)" }}>{done ? "✓" : i + 1}</div><p className="font-semibold text-primary">{step.label}</p></div><p className="text-sm text-muted-foreground">{step.desc}</p>{active && <p className="mt-3 text-xs uppercase tracking-widest text-accent">Étape actuelle</p>}</li>; })}</ol></section>

        <section className="grid md:grid-cols-3 gap-4">
          <Link to="/paiement" className="rounded-3xl bg-card border border-border p-6 hover:border-accent hover:-translate-y-0.5 transition-all"><CreditCard className="w-6 h-6 text-accent mb-4" /><p className="font-semibold text-primary">Paiement</p><p className="text-sm text-muted-foreground mt-1">Consulter les moyens de paiement.</p></Link>
          <Link to="/cours" className="rounded-3xl bg-card border border-border p-6 hover:border-accent hover:-translate-y-0.5 transition-all"><BookOpen className="w-6 h-6 text-accent mb-4" /><p className="font-semibold text-primary">Formations</p><p className="text-sm text-muted-foreground mt-1">Voir les programmes disponibles.</p></Link>
          <a href="https://wa.me/22788376133" target="_blank" rel="noopener noreferrer" className="rounded-3xl bg-card border border-border p-6 hover:border-accent hover:-translate-y-0.5 transition-all"><MessageCircle className="w-6 h-6 text-accent mb-4" /><p className="font-semibold text-primary">Assistance</p><p className="text-sm text-muted-foreground mt-1">Contacter l'équipe sur WhatsApp.</p></a>
        </section>
      </div>}

      <section className="max-w-4xl mx-auto mt-12 rounded-3xl border border-border bg-card p-7 md:p-9"><div className="flex items-center gap-3 mb-6"><div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-gold)" }}><Award className="w-5 h-5 text-primary" /></div><div><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Certification</p><h2 className="text-2xl text-primary">Vérifier un certificat</h2></div></div><div className="flex flex-col sm:flex-row gap-3"><input value={certificateCode} onChange={(e) => setCertificateCode(e.target.value)} placeholder="Ex. NF-2026-000145" className="flex-1 px-4 py-3.5 rounded-2xl bg-background border border-input outline-none focus:ring-2 focus:ring-accent/25" /><button onClick={verifyCertificate} type="button" className="px-6 py-3.5 rounded-2xl font-semibold text-primary" style={{ background: "var(--gradient-gold)" }}>Vérifier</button></div>{certificateMessage && <div className="mt-4 rounded-2xl bg-accent/5 border border-accent/20 p-4 text-sm text-muted-foreground">{certificateMessage}</div>}<p className="text-xs text-muted-foreground mt-4">La base publique des certificats pourra être reliée à Supabase lorsque les certificats seront enregistrés.</p></section>

      <div className="mt-8 flex flex-wrap justify-center gap-3">{data?.status === "access_granted" && <Link to="/cours" className="px-6 py-3 rounded-full text-primary-foreground font-semibold" style={{ background: "var(--gradient-hero)" }}>Accéder aux formations</Link>}<Link to="/paiement" className="px-6 py-3 rounded-full border border-border text-primary font-medium">Voir le paiement</Link><a href={`https://wa.me/22788376133?text=${encodeURIComponent(data ? `Assalâmu ‘alaykum, je suis ${data.customer_name}. Code de suivi : ${data.tracking_code}.` : "Assalâmu ‘alaykum, je souhaite des informations sur Nouroul Foua'ad.")}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full border border-border text-primary font-medium">WhatsApp</a></div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</dt><dd className="text-primary">{value}</dd></div>; }
