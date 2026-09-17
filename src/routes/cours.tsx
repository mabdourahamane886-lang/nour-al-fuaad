import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Clock3, GraduationCap, ShieldCheck } from "lucide-react";
import { PriceCard } from "@/components/PriceCard";

export const Route = createFileRoute("/cours")({
  head: () => ({ meta: [
    { title: "Formations — Nouroul Foua'ad" },
    { name: "description", content: "Découvrez les formations de Nouroul Foua'ad : Coran, tajwid, hadiths, fiqh et parcours de langue arabe." },
  ] }),
  component: CoursPage,
});

const subjects = [
  { icon: "📖", ar: "حِفْظُ الْقُرْآن", fr: "Mémorisation du Coran", desc: "Construire une mémorisation progressive avec révisions et accompagnement.", points: ["Mémorisation progressive", "Révisions encadrées", "Tajwid intégré"] },
  { icon: "🎙️", ar: "التَّجْوِيد", fr: "Tajwid", desc: "Améliorer la qualité de la récitation en comprenant les règles essentielles.", points: ["Règles de base", "Correction de récitation", "Pratique régulière"] },
  { icon: "📚", ar: "الْحَدِيث", fr: "Hadiths", desc: "Étudier les hadiths avec compréhension du sens et application au quotidien.", points: ["Textes sélectionnés", "Explication du sens", "Leçons pratiques"] },
  { icon: "⚖️", ar: "الْفِقْهُ", fr: "Fiqh", desc: "Acquérir les connaissances indispensables pour la pratique religieuse.", points: ["Purification & prière", "Jeûne & zakat", "Situations du quotidien"] },
  { icon: "🤲", ar: "الأَذْكَار", fr: "Invocations", desc: "Apprendre les adhkar et invocations utiles dans la vie quotidienne.", points: ["Invocations authentiques", "Mémorisation", "Mise en pratique"] },
  { icon: "ع", ar: "اللُّغَةُ الْعَرَبِيَّة", fr: "Langue arabe", desc: "Progresser en lecture, vocabulaire, compréhension et expression.", points: ["Niveau débutant", "Lecture arabe", "Progression par niveaux"] },
];

function CoursPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <header className="text-center max-w-3xl mx-auto mb-14">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Catalogue</p>
        <h1 className="text-5xl md:text-6xl text-primary mb-4">Nos formations</h1>
        <p className="text-muted-foreground text-lg leading-relaxed">Des parcours conçus pour avancer avec clarté, régularité et accompagnement. Choisissez votre objectif et commencez votre parcours.</p>
      </header>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mb-20">
        {subjects.map((s) => (
          <article key={s.fr} className="group rounded-3xl bg-card border border-border p-7 hover:border-accent hover:-translate-y-1 transition-all shadow-sm hover:shadow-lg">
            <div className="text-3xl mb-4">{s.icon}</div><div className="font-arabic text-2xl text-accent mb-2">{s.ar}</div><h2 className="text-2xl text-primary mb-3">{s.fr}</h2><p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.desc}</p>
            <ul className="space-y-2 text-sm mb-6">{s.points.map((p) => <li key={p} className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /><span>{p}</span></li>)}</ul>
            <Link to={s.fr === "Langue arabe" ? "/arabe" : "/inscription"} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">Commencer ce parcours <ArrowRight className="w-4 h-4" /></Link>
          </article>
        ))}
      </section>

      <section className="grid lg:grid-cols-3 gap-5 mb-20">
        <div className="rounded-3xl p-7 bg-card border border-border"><GraduationCap className="w-7 h-7 text-accent mb-4" /><h3 className="text-xl text-primary mb-2">Programme structuré</h3><p className="text-sm text-muted-foreground">Objectifs, séances et révisions présentés de façon simple pour garder le cap.</p></div>
        <div className="rounded-3xl p-7 bg-card border border-border"><Clock3 className="w-7 h-7 text-accent mb-4" /><h3 className="text-xl text-primary mb-2">Régularité</h3><p className="text-sm text-muted-foreground">Le calendrier de l'inscription indique actuellement trois séances hebdomadaires à 15h30.</p></div>
        <div className="rounded-3xl p-7 bg-card border border-border"><ShieldCheck className="w-7 h-7 text-accent mb-4" /><h3 className="text-xl text-primary mb-2">Suivi du dossier</h3><p className="text-sm text-muted-foreground">Un code de suivi permet de retrouver votre inscription et son état.</p></div>
      </section>

      <section className="max-w-4xl mx-auto mb-20"><div className="text-center mb-10"><p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Tarifs actuels</p><h2 className="text-4xl text-primary">Sciences islamiques</h2><p className="text-muted-foreground mt-3">Les montants affichés ci-dessous reprennent les tarifs actuellement présents sur le site.</p></div><div className="grid sm:grid-cols-2 gap-5"><PriceCard label="Inscription" price="3 000" highlight /><PriceCard label="Mensualité" price="5 000" /></div></section>

      <section className="rounded-[2rem] p-10 md:p-14 text-primary-foreground" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}><div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center"><div><p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "var(--gold)" }}>Prochaine étape</p><h2 className="text-4xl md:text-5xl mb-4">Choisir une formation et s'inscrire</h2><p className="text-white/75 max-w-2xl leading-relaxed">Après l'inscription, vous obtenez un code de suivi. Vous pouvez ensuite suivre votre dossier depuis votre espace étudiant.</p></div><Link to="/inscription" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full text-primary font-semibold" style={{ background: "var(--gradient-gold)" }}>S'inscrire <ArrowRight className="w-4 h-4" /></Link></div></section>
    </div>
  );
}
