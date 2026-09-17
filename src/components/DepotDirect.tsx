import { useState } from "react";

const NUMBER = "88376133";
const NUMBER_DISPLAY = "+227 88 37 61 33";

const operators = [
  { name: "Wave", logo: "/payments/wave.svg", hint: "Transfert via Wave", border: "border-sky-200", soft: "bg-sky-50", text: "text-sky-700", button: "bg-sky-500 hover:bg-sky-600" },
  { name: "NITA", logo: "/payments/nita.svg", hint: "Transfert via NITA", border: "border-orange-200", soft: "bg-orange-50", text: "text-orange-700", button: "bg-orange-500 hover:bg-orange-600" },
  { name: "AMANA", logo: "/payments/amana.svg", hint: "Transfert via AMANA", border: "border-emerald-200", soft: "bg-emerald-50", text: "text-emerald-700", button: "bg-emerald-600 hover:bg-emerald-700" },
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
    <section className="mb-12 overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-4 shadow-xl sm:p-6 md:p-8">
      <div className="mx-auto mb-9 max-w-4xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
          🔒 Paiement sécurisé et 100% fiable
        </div>
        <h2 className="mb-3 bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl">
          Méthodes de paiement
        </h2>
        <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
          Choisissez votre moyen de paiement et effectuez le transfert au numéro ci-dessous.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {operators.map((op) => (
          <article
            key={op.name}
            className={`group flex flex-col rounded-[1.7rem] border-2 ${op.border} bg-white p-4 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-5 md:p-6`}
          >
            <div className="mb-4 flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl bg-white sm:h-48">
              <img
                src={op.logo}
                alt={`Logo ${op.name}`}
                className="max-h-full max-w-full object-contain object-center"
              />
            </div>

            <div className="mb-5 text-center">
              <h3 className="text-2xl font-bold text-slate-900">{op.name}</h3>
              <p className="mt-1 text-slate-500">{op.hint}</p>
            </div>

            <div className={`mb-4 flex min-h-[82px] items-center justify-between rounded-2xl ${op.soft} p-4`}>
              <div className="min-w-0">
                <div className={`text-sm font-semibold ${op.text}`}>Numéro {op.name}</div>
                <div className="mt-1 whitespace-nowrap text-base font-bold tracking-wide text-slate-900 sm:text-lg">
                  {NUMBER_DISPLAY}
                </div>
              </div>
              <button
                type="button"
                onClick={copy}
                aria-label={`Copier le numéro ${op.name}`}
                className="ml-3 shrink-0 rounded-xl bg-white px-3 py-2 text-xl shadow-sm transition hover:scale-105"
              >
                {copied ? "✓" : "⧉"}
              </button>
            </div>

            <a
              href={`tel:+227${NUMBER}`}
              className={`mt-auto flex w-full items-center justify-center rounded-2xl px-5 py-3.5 font-semibold text-white shadow-sm transition ${op.button}`}
            >
              📞&nbsp; Appeler le numéro
            </a>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-5xl rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 text-center shadow-sm md:p-6">
        <p className="text-base font-medium leading-relaxed text-slate-700 md:text-lg">
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
