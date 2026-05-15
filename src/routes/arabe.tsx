import { createFileRoute, Link } from "@tanstack/react-router";
import { PriceCard } from "@/components/PriceCard";

export const Route = createFileRoute("/arabe")({
  head: () => ({
    meta: [
      { title: "Apprendre la langue arabe — NOUROUL FOUA'AD" },
      { name: "description", content: "Cours d'arabe : débutant 3000F, inscription 1500F, mensualité 4000F. Lecture, écriture et compréhension du Coran." },
    ],
  }),
  component: ArabePage,
});

function ArabePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <header className="text-center mb-16">
        <p className="font-arabic text-4xl text-accent mb-4">اللُّغَةُ الْعَرَبِيَّة</p>
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Programme</p>
        <h1 className="text-5xl md:text-6xl text-primary mb-5">Langue arabe</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          La clé du Coran. Apprenez à lire, écrire et comprendre la langue de la révélation, des fondations à la lecture autonome.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-6 mb-24">
        {[
          { t: "Alphabet & lecture", d: "Lettres, voyelles, prononciation correcte." },
          { t: "Grammaire essentielle", d: "Nahw et sarf simplifiés pour comprendre les textes." },
          { t: "Vocabulaire coranique", d: "Mots les plus fréquents pour lire le Coran avec sens." },
        ].map((c) => (
          <article key={c.t} className="p-8 rounded-2xl bg-card border border-border">
            <h3 className="text-2xl text-primary mb-3">{c.t}</h3>
            <p className="text-sm text-muted-foreground">{c.d}</p>
          </article>
        ))}
      </section>

      <section className="mb-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Tarifs</p>
          <h2 className="text-4xl text-primary">Langue arabe</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <PriceCard label="Inscription" price="1 500" />
          <PriceCard label="Niveau débutant" price="3 000" />
          <PriceCard label="Apprentissage" price="4 000" highlight />
        </div>
      </section>

      <div className="text-center">
        <Link to="/inscription" className="inline-block px-10 py-4 rounded-full text-primary-foreground font-medium hover:scale-105 transition-transform" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
          M'inscrire
        </Link>
      </div>
    </div>
  );
}