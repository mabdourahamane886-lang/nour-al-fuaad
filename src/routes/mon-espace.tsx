import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getInscriptionStatus } from "@/lib/inscriptions.functions";

export const Route = createFileRoute("/mon-espace")({
  head: () => ({
    meta: [
      { title: "Mon espace — Suivi d'inscription | NOUROUL FOUA'AD" },
      {
        name: "description",
        content:
          "Suivez l'état de votre inscription à NOUROUL FOUA'AD : en attente, validée, accès aux cours ouvert.",
      },
      { property: "og:title", content: "Mon espace — Suivi d'inscription" },
      {
        property: "og:description",
        content: "Entrez votre code de suivi pour voir l'avancement de votre inscription.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MonEspacePage,
});

type Inscription = {
  tracking_code: string;
  customer_name: string;
  whatsapp: string;
  programme: string;
  status: string;
  note: string | null;
  created_at: string;
  validated_at: string | null;
  access_granted_at: string | null;
};

const STEPS = [
  {
    key: "pending",
    label: "En attente",
    desc: "Nous avons bien reçu votre demande. Envoyez le justificatif de paiement par WhatsApp.",
  },
  {
    key: "validated",
    label: "Validée",
    desc: "Votre paiement est confirmé. Votre place est réservée.",
  },
  {
    key: "access_granted",
    label: "Accès au cours",
    desc: "Vous pouvez rejoindre les séances du lundi, mercredi et vendredi à 15h30.",
  },
] as const;

function MonEspacePage() {
  const fetchStatus = useServerFn(getInscriptionStatus);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Inscription | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const lookup = async (value: string) => {
    if (value.trim().length < 4) return;
    setLoading(true);
    try {
      const res = await fetchStatus({ data: { query: value.trim() } });
      setData((res.inscription as Inscription | null) ?? null);
      setSearched(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("nf_tracking_code", value.trim());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("nf_tracking_code");
    if (saved) {
      setQuery(saved);
      lookup(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentIndex = data ? STEPS.findIndex((s) => s.key === data.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <header className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">Espace étudiant</p>
        <h1 className="text-5xl md:text-6xl text-primary mb-4">Mon espace</h1>
        <p className="text-muted-foreground text-lg">
          Entrez votre code de suivi (INS-XXXX-XXXX) ou votre numéro WhatsApp pour connaître l'état de
          votre inscription.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(query);
        }}
        className="flex flex-col sm:flex-row gap-3 mb-10"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={40}
          placeholder="INS-XXXX-XXXX ou +227 ..."
          className="flex-1 px-4 py-3 rounded-lg bg-background border border-input focus:border-accent focus:ring-2 focus:ring-accent/30 outline-none transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 rounded-full text-primary-foreground font-medium disabled:opacity-60"
          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
        >
          {loading ? "Recherche…" : "Voir mon statut"}
        </button>
      </form>

      {searched && !data && (
        <div className="p-8 rounded-2xl bg-card border border-border text-center">
          <p className="text-lg text-primary mb-2">Aucune inscription trouvée</p>
          <p className="text-muted-foreground text-sm mb-5">
            Vérifiez votre code de suivi, ou inscrivez-vous si ce n'est pas encore fait.
          </p>
          <Link to="/inscription" className="text-accent underline">
            Aller au formulaire d'inscription
          </Link>
        </div>
      )}

      {data && (
        <div className="space-y-8">
          <div className="p-8 rounded-2xl bg-card border border-border">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-1">
                  Code de suivi
                </p>
                <p className="font-mono text-xl text-primary">{data.tracking_code}</p>
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(data.tracking_code)}
                className="text-xs underline text-muted-foreground hover:text-primary"
              >
                Copier
              </button>
            </div>
            <dl className="grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Nom" value={data.customer_name} />
              <Field label="WhatsApp" value={data.whatsapp} />
              <Field label="Programme" value={data.programme} />
              <Field
                label="Demande envoyée le"
                value={new Date(data.created_at).toLocaleString("fr-FR")}
              />
            </dl>
            {data.note && (
              <p className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20 text-sm text-primary">
                {data.note}
              </p>
            )}
          </div>

          <ol className="space-y-4">
            {STEPS.map((step, i) => {
              const done = currentIndex >= i;
              const active = currentIndex === i;
              return (
                <li
                  key={step.key}
                  className={`flex gap-4 p-6 rounded-2xl border transition ${
                    done ? "bg-card border-accent/40" : "bg-muted/40 border-border opacity-70"
                  }`}
                >
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-semibold ${
                      done ? "text-primary" : "text-muted-foreground bg-muted"
                    }`}
                    style={done ? { background: "var(--gradient-gold)" } : undefined}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-primary">
                      {step.label}
                      {active && (
                        <span className="ml-2 text-xs uppercase tracking-widest text-accent">
                          étape actuelle
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                    {step.key === "validated" && data.validated_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Validée le {new Date(data.validated_at).toLocaleString("fr-FR")}
                      </p>
                    )}
                    {step.key === "access_granted" && data.access_granted_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Accès ouvert le {new Date(data.access_granted_at).toLocaleString("fr-FR")}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="flex flex-wrap gap-3 justify-center">
            {data.status === "access_granted" ? (
              <Link
                to="/cours"
                className="px-6 py-3 rounded-full text-primary-foreground font-medium"
                style={{ background: "var(--gradient-hero)" }}
              >
                Accéder aux cours
              </Link>
            ) : (
              <Link to="/paiement" className="px-6 py-3 rounded-full border border-border text-primary">
                Effectuer / finaliser le paiement
              </Link>
            )}
            <a
              href={`https://wa.me/22788376133?text=${encodeURIComponent(
                `Assalâmu ‘alaykum, je suis ${data.customer_name}. Voici mon code de suivi : ${data.tracking_code}.`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full border border-border text-primary"
            >
              Envoyer mon justificatif (WhatsApp)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</dt>
      <dd className="text-primary">{value}</dd>
    </div>
  );
}
