import { createFileRoute, Link } from "@tanstack/react-router";
import { PriceCard } from "@/components/PriceCard";

export const Route = createFileRoute("/cours")({
  head: () => ({
    meta: [
      { title: "Cours & Tarifs — NOUROUL FOUA'AD" },
      { name: "description", content: "Mémorisation du Coran, hadiths et fiqh. Tarifs : inscription 3000F, mois 5000F. Accompagnement avec succès." },
    ],
  }),
  component: CoursPage,
});

const subjects = [
  {
    ar: "حِفْظُ الْقُرْآن",
    fr: "Mémorisation du Coran",
    points: ["Tajwid pas à pas", "Mémorisation progressive", "Révisions encadrées"],
  },
  {
    ar: "الْحَدِيث",
    fr: "Hadiths",
    points: ["Recueils authentiques", "Explication du sens", "Application quotidienne"],
  },
  {
    ar: "الْفِقْهُ",
    fr: "Fiqh",
    points: ["Purification & prière", "Jeûne & zakat", "Transactions licites"],
  },
];

function CoursPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <header className="text-center mb-16">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-4">Programme</p>
        <h1 className="text-5xl md:text-6xl text-primary mb-4">Cours en ligne</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Trois matières fondamentales enseignées avec rigueur, douceur et accompagnement personnalisé.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-6 mb-24">
        {subjects.map((s) => (
          <article key={s.fr} className="p-8 rounded-2xl bg-card border border-border">
            <div className="font-arabic text-4xl text-accent mb-5">{s.ar}</div>
            <h2 className="text-2xl text-primary mb-4">{s.fr}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2"><span className="text-accent">◆</span>{p}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="mb-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Tarifs</p>
          <h2 className="text-4xl text-primary">Sciences islamiques</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <PriceCard label="Inscription" price="3 000" highlight />
          <PriceCard label="Mensualité" price="5 000" />
        </div>
        <p className="text-center text-muted-foreground mt-8 italic" style={{ fontFamily: "var(--font-display)" }}>
          Accompagnement avec succès — un suivi jusqu'à la maîtrise.
        </p>
      </section>

      <div className="text-center">
        <Link to="/inscription" className="inline-block px-10 py-4 rounded-full text-primary-foreground font-medium hover:scale-105 transition-transform" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          Procéder à l'inscription
        </Link>
      </div>
    </div>
  );
}