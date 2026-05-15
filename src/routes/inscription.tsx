import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/inscription")({
  head: () => ({
    meta: [
      { title: "Inscription & Paiement — NOUROUL FOUA'AD" },
      { name: "description", content: "Inscrivez-vous à NOUROUL FOUA'AD. Paiement via My Nita, Amana ta ou Wave au +227 88 37 61 33." },
    ],
  }),
  component: InscriptionPage,
});

const tarifs = [
  { cat: "Sciences islamiques", items: [["Inscription", "3 000"], ["Mensualité", "5 000"]] },
  { cat: "Langue arabe", items: [["Inscription", "1 500"], ["Niveau débutant", "3 000"], ["Apprentissage", "4 000"]] },
] as const;

const methods = [
  { name: "My Nita", desc: "Dépôt mobile" },
  { name: "Amana ta", desc: "Dépôt mobile" },
  { name: "Wave", desc: "Transfert sécurisé" },
];

function InscriptionPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <header className="text-center mb-14">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Rejoindre l'institut</p>
        <h1 className="text-5xl md:text-6xl text-primary mb-4">Inscription</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Choisissez votre programme, effectuez le paiement, puis envoyez-nous le justificatif par WhatsApp.
        </p>
      </header>

      {/* Tarifs */}
      <section className="grid md:grid-cols-2 gap-6 mb-16">
        {tarifs.map((t) => (
          <div key={t.cat} className="p-8 rounded-2xl bg-card border border-border">
            <h2 className="text-2xl text-primary mb-6">{t.cat}</h2>
            <ul className="divide-y divide-border">
              {t.items.map(([label, price]) => (
                <li key={label} className="flex justify-between items-baseline py-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-2xl text-primary font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                    {price}<span className="text-sm ml-1 opacity-70">FCFA</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Paiement */}
      <section className="rounded-3xl p-10 md:p-14 text-primary-foreground" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}>
        <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-80" style={{ color: "var(--gold)" }}>Méthodes de paiement</p>
        <h2 className="text-4xl mb-8" style={{ fontFamily: "var(--font-display)" }}>Dépôt mobile</h2>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {methods.map((m) => (
            <div key={m.name} className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
              <p className="text-lg font-semibold">{m.name}</p>
              <p className="text-xs opacity-70 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8 border-t border-white/15">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] opacity-70 mb-2">Numéro de dépôt</p>
            <a href="tel:+22788376133" className="text-4xl md:text-5xl font-semibold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>
              +227 88 37 61 33
            </a>
          </div>
          <a
            href="https://wa.me/22788376133"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-primary hover:scale-105 transition-transform"
            style={{ background: "var(--gradient-gold)" }}
          >
            Envoyer le justificatif via WhatsApp
          </a>
        </div>
      </section>

      <p className="text-center text-muted-foreground mt-10 italic" style={{ fontFamily: "var(--font-display)" }}>
        « Et dis : Ô mon Seigneur, accroîs mes connaissances. » — Sourate Ta-Ha, 114
      </p>
    </div>
  );
}