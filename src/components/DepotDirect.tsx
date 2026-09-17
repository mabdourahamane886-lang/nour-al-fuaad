import { useState } from "react";

const NUMBER = "88376133";
const NUMBER_DISPLAY = "+227 88 37 61 33";

const operators = [
  { name: "Wave", logo: "/payments/wave.svg", hint: "Transfert via Wave", accent: "border-sky-200", badge: "bg-sky-50 text-sky-700" },
  { name: "NITA", logo: "/payments/nita.svg", hint: "Transfert via NITA", accent: "border-orange-200", badge: "bg-orange-50 text-orange-700" },
  { name: "AMANA", logo: "/payments/amana.svg", hint: "Transfert via AMANA", accent: "border-emerald-200", badge: "bg-emerald-50 text-emerald-700" },
];

export function DepotDirect() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mb-12 overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-xl md:p-8">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          🔒 Paiement sécurisé et 100% fiable
        </div>
        <h2 className="mb-3 text-3xl font-bold text-emerald-950 md:text-4xl">
          Méthodes de paiement
        </h2>
        <p className="mx-auto max-w-3xl text-base text-slate-600 md:text-lg">
          Choisissez votre moyen de paiement et effectuez le transfert au numéro ci-dessous.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {operators.map((op) => (
          <article
            key={op.name}
            className={`group rounded-3xl border-2 ${op.accent} bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-6`}
          >
            <div className="mb-5 flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl bg-white md:h-44">
              <img
                src={op.logo}
                alt={`Logo ${op.name}`}
                className="block h-full w-full object-contain object-center p-1.5"
              />
            </div>

            <div className="mb-5 text-center">
              <h3 className="text-2xl font-bold text-emerald-950">{op.name}</h3>
              <p className="mt-1 text-slate-500">{op.hint}</p>
            </div>

            <div className={`mb-4 flex items-center justify-between rounded-2xl ${op.badge} p-4`}>
              <div>
                <div className="text-sm font-medium opacity-80">Numéro {op.name}</div>
                <div className="mt-1 text-lg font-bold tracking-wide text-slate-900">{NUMBER_DISPLAY}</div>
              </div>
              <button
                type="button"
                onClick={copy}
                aria-label={`Copier le numéro ${op.name}`}
                className="rounded-xl bg-white px-3 py-2 text-xl shadow-sm transition hover:scale-105"
              >
                {copied ? "✓" : "⧉"}
              </button>
            </div>

            <a
              href={`tel:+227${NUMBER}`}
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
            >
              📞 Appeler le numéro
            </a>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-sky-50 p-5 text-center md:p-6">
        <p className="text-base font-medium text-slate-700 md:text-lg">
          Après votre paiement, veuillez envoyer la preuve de paiement sur WhatsApp pour confirmation.
        </p>
        <a
          href={`https://wa.me/227${NUMBER}?text=${encodeURIComponent("Assalamou aleykoum, j'ai effectué un paiement. Nom : ... Programme : ... Montant : ... FCFA. Voici le reçu.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-full bg-[#25D366] px-7 py-3.5 font-semibold text-white shadow-md transition hover:scale-105"
        >
          💬 Envoyer le reçu sur WhatsApp
        </a>
        <p className="mt-4 text-slate-500">Merci pour votre confiance !</p>
      </div>
    </section>
  );
}
